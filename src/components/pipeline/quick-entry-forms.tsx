'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { InterviewLoop, OutcomeEntry } from '@/lib/parser/types';
import { field } from '@/lib/pipeline-helpers';

// ── Log Outcome Form ────────────────────────────────────────────────────────

interface LogOutcomeFormProps {
  loop: InterviewLoop;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    outcomeEntry: OutcomeEntry;
    updatedLoop: InterviewLoop;
  }) => Promise<void>;
}

export function LogOutcomeForm({
  loop,
  open,
  onOpenChange,
  onSubmit,
}: LogOutcomeFormProps) {
  const [round, setRound] = useState('');
  const [result, setResult] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reset form state when dialog opens or loop changes
  useEffect(() => {
    if (open) {
      setRound('');
      setResult('');
      setNotes('');
    }
  }, [open, loop.companyName]);

  const today = new Date().toISOString().split('T')[0];

  async function handleSubmit() {
    if (!result) return;
    setSubmitting(true);

    const outcomeEntry: OutcomeEntry = {
      date: today,
      company: loop.companyName,
      role: field(loop, 'role') || loop.companyName,
      round: round || '—',
      result,
      notes: notes || '—',
    };

    // Update the loop's rounds completed if a round name is given
    const updatedLoop = { ...loop, fields: [...loop.fields] };

    await onSubmit({ outcomeEntry, updatedLoop });
    setSubmitting(false);
    setRound('');
    setResult('');
    setNotes('');
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Outcome — {loop.companyName}</DialogTitle>
          <DialogDescription>
            Record the result of an interview round.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
              Round
            </label>
            <Input
              placeholder="e.g., HM call, R2 technical, Final round"
              value={round}
              onChange={(e) => setRound(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
              Result
            </label>
            <Select value={result} onValueChange={setResult}>
              <SelectTrigger>
                <SelectValue placeholder="Select result" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
              Notes
            </label>
            <Textarea
              placeholder="How did it go? Key takeaways, feedback, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!result || submitting}>
            {submitting ? 'Saving...' : 'Log Outcome'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Update Status Form ──────────────────────────────────────────────────────

interface UpdateStatusFormProps {
  loop: InterviewLoop;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (updatedLoop: InterviewLoop) => Promise<void>;
}

const STATUS_OPTIONS = [
  'Researched',
  'Applied',
  'Interviewing',
  'Interviewing (assessments pending)',
  'Interviewing (HM call scheduling)',
  'Offer',
  'Closed (rejected)',
  'Closed (paused)',
  'Closed (candidate declined)',
];

export function UpdateStatusForm({
  loop,
  open,
  onOpenChange,
  onSubmit,
}: UpdateStatusFormProps) {
  const currentStatus = field(loop, 'status');
  const [status, setStatus] = useState(currentStatus);
  const [submitting, setSubmitting] = useState(false);

  // Reset when dialog opens or loop changes
  useEffect(() => {
    if (open) {
      setStatus(field(loop, 'status'));
    }
  }, [open, loop]);

  async function handleSubmit() {
    if (!status || status === currentStatus) return;
    setSubmitting(true);

    // Create updated loop with new status
    const updatedFields = loop.fields.map((f) => {
      if (f.key.toLowerCase().includes('status')) {
        return { ...f, value: status };
      }
      return f;
    });

    const updatedLoop: InterviewLoop = {
      ...loop,
      fields: updatedFields,
    };

    await onSubmit(updatedLoop);
    setSubmitting(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Status — {loop.companyName}</DialogTitle>
          <DialogDescription>
            Change the pipeline status for this company.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
              Current Status
            </label>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {currentStatus}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
              New Status
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!status || status === currentStatus || submitting}
          >
            {submitting ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Add Round Form ──────────────────────────────────────────────────────────

interface AddRoundFormProps {
  loop: InterviewLoop;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (updatedLoop: InterviewLoop) => Promise<void>;
}

export function AddRoundForm({
  loop,
  open,
  onOpenChange,
  onSubmit,
}: AddRoundFormProps) {
  const [format, setFormat] = useState('');
  const [date, setDate] = useState('');
  const [interviewer, setInterviewer] = useState('');
  const [duration, setDuration] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reset when dialog opens or loop changes
  useEffect(() => {
    if (open) {
      setFormat('');
      setDate('');
      setInterviewer('');
      setDuration('');
    }
  }, [open, loop.companyName]);

  async function handleSubmit() {
    if (!format) return;
    setSubmitting(true);

    // Add to next round field
    const nextRoundValue = date
      ? `${format} — ${date}${interviewer ? `, ${interviewer}` : ''}`
      : `${format}${interviewer ? `, ${interviewer}` : ''}`;

    const updatedFields = loop.fields.map((f) => {
      if (f.key.toLowerCase().includes('next round')) {
        return { ...f, value: nextRoundValue };
      }
      return f;
    });

    const updatedLoop: InterviewLoop = {
      ...loop,
      fields: updatedFields,
    };

    await onSubmit(updatedLoop);
    setSubmitting(false);
    setFormat('');
    setDate('');
    setInterviewer('');
    setDuration('');
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Round — {loop.companyName}</DialogTitle>
          <DialogDescription>
            Add details about an upcoming interview round.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
              Format *
            </label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select round format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Behavioral screen">
                  Behavioral screen
                </SelectItem>
                <SelectItem value="Technical interview">
                  Technical interview
                </SelectItem>
                <SelectItem value="System design">System design</SelectItem>
                <SelectItem value="Case study">Case study</SelectItem>
                <SelectItem value="HM call">HM call</SelectItem>
                <SelectItem value="Panel interview">Panel interview</SelectItem>
                <SelectItem value="Assessment">Assessment</SelectItem>
                <SelectItem value="Culture fit">Culture fit</SelectItem>
                <SelectItem value="Final round">Final round</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
              Date
            </label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
              Interviewer
            </label>
            <Input
              placeholder="e.g., John Smith, VP Engineering"
              value={interviewer}
              onChange={(e) => setInterviewer(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
              Duration
            </label>
            <Input
              placeholder="e.g., 45min, 1hr"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!format || submitting}>
            {submitting ? 'Saving...' : 'Add Round'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
