import type { Context } from 'hono';
import { Layout } from '../layout';
import type { Env } from '../types';

interface SearchResult {
  id: number;
  from_address: string;
  subject: string;
  received_at: string;
  direction: string;
  snippet: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export async function searchPage(c: Context<{ Bindings: Env }>) {
  const query = c.req.query('q') || '';
  let results: SearchResult[] = [];
  let error = '';

  if (query) {
    try {
      const rows = await c.env.MAILBOX.prepare(
        `SELECT e.id, e.from_address, e.subject, e.received_at, e.direction,
                snippet(emails_fts, 1, '<mark>', '</mark>', '...', 40) as snippet
         FROM emails_fts
         JOIN emails e ON emails_fts.rowid = e.id
         WHERE emails_fts MATCH ?
         ORDER BY rank
         LIMIT 50`
      ).bind(query).all<SearchResult>();

      results = rows.results;
    } catch (e: any) {
      error = 'Invalid search query. Try simpler terms.';
    }
  }

  return c.html(
    <Layout title="Search">
      <h2 style="font-size: 18px; margin-bottom: 16px;">Search emails</h2>

      <form class="search-form" method="get" action="/search">
        <input
          type="text"
          name="q"
          placeholder="Search emails..."
          value={query}
          autofocus
        />
        <button type="submit">Search</button>
      </form>

      {error && (
        <div style="color: var(--danger); font-size: 13px; margin-bottom: 16px;">{error}</div>
      )}

      {query && !error && (
        <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
          {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
        </div>
      )}

      {results.length > 0 && (
        <div class="email-list">
          {results.map((r) => (
            <a
              href={`/email/${r.id}`}
              class="email-row"
              style="text-decoration: none; color: inherit;"
            >
              <div>
                <div class="from" style="font-size: 13px;">{r.from_address}</div>
                <div class="subject">{r.subject}</div>
                <div
                  style="font-size: 12px; color: var(--text-muted); margin-top: 4px;"
                  dangerouslySetInnerHTML={{ __html: r.snippet }}
                />
              </div>
              <div class="meta">
                <span>{formatDate(r.received_at)}</span>
                <span class={`badge ${r.direction}`}>{r.direction}</span>
              </div>
            </a>
          ))}
        </div>
      )}

      {query && results.length === 0 && !error && (
        <div class="empty">No results found.</div>
      )}
    </Layout>
  );
}
