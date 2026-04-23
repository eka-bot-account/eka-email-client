import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import type { Env } from './types';
import { inboxPage } from './pages/inbox';
import { emailPage } from './pages/email';
import { searchPage } from './pages/search';
import { loginPage, handleLogin } from './pages/login';
import { composePage, handleCompose } from './pages/compose';
import { filtersPage, handleCreateFilter, handleToggleFilter, handleDeleteFilter } from './pages/filters';

const app = new Hono<{ Bindings: Env }>();

// Auth middleware — cookie-based session after login
app.use('*', async (c, next) => {
  const path = c.req.path;

  // Allow login page and health check without auth
  if (path === '/login' || path === '/health') {
    return next();
  }

  const token = getCookie(c, 'eka_mail_session');
  if (!token || token !== c.env.AUTH_TOKEN) {
    // Redirect to login
    return c.redirect('/login');
  }

  return next();
});

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

// Login
app.get('/login', (c) => loginPage(c));
app.post('/login', (c) => handleLogin(c));

// Inbox
app.get('/', (c) => inboxPage(c));

// Email detail
app.get('/email/:id', (c) => emailPage(c));

// Search
app.get('/search', (c) => searchPage(c));

// Compose
app.get('/compose', (c) => composePage(c));
app.post('/compose', (c) => handleCompose(c));

// Filters
app.get('/filters', (c) => filtersPage(c));
app.post('/filters', (c) => handleCreateFilter(c));
app.post('/filters/:id/toggle', (c) => handleToggleFilter(c));
app.post('/filters/:id/delete', (c) => handleDeleteFilter(c));

// Reply (loads compose with reply context)
app.get('/reply/:id', async (c) => {
  const id = parseInt(c.req.param('id') || '');
  if (isNaN(id)) return c.redirect('/');

  const email = await c.env.MAILBOX.prepare(
    'SELECT * FROM emails WHERE id = ?'
  ).bind(id).first();

  if (!email) return c.redirect('/');
  return composePage(c, { replyTo: email as any });
});

export default app;
