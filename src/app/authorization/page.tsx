'use client';

import { useState } from 'react';
import { apiFetch, type ApiResult } from '@/lib/api-client';
import { ResponsePanel } from '@/components/ResponsePanel';
import { ActionButton } from '@/components/ActionButton';
import { PageShell, Field, ReadoutLine } from '@/components/PageShell';

const VISIBILITIES = ['private', 'internal', 'public'] as const;
const RELATIONS = ['viewer', 'editor'] as const;

export default function AuthorizationPage() {
  const [accessToken, setAccessToken] = useState('');

  // Document creation / list fields
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [visibility, setVisibility] = useState<string>('private');
  const [skip, setSkip] = useState('0');
  const [take, setTake] = useState('20');

  // Per-document fields
  const [docId, setDocId] = useState('');
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateBody, setUpdateBody] = useState('');
  const [updateVisibility, setUpdateVisibility] = useState('');

  // Share fields
  const [shareTargetId, setShareTargetId] = useState('');
  const [shareRelation, setShareRelation] = useState<string>('viewer');

  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResult<unknown> | null>(null);

  function authHeader() {
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  }

  async function run(name: string, fn: () => Promise<ApiResult<unknown>>) {
    setLoading(name);
    const res = await fn();
    setResult(res);
    setLoading(null);
    return res;
  }

  // --- RBAC / Scopes ---

  async function handleCreate() {
    await run('create', () =>
      apiFetch<unknown>('/documents', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ title, body, visibility }),
      }),
    );
  }

  async function handleList() {
    const q = new URLSearchParams({ skip, take }).toString();
    await run('list', () =>
      apiFetch<unknown>(`/documents?${q}`, { headers: authHeader() }),
    );
  }

  // --- Composed read (RBAC + ABAC + ReBAC) ---

  async function handleReadOne() {
    await run('read-one', () =>
      apiFetch<unknown>(`/documents/${docId}`, { headers: authHeader() }),
    );
  }

  // --- ABAC: visibility policy gate ---

  async function handlePreview() {
    await run('preview', () =>
      apiFetch<unknown>(`/documents/${docId}/preview`, { headers: authHeader() }),
    );
  }

  // --- ReBAC mutations ---

  async function handleUpdate() {
    const payload: Record<string, string> = {};
    if (updateTitle) payload.title = updateTitle;
    if (updateBody) payload.body = updateBody;
    if (updateVisibility) payload.visibility = updateVisibility;
    await run('update', () =>
      apiFetch<unknown>(`/documents/${docId}`, {
        method: 'PATCH',
        headers: authHeader(),
        body: JSON.stringify(payload),
      }),
    );
  }

  async function handleDelete() {
    await run('delete', () =>
      apiFetch<unknown>(`/documents/${docId}`, {
        method: 'DELETE',
        headers: authHeader(),
      }),
    );
  }

  // --- ReBAC sharing ---

  async function handleShare() {
    await run('share', () =>
      apiFetch<unknown>(`/documents/${docId}/share`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ subjectId: shareTargetId, relation: shareRelation }),
      }),
    );
  }

  async function handleUnshare() {
    await run('unshare', () =>
      apiFetch<unknown>(`/documents/${docId}/share`, {
        method: 'DELETE',
        headers: authHeader(),
        body: JSON.stringify({ subjectId: shareTargetId, relation: shareRelation }),
      }),
    );
  }

  return (
    <PageShell
      path="authorization"
      title="Authorization — RBAC · ABAC · ReBAC"
      description="Document resource exercising all three authz techniques. Paste a JWT from the /jwt page to run authenticated requests."
    >
      {/* Token */}
      <div className="flex flex-col gap-3">
        <Field
          label="access token (paste from /jwt)"
          placeholder="eyJ…"
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
        />
        <ReadoutLine label="token" value={accessToken ? `${accessToken.slice(0, 32)}…` : '(none)'} />
      </div>

      {/* RBAC — scopes */}
      <div className="flex flex-col gap-3">
        <p className="text-[11px] uppercase tracking-[0.15em] text-[var(--fg-dim)]">
          rbac / scopes — document:read · document:write
        </p>
        <Field label="title" placeholder="Quarterly report" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Field label="body" placeholder="Body text…" value={body} onChange={(e) => setBody(e.target.value)} />
        <label className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-[0.15em] text-[var(--fg-dim)]">visibility</span>
          <div className="flex items-center gap-2 rounded border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 focus-within:border-[var(--accent)]">
            <span className="text-[var(--accent)]">&gt;</span>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full bg-transparent text-sm text-[var(--fg)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--accent)]"
            >
              {VISIBILITIES.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </label>
        <div className="flex gap-2">
          <Field label="skip" placeholder="0" value={skip} onChange={(e) => setSkip(e.target.value)} />
          <Field label="take" placeholder="20" value={take} onChange={(e) => setTake(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionButton onClick={handleCreate} loading={loading === 'create'}>
            POST /documents
          </ActionButton>
          <ActionButton onClick={handleList} loading={loading === 'list'}>
            GET /documents
          </ActionButton>
        </div>
        <p className="text-xs text-[var(--fg-dim)]">
          List returns only rows the authz filter permits — skip/take page the readable subset, not the full table.
        </p>
      </div>

      {/* Composed read + ABAC */}
      <div className="flex flex-col gap-3">
        <p className="text-[11px] uppercase tracking-[0.15em] text-[var(--fg-dim)]">
          composed read (rbac + abac + rebac) · abac — visibility policy
        </p>
        <Field label="document id" placeholder="uuid" value={docId} onChange={(e) => setDocId(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          <ActionButton onClick={handleReadOne} loading={loading === 'read-one'}>
            GET /documents/:id
          </ActionButton>
          <ActionButton onClick={handlePreview} loading={loading === 'preview'}>
            GET /documents/:id/preview (ABAC)
          </ActionButton>
        </div>
        <p className="text-xs text-[var(--fg-dim)]">
          Read-one: read:any scope OR ABAC visibility (public/internal) OR viewer relation — forbidden returns 404 (no enumeration).
          Preview: ABAC visibility policy only — private documents are 403 for non-owners.
        </p>
      </div>

      {/* ReBAC mutations */}
      <div className="flex flex-col gap-3">
        <p className="text-[11px] uppercase tracking-[0.15em] text-[var(--fg-dim)]">
          rebac mutations — editor relation (update) · owner relation (delete)
        </p>
        <Field
          label="update title (optional)"
          placeholder="New title"
          value={updateTitle}
          onChange={(e) => setUpdateTitle(e.target.value)}
        />
        <Field
          label="update body (optional)"
          placeholder="New body"
          value={updateBody}
          onChange={(e) => setUpdateBody(e.target.value)}
        />
        <label className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-[0.15em] text-[var(--fg-dim)]">
            update visibility (optional — owner only)
          </span>
          <div className="flex items-center gap-2 rounded border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 focus-within:border-[var(--accent)]">
            <span className="text-[var(--accent)]">&gt;</span>
            <select
              value={updateVisibility}
              onChange={(e) => setUpdateVisibility(e.target.value)}
              className="w-full bg-transparent text-sm text-[var(--fg)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--accent)]"
            >
              <option value="">(no change)</option>
              {VISIBILITIES.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </label>
        <div className="flex flex-wrap gap-2">
          <ActionButton onClick={handleUpdate} loading={loading === 'update'}>
            PATCH /documents/:id
          </ActionButton>
          <ActionButton onClick={handleDelete} loading={loading === 'delete'}>
            DELETE /documents/:id
          </ActionButton>
        </div>
        <p className="text-xs text-[var(--fg-dim)]">
          Update requires document:write scope + editor (or owner) relation. Visibility changes are owner-only even for editors.
          Delete requires document:delete scope + owner relation.
        </p>
      </div>

      {/* ReBAC sharing */}
      <div className="flex flex-col gap-3">
        <p className="text-[11px] uppercase tracking-[0.15em] text-[var(--fg-dim)]">
          rebac sharing — owner relation required
        </p>
        <Field
          label="target user id"
          placeholder="uuid of the user to grant/revoke"
          value={shareTargetId}
          onChange={(e) => setShareTargetId(e.target.value)}
        />
        <label className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-[0.15em] text-[var(--fg-dim)]">relation to grant / revoke</span>
          <div className="flex items-center gap-2 rounded border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 focus-within:border-[var(--accent)]">
            <span className="text-[var(--accent)]">&gt;</span>
            <select
              value={shareRelation}
              onChange={(e) => setShareRelation(e.target.value)}
              className="w-full bg-transparent text-sm text-[var(--fg)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--accent)]"
            >
              {RELATIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </label>
        <div className="flex flex-wrap gap-2">
          <ActionButton onClick={handleShare} loading={loading === 'share'}>
            POST /documents/:id/share
          </ActionButton>
          <ActionButton onClick={handleUnshare} loading={loading === 'unshare'}>
            DELETE /documents/:id/share
          </ActionButton>
        </div>
        <p className="text-xs text-[var(--fg-dim)]">
          owner → editor → viewer implication: granting editor also satisfies viewer checks. Ownership cannot be transferred via share.
        </p>
      </div>

      <ResponsePanel result={result} />
    </PageShell>
  );
}
