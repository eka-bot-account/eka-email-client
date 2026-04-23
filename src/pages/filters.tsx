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

const FIELD_ICONS: Record<string, string> = {
  from_address: '\u2190',
  subject: '\u2261',
  to_address: '\u2192',
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

  const suggestions = JSON.stringify({
    from_address: fromSuggestions.results.map((r) => r.value),
    subject: subjectSuggestions.results.map((r) => r.value),
    to_address: toSuggestions.results.map((r) => r.value),
  });

  const activeCount = filters.results.filter((f) => f.enabled).length;
  const totalCount = filters.results.length;

  return c.html(
    <Layout title="Filters">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700&display=swap');

        .filters-page {
          --f-accent: #ff6b35;
          --f-accent-glow: rgba(255, 107, 53, 0.15);
          --f-accent-dim: #cc5429;
          --f-enabled: #22c55e;
          --f-enabled-glow: rgba(34, 197, 94, 0.12);
          --f-disabled: #555;
          --f-card: #141414;
          --f-card-border: #1e1e1e;
          --f-card-hover: #191919;
          --f-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
          --f-sans: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          font-family: var(--f-sans);
        }

        /* ── Header Section ── */
        .filters-hero {
          margin-bottom: 36px;
          position: relative;
        }

        .filters-hero::after {
          content: '';
          position: absolute;
          bottom: -18px;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, var(--f-accent) 0%, transparent 60%);
        }

        .filters-title {
          font-family: var(--f-sans);
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: #fff;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .filters-title .icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: var(--f-accent-glow);
          border: 1px solid rgba(255, 107, 53, 0.25);
          border-radius: 8px;
          font-size: 16px;
        }

        .filters-subtitle {
          font-size: 14px;
          color: var(--text-muted);
          margin-left: 50px;
          line-height: 1.5;
        }

        .filters-stats {
          display: flex;
          gap: 20px;
          margin-left: 50px;
          margin-top: 12px;
        }

        .stat-chip {
          font-family: var(--f-mono);
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 4px;
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .stat-chip .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
        }

        .stat-chip .dot.active { background: var(--f-enabled); box-shadow: 0 0 6px var(--f-enabled-glow); }
        .stat-chip .dot.total { background: var(--f-accent); }

        /* ── Filter Cards ── */
        .filter-grid {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-bottom: 32px;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid var(--f-card-border);
        }

        .filter-card {
          background: var(--f-card);
          padding: 16px 20px;
          display: grid;
          grid-template-columns: 6px 1fr auto;
          gap: 16px;
          align-items: center;
          transition: background 0.2s ease, transform 0.15s ease;
          position: relative;
          animation: cardSlideIn 0.3s ease both;
        }

        .filter-card:hover {
          background: var(--f-card-hover);
        }

        @keyframes cardSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .filter-indicator {
          width: 6px;
          height: 32px;
          border-radius: 3px;
          transition: all 0.3s ease;
        }

        .filter-indicator.on {
          background: var(--f-enabled);
          box-shadow: 0 0 8px var(--f-enabled-glow), 0 0 20px rgba(34, 197, 94, 0.06);
        }

        .filter-indicator.off {
          background: var(--f-disabled);
          opacity: 0.4;
        }

        .filter-info {
          min-width: 0;
        }

        .filter-name {
          font-weight: 600;
          font-size: 14px;
          color: #fff;
          margin-bottom: 4px;
          letter-spacing: -0.01em;
        }

        .filter-card[data-disabled="true"] .filter-name {
          color: var(--text-muted);
        }

        .filter-rule {
          font-family: var(--f-mono);
          font-size: 12px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .rule-field {
          background: rgba(255, 107, 53, 0.08);
          color: var(--f-accent);
          padding: 2px 8px;
          border-radius: 3px;
          font-weight: 500;
          border: 1px solid rgba(255, 107, 53, 0.15);
        }

        .rule-op {
          color: #666;
          font-style: italic;
        }

        .rule-value {
          color: var(--accent);
          max-width: 300px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .filter-card[data-disabled="true"] .rule-field {
          opacity: 0.5;
        }

        .filter-actions {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .action-btn {
          background: transparent;
          border: 1px solid transparent;
          border-radius: 6px;
          padding: 6px 14px;
          font-size: 12px;
          font-family: var(--f-sans);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--text-muted);
        }

        .action-btn:hover {
          background: var(--surface-hover);
          border-color: var(--border);
          color: var(--text);
        }

        .action-btn.toggle-off:hover {
          color: var(--f-enabled);
          border-color: rgba(34, 197, 94, 0.3);
          background: rgba(34, 197, 94, 0.06);
        }

        .action-btn.toggle-on:hover {
          color: #f59e0b;
          border-color: rgba(245, 158, 11, 0.3);
          background: rgba(245, 158, 11, 0.06);
        }

        .action-btn.delete:hover {
          color: var(--danger);
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.06);
        }

        /* ── Empty State ── */
        .empty-state {
          text-align: center;
          padding: 56px 20px;
          margin-bottom: 32px;
          border: 1px dashed #2a2a2a;
          border-radius: 10px;
          background: repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 20px,
            rgba(255, 107, 53, 0.015) 20px,
            rgba(255, 107, 53, 0.015) 40px
          );
        }

        .empty-icon {
          font-size: 32px;
          margin-bottom: 12px;
          opacity: 0.4;
          filter: grayscale(0.5);
        }

        .empty-text {
          font-size: 15px;
          color: var(--text-muted);
          font-weight: 500;
          margin-bottom: 4px;
        }

        .empty-hint {
          font-size: 13px;
          color: #555;
        }

        /* ── Create Form ── */
        .create-section {
          position: relative;
        }

        .create-panel {
          background: var(--f-card);
          border: 1px solid var(--f-card-border);
          border-radius: 10px;
          overflow: hidden;
        }

        .create-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--f-card-border);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .create-header h3 {
          font-family: var(--f-sans);
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          letter-spacing: -0.01em;
        }

        .create-header .plus-icon {
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--f-accent-glow);
          border: 1px solid rgba(255, 107, 53, 0.2);
          border-radius: 5px;
          font-size: 14px;
          font-weight: 600;
          color: var(--f-accent);
        }

        .create-body {
          padding: 20px;
        }

        .create-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-row {
          display: grid;
          gap: 12px;
        }

        .form-row.two-col {
          grid-template-columns: 1fr 1fr;
        }

        .form-row.auto-fill {
          grid-template-columns: 160px 1fr;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .field-label {
          font-size: 11px;
          font-weight: 600;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-family: var(--f-mono);
        }

        .field-input,
        .field-select {
          background: #0c0c0c;
          border: 1px solid #222;
          border-radius: 6px;
          padding: 10px 12px;
          color: var(--text);
          font-size: 14px;
          font-family: var(--f-sans);
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .field-input:focus,
        .field-select:focus {
          border-color: var(--f-accent-dim);
          box-shadow: 0 0 0 3px var(--f-accent-glow);
        }

        .field-input::placeholder {
          color: #3a3a3a;
        }

        .field-select {
          cursor: pointer;
          -webkit-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' fill='%23555' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 32px;
        }

        .submit-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-top: 4px;
        }

        .btn-create {
          background: var(--f-accent);
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 10px 28px;
          font-size: 14px;
          font-weight: 600;
          font-family: var(--f-sans);
          cursor: pointer;
          transition: all 0.2s ease;
          letter-spacing: -0.01em;
        }

        .btn-create:hover {
          background: #ff7d4f;
          box-shadow: 0 4px 16px rgba(255, 107, 53, 0.25);
          transform: translateY(-1px);
        }

        .btn-create:active {
          transform: translateY(0);
          box-shadow: none;
        }

        .submit-hint {
          font-size: 12px;
          color: #444;
          font-family: var(--f-mono);
        }

        /* ── Suggestions Dropdown ── */
        .suggestions-dropdown {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #111;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          max-height: 220px;
          overflow-y: auto;
          z-index: 20;
          margin-top: 4px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
          scrollbar-width: thin;
          scrollbar-color: #333 transparent;
        }

        .suggestions-dropdown::-webkit-scrollbar {
          width: 6px;
        }

        .suggestions-dropdown::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 3px;
        }

        .suggestions-dropdown.active {
          display: block;
          animation: dropdownReveal 0.15s ease;
        }

        @keyframes dropdownReveal {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .suggestion-item {
          padding: 10px 14px;
          font-size: 13px;
          font-family: var(--f-mono);
          cursor: pointer;
          color: var(--text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: background 0.1s ease;
          border-bottom: 1px solid #1a1a1a;
        }

        .suggestion-item:last-child {
          border-bottom: none;
        }

        .suggestion-item:hover {
          background: #1a1a1a;
          color: var(--text);
        }

        .suggestion-item .hl {
          color: var(--f-accent);
          font-weight: 600;
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .form-row.two-col,
          .form-row.auto-fill {
            grid-template-columns: 1fr;
          }

          .filter-card {
            grid-template-columns: 4px 1fr;
            gap: 12px;
          }

          .filter-actions {
            grid-column: 2;
            justify-self: start;
          }

          .filters-title { font-size: 22px; }
          .filters-subtitle, .filters-stats { margin-left: 0; }
          .filters-title .icon { display: none; }
        }
      `}</style>

      <div class="filters-page">
        {/* ── Hero ── */}
        <div class="filters-hero">
          <div class="filters-title">
            <span class="icon">{'\u2AF6'}</span>
            Filters
          </div>
          <p class="filters-subtitle">
            Rules that hide matching emails from your inbox. Filtered emails are still searchable.
          </p>
          {totalCount > 0 && (
            <div class="filters-stats">
              <div class="stat-chip">
                <span class="dot active"></span>
                {activeCount} active
              </div>
              <div class="stat-chip">
                <span class="dot total"></span>
                {totalCount} total
              </div>
            </div>
          )}
        </div>

        {/* ── Filter List ── */}
        {filters.results.length > 0 ? (
          <div class="filter-grid">
            {filters.results.map((f, i) => (
              <div
                class="filter-card"
                data-disabled={f.enabled ? 'false' : 'true'}
                style={`animation-delay: ${i * 0.05}s;`}
              >
                <div class={`filter-indicator ${f.enabled ? 'on' : 'off'}`}></div>
                <div class="filter-info">
                  <div class="filter-name">{f.name}</div>
                  <div class="filter-rule">
                    <span class="rule-field">{FIELD_ICONS[f.field] || ''} {FIELD_LABELS[f.field] || f.field}</span>
                    <span class="rule-op">{OPERATOR_LABELS[f.operator] || f.operator}</span>
                    <span class="rule-value">&ldquo;{f.value}&rdquo;</span>
                  </div>
                </div>
                <div class="filter-actions">
                  <form method="post" action={`/filters/${f.id}/toggle`} style="margin: 0;">
                    <button
                      type="submit"
                      class={`action-btn ${f.enabled ? 'toggle-on' : 'toggle-off'}`}
                      title={f.enabled ? 'Pause filter' : 'Activate filter'}
                    >
                      {f.enabled ? 'Pause' : 'Activate'}
                    </button>
                  </form>
                  <form method="post" action={`/filters/${f.id}/delete`} style="margin: 0;">
                    <button type="submit" class="action-btn delete" title="Delete filter">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div class="empty-state">
            <div class="empty-icon">{'\u2AF6'}</div>
            <div class="empty-text">No filters yet</div>
            <div class="empty-hint">Create your first rule below to start filtering noise</div>
          </div>
        )}

        {/* ── Create Form ── */}
        <div class="create-section">
          <div class="create-panel">
            <div class="create-header">
              <span class="plus-icon">+</span>
              <h3>New filter</h3>
            </div>
            <div class="create-body">
              <form method="post" action="/filters" class="create-form">
                <div class="form-row two-col">
                  <div class="field-group">
                    <label class="field-label" for="name">Name</label>
                    <input class="field-input" type="text" name="name" id="name" placeholder="GitHub Notifications" required />
                  </div>
                  <div class="field-group">
                    <label class="field-label" for="filter-field">Field</label>
                    <select class="field-select" name="field" id="filter-field">
                      <option value="from_address">{'\u2190'} From</option>
                      <option value="subject">{'\u2261'} Subject</option>
                      <option value="to_address">{'\u2192'} To</option>
                    </select>
                  </div>
                </div>

                <div class="form-row auto-fill">
                  <div class="field-group">
                    <label class="field-label" for="operator">Operator</label>
                    <select class="field-select" name="operator" id="operator">
                      <option value="contains">contains</option>
                      <option value="equals">equals</option>
                      <option value="starts_with">starts with</option>
                    </select>
                  </div>
                  <div class="field-group" style="position: relative;">
                    <label class="field-label" for="filter-value">Value</label>
                    <input
                      class="field-input"
                      type="text"
                      name="value"
                      id="filter-value"
                      placeholder="notifications@github.com"
                      required
                      autocomplete="off"
                    />
                    <div id="suggestions" class="suggestions-dropdown"></div>
                  </div>
                </div>

                <div class="submit-row">
                  <button type="submit" class="btn-create">Add filter</button>
                  <span class="submit-hint">Filter takes effect immediately</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

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
                    '<span class="hl">' + escapeHtml(item.substring(idx, idx + filter.length)) + '</span>' +
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
            valueInput.placeholder = fieldSelect.value === 'from_address' ? 'notifications@github.com' :
              fieldSelect.value === 'subject' ? 'Weekly digest' :
              'eka@ai.weiyen.net';
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
