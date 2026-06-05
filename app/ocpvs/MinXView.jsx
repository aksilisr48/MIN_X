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

    window.updateSim = function updateSimFallback() {
      const delayInput = document.getElementById('sim-delay');
      const resInput = document.getElementById('sim-res');
      const budInput = document.getElementById('sim-bud');
      const projectInput = document.getElementById('sim-project');

      if (!delayInput || !resInput || !budInput || !projectInput) return;

      const simData = {
        p4: { base: 'Avr 2026', months: ['Mai', 'Juin', 'Juil', 'Aout', 'Sep'] },
        laverie: { base: 'Juin 2026', months: ['Juil', 'Aout', 'Sep'] },
        slurry: { base: 'Dec 2026', months: ['Fev 2027', 'Mar 2027'] },
        solaire: { base: 'Sep 2026', months: ['Oct', 'Nov', 'Dec 2026'] },
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
          "Situation critique : declencher une revue d'urgence avec le comite de direction. Chemin critique fortement impacte.";
      } else if (riskScore >= 40) {
        tag.innerHTML = '<span class="tag risk"><span class="tag-dot"></span>Risque Modere</span>';
        reco.style.background = 'rgba(240,165,0,0.07)';
        reco.style.borderColor = 'rgba(240,165,0,0.2)';
        reco.style.color = 'var(--gold)';
        reco.textContent =
          'Recommandation : reaffecter des ressources et reviser les jalons critiques. Surveiller les indicateurs hebdomadairement.';
      } else {
        tag.innerHTML = '<span class="tag on"><span class="tag-dot"></span>Risque Faible</span>';
        reco.style.background = 'rgba(0,132,61,0.07)';
        reco.style.borderColor = 'rgba(0,132,61,0.2)';
        reco.style.color = 'var(--g-l)';
        reco.textContent =
          'Scenario acceptable. Les impacts sont maitrisables sans action immediate. Monitoring standard suffisant.';
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

        <div className="auth-art auth-art-left" aria-hidden="true">
          <div className="auth-squiggle" />
          <div className="auth-note">
            <span />
            <span />
          </div>
          <div className="auth-tower">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="auth-chart">
            <span />
          </div>
        </div>

        <form className="auth-card" onSubmit={submitAuth} key={mode}>
          <div className="auth-kicker">OCP Horizon Simulation</div>
          <h1>{isSignup ? 'Create Access' : 'Agent Login'}</h1>
          <p>
            {isSignup
              ? 'Register a simulated workspace profile for the dashboard.'
              : 'Enter your details to sign in to your dashboard account.'}
          </p>

          {isSignup && (
            <label className="auth-field">
              <span>Full Name</span>
              <input name="name" type="text" placeholder="ex: A. Benali" required />
            </label>
          )}

          <label className="auth-field">
            <span>Email / Phone No</span>
            <input
              name="email"
              type="text"
              placeholder="agent@ocpgroup.ma"
              defaultValue={isSignup ? '' : 'agent@ocpgroup.ma'}
              required
            />
          </label>

          <label className="auth-field">
            <span>{isSignup ? 'Create Passcode' : 'Passcode'}</span>
            <div className="auth-pass-wrap">
              <input
                name="passcode"
                type={showSecret ? 'text' : 'password'}
                placeholder="Enter passcode"
                defaultValue={isSignup ? '' : '123456'}
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

          {isSignup && (
            <label className="auth-field">
              <span>Site / Unit</span>
              <select name="site" defaultValue="Khouribga">
                <option>Khouribga</option>
                <option>Jorf Lasfar</option>
                <option>Safi</option>
                <option>Laayoune</option>
              </select>
            </label>
          )}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign in'}
          </button>

          <p className="auth-switch">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button type="button" onClick={() => switchMode(isSignup ? 'signin' : 'signup')}>
              {isSignup ? 'Sign in' : 'Request Now'}
            </button>
          </p>

          <p className="auth-notice" aria-live="polite">
            {notice || 'Simulation only. Any valid details will open the app.'}
          </p>
        </form>

        <div className="auth-art auth-art-right" aria-hidden="true">
          <div className="auth-panel">
            <span />
            <span />
          </div>
          <div className="auth-person">
            <span className="auth-head" />
            <span className="auth-body" />
            <span className="auth-laptop" />
            <span className="auth-leg auth-leg-one" />
            <span className="auth-leg auth-leg-two" />
          </div>
          <div className="auth-base" />
          <div className="auth-tower auth-tower-small">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>

        <footer className="auth-footer">
          OCP Horizon View 2026 <span /> Simulated access layer
        </footer>
      </section>
    </main>
  );
}
