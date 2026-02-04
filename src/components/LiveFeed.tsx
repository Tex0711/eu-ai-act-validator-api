"use client";

import { Activity, CheckCircle2, XCircle } from "lucide-react";
import type { AuditEntry } from "@/types/audit";
import {
  submitFeedbackCorrect,
  submitFeedbackIncorrect,
} from "@/lib/api";
import { useState } from "react";

interface LiveFeedProps {
  audits: AuditEntry[];
  apiKey: string;
  onFeedbackSubmitted?: () => void;
}

export function LiveFeed({
  audits,
  apiKey,
  onFeedbackSubmitted,
}: LiveFeedProps) {
  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-gray-900">Recent Audits</h2>
          <div className="flex items-center gap-1.5 ml-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs text-emerald-600">Live</span>
          </div>
        </div>
        <span className="text-xs text-gray-500">
          Showing {audits.length} most recent
        </span>
      </div>

      {/* Feed Container */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/10 via-transparent to-violet-500/10 rounded-xl blur" />
        <div className="relative bg-white/80 backdrop-blur-xl border border-gray-200 rounded-xl overflow-hidden">
          <div className="max-h-[280px] overflow-y-auto">
            {audits.map((audit, index) => (
              <AuditRow
                key={audit.id}
                audit={audit}
                isFirst={index === 0}
                apiKey={apiKey}
                onFeedbackSubmitted={onFeedbackSubmitted}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Compliant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span>Non-Compliant</span>
        </div>
      </div>
    </section>
  );
}

interface AuditRowProps {
  audit: AuditEntry;
  isFirst: boolean;
  apiKey: string;
  onFeedbackSubmitted?: () => void;
}

function AuditRow({
  audit,
  isFirst,
  apiKey,
  onFeedbackSubmitted,
}: AuditRowProps) {
  const isAllow = audit.status === "ALLOW";
  const [incorrectOpen, setIncorrectOpen] = useState(false);
  const [correctedDecision, setCorrectedDecision] = useState<
    "ALLOW" | "DENY" | "WARNING" | ""
  >("");
  const [correctedReason, setCorrectedReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatTime = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - d.getTime()) / 1000
    );
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  const handleCorrect = async () => {
    if (!apiKey) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitFeedbackCorrect(audit.id, apiKey);
      onFeedbackSubmitted?.();
      if (typeof window !== "undefined") window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fout bij opslaan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleIncorrectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !correctedDecision || !correctedReason.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitFeedbackIncorrect(
        audit.id,
        correctedDecision as "ALLOW" | "DENY" | "WARNING",
        correctedReason.trim(),
        apiKey
      );
      onFeedbackSubmitted?.();
      if (typeof window !== "undefined") window.location.reload();
      setIncorrectOpen(false);
      setCorrectedDecision("");
      setCorrectedReason("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fout bij opslaan");
    } finally {
      setSubmitting(false);
    }
  };

  const hasFeedback = audit.feedback != null;

  return (
    <div
      className={`flex flex-col gap-2 px-4 py-3 border-b border-gray-200/80 last:border-b-0 hover:bg-gray-50/80 transition-colors ${
        isFirst ? "animate-in fade-in slide-in-from-top-2 duration-500" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Status Icon */}
        <div className="flex-shrink-0">
          {isAllow ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
        </div>

        {/* Prompt Preview */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 truncate font-mono">
            {audit.prompt}
          </p>
        </div>

        {/* Article Reference */}
        <div className="flex-shrink-0 hidden sm:block">
          <span
            className={`text-xs px-2 py-1 rounded-full border ${
              isAllow
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                : "border-red-500/30 bg-red-500/10 text-red-600"
            }`}
          >
            {audit.articleReference}
          </span>
        </div>

        {/* Timestamp */}
        <div className="flex-shrink-0 text-xs text-gray-500 w-16 text-right">
          {formatTime(audit.timestamp)}
        </div>
      </div>

      {/* Feedback section */}
      <div className="flex items-center gap-2 pl-9">
        {hasFeedback ? (
          audit.feedback!.is_correct ? (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              Beoordeeld: Correct
            </span>
          ) : (
            <span className="inline-flex flex-col text-xs text-red-600">
              <span className="inline-flex items-center gap-1">
                <XCircle className="w-4 h-4" />
                Beoordeeld: Incorrect
              </span>
              {audit.feedback!.corrected_decision && (
                <span className="text-gray-600 mt-0.5">
                  → {audit.feedback!.corrected_decision}
                </span>
              )}
            </span>
          )
        ) : (
          <>
            <button
              type="button"
              onClick={handleCorrect}
              disabled={submitting}
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
            >
              Correct
            </button>
            <button
              type="button"
              onClick={() => setIncorrectOpen(true)}
              disabled={submitting}
              className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              Incorrect
            </button>
          </>
        )}
      </div>

      {/* Incorrect form (inline) */}
      {incorrectOpen && (
        <form
          onSubmit={handleIncorrectSubmit}
          className="pl-9 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2"
        >
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Juiste beslissing
            </label>
            <select
              value={correctedDecision}
              onChange={(e) =>
                setCorrectedDecision(
                  e.target.value as "ALLOW" | "DENY" | "WARNING" | ""
                )
              }
              required
              className="w-full text-sm rounded border border-gray-300 px-2 py-1.5"
            >
              <option value="">— Kies —</option>
              <option value="ALLOW">ALLOW</option>
              <option value="DENY">DENY</option>
              <option value="WARNING">WARNING</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Reden (Nederlands)
            </label>
            <textarea
              value={correctedReason}
              onChange={(e) => setCorrectedReason(e.target.value)}
              required
              rows={2}
              className="w-full text-sm rounded border border-gray-300 px-2 py-1.5"
              placeholder="Waarom was de oorspronkelijke beslissing incorrect?"
            />
          </div>
          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setIncorrectOpen(false);
                setCorrectedDecision("");
                setCorrectedReason("");
                setError(null);
              }}
              className="text-xs px-2 py-1.5 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="text-xs px-2 py-1.5 text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
            >
              Versturen
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
