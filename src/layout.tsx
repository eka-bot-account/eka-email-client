import type { FC } from 'hono/jsx';

const css = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700&family=Outfit:wght@400;500;600;700;800&display=swap');

:root {
  --bg: #08080a;
  --bg-subtle: #0c0c0e;
  --surface: #111114;
  --surface-hover: #161619;
  --surface-active: #1a1a1e;
  --border: #1e1e24;
  --border-hover: #2a2a32;
  --text: #e2e2ea;
  --text-secondary: #9898a8;
  --text-muted: #5a5a6e;
  --accent: #ff6b35;
  --accent-hover: #ff7d4f;
  --accent-dim: #cc5429;
  --accent-glow: rgba(255, 107, 53, 0.12);
  --accent-glow-strong: rgba(255, 107, 53, 0.25);
  --blue: #5b8def;
  --blue-dim: rgba(91, 141, 239, 0.12);
  --purple: #a78bfa;
  --purple-dim: rgba(167, 139, 250, 0.12);
  --green: #34d399;
  --green-dim: rgba(52, 211, 153, 0.10);
  --red: #f87171;
  --red-dim: rgba(248, 113, 113, 0.10);
  --yellow: #fbbf24;
  --unread: #fff;
  --mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
  --heading: 'Outfit', 'DM Sans', -apple-system, sans-serif;
  --body: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --radius: 8px;
  --radius-lg: 12px;
  --transition: 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

* { margin: 0; padding: 0; box-sizing: border-box; }

html {
  font-size: 15px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--body);
  background: var(--bg);
  color: var(--text);
  line-height: 1.55;
  min-height: 100vh;
  position: relative;
}

/* Noise texture overlay */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  opacity: 0.015;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 128px 128px;
  pointer-events: none;
  z-index: 0;
}

/* Subtle top gradient glow */
body::after {
  content: '';
  position: fixed;
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 400px;
  background: radial-gradient(ellipse, rgba(255, 107, 53, 0.04) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

a { color: var(--accent); text-decoration: none; transition: color var(--transition); }
a:hover { color: var(--accent-hover); }

::selection {
  background: rgba(255, 107, 53, 0.2);
  color: #fff;
}

.container {
  max-width: 940px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;
}

/* ═══════════════ HEADER ═══════════════ */

header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(8, 8, 10, 0.85);
  backdrop-filter: blur(16px) saturate(1.4);
  -webkit-backdrop-filter: blur(16px) saturate(1.4);
  border-bottom: 1px solid var(--border);
  padding: 0;
}

header::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 5%, var(--accent) 30%, var(--accent) 70%, transparent 95%);
  opacity: 0.15;
}

header .inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
}

header h1 {
  font-family: var(--heading);
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.03em;
  display: flex;
  align-items: center;
  gap: 10px;
}

header h1 a {
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 10px;
}
header h1 a:hover { color: #fff; }

.logo-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%);
  border-radius: 6px;
  font-family: var(--heading);
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.25);
}

header nav {
  display: flex;
  gap: 2px;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
  background: var(--surface);
  border-radius: var(--radius);
  padding: 3px;
  border: 1px solid var(--border);
}

header nav a {
  color: var(--text-muted);
  padding: 6px 14px;
  border-radius: 6px;
  transition: all var(--transition);
  font-family: var(--body);
}

header nav a:hover {
  color: var(--text);
  background: var(--surface-hover);
}

header nav a.active {
  color: var(--text);
  background: var(--surface-active);
  font-weight: 600;
}

header nav .nav-compose {
  background: var(--accent);
  color: #fff !important;
  font-weight: 600;
  margin-left: 2px;
}

header nav .nav-compose:hover {
  background: var(--accent-hover);
  box-shadow: 0 2px 12px rgba(255, 107, 53, 0.3);
}

/* ═══════════════ PAGE ANIMATIONS ═══════════════ */

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

main {
  animation: fadeIn 0.3s ease;
  padding-top: 28px;
  padding-bottom: 60px;
}

/* ═══════════════ SEARCH ═══════════════ */

.search-form {
  display: flex;
  gap: 0;
  margin-bottom: 24px;
  position: relative;
}

.search-form input[type="text"] {
  flex: 1;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius) 0 0 var(--radius);
  padding: 11px 16px;
  color: var(--text);
  font-size: 14px;
  font-family: var(--body);
  outline: none;
  transition: border-color var(--transition), box-shadow var(--transition);
}

.search-form input[type="text"]::placeholder {
  color: var(--text-muted);
  font-family: var(--mono);
  font-size: 13px;
}

