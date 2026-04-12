import Anthropic from '@anthropic-ai/sdk';
import { getAccessToken } from '@/lib/auth';
import {
  loadSystemPrompt,
  listReferenceFiles,
  readReferenceFile,
  readReferenceFiles,
  readCoachingState,
  writeCoachingState,
} from '@/lib/skill-loader';

export const runtime = 'nodejs';
export const maxDuration = 120;

const refFileList = listReferenceFiles().join(', ');

/** Tool definitions given to Claude. */
const TOOLS: Anthropic.Tool[] = [
  {
    name: 'read_reference',
    description:
      'Read a single reference file. Prefer read_reference_batch when you need multiple files. Available files: ' +
      refFileList,
    input_schema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description:
            'Relative path to the reference file, e.g. "references/commands/analyze.md"',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'read_reference_batch',
    description:
      'Read multiple reference files in one call — much faster than multiple read_reference calls. Use this whenever a command requires multiple files (e.g., analyze needs transcript-processing.md + rubrics-detailed.md + cross-cutting.md). Available files: ' +
      refFileList,
    input_schema: {
      type: 'object' as const,
      properties: {
        paths: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Array of relative paths, e.g. ["references/commands/practice.md", "references/role-drills.md"]',
        },
      },
      required: ['paths'],
    },
  },
  {
    name: 'read_coaching_state',
    description: 'Read the current coaching_state.md file to get the latest candidate data. Always call this at the start of a conversation.',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'write_coaching_state',
    description:
      'Write the updated coaching_state.md file. Use this after any workflow that changes scores, stories, pipeline, or coaching strategy. Pass the complete file content.',
    input_schema: {
      type: 'object' as const,
      properties: {
        content: {
          type: 'string',
          description: 'The full updated content of coaching_state.md',
        },
      },
      required: ['content'],
    },
  },
];

/** Handle a tool call and return the result. */
function handleToolCall(
  name: string,
  input: Record<string, unknown>
): string {
  switch (name) {
    case 'read_reference': {
      const content = readReferenceFile(input.path as string);
      return content ?? `File not found: ${input.path}`;
    }
    case 'read_reference_batch': {
      const paths = input.paths as string[];
      const results = readReferenceFiles(paths);
      // Return as a combined document with clear separators
      return Object.entries(results)
        .map(([path, content]) => `--- ${path} ---\n${content}`)
        .join('\n\n');
    }
    case 'read_coaching_state': {
      const state = readCoachingState();
      return state ?? 'No coaching_state.md found.';
    }
    case 'write_coaching_state': {
      const ok = writeCoachingState(input.content as string);
      return ok
        ? 'coaching_state.md updated successfully.'
        : 'Failed to write coaching_state.md.';
    }
    default:
      return `Unknown tool: ${name}`;
  }
}

export async function POST(req: Request) {
  const token = getAccessToken();
  if (!token) {
    return new Response(
      JSON.stringify({ error: 'Not authenticated. Please connect your Claude account.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { messages } = (await req.json()) as {
    messages: Anthropic.MessageParam[];
  };

  const client = new Anthropic({ apiKey: token });
  const systemPrompt = loadSystemPrompt();

  // Agentic loop: keep calling Claude until we get a final text response.
  const allMessages: Anthropic.MessageParam[] = [...messages];
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let continueLoop = true;

        while (continueLoop) {
          const response = await client.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 8192,
            system: systemPrompt,
            messages: allMessages,
            tools: TOOLS,
            stream: true,
          });

          let currentText = '';
          let toolUseBlocks: Array<{
            id: string;
            name: string;
            input: string;
          }> = [];
          let currentToolId = '';
          let currentToolName = '';
          let currentToolInput = '';
          let stopReason: string | null = null;

          for await (const event of response) {
            switch (event.type) {
              case 'message_start':
                // Send input token count
                if (event.message?.usage) {
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        type: 'usage',
                        inputTokens: event.message.usage.input_tokens,
                        outputTokens: 0,
                      })}\n\n`
                    )
                  );
                }
                break;

              case 'content_block_start':
                if (event.content_block.type === 'text') {
                  // Start of text block
                } else if (event.content_block.type === 'tool_use') {
                  currentToolId = event.content_block.id;
                  currentToolName = event.content_block.name;
                  currentToolInput = '';
                }
                break;

              case 'content_block_delta':
                if (event.delta.type === 'text_delta') {
                  currentText += event.delta.text;
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ type: 'text', text: event.delta.text })}\n\n`
                    )
                  );
                } else if (event.delta.type === 'input_json_delta') {
                  currentToolInput += event.delta.partial_json;
                }
                break;

              case 'content_block_stop':
                if (currentToolId) {
                  toolUseBlocks.push({
                    id: currentToolId,
                    name: currentToolName,
                    input: currentToolInput,
                  });
                  currentToolId = '';
                  currentToolName = '';
                  currentToolInput = '';
                }
                break;

              case 'message_delta':
                stopReason = event.delta.stop_reason;
                if ((event as any).usage?.output_tokens) {
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        type: 'usage',
                        outputTokens: (event as any).usage.output_tokens,
                      })}\n\n`
                    )
                  );
                }
                break;
            }
          }

          if (stopReason === 'tool_use' && toolUseBlocks.length > 0) {
            const assistantContent: Anthropic.ContentBlockParam[] = [];
            if (currentText) {
              assistantContent.push({ type: 'text', text: currentText });
            }
            for (const tool of toolUseBlocks) {
              let parsedInput = {};
              try {
                parsedInput = JSON.parse(tool.input || '{}');
              } catch {
                parsedInput = {};
              }
              assistantContent.push({
                type: 'tool_use',
                id: tool.id,
                name: tool.name,
                input: parsedInput,
              });
            }

            allMessages.push({ role: 'assistant', content: assistantContent });

            // Execute all tool calls and build tool results
            const toolResults: Anthropic.ToolResultBlockParam[] =
              toolUseBlocks.map((tool) => {
                let parsedInput: Record<string, unknown> = {};
                try {
                  parsedInput = JSON.parse(tool.input || '{}');
                } catch {
                  parsedInput = {};
                }

                // Notify client about tool use
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: 'tool_use',
                      name: tool.name,
                      input: parsedInput,
                    })}\n\n`
                  )
                );

                const result = handleToolCall(tool.name, parsedInput);
                return {
                  type: 'tool_result' as const,
                  tool_use_id: tool.id,
                  content: result,
                };
              });

            allMessages.push({ role: 'user', content: toolResults });

            // Reset for next iteration
            currentText = '';
            toolUseBlocks = [];
          } else {
            continueLoop = false;
          }
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
        );
        controller.close();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unknown error';
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'error', error: message })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
