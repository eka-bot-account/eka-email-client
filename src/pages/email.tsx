import type { Context } from 'hono';
import { Layout } from '../layout';
import type { Env, Email } from '../types';

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isHtmlContent(body: string): boolean {
  return /<\s*(html|div|p|br|table|span|a\s)/i.test(body);
}

export async function emailPage(c: Context<{ Bindings: Env }>) {
  const id = parseInt(c.req.param('id') || '');
  const justSent = c.req.query('sent') === '1';

  if (isNaN(id)) {
    return c.html(<Layout title="Not Found"><div class="empty">Email not found.</div></Layout>, 404);
  }

  const email = await c.env.MAILBOX.prepare(
    'SELECT * FROM emails WHERE id = ?'
  ).bind(id).first<Email>();

  if (!email) {
    return c.html(<Layout title="Not Found"><div class="empty">Email not found.</div></Layout>, 404);
  }

  // Mark as read
  if (!email.read) {
    await c.env.MAILBOX.prepare(
      'UPDATE emails SET read = 1 WHERE id = ?'
    ).bind(id).run();
  }

  const bodyIsHtml = email.body ? isHtmlContent(email.body) : false;

  return c.html(
    <Layout title={email.subject}>
      <a href="/" class="back-link">&larr; Back to inbox</a>

      {justSent && (
        <div class="sent-banner">Reply sent successfully.</div>
      )}

      <div class="email-detail">
        <div class="email-header">
          <h2>{email.subject}</h2>
          <div class="meta-grid">
            <span class="label">From</span>
            <span>{email.from_address}</span>
            <span class="label">To</span>
            <span>{email.to_address}</span>
            {email.reply_to && (
              <>
                <span class="label">Reply-To</span>
                <span>{email.reply_to}</span>
              </>
            )}
            <span class="label">Date</span>
            <span>{formatFullDate(email.received_at)}</span>
            <span class="label">Type</span>
            <span><span class={`badge ${email.direction}`}>{email.direction}</span></span>
          </div>
        </div>

        {email.body ? (
          bodyIsHtml ? (
            <div class="email-body-html">
              <iframe
                srcdoc={email.body}
                sandbox="allow-same-origin"
                style="width: 100%; min-height: 500px; border: none; background: #fff; border-radius: var(--radius);"
                onload="this.style.height = this.contentWindow.document.body.scrollHeight + 'px'"
              />
            </div>
          ) : (
            <div class="email-body">
              <pre>{email.body}</pre>
            </div>
          )
        ) : (
          <div class="email-body">
            <span style="color: var(--text-muted); font-family: var(--mono); font-size: 13px;">No body content.</span>
          </div>
        )}

        <div style="padding: 18px 24px; border-top: 1px solid var(--border);">
          <a href={`/reply/${email.id}`} class="btn-reply">
            &larr; Reply
          </a>
        </div>
      </div>
    </Layout>
  );
}