.search-form input[type="text"]:focus {
  border-color: var(--accent-dim);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.search-form button {
  background: var(--accent);
  color: #fff;
  border: 1px solid var(--accent);
  border-left: none;
  border-radius: 0 var(--radius) var(--radius) 0;
  padding: 11px 20px;
  font-size: 13px;
  font-family: var(--mono);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
  letter-spacing: 0.02em;
}

.search-form button:hover {
  background: var(--accent-hover);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

/* ═══════════════ EMAIL LIST ═══════════════ */

.email-list {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface);
}

.email-row {
  display: grid;
  grid-template-columns: 6px 1fr auto;
  gap: 0 14px;
  padding: 14px 18px 14px 0;
  border-bottom: 1px solid var(--border);
  transition: all var(--transition);
  color: var(--text-secondary);
  font-size: 14px;
  position: relative;
  animation: slideUp 0.35s ease both;
}

.email-row:last-child { border-bottom: none; }

.email-row:hover {
  background: var(--surface-hover);
}

.email-row .row-indicator {
  width: 6px;
  align-self: stretch;
  border-radius: 0;
  transition: background var(--transition);
}

.email-row:hover .row-indicator {
  background: var(--accent-glow);
}

.email-row.unread {
  color: var(--unread);
  font-weight: 500;
}

.email-row.unread .row-indicator {
  background: var(--accent);
}

.email-row .from {
  font-family: var(--mono);
  font-size: 12px;
  margin-bottom: 3px;
  letter-spacing: -0.01em;
  color: var(--text-muted);
}

.email-row.unread .from {
  color: var(--accent);
}

.email-row .subject {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: inherit;
}

.email-row .meta {
  text-align: right;
  white-space: nowrap;
  font-size: 12px;
  font-family: var(--mono);
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
  padding-top: 1px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: var(--mono);
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.badge.inbound {
  background: var(--blue-dim);
  color: var(--blue);
  border: 1px solid rgba(91, 141, 239, 0.15);
}

.badge.outbound {
  background: var(--purple-dim);
  color: var(--purple);
  border: 1px solid rgba(167, 139, 250, 0.15);
}

/* ═══════════════ EMAIL DETAIL ═══════════════ */

.email-detail {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  animation: slideUp 0.4s ease;
}

.email-header {
  padding: 24px;
  border-bottom: 1px solid var(--border);
  position: relative;
}

.email-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, var(--accent), transparent);
}

.email-header h2 {
  font-family: var(--heading);
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 16px;
  letter-spacing: -0.025em;
  color: #fff;
  line-height: 1.3;
}

.email-header .meta-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px 14px;
  font-size: 13px;
  color: var(--text-secondary);
}

.email-header .meta-grid .label {
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding-top: 2px;
}

.email-body {
  padding: 24px;
  font-size: 14px;
  line-height: 1.75;
  overflow-x: auto;
}

.email-body pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: var(--body);
  color: var(--text);
}

.email-body-html {
  padding: 20px;
}

.email-body-html iframe {
  width: 100%;
  min-height: 400px;
  border: none;
  background: #fff;
  border-radius: var(--radius);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 13px;
  font-family: var(--mono);
  color: var(--text-muted);
  padding: 6px 12px;
  border-radius: var(--radius);
  transition: all var(--transition);
  margin-left: -12px;
}

.back-link:hover {
  color: var(--accent);
  background: var(--accent-glow);
}

/* ═══════════════ PAGINATION ═══════════════ */

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  font-size: 12px;
  font-family: var(--mono);
  color: var(--text-muted);
}

.pagination a {
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 12px;
  font-family: var(--mono);
  font-weight: 500;
  transition: all var(--transition);
  color: var(--text-secondary);
}

.pagination a:hover {
  background: var(--surface);
  border-color: var(--accent-dim);
  color: var(--accent);
  box-shadow: 0 2px 8px var(--accent-glow);
}

/* ═══════════════ EMPTY STATE ═══════════════ */

.empty {
  text-align: center;
  padding: 64px 20px;
  color: var(--text-muted);
  font-size: 14px;
  border: 1px dashed var(--border);
  border-radius: var(--radius-lg);
  background: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 20px,
    rgba(255, 107, 53, 0.01) 20px,
    rgba(255, 107, 53, 0.01) 40px
  );
}

/* ═══════════════ FILTER BAR ═══════════════ */

.filter-bar {
  display: flex;
  gap: 2px;
  margin-bottom: 20px;
  font-size: 13px;
  background: var(--surface);
  border-radius: var(--radius);
  padding: 3px;
  border: 1px solid var(--border);
  width: fit-content;
}

.filter-bar a {
  padding: 6px 16px;
  border-radius: 6px;
  color: var(--text-muted);
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 500;
  transition: all var(--transition);
}

.filter-bar a:hover {
  background: var(--surface-hover);
  color: var(--text-secondary);
}

.filter-bar a.active {
  background: var(--surface-active);
  color: var(--text);
  font-weight: 600;
}

/* ═══════════════ STATS ═══════════════ */

.stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  font-family: var(--mono);
  color: var(--text-muted);
  margin-bottom: 16px;
}

