import type { Context } from 'hono';
import { Layout } from '../layout';
import type { Env } from '../types';

interface Filter {
  id: number;
  name: string;
  field: string;
  operator: string;
  value: string;
  action: string;
  enabled: number;
  created_at: string;
}

const FIELD_LABELS: Record<string, string> = {
  from_address: 'From',
  subject: 'Subject',
  to_address: 'To',
};

const OPERATOR_LABELS: Record<string, string> = {
  contains: 'contains',
  equals: 'equals',
  starts_with: 'starts with',
};

export async function filtersPage(c: Context<{ Bindings: Env }>) {
  const filters = await c.env.MAILBOX.prepare(
    'SELECT * FROM email_filters ORDER BY created_at DESC'
  ).all<Filter>();

  return c.html(
    <Layout title="Filters">
      <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 20px;">Email Filters</h2>

      <form method="post" action="/filters" class="filter-form" style="margin-bottom: 24px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 2fr auto; gap: 8px; align-items: end;">
          <div class="form-field">
            <label>Name</label>
            <input type="text" name="name" placeholder="e.g. GitHub" required />
          </div>
          <div class="form-field">
            <label>Field</label>
            <select name="field">
              <option value="from_address">From</option>
              <option value="subject">Subject</option>
              <option value="to_address">To</option>
            </select>
          </div>
          <div class="form-field">
            <label>Operator</label>
            <select name="operator">
              <option value="contains">contains</option>
              <option value="equals">equals</option>
              <option value="starts_with">starts with</option>
            </select>
          </div>
          <div class="form-field">
            <label>Value</label>
            <input type="text" name="value" placeholder="e.g. notifications@github.com" required />
          </div>
          <button type="submit" class="btn-send" style="height: 38px; padding: 0 16px;">Add</button>
        </div>
      </form>

      {filters.results.length === 0 ? (
        <div class="empty">No filters yet. Add one above to start filtering emails from your inbox.</div>
      ) : (
        <div class="email-list">
          {filters.results.map((filter) => (
            <div class="email-row" style="align-items: center;">
              <div>
                <div class="from" style="font-weight: 500; color: var(--text);">
                  {filter.name}
                  {!filter.enabled && <span style="color: var(--text-muted); font-weight: 400;"> (disabled)</span>}
                </div>
                <div class="subject" style="color: var(--text-muted);">
                  Hide when <strong>{FIELD_LABELS[filter.field] || filter.field}</strong>{' '}
                  {OPERATOR_LABELS[filter.operator] || filter.operator}{' '}
                  "<code>{filter.value}</code>"
                </div>
              </div>
              <div style="display: flex; gap: 8px; align-items: center;">
                <form method="post" action={`/filters/${filter.id}/toggle`} style="display: inline;">
                  <button
                    type="submit"
                    style="background: none; border: 1px solid var(--border); border-radius: 4px; padding: 4px 10px; color: var(--text-muted); font-size: 12px; cursor: pointer;"
                  >
                    {filter.enabled ? 'Disable' : 'Enable'}
                  </button>
                </form>
                <form method="post" action={`/filters/${filter.id}/delete`} style="display: inline;">
                  <button
                    type="submit"
                    style="background: none; border: 1px solid var(--border); border-radius: 4px; padding: 4px 10px; color: var(--danger); font-size: 12px; cursor: pointer;"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

export async function handleCreateFilter(c: Context<{ Bindings: Env }>) {
  const body = await c.req.parseBody();
  const name = (body.name as string || '').trim();
  const field = body.field as string || 'from_address';
  const operator = body.operator as string || 'contains';
  const value = (body.value as string || '').trim();

  if (!name || !value) {
    return c.redirect('/filters');
  }

  await c.env.MAILBOX.prepare(
    'INSERT INTO email_filters (name, field, operator, value) VALUES (?, ?, ?, ?)'
  ).bind(name, field, operator, value).run();

  return c.redirect('/filters');
}

export async function handleToggleFilter(c: Context<{ Bindings: Env }>) {
  const id = parseInt(c.req.param('id') || '');
  if (isNaN(id)) return c.redirect('/filters');

  await c.env.MAILBOX.prepare(
    'UPDATE email_filters SET enabled = CASE WHEN enabled = 1 THEN 0 ELSE 1 END WHERE id = ?'
  ).bind(id).run();

  return c.redirect('/filters');
}

export async function handleDeleteFilter(c: Context<{ Bindings: Env }>) {
  const id = parseInt(c.req.param('id') || '');
  if (isNaN(id)) return c.redirect('/filters');

  await c.env.MAILBOX.prepare('DELETE FROM email_filters WHERE id = ?').bind(id).run();

  return c.redirect('/filters');
}
