import React from 'react';
import type { WorkspaceSettings } from '../../types';

interface LoginPageProps {
  email: string;
  password: string;
  loginError: string | null;
  settings: WorkspaceSettings;
  tasks: any[];
  members: any[];
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({
  email,
  password,
  loginError,
  settings,
  tasks,
  members,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}) => {
  return (
    <div className="login-container" style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Banner */}
      <div
        className="login-banner"
        style={{
          flex: 1.05,
          background: `linear-gradient(150deg, ${settings.accent}, color-mix(in srgb, ${settings.accent} 70%, #000))`,
          color: '#fff',
          padding: '56px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '420px',
            height: '420px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,.16)',
            top: '-120px',
            right: '-120px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,.12)',
            bottom: '-80px',
            left: '-60px',
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '11px',
            fontWeight: 800,
            fontSize: '19px',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '9px',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: settings.accent,
              fontSize: '16px',
            }}
          >
            ◆
          </div>
          {settings.companyName}
        </div>
        <div style={{ position: 'relative' }}>
          <div
            style={{
              fontSize: '40px',
              fontWeight: 800,
              lineHeight: 1.08,
              maxWidth: '440px',
              letterSpacing: '-0.02em',
            }}
          >
            Assign work. Track tickets. Ship faster.
          </div>
          <div style={{ marginTop: '18px', fontSize: '15px', opacity: 0.82, maxWidth: '400px', lineHeight: 1.6 }}>
            Role-based ticketing for your software house — backlog to done, with deadlines, attachments and live
            progress.
          </div>
          <div style={{ marginTop: '30px', display: 'flex', gap: '26px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800 }}>
                {tasks.filter(t => t.status !== 'done').length}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.75 }}>Active tickets</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800 }}>{members.length}</div>
              <div style={{ fontSize: '12px', opacity: 0.75 }}>Team members</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800 }}>3</div>
              <div style={{ fontSize: '12px', opacity: 0.75 }}>Projects</div>
            </div>
          </div>
        </div>
        <div style={{ fontSize: '12px', opacity: 0.7, position: 'relative' }}>
          © 2026 {settings.companyName} · Internal Tools
        </div>
      </div>

      {/* Right Login Form */}
      <div
        className="login-form-container"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f6f7f9',
          padding: '40px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '372px' }}>
          <div style={{ fontSize: '25px', fontWeight: 800, letterSpacing: '-0.02em' }}>Sign in</div>
          <div style={{ color: '#6b6b76', fontSize: '14px', marginTop: '6px' }}>
            Welcome back. Continue to your workspace.
          </div>

          {loginError && (
            <div
              style={{
                marginTop: '16px',
                padding: '10px 12px',
                background: '#fef2f2',
                border: '1px solid #fee2e2',
                borderRadius: '10px',
                color: '#dc2626',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              {loginError}
            </div>
          )}

          <form onSubmit={onSubmit} style={{ marginTop: '20px' }}>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#44444e' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => onEmailChange(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '7px',
                  padding: '11px 13px',
                  border: '1px solid #e1e1e8',
                  borderRadius: '10px',
                  fontSize: '14px',
                  background: '#fff',
                }}
                required
              />
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#44444e' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => onPasswordChange(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '7px',
                  padding: '11px 13px',
                  border: '1px solid #e1e1e8',
                  borderRadius: '10px',
                  fontSize: '14px',
                  background: '#fff',
                }}
                required
              />
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                marginTop: '22px',
                padding: '12px',
                border: 'none',
                borderRadius: '10px',
                background: settings.accent,
                color: '#fff',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