.stats .stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stats .stat-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.stats .stat-dot.total { background: var(--text-muted); }
.stats .stat-dot.unread {
  background: var(--accent);
  box-shadow: 0 0 6px var(--accent-glow-strong);
}

/* ═══════════════ FORMS ═══════════════ */

.compose-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.form-field input,
.form-field select,
.form-field textarea {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 11px 14px;
  color: var(--text);
  font-size: 14px;
  font-family: var(--body);
  outline: none;
  transition: border-color var(--transition), box-shadow var(--transition);
}

.form-field input::placeholder,
.form-field textarea::placeholder {
  color: var(--text-muted);
  font-family: var(--mono);
  font-size: 13px;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  border-color: var(--accent-dim);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.form-field select {
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%235a5a6e' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 36px;
}

.form-field textarea {
  resize: vertical;
  min-height: 220px;
  line-height: 1.65;
  font-family: var(--body);
}

.form-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  padding-top: 8px;
}

.btn-send {
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  padding: 11px 28px;
  font-size: 14px;
  font-family: var(--body);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
  letter-spacing: -0.01em;
}

.btn-send:hover {
  background: var(--accent-hover);
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.3);
  transform: translateY(-1px);
}

.btn-send:active {
  transform: translateY(0);
  box-shadow: none;
}

.btn-cancel {
  color: var(--text-muted);
  font-size: 13px;
  font-family: var(--mono);
  padding: 11px 18px;
  border-radius: var(--radius);
  transition: all var(--transition);
}

.btn-cancel:hover { color: var(--text); background: var(--surface-hover); }

.btn-reply {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 20px;
  color: var(--text-secondary);
  font-size: 13px;
  font-family: var(--mono);
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: all var(--transition);
}

.btn-reply:hover {
  background: var(--surface-hover);
  border-color: var(--accent-dim);
  color: var(--accent);
  box-shadow: 0 2px 12px var(--accent-glow);
}

/* ═══════════════ BANNERS ═══════════════ */

.sent-banner {
  background: var(--green-dim);
  color: var(--green);
  padding: 12px 16px;
  border-radius: var(--radius);
  font-size: 13px;
  font-family: var(--mono);
  font-weight: 500;
  margin-bottom: 20px;
  border: 1px solid rgba(52, 211, 153, 0.15);
  display: flex;
  align-items: center;
  gap: 8px;
  animation: slideDown 0.3s ease;
}

.error-banner {
  background: var(--red-dim);
  color: var(--red);
  padding: 12px 16px;
  border-radius: var(--radius);
  font-size: 13px;
  font-family: var(--mono);
  font-weight: 500;
  margin-bottom: 20px;
  border: 1px solid rgba(248, 113, 113, 0.15);
  animation: slideDown 0.3s ease;
}

/* ═══════════════ PAGE TITLES ═══════════════ */

.page-title {
  font-family: var(--heading);
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #fff;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title .title-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: var(--accent-glow);
  border: 1px solid rgba(255, 107, 53, 0.2);
  border-radius: var(--radius);
  font-size: 15px;
}

.page-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 24px;
  font-family: var(--mono);
}

/* ═══════════════ SECTION CARDS ═══════════════ */

.section-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  animation: slideUp 0.4s ease;
}

.section-card-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-card-header h3 {
  font-family: var(--heading);
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.section-card-header .header-icon {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-glow);
  border: 1px solid rgba(255, 107, 53, 0.2);
  border-radius: 5px;
  font-size: 12px;
  color: var(--accent);
  font-weight: 700;
}

.section-card-body {
  padding: 20px;
}

/* ═══════════════ RESPONSIVE ═══════════════ */

@media (max-width: 640px) {
  .container { padding: 0 14px; }

  header nav {
    gap: 1px;
    padding: 2px;
  }

  header nav a {
    padding: 5px 10px;
    font-size: 12px;
  }

  .email-row {
    grid-template-columns: 4px 1fr auto;
    padding: 12px 14px 12px 0;
    gap: 0 10px;
  }

  .email-header { padding: 18px; }
  .email-body { padding: 18px; }

  .page-title { font-size: 20px; }
  .page-title .title-icon { display: none; }
}

/* ═══════════════ SCROLLBAR ═══════════════ */

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #2a2a32; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #3a3a44; }
html { scrollbar-width: thin; scrollbar-color: #2a2a32 transparent; }

/* ═══════════════ HIGHLIGHT (search) ═══════════════ */

mark {
  background: rgba(255, 107, 53, 0.2);
  color: var(--accent);
  border-radius: 2px;
  padding: 0 2px;
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
          <h1>
            <a href="/">
              <span class="logo-mark">E</span>
              Eka Mail
            </a>
          </h1>
          <nav>
            <a href="/">Inbox</a>
            <a href="/search">Search</a>
            <a href="/filters">Filters</a>
            <a href="/compose" class="nav-compose">Compose</a>
          </nav>
        </div>
      </header>
      <main class="container">
        {children}
      </main>
    </body>
  </html>
);
