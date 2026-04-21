import type { Context } from 'hono';
import { Layout } from '../layout';
import type { Env, EmailListItem } from '../types';

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const emailDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (emailDate.getTime() === today.getTime()) {
    return d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  const diffDays = Math.floor((today.getTime() - emailDate.getTime()) / 86400000);
  if (diffDays < 7) {
    return d.toLocaleDateString('en-AU', { weekday: 'short' });
  }

  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function extractName(address: string): string {
  // "Name <email>" → Name, otherwise just the address
  const match = address.match(/^(.+?)\s*<.+>$/);
  return match ? match[1].replace(/"/g, '') : address;
}

export async function inboxPage(c: Context<{ Bindings: Env }>) {
  const direction = c.req.query('direction') || 'all';
  const page = parseInt(c.req.query('page') || '1');
  const limit = 30;
  const offset = (page - 1) * limit;

  let whereClause = '';
  const params: any[] = [];

  if (direction === 'inbound') {
    whereClause = 'WHERE direction = ?';
    params.push('inbound');
  } else if (direction === 'outbound') {
    whereClause = 'WHERE direction = ?';
    params.push('outbound');
  }

  const countResult = await c.env.MAILBOX.prepare(
    `SELECT COUNT(*) as total FROM emails ${whereClause}`
  ).bind(...params).first<{ total: number }>();

  const total = countResult?.total || 0;

  const emails = await c.env.MAILBOX.prepare(
    `SELECT id, message_id, from_address, to_address, subject, received_at, read, direction, LENGTH(body) as body_length
     FROM emails ${whereClause}
     ORDER BY received_at DESC
     LIMIT ? OFFSET ?`
  ).bind(...params, limit, offset).all<EmailListItem>();

  const unreadResult = await c.env.MAILBOX.prepare(
    'SELECT COUNT(*) as count FROM emails WHERE read = 0'
  ).first<{ count: number }>();

  const unreadCount = unreadResult?.count || 0;
  const totalPages = Math.ceil(total / limit);

  return c.html(
    <Layout>
      <div class="stats">
        <span>{total} emails</span>
        {unreadCount > 0 && <span>{unreadCount} unread</span>}
      </div>

      <div class="filter-bar">
        <a href="/" class={direction === 'all' ? 'active' : ''}>All</a>
        <a href="/?direction=inbound" class={direction === 'inbound' ? 'active' : ''}>Inbound</a>
        <a href="/?direction=outbound" class={direction === 'outbound' ? 'active' : ''}>Outbound</a>
      </div>

      {emails.results.length === 0 ? (
        <div class="empty">No emails yet.</div>
      ) : (
        <div class="email-list">
          {emails.results.map((email) => (
            <a
              href={`/email/${email.id}`}
              class={`email-row ${email.read ? '' : 'unread'}`}
              style="text-decoration: none; color: inherit;"
            >
              <div>
                <div class="from">{extractName(email.from_address)}</div>
                <div class="subject">{email.subject}</div>
              </div>
              <div class="meta">
                <span>{formatDate(email.received_at)}</span>
                <span class={`badge ${email.direction}`}>{email.direction}</span>
              </div>
            </a>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div class="pagination">
          <div>
            {page > 1 ? (
              <a href={`/?page=${page - 1}${direction !== 'all' ? `&direction=${direction}` : ''}`}>
                &larr; Newer
              </a>
            ) : <span />}
          </div>
          <span>Page {page} of {totalPages}</span>
          <div>
            {page < totalPages ? (
              <a href={`/?page=${page + 1}${direction !== 'all' ? `&direction=${direction}` : ''}`}>
                Older &rarr;
              </a>
            ) : <span />}
          </div>
        </div>
      )}
    </Layout>
  );
}
