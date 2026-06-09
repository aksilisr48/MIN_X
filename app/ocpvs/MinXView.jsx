'use client';

import { useEffect, useRef, useState } from 'react';
import markup from './markup';
import originalScript from './original-script';

const STORAGE_KEY = 'demo-user';
const ROLE_OPTIONS = ['Chef de projet', 'DG', 'Manager', 'Technicien'];

const ROLE_ACCESS = {
  'Chef de projet': ['news', 'dash', 'init', 'risk', 'gantt', 'sim', 'pred', 'exec', 'ai'],
  DG: ['dash', 'init', 'exec', 'news', 'risk', 'ai'],
  Manager: ['news', 'dash', 'init', 'risk', 'gantt', 'sim', 'exec', 'ai'],
  Technicien: ['news', 'dash', 'tech-sheet', 'task-checklist', 'ai', 'risk'],
};

const ROLE_SUMMARIES = {
  'Chef de projet': [
    {
      title: 'Pilotage planning',
      body: 'Suivez les projets, la simulation, le Gantt et les predictions de retard pour ajuster le portefeuille.',
      stat: '12 jalons',
      tone: 'var(--g)',
    },
    {
      title: 'Priorites a traiter',
      body: 'Cette vue inclut aussi le comite, les news, la matrice des risques et les analyses IA.',
      stat: '9 acces',
      tone: 'var(--gold)',
    },
  ],
  DG: [
    {
      title: 'Vue executive',
      body: 'Accedez aux dashboards, projets, comite, news, matrice des risques et IA.',
      stat: '6 acces',
      tone: 'var(--g)',
    },
    {
      title: 'Decisions requises',
      body: 'Les sections visibles mettent en avant la gouvernance, les alertes majeures et les arbitrages.',
      stat: '2 arbitrages',
      tone: 'var(--red)',
    },
  ],
  Manager: [
    {
      title: 'Coordination equipe',
      body: 'Gardez un oeil sur les projets, le Gantt, la simulation, le comite et les risques.',
      stat: '8 acces',
      tone: 'var(--cyan)',
    },
    {
      title: 'Suivi transversal',
      body: "Les sections visibles couvrent l'avancement, les news et l'assistant d'analyse IA.",
      stat: 'Vue manager',
      tone: 'var(--g)',
    },
  ],
  Technicien: [
    {
      title: 'Execution terrain',
      body: 'Recentrez-vous sur la fiche technique, les checklists terrain, les news et les risques.',
      stat: '6 acces',
      tone: 'var(--g)',
    },
    {
      title: 'Maintenance critique',
      body: 'Les sections affichees privilegient les controles, les taches journalieres et les analyses IA.',
      stat: '14 controles',
      tone: 'var(--gold)',
    },
  ],
};

const ROLE_LABELS = {
  'Chef de projet': {
    init: 'Projets',
    risk: 'Matrice des Risques',
    pred: 'Predictions',
    exec: 'Comite',
    ai: 'IA',
  },
  DG: {
    init: 'Projets',
    risk: 'Matrice des Risques',
    exec: 'Comite',
    ai: 'IA',
  },
  Manager: {
    init: 'Projets',
    risk: 'Matrice des Risques',
    exec: 'Comite',
    ai: 'IA',
  },
  Technicien: {
    risk: 'Matrice des Risques',
    ai: 'IA',
    'tech-sheet': 'Fiche technique',
    'task-checklist': 'Taches et checklist',
  },
};

const DEFAULT_PAGE_LABELS = {
  dash: 'Dashboards',
  init: 'Projets',
  gantt: 'Gantt',
  sim: 'Simulation',
  risk: 'Matrice des Risques',
  ai: 'IA',
  pred: 'Predictions',
  news: 'News',
  exec: 'Comite',
  'tech-sheet': 'Fiche technique',
  'task-checklist': 'Taches et checklist',
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
    topbarDate.textContent = `${user.role} - ${user.email}`;
  }
}

