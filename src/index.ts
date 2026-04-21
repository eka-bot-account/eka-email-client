import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import type { Env } from './types';
import { inboxPage } from './pages/inbox';
import { emailPage } from './pages/email';
import { searchPage } from './pages/search';
import { loginPage, handleLogin } from './pages/login';

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

export default app;
