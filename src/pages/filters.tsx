import type { Context } from 'hono';
import { Layout } from '../layout';
import type { Env } from '../types';

interface Filter {
  id: number;
  name: string;
  field: string;
  operator: string;
  value: string;
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

  // Fetch suggestions for each field
  const [fromSuggestions, subjectSuggestions, toSuggestions] = await Promise.all([
    c.env.MAILBOX.prepare(
      `SELECT from_address as value, COUNT(*) as cnt
       FROM emails GROUP BY from_address ORDER BY cnt DESC LIMIT 20`
    ).all<{ value: string; cnt: number }>(),
    c.env.MAILBOX.prepare(
      `SELECT DISTINCT subject as value FROM emails ORDER BY received_at DESC LIMIT 30`
    ).all<{ value: string }>(),
    c.env.MAILBOX.prepare(
      `SELECT to_address as value, COUNT(*) as cnt
       FROM emails GROUP BY to_address ORDER BY cnt DESC LIMIT 20`
    ).all<{ value: string; cnt: number }>(),
  ]);

  // Build JSON for suggestions
  const suggestions = JSON.stringify({
    from_address: fromSuggestions.results.map((r) => r.value),
    subject: subjectSuggestions.results.map((r) => r.value),
    to_address: toSuggestions.results.map((r) => r.value),
  });

