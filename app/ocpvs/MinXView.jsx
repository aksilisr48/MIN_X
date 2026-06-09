'use client';

import { useEffect, useRef, useState } from 'react';
import markup from './markup';
import originalScript from './original-script';

const STORAGE_KEY = 'demo-user';
const ROLE_OPTIONS = ['Chef de projet', 'DG', 'Manager', 'Technicien'];

const ROLE_ACCESS = {
  'Chef de projet': ['dash', 'init', 'gantt', 'sim', 'risk'],
  DG: ['dash', 'exec', 'pred', 'news', 'risk'],
  Manager: ['dash', 'init', 'gantt', 'risk', 'ai', 'pred', 'news'],
  Technicien: ['dash', 'gantt', 'risk', 'rca'],
};

const ROLE_SUMMARIES = {
  'Chef de projet': [
    {
      title: 'Pilotage planning',
      body: 'Suivez les initiatives, le Gantt et les simulations de delai pour ajuster le portefeuille.',
      stat: '12 jalons',
      tone: 'var(--g)',
    },
    {
      title: 'Priorites a traiter',
      body: 'Concentrez-vous sur les projets en risque et les arbitrages de ressources a faire cette semaine.',
      stat: '3 alertes',
      tone: 'var(--gold)',
    },
  ],
  DG: [
    {
      title: 'Vue executive',
      body: 'Accedez uniquement aux syntheses portefeuille, aux predictions et aux points de comite.',
      stat: '5 KPI',
      tone: 'var(--g)',
    },
    {
      title: 'Decisions requises',
      body: 'Les sections visibles mettent en avant les alertes majeures et les sujets de gouvernance.',
      stat: '2 arbitrages',
      tone: 'var(--red)',
    },
  ],
  Manager: [
    {
      title: 'Coordination equipe',
      body: 'Gardez un oeil sur le pipeline, les risques et les tendances pour guider les equipes.',
      stat: '7 chantiers',
      tone: 'var(--cyan)',
    },
    {
      title: 'Suivi transversal',
      body: "Les sections visibles couvrent l'avancement, les previsions et l'assistant d'analyse.",
      stat: '4 vues',
      tone: 'var(--g)',
    },
  ],
  Technicien: [
    {
      title: 'Execution terrain',
      body: 'Recentrez-vous sur le planning terrain, les risques operationnels et les analyses RCA.',
      stat: '9 actions',
      tone: 'var(--g)',
    },
    {
      title: 'Maintenance critique',
      body: 'Les sections affichees privilegient le diagnostic, les causes racines et les interventions.',
      stat: '2 RCA',
      tone: 'var(--gold)',
    },
  ],
};

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

function readSavedUser() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.name === 'string' &&
      typeof parsed.email === 'string' &&
      ROLE_OPTIONS.includes(parsed.role)
    ) {
      return parsed;
    }

    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Unable to read demo user from localStorage.', error);
  }

  return null;
}

