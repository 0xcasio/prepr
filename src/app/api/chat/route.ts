import Anthropic from '@anthropic-ai/sdk';
import { getAccessToken } from '@/lib/auth';
import {
  loadSystemPrompt,
  listReferenceFiles,
  readReferenceFile,
  readCoachingState,
  writeCoachingState,
} from '@/lib/skill-loader';

export const runtime = 'nodejs';
export const maxDuration = 120;

/** Tool definitions given to Claude. */
const TOOLS: Anthropic.Tool[] = [
  {
    name: 'read_reference',
    description:
      'Read a reference file from the interview coaching skill. Available files: ' +
      listReferenceFiles().join(', '),
    input_schema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description:
            'Relative path to the reference file, e.g. "references/commands/analyze.md" or "references/rubrics-detailed.md"',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'read_coaching_state',
    description: 'Read the current coaching_state.md file to get the latest candidate data.',
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
  input: Record<string, string>
): string {
  switch (name) {
    case 'read_reference': {
      const content = readReferenceFile(input.path);
      return content ?? `File not found: ${input.path}`;
    }
    case 'read_coaching_state': {
      const state = readCoachingState();
      return state ?? 'No coaching_state.md found.';
    }
    case 'write_coaching_state': {
      const ok = writeCoachingState(input.content);
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
  // This handles multi-step tool use (e.g., read reference → generate response).
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
                  // Stream text chunks to the client
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
                break;
            }
          }

          if (stopReason === 'tool_use' && toolUseBlocks.length > 0) {
            // Build the assistant message with all content blocks
            // Use Anthropic.ContentBlockParam for constructing messages
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
                let parsedInput: Record<string, string> = {};
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
            // No tool use — we're done
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
