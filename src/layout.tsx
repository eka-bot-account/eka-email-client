import type { FC } from 'hono/jsx';

const css = `
:root {
  --bg: #0f0f0f;
  --surface: #1a1a1a;
  --surface-hover: #222;
  --border: #2a2a2a;
  --text: #e0e0e0;
  --text-muted: #888;
  --accent: #6d9fff;
  --accent-dim: #4a7adb;
  --unread: #fff;
  --badge-bg: #2563eb;
  --danger: #ef4444;
  --success: #22c55e;
  --inbound: #6d9fff;
  --outbound: #a78bfa;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
  min-height: 100vh;
}

a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 16px;
}

header {
  border-bottom: 1px solid var(--border);
  padding: 16px 0;
  margin-bottom: 24px;
}

header .inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

header h1 {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

header h1 a { color: var(--text); }
header h1 a:hover { text-decoration: none; }

header nav {
  display: flex;
  gap: 16px;
  align-items: center;
  font-size: 14px;
}

nav .active { color: var(--text); font-weight: 500; }

.search-form {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.search-form input[type="text"] {
  flex: 1;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 12px;
  color: var(--text);
  font-size: 14px;
  outline: none;
}

.search-form input[type="text"]:focus {
  border-color: var(--accent-dim);
}

.search-form button {
  background: var(--accent-dim);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
}

.search-form button:hover { background: var(--accent); }

.email-list {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.email-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  transition: background 0.1s;
  color: var(--text-muted);
  font-size: 14px;
}

.email-row:last-child { border-bottom: none; }
.email-row:hover { background: var(--surface-hover); }

.email-row.unread {
  color: var(--unread);
  font-weight: 500;
}

.email-row .from {
  font-size: 13px;
  margin-bottom: 2px;
}

.email-row .subject {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.email-row .meta {
  text-align: right;
  white-space: nowrap;
  font-size: 12px;
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.badge {
  display: inline-block;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.badge.inbound { background: rgba(109,159,255,0.15); color: var(--inbound); }
.badge.outbound { background: rgba(167,139,250,0.15); color: var(--outbound); }

.email-detail {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.email-header {
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

.email-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  letter-spacing: -0.01em;
}

.email-header .meta-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 12px;
  font-size: 13px;
  color: var(--text-muted);
}

.email-header .meta-grid .label {
  font-weight: 500;
  color: var(--text);
}

.email-body {
  padding: 20px;
  font-size: 14px;
  line-height: 1.7;
  overflow-x: auto;
}

.email-body pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
}

.email-body-html {
  padding: 20px;
}

.email-body-html iframe {
  width: 100%;
  min-height: 400px;
  border: none;
  background: #fff;
  border-radius: 4px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 16px;
  font-size: 14px;
  color: var(--text-muted);
}

.back-link:hover { color: var(--text); text-decoration: none; }

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  font-size: 13px;
  color: var(--text-muted);
}

.pagination a {
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
}

.pagination a:hover {
  background: var(--surface);
  text-decoration: none;
}

.empty {
  text-align: center;
  padding: 48px 16px;
  color: var(--text-muted);
  font-size: 14px;
}

.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 13px;
}

.filter-bar a {
  padding: 4px 12px;
  border-radius: 4px;
  color: var(--text-muted);
}

.filter-bar a:hover { background: var(--surface); text-decoration: none; }
.filter-bar a.active { background: var(--surface); color: var(--text); font-weight: 500; }

.stats {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 16px;
}
`;

export const Layout: FC<{ title?: string; children: any }> = ({ title, children }) => (
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{title ? `${title} — Eka Mail` : 'Eka Mail'}</title>
      <style>{css}</style>
    </head>
    <body>
      <header>
        <div class="container inner">
          <h1><a href="/">Eka Mail</a></h1>
          <nav>
            <a href="/">Inbox</a>
            <a href="/search">Search</a>
          </nav>
        </div>
      </header>
      <main class="container">
        {children}
      </main>
    </body>
  </html>
);