function applyRoleAccess(root, user) {
  if (!root || !user) return;

  const allowedPages = ROLE_ACCESS[user.role] || ['dash'];
  const navButtons = Array.from(root.querySelectorAll('.sidebar .nav-btn'));
  const pages = Array.from(root.querySelectorAll('.page[id^="page-"]'));
  const pageTriggers = Array.from(root.querySelectorAll('[onclick*="showPage("]'));

  navButtons.forEach((button) => {
    const onclickValue = button.getAttribute('onclick') || '';
    const match = onclickValue.match(/showPage\('([^']+)'/);

    if (!match) return;

    const pageId = match[1];
    const allowed = allowedPages.includes(pageId);
    button.style.display = allowed ? '' : 'none';
    button.setAttribute('aria-hidden', allowed ? 'false' : 'true');
  });

  pages.forEach((page) => {
    const pageId = page.id.replace('page-', '');
    page.style.display = allowedPages.includes(pageId) ? '' : 'none';
    page.classList.remove('active');
  });

  pageTriggers.forEach((trigger) => {
    const onclickValue = trigger.getAttribute('onclick') || '';
    const match = onclickValue.match(/showPage\('([^']+)'/);

    if (!match) return;

    trigger.style.display = allowedPages.includes(match[1]) ? '' : 'none';
  });

  const firstAllowedPage = root.querySelector(`#page-${allowedPages[0]}`);
  const firstAllowedButton = navButtons.find((button) => {
    const onclickValue = button.getAttribute('onclick') || '';
    return onclickValue.includes(`showPage('${allowedPages[0]}'`);
  });

  navButtons.forEach((button) => button.classList.remove('active'));
  firstAllowedButton?.classList.add('active');
  firstAllowedPage?.classList.add('active');

  const avatar = root.querySelector('.avatar');
  if (avatar) {
    avatar.textContent = getInitials(user.name) || 'DU';
    avatar.setAttribute('title', `${user.name} - ${user.role}`);
  }

  const topbarDate = root.querySelector('.tb-date');
  if (topbarDate) {
    topbarDate.textContent = `${user.role} · ${user.email}`;
  }
}

function injectRoleSummary(root, user, onSignOut) {
  if (!root || !user) return;

  root.querySelector('[data-demo-role-summary]')?.remove();

  const dashPage = root.querySelector('#page-dash');
  const pageHeader = dashPage?.querySelector('.page-header');
  if (!dashPage || !pageHeader) return;

  const wrapper = document.createElement('div');
  wrapper.setAttribute('data-demo-role-summary', 'true');
  wrapper.className = 'g2';
  wrapper.style.marginBottom = '16px';

  const cards = ROLE_SUMMARIES[user.role] || [];

  wrapper.innerHTML = cards
    .map(
      (card) => `
        <section class="card">
          <div class="ch">
            <span class="ct">${card.title}</span>
            <span class="ca" style="color:${card.tone}">${card.stat}</span>
          </div>
          <div class="cb">
            <div style="font-size:14px;line-height:1.6;color:var(--t2)">${card.body}</div>
          </div>
        </section>
      `,
    )
    .join('');

  const intro = document.createElement('section');
  intro.className = 'card';
  intro.setAttribute('data-demo-role-summary', 'true');
  intro.style.marginBottom = '16px';
  intro.innerHTML = `
    <div class="ch">
      <span class="ct">Acces demo actif</span>
      <span class="tag on"><span class="tag-dot"></span>${user.role}</span>
    </div>
    <div class="cb" style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
      <div>
        <div style="font-family:'Bebas Neue';font-size:28px;letter-spacing:1px;color:var(--t1)">Bonjour ${user.name}</div>
        <div style="font-size:13px;line-height:1.6;color:var(--t2)">Cette demo affiche seulement les sections autorisees pour le role ${user.role}.</div>
      </div>
      <button type="button" class="btn-cancel" data-demo-signout="true">Changer de role</button>
    </div>
  `;

  dashPage.insertBefore(intro, pageHeader.nextSibling);
  dashPage.insertBefore(wrapper, intro.nextSibling);

  intro
    .querySelector('[data-demo-signout="true"]')
    ?.addEventListener('click', onSignOut, { once: true });
}