function buildPlaceholderPage(pageId, title, subtitle, sections) {
  const page = document.createElement('div');
  page.className = 'page';
  page.id = `page-${pageId}`;
  page.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">${title}</div>
        <div class="page-sub">${subtitle}</div>
      </div>
    </div>
    <div class="g2">
      ${sections
        .map(
          (section) => `
            <section class="card">
              <div class="ch"><span class="ct">${section.title}</span></div>
              <div class="cb">${section.content}</div>
            </section>
          `,
        )
        .join('')}
    </div>
  `;

  return page;
}

function ensureRoleSpecificPages(root) {
  if (!root) return;

  const main = root.querySelector('.main');
  const footer = root.querySelector('.footer');
  const navBottom = root.querySelector('.nav-bottom');
  if (!main || !footer || !navBottom) return;

  if (!root.querySelector('#page-tech-sheet')) {
    const techSheetPage = buildPlaceholderPage(
      'tech-sheet',
      'Fiche technique',
      'Vue terrain · Equipements critiques · Demo locale',
      [
        {
          title: 'Equipement prioritaire',
          content:
            "<div style=\"display:flex;flex-direction:column;gap:10px;font-size:13px;color:var(--t2)\"><div><strong style=\"color:var(--t1)\">Broyeur B-204</strong><br>Etat: surveillance renforcee du palier principal.</div><div>Derniere intervention: 08/06/2026 · Graissage complet et controle vibration.</div><div>Consigne: verifier pression, temperature et niveau lubrifiant a chaque prise de poste.</div></div>",
        },
        {
          title: 'Parametres de controle',
          content:
            "<div class=\"sim-result-grid\"><div class=\"sim-metric\"><div class=\"sm-lbl\">Temperature max</div><div class=\"sm-val\">78 C</div></div><div class=\"sim-metric\"><div class=\"sm-lbl\">Vibration cible</div><div class=\"sm-val\">2.4 mm/s</div></div><div class=\"sim-metric\"><div class=\"sm-lbl\">Niveau lubrifiant</div><div class=\"sm-val\">85%</div></div><div class=\"sim-metric\"><div class=\"sm-lbl\">Pieces critiques</div><div class=\"sm-val\">12</div></div></div>",
        },
      ],
    );

    main.insertBefore(techSheetPage, footer);
  }

  if (!root.querySelector('#page-task-checklist')) {
    const checklistPage = buildPlaceholderPage(
      'task-checklist',
      'Taches et checklist',
      'Execution terrain · Verification avant demarrage · Demo locale',
      [
        {
          title: 'Checklist de poste',
          content:
            "<div style=\"display:flex;flex-direction:column;gap:10px;font-size:13px;color:var(--t2)\"><label class=\"auth-check\"><input type=\"checkbox\"><span>Verifier la pression hydraulique</span></label><label class=\"auth-check\"><input type=\"checkbox\"><span>Confirmer le niveau lubrifiant</span></label><label class=\"auth-check\"><input type=\"checkbox\"><span>Signer la ronde securite</span></label><label class=\"auth-check\"><input type=\"checkbox\"><span>Reporter toute alerte critique au manager</span></label></div>",
        },
        {
          title: 'Taches du jour',
          content:
            "<div style=\"display:flex;flex-direction:column;gap:8px;font-size:13px;color:var(--t2)\"><div class=\"why-row\"><div class=\"why-num\">1</div><div class=\"why-content\"><div class=\"why-a\">Inspection convoyeur zone nord</div></div></div><div class=\"why-row\"><div class=\"why-num\">2</div><div class=\"why-content\"><div class=\"why-a\">Remonter les photos d'usure dans le rapport journalier</div></div></div><div class=\"why-row\"><div class=\"why-num\">3</div><div class=\"why-content\"><div class=\"why-a\">Confirmer la disponibilite des pieces de rechange critiques</div></div></div></div>",
        },
      ],
    );

    main.insertBefore(checklistPage, footer);
  }

  if (!root.querySelector('[data-page-id="tech-sheet"]')) {
    const techSheetNav = document.createElement('div');
    techSheetNav.className = 'nav-btn';
    techSheetNav.setAttribute('data-page-id', 'tech-sheet');
    techSheetNav.setAttribute('onclick', "showPage('tech-sheet',this)");
    techSheetNav.innerHTML = `
      <svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M7 3h10l4 4v14H7z"/><path d="M17 3v5h4"/><path d="M10 12h8"/><path d="M10 16h8"/></svg>
      <span class="nav-tip">Fiche technique</span>
    `;
    navBottom.parentNode.insertBefore(techSheetNav, navBottom);
  }

  if (!root.querySelector('[data-page-id="task-checklist"]')) {
    const checklistNav = document.createElement('div');
    checklistNav.className = 'nav-btn';
    checklistNav.setAttribute('data-page-id', 'task-checklist');
    checklistNav.setAttribute('onclick', "showPage('task-checklist',this)");
    checklistNav.innerHTML = `
      <svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
      <span class="nav-tip">Taches et checklist</span>
    `;
    navBottom.parentNode.insertBefore(checklistNav, navBottom);
  }
}

function applyRoleLabels(root, user) {
  if (!root || !user) return;

  const labels = ROLE_LABELS[user.role] || {};
  const navButtons = Array.from(root.querySelectorAll('.sidebar .nav-btn'));

  navButtons.forEach((button) => {
    const onclickValue = button.getAttribute('onclick') || '';
    const match = onclickValue.match(/showPage\('([^']+)'/);
    if (!match) return;

    const pageId = match[1];
    const navTip = button.querySelector('.nav-tip');
    const label = labels[pageId] || DEFAULT_PAGE_LABELS[pageId];

    if (navTip && label) {
      navTip.textContent = label;
    }
  });
}

function applyProjectTerminology(root) {
  if (!root) return;

  const replaceText = (selector, matcher, value) => {
    root.querySelectorAll(selector).forEach((node) => {
      const text = node.textContent?.trim();
      if (text === matcher) {
        node.textContent = value;
      }
    });
  };

  replaceText('.nav-tip', 'Initiatives', 'Projets');
  replaceText('.btn-new', '📋 Initiatives', '📋 Projets');
  replaceText('.btn-new', '+ Nouvelle Initiative', '+ Nouveau Projet');
  replaceText('.kpi-lbl', 'Initiatives Actives', 'Projets Actifs');
  replaceText('.ct', '📈 Initiatives Créées / Semaine', '📈 Projets Créés / Semaine');
  replaceText('.ct', '🗺 Initiatives par Site', '🗺 Projets par Site');
  replaceText('.modal-title', 'Créer une Initiative', 'Créer un Projet');
  replaceText('.form-label', 'Code Initiative *', 'Code Projet *');
  replaceText('.form-label', "Nom de l'initiative *", 'Nom du projet *');

  root.querySelectorAll('*').forEach((node) => {
    if (!node.children.length && typeof node.textContent === 'string') {
      if (node.textContent.includes('INITIATIVES CE TRIMESTRE')) {
        node.textContent = node.textContent.replace('INITIATIVES CE TRIMESTRE', 'PROJETS CE TRIMESTRE');
      }

      if (node.textContent.includes('INITIATIVES')) {
        node.textContent = node.textContent.replace('INITIATIVES', 'PROJETS');
      }

      if (node.textContent.includes('24 initiatives · 4 sites')) {
        node.textContent = node.textContent.replace('24 initiatives · 4 sites', '24 projets · 4 sites');
      }
    }
  });

  const descriptionField = root.querySelector('#f-desc');
  if (descriptionField?.getAttribute('placeholder')) {
    descriptionField.setAttribute(
      'placeholder',
      "Décrivez l'état actuel du projet, les actions déjà réalisées, les blocages éventuels...",
    );
  }

  const submitButton = root.querySelector('.modal .btn-submit');
  if (submitButton?.textContent?.trim() === '✓ Créer l\'Initiative') {
    submitButton.textContent = '✓ Créer le Projet';
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
      ensureRoleSpecificPages(appRef.current);
      applyProjectTerminology(appRef.current);
      applyRoleLabels(appRef.current, user);
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
