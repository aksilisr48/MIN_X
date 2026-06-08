'use client';

import { useEffect, useRef, useState } from 'react';
import markup from './markup';
import originalScript from './original-script';

export default function MinXView() {
  const scriptRef = useRef(null);
  const [mode, setMode] = useState('signin');
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const isSignup = mode === 'signup';

  useEffect(() => {
    if (!authenticated) return undefined;

    const previousUpdateSim = window.updateSim;
    const previousLoadScenario = window.loadScenario;
    const previousToggleSidebar = window.toggleSidebar;

    window.toggleSidebar = function toggleSidebarFallback() {
      document.body.classList.toggle('sidebar-hidden');
      const hidden = document.body.classList.contains('sidebar-hidden');
      document.querySelectorAll('.sidebar-toggle, .sidebar-reveal').forEach((btn) => {
        btn.classList.toggle('active', hidden);
        btn.setAttribute('aria-pressed', hidden ? 'true' : 'false');
      });
    };

    window.updateSim = function updateSimFallback() {
      const delayInput = document.getElementById('sim-delay');
      const resInput = document.getElementById('sim-res');
      const budInput = document.getElementById('sim-bud');
      const projectInput = document.getElementById('sim-project');

      if (!delayInput || !resInput || !budInput || !projectInput) return;

      const simData = {
        p4: { base: 'Avr 2026', months: ['Mai', 'Juin', 'Juil', 'Août', 'Sep'] },
        laverie: { base: 'Juin 2026', months: ['Juil', 'Août', 'Sep'] },
        slurry: { base: 'Déc 2026', months: ['Fév 2027', 'Mar 2027'] },
        solaire: { base: 'Sep 2026', months: ['Oct', 'Nov', 'Déc 2026'] },
      };

      const delay = Number(delayInput.value);
      const res = Number(resInput.value);
      const bud = Number(budInput.value);
      const project = projectInput.value;
      const projectData = simData[project] || simData.p4;
      const addMonths = Math.ceil(delay / 4);
      const endDate =
        projectData.months[Math.min(addMonths, projectData.months.length - 1)] ||
        projectData.months[projectData.months.length - 1];
      const costAdd = (bud * 0.82 + delay * 0.3).toFixed(1);
      const riskScore = Math.min(95, Math.round(delay * 2.5 + res * 0.6 + bud * 0.9));

      document.getElementById('delay-val').textContent =
        delay === 0 ? 'Aucun' : `+${delay} semaines`;
      document.getElementById('res-val').textContent = res === 0 ? 'Aucune' : `-${res}%`;
      document.getElementById('bud-val').textContent = bud === 0 ? 'Aucun' : `+${bud}%`;
      document.getElementById('sim-enddate').textContent = delay === 0 ? projectData.base : endDate;
      document.getElementById('sim-drift').textContent = delay === 0 ? 'Aucune' : `+${delay} sem.`;
      document.getElementById('sim-cost').textContent = bud === 0 ? '0 MAD' : `+${costAdd} M MAD`;
      document.getElementById('sim-risk').textContent = `${riskScore}/100`;

      const tag = document.getElementById('sim-status-tag');
      const reco = document.getElementById('sim-reco');
      if (!tag || !reco) return;

      if (riskScore >= 70) {
        tag.innerHTML = '<span class="tag del"><span class="tag-dot"></span>Risque Critique</span>';
        reco.style.background = 'rgba(229,62,62,0.07)';
        reco.style.borderColor = 'rgba(229,62,62,0.25)';
        reco.style.color = '#FC8181';
        reco.textContent =
          "Situation critique : déclencher une revue d'urgence avec le comité de direction. Chemin critique fortement impacté.";
      } else if (riskScore >= 40) {
        tag.innerHTML = '<span class="tag risk"><span class="tag-dot"></span>Risque Modéré</span>';
        reco.style.background = 'rgba(240,165,0,0.07)';
        reco.style.borderColor = 'rgba(240,165,0,0.2)';
        reco.style.color = 'var(--gold)';
        reco.textContent =
          'Recommandation : réaffecter des ressources et réviser les jalons critiques. Surveiller les indicateurs hebdomadairement.';
      } else {
        tag.innerHTML = '<span class="tag on"><span class="tag-dot"></span>Risque Faible</span>';
        reco.style.background = 'rgba(0,132,61,0.07)';
        reco.style.borderColor = 'rgba(0,132,61,0.2)';
        reco.style.color = 'var(--g-l)';
        reco.textContent =
          'Scénario acceptable. Les impacts sont maîtrisables sans action immédiate. Monitoring standard suffisant.';
      }
    };

    window.loadScenario = function loadScenarioFallback(type) {
      const scenarios = {
        pessimiste: [14, 40, 30],
        base: [4, 20, 10],
        optimiste: [0, 0, 0],
      };
      const scenario = scenarios[type] || scenarios.base;
      const delayInput = document.getElementById('sim-delay');
      const resInput = document.getElementById('sim-res');
      const budInput = document.getElementById('sim-bud');

      if (!delayInput || !resInput || !budInput) return;

      delayInput.value = scenario[0];
      resInput.value = scenario[1];
      budInput.value = scenario[2];
      window.updateSim();
    };

    const script = document.createElement('script');
    script.textContent = originalScript;
    document.body.appendChild(script);
    scriptRef.current = script;

    return () => {
      script.remove();
      scriptRef.current = null;
      window.updateSim = previousUpdateSim;
      window.loadScenario = previousLoadScenario;
      window.toggleSidebar = previousToggleSidebar;
    };
  }, [authenticated]);

  function switchMode(nextMode) {
    setMode(nextMode);
    setNotice('');
    setShowSecret(false);
  }

  function submitAuth(event) {
    event.preventDefault();
    setLoading(true);
    setNotice(
      isSignup
        ? 'Creating your simulated Horizon account...'
        : 'Checking simulated credentials...',
    );

    window.setTimeout(() => {
      setAuthenticated(true);
      setLoading(false);
      setNotice('');
    }, 650);
  }

  if (authenticated) {
    return <div dangerouslySetInnerHTML={{ __html: markup }} />;
  }

  return (
    <main className="auth-shell">
      <section className="auth-stage" aria-label="OCP Horizon authentication">
        <header className="auth-header">
          <div className="auth-brand">
            <div className="auth-logo">OCP</div>
            <div>
              <div className="auth-brand-title">Horizon View</div>
              <a href="mailto:horizon@ocpgroup.ma">horizon@ocpgroup.ma</a>
            </div>
          </div>
          <nav className="auth-nav" aria-label="Authentication options">
            <button
              type="button"
              className="auth-nav-link"
              onClick={() => switchMode(isSignup ? 'signin' : 'signup')}
            >
              {isSignup ? 'Sign in' : 'Sign up'}
            </button>
            <button
              type="button"
              className="auth-demo-btn"
              onClick={() => {
                setNotice('Demo access prepared. Submit the form to enter.');
              }}
            >
              Request Demo
            </button>
          </nav>
        </header>

        <div className="auth-panel-wrap">
          {!isSignup ? (
            <form className="auth-form auth-form-plain" onSubmit={submitAuth} key={mode}>
              <h3>Welcome Back</h3>
              <p>Enter your credentials to access your account.</p>

              <label className="auth-field" htmlFor="email-login-03">
                <span>Email</span>
                <input
                  type="email"
                  id="email-login-03"
                  name="email-login-03"
                  autoComplete="email"
                  placeholder="agent@ocpgroup.ma"
                  defaultValue="agent@ocpgroup.ma"
                  required
                />
              </label>

              <label className="auth-field" htmlFor="password-login-03">
                <span>Password</span>
                <div className="auth-pass-wrap">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    id="password-login-03"
                    name="password-login-03"
                    autoComplete="current-password"
                    placeholder="**************"
                    defaultValue="123456"
                    required
                  />
                  <button
                    type="button"
                    className="auth-hide"
                    onClick={() => setShowSecret((value) => !value)}
                  >
                    {showSecret ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>

              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? 'Please wait...' : 'Sign in'}
              </button>

              <p className="auth-helper">
                Forgot your password? <button type="button">Reset password</button>
              </p>

              <p className="auth-switch">
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => switchMode('signup')}>
                  Sign up
                </button>
              </p>

              <p className="auth-notice" aria-live="polite">
                {notice || 'Simulation only. Any valid details will open the app.'}
              </p>
            </form>
          ) : (
            <div className="auth-signup-shell">
              <div className="auth-signup-head">
                <div className="auth-mark" aria-hidden="true">
                  OCP
                </div>
                <h3>Create new account for workspace</h3>
              </div>

              <form className="auth-form auth-card" onSubmit={submitAuth} key={mode}>
                <label className="auth-field" htmlFor="name-login-05">
                  <span>Name</span>
                  <input
                    type="text"
                    id="name-login-05"
                    name="name-login-05"
                    autoComplete="name"
                    placeholder="Name"
                    required
                  />
                </label>

                <label className="auth-field" htmlFor="email-login-05">
                  <span>Email</span>
                  <input
                    type="email"
                    id="email-login-05"
                    name="email-login-05"
                    autoComplete="email"
                    placeholder="agent@ocpgroup.ma"
                    required
                  />
                </label>

                <label className="auth-field" htmlFor="password-login-05">
                  <span>Password</span>
                  <div className="auth-pass-wrap">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      id="password-login-05"
                      name="password-login-05"
                      autoComplete="new-password"
                      placeholder="Password"
                      required
                    />
                    <button
                      type="button"
                      className="auth-hide"
                      onClick={() => setShowSecret((value) => !value)}
                    >
                      {showSecret ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </label>

                <label className="auth-field" htmlFor="confirm-password-login-05">
                  <span>Confirm password</span>
                  <input
                    type="password"
                    id="confirm-password-login-05"
                    name="confirm-password-login-05"
                    autoComplete="new-password"
                    placeholder="Password"
                    required
                  />
                </label>

                <label className="auth-check" htmlFor="newsletter-login-05">
                  <input id="newsletter-login-05" name="newsletter-login-05" type="checkbox" />
                  <span>Sign up to our newsletter</span>
                </label>

                <button className="auth-submit" type="submit" disabled={loading}>
                  {loading ? 'Please wait...' : 'Create account'}
                </button>

                <p className="auth-terms">
                  By signing in, you agree to our <button type="button">Terms of use</button> and{' '}
                  <button type="button">Privacy policy</button>
                </p>
              </form>

              <p className="auth-switch auth-switch-outside">
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('signin')}>
                  Sign in
                </button>
              </p>

              <p className="auth-notice" aria-live="polite">
                {notice || 'Simulation only. Any valid details will open the app.'}
              </p>
            </div>
          )}
        </div>

        <footer className="auth-footer">
          OCP Horizon View 2026 <span /> Simulated access layer
        </footer>
      </section>
    </main>
  );
}