  return c.html(
    <Layout title="Filters">
      <h2 style="font-size: 18px; margin-bottom: 16px;">Inbox Filters</h2>
      <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 20px;">
        Filters hide matching emails from your inbox. They're still accessible via search.
      </p>

      {/* Existing filters */}
      {filters.results.length > 0 ? (
        <div class="email-list" style="margin-bottom: 28px;">
          {filters.results.map((f) => (
            <div class="email-row" style={`opacity: ${f.enabled ? 1 : 0.5};`}>
              <div>
                <div class="from" style="font-size: 13px; font-weight: 500;">
                  {f.name}
                </div>
                <div class="subject" style="font-size: 13px; color: var(--text-muted);">
                  {FIELD_LABELS[f.field] || f.field} {OPERATOR_LABELS[f.operator] || f.operator} "{f.value}"
                </div>
              </div>
              <div style="display: flex; gap: 8px; align-items: center;">
                <form method="post" action={`/filters/${f.id}/toggle`} style="margin: 0;">
                  <button
                    type="submit"
                    class="filter-action-btn"
                    title={f.enabled ? 'Disable' : 'Enable'}
                  >
                    {f.enabled ? 'Disable' : 'Enable'}
                  </button>
                </form>
                <form method="post" action={`/filters/${f.id}/delete`} style="margin: 0;">
                  <button type="submit" class="filter-action-btn danger" title="Delete">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div class="empty" style="margin-bottom: 28px;">No filters yet.</div>
      )}

      {/* Create new filter */}
      <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 20px;">
        <h3 style="font-size: 15px; margin-bottom: 14px;">Add filter</h3>
        <form method="post" action="/filters" class="compose-form">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div class="form-field">
              <label for="name">Name</label>
              <input type="text" name="name" id="name" placeholder="e.g. GitHub Notifications" required />
            </div>

            <div class="form-field">
              <label for="field">Field</label>
              <select name="field" id="filter-field">
                <option value="from_address">From</option>
                <option value="subject">Subject</option>
                <option value="to_address">To</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: auto 1fr; gap: 14px;">
            <div class="form-field">
              <label for="operator">Operator</label>
              <select name="operator" id="operator">
                <option value="contains">contains</option>
                <option value="equals">equals</option>
                <option value="starts_with">starts with</option>
              </select>
            </div>

            <div class="form-field" style="position: relative;">
              <label for="value">Value</label>
              <input
                type="text"
                name="value"
                id="filter-value"
                placeholder="e.g. notifications@github.com"
                required
                autocomplete="off"
              />
              <div id="suggestions" class="suggestions-dropdown"></div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-send">Add filter</button>
          </div>
        </form>
      </div>

      <style>{`
        .filter-action-btn {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 4px 10px;
          font-size: 12px;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s;
        }
        .filter-action-btn:hover {
          background: var(--surface-hover);
          color: var(--text);
          border-color: var(--accent-dim);
        }
        .filter-action-btn.danger:hover {
          color: var(--danger);
          border-color: var(--danger);
        }
        .suggestions-dropdown {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 6px;
          max-height: 200px;
          overflow-y: auto;
          z-index: 10;
          margin-top: 2px;
        }
        .suggestions-dropdown.active {
          display: block;
        }
        .suggestion-item {
          padding: 8px 12px;
          font-size: 13px;
          cursor: pointer;
          color: var(--text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .suggestion-item:hover {
          background: var(--surface-hover);
        }
        .suggestion-item .highlight {
          color: var(--accent);
          font-weight: 500;
        }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          var suggestions = ${suggestions};
          var fieldSelect = document.getElementById('filter-field');
          var valueInput = document.getElementById('filter-value');
          var dropdown = document.getElementById('suggestions');

          function renderSuggestions(items, filter) {
            dropdown.innerHTML = '';
            var filtered = items.filter(function(item) {
              if (!filter) return true;
              return item.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
            }).slice(0, 10);

            if (filtered.length === 0) {
              dropdown.classList.remove('active');
              return;
            }

            filtered.forEach(function(item) {
              var div = document.createElement('div');
              div.className = 'suggestion-item';
              if (filter) {
                var idx = item.toLowerCase().indexOf(filter.toLowerCase());
                if (idx !== -1) {
                  div.innerHTML = escapeHtml(item.substring(0, idx)) +
                    '<span class="highlight">' + escapeHtml(item.substring(idx, idx + filter.length)) + '</span>' +
                    escapeHtml(item.substring(idx + filter.length));
                } else {
                  div.textContent = item;
                }
              } else {
                div.textContent = item;
              }
              div.addEventListener('mousedown', function(e) {
                e.preventDefault();
                valueInput.value = item;
                dropdown.classList.remove('active');
              });
              dropdown.appendChild(div);
            });
            dropdown.classList.add('active');
          }

          function escapeHtml(str) {
            var div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
          }

          function getCurrentSuggestions() {
            return suggestions[fieldSelect.value] || [];
          }

          valueInput.addEventListener('focus', function() {
            renderSuggestions(getCurrentSuggestions(), valueInput.value);
          });

          valueInput.addEventListener('input', function() {
            renderSuggestions(getCurrentSuggestions(), valueInput.value);
          });

          valueInput.addEventListener('blur', function() {
            setTimeout(function() { dropdown.classList.remove('active'); }, 150);
          });

          fieldSelect.addEventListener('change', function() {
            valueInput.value = '';
            valueInput.placeholder = fieldSelect.value === 'from_address' ? 'e.g. notifications@github.com' :
              fieldSelect.value === 'subject' ? 'e.g. GitHub' :
              'e.g. eka@ai.weiyen.net';
            if (document.activeElement === valueInput) {
              renderSuggestions(getCurrentSuggestions(), '');
            }
          });
        })();
      ` }} />
    </Layout>
  );
}

export async function handleCreateFilter(c: Context<{ Bindings: Env }>) {
  const formData = await c.req.parseBody();
  const name = formData['name'] as string;
  const field = formData['field'] as string;
  const operator = formData['operator'] as string;
  const value = formData['value'] as string;

  if (!name || !field || !operator || !value) {
    return c.redirect('/filters');
  }

  // Validate field and operator
  const validFields = ['from_address', 'subject', 'to_address'];
  const validOperators = ['contains', 'equals', 'starts_with'];

  if (!validFields.includes(field) || !validOperators.includes(operator)) {
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

  await c.env.MAILBOX.prepare(
    'DELETE FROM email_filters WHERE id = ?'
  ).bind(id).run();

  return c.redirect('/filters');
}
