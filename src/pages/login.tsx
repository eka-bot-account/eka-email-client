import type { Context } from 'hono';
import { setCookie } from 'hono/cookie';
import { Layout } from '../layout';
import type { Env } from '../types';

export function loginPage(c: Context<{ Bindings: Env }>, error?: string) {
  return c.html(
    <Layout title="Login">
      <div style="max-width: 360px; margin: 80px auto;">
        <h2 style="font-size: 24px; margin-bottom: 24px; text-align: center;">Sign in</h2>
        {error && (
          <div style="background: rgba(239,68,68,0.1); color: #ef4444; padding: 8px 12px; border-radius: 6px; font-size: 13px; margin-bottom: 16px;">
            {error}
          </div>
        )}
        <form method="post" action="/login">
          <input
            type="password"
            name="token"
            placeholder="Access token"
            autofocus
            style="width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 10px 12px; color: var(--text); font-size: 14px; margin-bottom: 12px; outline: none;"
          />
          <button
            type="submit"
            style="width: 100%; background: var(--accent-dim); color: #fff; border: none; border-radius: 6px; padding: 10px; font-size: 14px; cursor: pointer;"
          >
            Sign in
          </button>
        </form>
      </div>
    </Layout>
  );
}

export async function handleLogin(c: Context<{ Bindings: Env }>) {
  const body = await c.req.parseBody();
  const token = body['token'] as string;

  if (!token || token !== c.env.AUTH_TOKEN) {
    return loginPage(c, 'Invalid token');
  }

  setCookie(c, 'eka_mail_session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return c.redirect('/');
}