export default function MinXView() {
  const appRef = useRef(null);
  const scriptRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ROLE_OPTIONS[0],
  });

  useEffect(() => {
    const savedUser = readSavedUser();
    if (savedUser) {
      setUser(savedUser);
      setFormData(savedUser);
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!user || !appRef.current) return undefined;

    const previousUpdateSim = window.updateSim;
    const previousLoadScenario = window.loadScenario;
    const previousToggleSidebar = window.toggleSidebar;

    window.toggleSidebar = function toggleSidebarFallback() {
      document.body.classList.toggle('sidebar-hidden');
      const hidden = document.body.classList.contains('sidebar-hidden');
      document.querySelectorAll('.sidebar-toggle, .sidebar-reveal').forEach((button) => {
        button.classList.toggle('active', hidden);
        button.setAttribute('aria-pressed', hidden ? 'true' : 'false');
      });
    };

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
          'Recommandation : reaffecter des ressources et reviser les jalons critiques. Surveiller les indicateurs chaque semaine.';
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

    const syncUi = () => {
      applyRoleAccess(appRef.current, user);
      injectRoleSummary(appRef.current, user, handleSignOut);
    };

    const frameId = window.requestAnimationFrame(syncUi);

    return () => {
      window.cancelAnimationFrame(frameId);
      script.remove();
      scriptRef.current = null;
      window.updateSim = previousUpdateSim;
      window.loadScenario = previousLoadScenario;
      window.toggleSidebar = previousToggleSidebar;
      appRef.current?.querySelector('[data-demo-role-summary]')?.remove();
      appRef.current?.querySelectorAll('[data-demo-role-summary]').forEach((node) => node.remove());
    };
  }, [user]);

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextUser = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
    };

    if (!nextUser.name || !nextUser.email) {
      setNotice('Please complete all fields before continuing.');
      return;
    }

    setLoading(true);
    setNotice('Creation de votre acces demo...');

    window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
      setLoading(false);
      setNotice('');
    }, 350);
  }

  function handleSignOut() {
    window.localStorage.removeItem(STORAGE_KEY);
    document.body.classList.remove('sidebar-hidden', 'dark');
    setUser(null);
    setNotice('Selectionnez un role pour charger une autre vue demo.');
    setFormData({
      name: '',
      email: '',
      role: ROLE_OPTIONS[0],
    });
  }

  if (!isReady) {
    return null;
  }

  if (user) {
    return <div ref={appRef} dangerouslySetInnerHTML={{ __html: markup }} />;
  }

  return (
    <main className="auth-shell">
      <section className="auth-stage" aria-label="MINE X sign-up demo">
        <header className="auth-header">
          <div className="auth-brand">
            <img className="auth-logo-img" src="/logo/LOGO.png" alt="MINE X" />
            <div>
              <div className="auth-brand-title">MINE X</div>
              <a href="mailto:horizon@ocpgroup.ma">frontend-only demo flow</a>
            </div>
          </div>
          <nav className="auth-nav" aria-label="Demo helpers">
            <button
              type="button"
              className="auth-nav-link"
              onClick={() =>
                setFormData({
                  name: 'Demo User',
                  email: 'demo@ocpgroup.ma',
                  role: 'Manager',
                })
              }
            >
              Fill demo data
            </button>
            <button
              type="button"
              className="auth-demo-btn"
              onClick={() => setNotice('Choisissez un role puis validez pour ouvrir la vue correspondante.')}
            >
              Demo only
            </button>
          </nav>
        </header>

        <div className="auth-panel-wrap">
          <div className="auth-signup-shell">
            <div className="auth-signup-head">
              <div className="auth-mark" aria-hidden="true">
                OCP
              </div>
              <h3>Create your local demo access</h3>
            </div>

            <form className="auth-form auth-card" onSubmit={handleSubmit}>
              <label className="auth-field" htmlFor="demo-name">
                <span>Name</span>
                <input
                  id="demo-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Nom complet"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </label>

              <label className="auth-field" htmlFor="demo-email">
                <span>Email</span>
                <input
                  id="demo-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="agent@ocpgroup.ma"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </label>

              <label className="auth-field" htmlFor="demo-role">
                <span>Role</span>
                <select
                  id="demo-role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>

              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? 'Please wait...' : 'Create demo access'}
              </button>

              <p className="auth-helper">
                This form uses React state and stores the selected profile in <strong>localStorage</strong>.
              </p>
            </form>

            <p className="auth-notice" aria-live="polite">
              {notice || 'A saved demo user will be restored automatically on the next page load.'}
            </p>
          </div>
        </div>

        <footer className="auth-footer">
          MINE X demo flow <span /> No backend <span /> No database
        </footer>
      </section>
    </main>
  );
}
