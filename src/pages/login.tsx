import type { Context } from 'hono';
import { setCookie } from 'hono/cookie';
import { Layout } from '../layout';
import type { Env } from '../types';

export function loginPage(c: Context<{ Bindings: Env }>, error?: string) {
  return c.html(
    <Layout title="Login">
      <style>{`
        .login-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 180px);
        }

        .login-card {
          width: 100%;
          max-width: 380px;
          animation: loginReveal 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        @keyframes loginReveal {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .login-brand {
          text-align: center;
          margin-bottom: 36px;
        }

        .login-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%);
          border-radius: 14px;
          font-family: var(--heading);
          font-size: 22px;
          font-weight: 800;
          color: #fff;
          margin-bottom: 16px;
          box-shadow: 0 8px 32px rgba(255, 107, 53, 0.3), 0 0 0 1px rgba(255, 107, 53, 0.1);
        }

        .login-title {
          font-family: var(--heading);
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.03em;
          margin-bottom: 6px;
        }

        .login-hint {
          font-family: var(--mono);
          font-size: 12px;
          color: var(--text-muted);
        }

        .login-form-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
          position: relative;
        }

        .login-form-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 24px;
          right: 24px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent-glow-strong), transparent);
        }

        .login-input {
          width: 100%;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 12px 14px;
          color: var(--text);
          font-size: 14px;
          font-family: var(--mono);
          outline: none;
          transition: border-color var(--transition), box-shadow var(--transition);
          margin-bottom: 14px;
        }

        .login-input::placeholder {
          color: var(--text-muted);
        }

        .login-input:focus {
          border-color: var(--accent-dim);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }

        .login-btn {
          width: 100%;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: var(--radius);
          padding: 12px;
          font-size: 14px;
          font-family: var(--body);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition);
          letter-spacing: -0.01em;
        }

        .login-btn:hover {
          background: var(--accent-hover);
          box-shadow: 0 4px 20px rgba(255, 107, 53, 0.35);
          transform: translateY(-1px);
        }

        .login-btn:active {
          transform: translateY(0);
          box-shadow: none;
        }

        .login-error {
          background: var(--red-dim);
          color: var(--red);
          padding: 10px 14px;
          border-radius: var(--radius);
          font-size: 13px;
          font-family: var(--mono);
          margin-bottom: 14px;
          border: 1px solid rgba(248, 113, 113, 0.15);
        }

        .login-label {
          font-family: var(--mono);
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 8px;
          display: block;
        }
      `}</style>

      <div class="login-wrapper">
        <div class="login-card">
          <div class="login-brand">
            <div class="login-logo">E</div>
            <div class="login-title">Welcome back</div>
            <div class="login-hint">Enter your access token to continue</div>
          </div>

          <div class="login-form-card">
            {error && (
              <div class="login-error">{error}</div>
            )}
            <form method="post" action="/login">
              <label class="login-label" for="token">Access token</label>
              <input
                class="login-input"
                type="password"
                name="token"
                id="token"
                placeholder="Enter token..."
                autofocus
              />
              <button type="submit" class="login-btn">
                Sign in
              </button>
            </form>
          </div>
        </div>
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
