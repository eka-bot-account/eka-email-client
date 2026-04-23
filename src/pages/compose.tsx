import type { Context } from 'hono';
import { getCookie } from 'hono/cookie';
import { Layout } from '../layout';
import type { Env, Email } from '../types';

interface ComposeProps {
  replyTo?: Email;
  fromAddress?: string;
  error?: string;
  success?: string;
}

function extractEmailAddress(full: string): string {
  const match = full.match(/<(.+?)>/);
  return match ? match[1] : full;
}

function quoteBody(email: Email): string {
  const date = new Date(email.received_at).toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const from = email.from_address;
  const body = email.body || '';

  // Strip HTML for quoting
  const plainBody = body.replace(/<[^>]*>/g, '').trim();
  const quoted = plainBody.split('\n').map((line) => `> ${line}`).join('\n');

  return `\n\nOn ${date}, ${from} wrote:\n${quoted}`;
}

export async function composePage(c: Context<{ Bindings: Env }>, props: ComposeProps = {}) {
  const { replyTo, error, success } = props;

  // Determine default from address for replies
  let defaultFrom = 'eka@ai.weiyen.net';
  let defaultTo = '';
  let defaultSubject = '';
  let defaultBody = '';

  if (replyTo) {
    // If replying, figure out which address received the original
    const toAddr = extractEmailAddress(replyTo.to_address);
    if (toAddr === 'hello@stratachecks.com') {
      defaultFrom = 'hello@stratachecks.com';
    } else if (toAddr === 'eka@ai.weiyen.net') {
      defaultFrom = 'eka@ai.weiyen.net';
    }

    // If the original was outbound, reply to the recipient
    if (replyTo.direction === 'outbound') {
      defaultTo = extractEmailAddress(replyTo.to_address);
    } else {
      // Reply to sender (prefer reply_to header)
      defaultTo = replyTo.reply_to
        ? extractEmailAddress(replyTo.reply_to)
        : extractEmailAddress(replyTo.from_address);
    }

    // Add Re: prefix if not already there
    const subj = replyTo.subject || '';
    defaultSubject = subj.startsWith('Re:') ? subj : `Re: ${subj}`;

    defaultBody = quoteBody(replyTo);
  }

  return c.html(
    <Layout title={replyTo ? 'Reply' : 'Compose'}>
      <style>{`
        .compose-hero {
          margin-bottom: 28px;
          position: relative;
        }

        .compose-hero::after {
          content: '';
          position: absolute;
          bottom: -14px;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, var(--accent) 0%, transparent 60%);
          opacity: 0.15;
        }
      `}</style>

      {replyTo && (
        <a href={`/email/${replyTo.id}`} class="back-link">&larr; Back to email</a>
      )}

      <div class="compose-hero">
        <div class="page-title">
          <span class="title-icon">{replyTo ? '\u21B5' : '\u270E'}</span>
          {replyTo ? 'Reply' : 'Compose'}
        </div>
      </div>

      {error && (
        <div class="error-banner">{error}</div>
      )}

      {success && (
        <div class="sent-banner">{success}</div>
      )}

      <div class="section-card">
        <div class="section-card-body">
          <form method="post" action="/compose" class="compose-form">
            {replyTo && <input type="hidden" name="in_reply_to_id" value={String(replyTo.id)} />}

            <div class="form-field">
              <label for="from_address">From</label>
              <select name="from_address" id="from_address">
                <option value="eka@ai.weiyen.net" selected={defaultFrom === 'eka@ai.weiyen.net'}>
                  Eka &lt;eka@ai.weiyen.net&gt;
                </option>
                <option value="hello@stratachecks.com" selected={defaultFrom === 'hello@stratachecks.com'}>
                  StrataChecks &lt;hello@stratachecks.com&gt;
                </option>
              </select>
            </div>

            <div class="form-field">
              <label for="to">To</label>
              <input
                type="email"
                name="to"
                id="to"
                placeholder="recipient@example.com"
                value={defaultTo}
                required
              />
            </div>

            <div class="form-field">
              <label for="subject">Subject</label>
              <input
                type="text"
                name="subject"
                id="subject"
                placeholder="Subject"
                value={defaultSubject}
                required
              />
            </div>

            <div class="form-field">
              <label for="body">Message</label>
              <textarea
                name="body"
                id="body"
                rows={16}
                placeholder="Write your email..."
                required
              >{defaultBody}</textarea>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-send">Send</button>
              <a href={replyTo ? `/email/${replyTo.id}` : '/'} class="btn-cancel">Cancel</a>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export async function handleCompose(c: Context<{ Bindings: Env }>) {
  const formData = await c.req.parseBody();

  const to = formData['to'] as string;
  const subject = formData['subject'] as string;
  const body = formData['body'] as string;
  const from_address = formData['from_address'] as string;
  const in_reply_to_id = formData['in_reply_to_id'] as string | undefined;

  if (!to || !subject || !body) {
    return composePage(c, { error: 'All fields are required.' });
  }

  // Look up the reply-to email if needed (for context in compose page on error)
  let replyToEmail: Email | undefined;
  if (in_reply_to_id) {
    const email = await c.env.MAILBOX.prepare(
      'SELECT * FROM emails WHERE id = ?'
    ).bind(parseInt(in_reply_to_id)).first<Email>();
    if (email) replyToEmail = email;
  }

  try {
    const workerUrl = c.env.EMAIL_WORKER_URL;
    const apiToken = c.env.EMAIL_API_TOKEN;

    if (!workerUrl || !apiToken) {
      return composePage(c, {
        replyTo: replyToEmail,
        error: 'Email sending is not configured. Set EMAIL_WORKER_URL and EMAIL_API_TOKEN.',
      });
    }

    const payload: Record<string, any> = {
      to,
      subject,
      body,
      from_address,
    };

    if (in_reply_to_id) {
      payload.in_reply_to_id = parseInt(in_reply_to_id);
    }

    const res = await fetch(`${workerUrl}/emails/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({ error: 'Unknown error' })) as { error?: string };
      return composePage(c, {
        replyTo: replyToEmail,
        error: `Failed to send: ${errBody.error || res.statusText}`,
      });
    }

    // Success — redirect to inbox with success message, or back to the email if replying
    if (replyToEmail) {
      return c.redirect(`/email/${replyToEmail.id}?sent=1`);
    }
    return c.redirect('/?sent=1');
  } catch (err: any) {
    return composePage(c, {
      replyTo: replyToEmail,
      error: `Error: ${err.message}`,
    });
  }
}
