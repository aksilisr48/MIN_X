'use client';

import { useEffect, useRef, useState } from 'react';
import markup from './markup';
import originalScript from './original-script';

const STORAGE_KEY = 'demo-user';
const ROLE_OPTIONS = ['Chef de projet', 'DG', 'Manager', 'Technicien'];

const ROLE_ACCESS = {
  'Chef de projet': ['news', 'dash', 'init', 'risk', 'gantt', 'sim', 'pred', 'exec', 'ai', 'rca'],
  DG: ['dash', 'init', 'exec', 'news', 'risk', 'ai', 'rca'],
  Manager: ['news', 'dash', 'init', 'risk', 'gantt', 'sim', 'exec', 'ai', 'rca'],
  Technicien: ['news', 'dash', 'tech-sheet', 'task-checklist', 'failure-report', 'ai', 'rca'],
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
      body: 'Recentrez-vous sur la fiche technique, les checklists terrain, les news et les signalements de panne.',
      stat: '7 acces',
      tone: 'var(--g)',
    },
    {
      title: 'Maintenance critique',
      body: 'Les sections affichees privilegient les controles, les taches journalieres, les signalements et les analyses RCA.',
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
    ai: 'IA',
    'tech-sheet': 'Fiche technique',
    'task-checklist': 'Taches et checklist',
    'failure-report': 'Signalement de la panne',
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
  rca: 'RCA',
  'tech-sheet': 'Fiche technique',
  'task-checklist': 'Taches et checklist',
  'failure-report': 'Signalement de la panne',
};

const NEWS_ARTICLES = {
  ai: {
    category: 'Technology',
    date: 'June 9, 2026',
    readTime: '7 min read',
    title: 'AI is reshaping business decision-making',
    dek: 'The next phase of artificial intelligence is less about isolated experiments and more about building a reliable decision layer across the business.',
    art: 'news-art-ai',
    paragraphs: [
      'Artificial intelligence is moving into the daily rhythm of operations. Planning teams are using it to compare scenarios, detect unusual patterns, and bring the most important signals to decision-makers before a problem becomes visible in a monthly report.',
      'The strongest results come from focused systems connected to trusted operational data. Instead of asking one model to solve every problem, companies are combining forecasting, workflow automation, and human review around a small number of high-value decisions.',
      'That shift also changes leadership priorities. Data quality, clear ownership, and transparent controls now matter as much as model performance. Organizations that define those foundations early can move faster without losing accountability.',
    ],
    takeaway: 'Practical AI creates value when it improves a specific decision, has a clear owner, and remains easy for teams to review.',
  },
  markets: {
    category: 'Economy',
    date: 'June 8, 2026',
    readTime: '5 min read',
    title: 'Global markets react to new economic trends',
    dek: 'Investors are balancing slower inflation, uneven growth, and a new wave of industrial spending.',
    art: 'news-art-market',
    paragraphs: [
      'Markets are responding to a mixed economic picture. Consumer demand remains resilient in several regions, while higher financing costs continue to influence construction, logistics, and capital-intensive industries.',
      'Industrial companies are adapting by protecting cash flow and prioritizing investments that improve energy efficiency, supply reliability, or production flexibility. Projects with measurable operational benefits are receiving faster approval than broad transformation programs.',
      'Analysts expect volatility to remain part of the landscape, but they also see opportunity in businesses with strong local supply networks and disciplined investment plans.',
    ],
    takeaway: 'The market is rewarding companies that can turn uncertainty into focused, measurable investment choices.',
  },
  startups: {
    category: 'Innovation',
    date: 'June 7, 2026',
    readTime: '4 min read',
    title: 'Startups accelerate digital innovation',
    dek: 'Smaller technology firms are shortening the path from industrial problem to working solution.',
    art: 'news-art-startup',
    paragraphs: [
      'A new generation of startups is building tools around specific operational needs, from equipment inspection to energy forecasting and field collaboration.',
      'Their advantage is speed. Small teams can test a narrow use case, learn directly from operators, and adjust the product before a large implementation begins.',
      'Partnerships work best when the business provides access to real users, clear performance targets, and a route from pilot to deployment. Without that path, even promising demonstrations can remain stuck in the laboratory.',
    ],
    takeaway: 'A successful pilot needs a business owner and a deployment plan from its first day.',
  },
  investment: {
    category: 'Business',
    date: 'June 6, 2026',
    readTime: '6 min read',
    title: 'Technology investment grows in emerging markets',
    dek: 'Digital infrastructure and local talent are attracting a broader mix of long-term capital.',
    art: 'news-art-investment',
    paragraphs: [
      'Investment in emerging technology markets is expanding beyond consumer applications. Capital is increasingly flowing toward cloud infrastructure, industrial software, cybersecurity, and specialized engineering services.',
      'The change reflects growing demand from local enterprises that want solutions designed for their operating conditions. Investors are also paying closer attention to teams that combine technical expertise with a deep understanding of regional industries.',
      'For established companies, the trend creates more options for local partnerships and faster access to specialized capabilities.',
    ],
    takeaway: 'Local expertise is becoming a strategic advantage in the next wave of technology investment.',
  },
  productivity: {
    category: 'Tech',
    date: 'June 5, 2026',
    readTime: '4 min read',
    title: 'New tools improve productivity in companies',
    dek: 'Connected workflows are reducing administrative effort and giving teams more time for higher-value work.',
    art: 'news-art-productivity',
    paragraphs: [
      'Productivity gains are increasingly coming from small improvements across an entire workflow rather than one dramatic automation project.',
      'Modern tools can collect updates automatically, route approvals to the right person, and keep operational context attached to each task. That reduces the time teams spend searching for information or rebuilding reports.',
      'The best implementations measure both time saved and decision quality. This helps leaders distinguish useful automation from technology that simply adds another screen.',
    ],
    takeaway: 'The most useful productivity tool is the one that removes a repeated delay from real work.',
  },
  cloud: {
    category: 'Digital transformation',
    date: 'June 4, 2026',
    readTime: '5 min read',
    title: 'Cloud platforms become essential business infrastructure',
    dek: 'Cloud strategy is shifting from migration targets toward resilient, well-governed operating platforms.',
    art: 'news-art-digital',
    paragraphs: [
      'Cloud platforms now support core analytics, customer services, and collaboration across many organizations. The conversation has moved beyond where systems are hosted to how quickly teams can build and improve services.',
      'This flexibility requires stronger governance. Clear cost controls, shared architecture standards, and reliable identity management prevent a flexible platform from becoming a fragmented one.',
      'Many leaders are adopting a hybrid approach, placing each workload according to performance, security, and operational needs rather than following a single migration rule.',
    ],
    takeaway: 'Cloud value comes from operating discipline, not migration volume.',
  },
  green: {
    category: 'Business',
    date: 'June 3, 2026',
    readTime: '6 min read',
    title: 'Green industry creates new growth opportunities',
    dek: 'Cleaner energy and circular production are becoming engines of competitiveness as well as sustainability.',
    art: 'news-art-green',
    paragraphs: [
      'Industrial sustainability programs are moving closer to the center of business strategy. Energy efficiency, water reuse, and waste recovery can lower operating costs while improving resilience.',
      'The most attractive projects connect environmental outcomes to production economics. A clear baseline makes it possible to compare alternatives and track whether expected savings appear after deployment.',
      'New supplier ecosystems are also emerging around renewable power, low-carbon materials, and industrial recycling, creating room for investment and specialized jobs.',
    ],
    takeaway: 'Green industry grows fastest when environmental progress and operational value are measured together.',
  },
  supply: {
    category: 'Economy',
    date: 'June 2, 2026',
    readTime: '3 min read',
    title: 'Why supply chains are becoming more regional',
    dek: 'Companies are redesigning critical supply networks around resilience, visibility, and shorter response times.',
    art: 'news-art-market',
    paragraphs: [
      'Recent disruptions have encouraged companies to look beyond the lowest unit cost when selecting suppliers. Lead-time stability and access to alternatives now carry more weight.',
      'Regional networks can reduce transport uncertainty and make collaboration easier, although they require careful supplier development and realistic capacity planning.',
      'Digital visibility helps procurement teams identify concentration risks and respond before a delay reaches production.',
    ],
    takeaway: 'Resilience improves when supply choices reflect total operational risk, not price alone.',
  },
  industrialData: {
    category: 'Innovation',
    date: 'June 1, 2026',
    readTime: '5 min read',
    title: 'Research teams turn industrial data into practical tools',
    dek: 'Closer collaboration between researchers and operators is producing solutions that work beyond the prototype.',
    art: 'news-art-startup',
    paragraphs: [
      'Industrial research is becoming more applied as teams work directly with maintenance specialists, planners, and field technicians.',
      'Shared problem definitions help researchers choose useful signals and design outputs that fit existing routines. This often matters more than adding complexity to the model.',
      'Organizations are also creating reusable data foundations so each new project does not begin with months of preparation.',
    ],
    takeaway: 'Research reaches the field faster when operators help define both the problem and the result.',
  },
  cyber: {
    category: 'Technology',
    date: 'May 31, 2026',
    readTime: '4 min read',
    title: 'Cybersecurity spending rises as operations connect',
    dek: 'Connected equipment brings valuable visibility, but it also expands the responsibility for protecting operations.',
    art: 'news-art-ai',
    paragraphs: [
      'As industrial systems become more connected, cybersecurity programs are expanding beyond office networks to include operational technology and remote access.',
      'Leaders are prioritizing asset inventories, network segmentation, and rapid recovery plans. These controls provide a practical foundation before more advanced monitoring is introduced.',
      'Security teams are also working more closely with operations so protection measures support safety and availability instead of disrupting them.',
    ],
    takeaway: 'Operational cybersecurity starts with knowing what is connected and how the business would recover.',
  },
  value: {
    category: 'Business',
    date: 'May 30, 2026',
    readTime: '6 min read',
    title: 'Executives put measurable value at the center of digital plans',
    dek: 'Transformation portfolios are being simplified around outcomes that teams can verify.',
    art: 'news-art-investment',
    paragraphs: [
      'Executive teams are asking digital programs to connect investment directly to revenue, cost, risk, or customer outcomes.',
      'This is reducing the number of disconnected pilots and encouraging shared platforms that can support several use cases. Regular value reviews also make it easier to stop work that no longer justifies its cost.',
      'The approach does not eliminate experimentation. It creates clearer rules for learning, scaling, and deciding what comes next.',
    ],
    takeaway: 'A digital roadmap becomes credible when every major initiative has a measurable business outcome.',
  },
  briefing: {
    category: 'Weekly briefing',
    date: 'June 9, 2026',
    readTime: '8 min read',
    title: 'Five signals shaping the next business cycle',
    dek: 'A concise view of the forces influencing investment, operations, talent, technology, and sustainability.',
    art: 'news-art-digital',
    paragraphs: [
      'First, capital is becoming more selective, favoring projects with short feedback loops and visible operating impact. Second, regional supply networks are gaining importance as resilience becomes part of everyday planning.',
      'Third, practical AI is moving into specific decisions rather than broad demonstrations. Fourth, demand for hybrid technical and business skills is changing how companies build teams.',
      'Finally, energy and resource efficiency are becoming core measures of industrial competitiveness. Together, these signals point toward a cycle defined by disciplined innovation.',
    ],
    takeaway: 'The next cycle will favor organizations that combine focused investment with the ability to learn quickly.',
  },
};

const NEWS_PAGE_MARKUP = `
<div class="page" id="page-news">
  <div class="news-shell">
    <header class="news-masthead">
      <div>
        <div class="news-kicker"><span></span> Business intelligence, curated daily</div>
        <h1>Latest News</h1>
        <p>Essential updates on the economy, technology, digital transformation, and the ideas shaping modern business.</p>
      </div>
      <div class="news-edition">
        <span>Morning edition</span>
        <strong>09 JUN 2026</strong>
      </div>
    </header>

    <section class="news-lead-layout" aria-label="Featured news">
      <article class="news-feature-card" data-news-article="ai">
        <div class="news-feature-visual news-art-ai">
          <span class="news-badge news-badge-light">Technology</span>
          <div class="news-visual-stamp">01</div>
        </div>
        <div class="news-feature-content">
          <div class="news-date">June 9, 2026 <span></span> 7 min read</div>
          <h2>AI is reshaping business decision-making</h2>
          <p>From forecasting demand to managing complex operations, artificial intelligence is moving from experimental pilots into the center of executive strategy.</p>
          <a class="news-read-link" href="#news-ai" data-news-article="ai">Read full story <span aria-hidden="true">+</span></a>
        </div>
      </article>

      <div class="news-side-stories">
        <div class="news-section-label">
          <span>Top stories</span>
          <span class="news-section-line"></span>
        </div>
        <article class="news-side-card" data-news-article="markets" tabindex="0" role="link">
          <div class="news-side-visual news-art-market"></div>
          <div class="news-side-copy">
            <span class="news-badge">Economy</span>
            <h3>Global markets react to new economic trends</h3>
            <div class="news-date">June 8, 2026 <span></span> 5 min</div>
          </div>
        </article>
        <article class="news-side-card" data-news-article="startups" tabindex="0" role="link">
          <div class="news-side-visual news-art-startup"></div>
          <div class="news-side-copy">
            <span class="news-badge news-badge-blue">Innovation</span>
            <h3>Startups accelerate digital innovation</h3>
            <div class="news-date">June 7, 2026 <span></span> 4 min</div>
          </div>
        </article>
        <article class="news-side-card" data-news-article="investment" tabindex="0" role="link">
          <div class="news-side-visual news-art-investment"></div>
          <div class="news-side-copy">
            <span class="news-badge news-badge-dark">Business</span>
            <h3>Technology investment grows in emerging markets</h3>
            <div class="news-date">June 6, 2026 <span></span> 6 min</div>
          </div>
        </article>
      </div>
    </section>

    <section class="news-content-layout">
      <div class="news-latest">
        <div class="news-heading-row">
          <div>
            <span class="news-eyebrow">Fresh perspective</span>
            <h2>Latest stories</h2>
          </div>
          <a href="#all-news">View all news <span aria-hidden="true">+</span></a>
        </div>
        <div class="news-card-grid">
          <article class="news-story-card" data-news-article="productivity">
            <div class="news-story-visual news-art-productivity">
              <span class="news-story-index">02</span>
            </div>
            <div class="news-story-body">
              <span class="news-badge news-badge-blue">Tech</span>
              <h3>New tools improve productivity in companies</h3>
              <p>Connected workflows are helping teams reduce repetitive work and focus on decisions that create measurable value.</p>
              <div class="news-story-footer">
                <span>June 5, 2026</span>
                <a href="#news-productivity" data-news-article="productivity" aria-label="Read productivity story">+</a>
              </div>
            </div>
          </article>
          <article class="news-story-card" data-news-article="cloud">
            <div class="news-story-visual news-art-digital">
              <span class="news-story-index">03</span>
            </div>
            <div class="news-story-body">
              <span class="news-badge">Digital transformation</span>
              <h3>Cloud platforms become essential business infrastructure</h3>
              <p>Leaders are consolidating data, operations, and customer services on flexible digital foundations.</p>
              <div class="news-story-footer">
                <span>June 4, 2026</span>
                <a href="#news-cloud" data-news-article="cloud" aria-label="Read cloud platforms story">+</a>
              </div>
            </div>
          </article>
          <article class="news-story-card" data-news-article="green">
            <div class="news-story-visual news-art-green">
              <span class="news-story-index">04</span>
            </div>
            <div class="news-story-body">
              <span class="news-badge news-badge-dark">Business</span>
              <h3>Green industry creates new growth opportunities</h3>
              <p>Efficiency, cleaner energy, and circular production models are opening new paths for industrial investment.</p>
              <div class="news-story-footer">
                <span>June 3, 2026</span>
                <a href="#news-green" data-news-article="green" aria-label="Read green industry story">+</a>
              </div>
            </div>
          </article>
        </div>
      </div>

      <aside class="news-trending">
        <div class="news-trending-head">
          <span class="news-eyebrow">Most read</span>
          <h2>Trending News</h2>
        </div>
        <ol class="news-trending-list">
          <li data-news-article="supply" tabindex="0" role="link">
            <span>01</span>
            <div>
              <small>Economy</small>
              <h3>Why supply chains are becoming more regional</h3>
              <p>3 min read</p>
            </div>
          </li>
          <li data-news-article="industrialData" tabindex="0" role="link">
            <span>02</span>
            <div>
              <small>Innovation</small>
              <h3>Research teams turn industrial data into practical tools</h3>
              <p>5 min read</p>
            </div>
          </li>
          <li data-news-article="cyber" tabindex="0" role="link">
            <span>03</span>
            <div>
              <small>Technology</small>
              <h3>Cybersecurity spending rises as operations connect</h3>
              <p>4 min read</p>
            </div>
          </li>
          <li data-news-article="value" tabindex="0" role="link">
            <span>04</span>
            <div>
              <small>Business</small>
              <h3>Executives put measurable value at the center of digital plans</h3>
              <p>6 min read</p>
            </div>
          </li>
        </ol>
        <div class="news-brief-card">
          <span>Weekly briefing</span>
          <h3>Five signals shaping the next business cycle.</h3>
          <a href="#news-brief" data-news-article="briefing">Explore the briefing <span aria-hidden="true">+</span></a>
        </div>
      </aside>
    </section>
  </div>
  <article class="news-article-page" id="news-reader" aria-hidden="true" aria-labelledby="news-reader-title">
    <div class="news-article-toolbar">
      <button type="button" class="news-reader-return news-reader-return-top" data-news-close>
        <span aria-hidden="true">←</span> Back to News
      </button>
      <span>MINE X / Business intelligence</span>
    </div>
    <div class="news-article-layout">
      <div class="news-reader-hero" id="news-reader-hero">
        <span class="news-badge news-badge-light" id="news-reader-category"></span>
      </div>
      <div class="news-reader-content">
        <div class="news-date"><b id="news-reader-date"></b><i></i><b id="news-reader-time"></b></div>
        <h2 id="news-reader-title"></h2>
        <p class="news-reader-dek" id="news-reader-dek"></p>
        <div class="news-reader-copy" id="news-reader-copy"></div>
        <aside class="news-reader-takeaway">
          <span>Key takeaway</span>
          <p id="news-reader-takeaway"></p>
        </aside>
        <button type="button" class="news-reader-return" data-news-close>
          <span aria-hidden="true">←</span> Back to all news
        </button>
      </div>
    </div>
  </article>
</div>
`;

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

function setupNewsArticles(root) {
  const page = root?.querySelector('#page-news');
  const newsHome = root?.querySelector('#page-news .news-shell');
  const reader = root?.querySelector('#news-reader');
  if (!page || !newsHome || !reader || page.dataset.newsReady === 'true') return;

  page.dataset.newsReady = 'true';

  page.querySelectorAll('[data-news-article]').forEach((trigger) => {
    if (!trigger.matches('a, button, [tabindex]')) {
      trigger.tabIndex = 0;
      trigger.setAttribute('role', 'link');
    }
  });

  const closeReader = () => {
    reader.classList.remove('open');
    reader.setAttribute('aria-hidden', 'true');
    newsHome.hidden = false;
    window.history.replaceState(null, '', '#news');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openReader = (articleId) => {
    const article = NEWS_ARTICLES[articleId];
    if (!article) return;

    const hero = reader.querySelector('#news-reader-hero');
    hero.className = `news-reader-hero ${article.art}`;
    reader.querySelector('#news-reader-category').textContent = article.category;
    reader.querySelector('#news-reader-date').textContent = article.date;
    reader.querySelector('#news-reader-time').textContent = article.readTime;
    reader.querySelector('#news-reader-title').textContent = article.title;
    reader.querySelector('#news-reader-dek').textContent = article.dek;
    reader.querySelector('#news-reader-takeaway').textContent = article.takeaway;

    const copy = reader.querySelector('#news-reader-copy');
    copy.innerHTML = '';
    article.paragraphs.forEach((paragraph) => {
      const text = document.createElement('p');
      text.textContent = paragraph;
      copy.appendChild(text);
    });

    newsHome.hidden = true;
    reader.classList.add('open');
    reader.setAttribute('aria-hidden', 'false');
    window.history.replaceState(null, '', `#news-${articleId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    reader.querySelector('.news-reader-return-top')?.focus({ preventScroll: true });
  };

  page.addEventListener('click', (event) => {
    const closeTrigger = event.target.closest('[data-news-close]');
    if (closeTrigger) {
      event.preventDefault();
      closeReader();
      return;
    }

    const articleTrigger = event.target.closest('[data-news-article]');
    if (!articleTrigger) return;

    event.preventDefault();
    openReader(articleTrigger.dataset.newsArticle);
  });

  page.addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-news-article]')) {
      event.preventDefault();
      openReader(event.target.dataset.newsArticle);
    }
  });
}

function setupFailureReporting(root) {
  const form = root?.querySelector('#failure-report-form');
  const history = root?.querySelector('#failure-report-history');
  const notice = root?.querySelector('#failure-report-notice');
  const dateInput = root?.querySelector('#failure-date');
  if (!form || !history || form.dataset.ready === 'true') return;

  const storageKey = 'minx-failure-reports';
  form.dataset.ready = 'true';

  const readReports = () => {
    try {
      return JSON.parse(window.localStorage.getItem(storageKey) || '[]');
    } catch {
      return [];
    }
  };

  const renderReports = () => {
    const reports = readReports();
    history.innerHTML = '';

    if (!reports.length) {
      history.innerHTML =
        '<div style="padding:18px;text-align:center;color:var(--t3);font-size:12px">Aucun signalement enregistre.</div>';
      return;
    }

    reports.slice(0, 5).forEach((report) => {
      const item = document.createElement('div');
      item.className = 'why-row';
      item.style.marginBottom = '8px';

      const severityColor =
        report.severity === 'Critique'
          ? 'var(--red)'
          : report.severity === 'Elevee'
            ? 'var(--gold)'
            : 'var(--g)';

      item.innerHTML = `
        <div class="why-num" style="background:${severityColor};color:#fff">!</div>
        <div class="why-content">
          <div style="display:flex;justify-content:space-between;gap:10px;align-items:center">
            <div class="why-a" style="font-weight:600;color:var(--t1)"></div>
            <span class="tag" style="color:${severityColor};border-color:${severityColor}"></span>
          </div>
          <div class="why-q" style="margin-top:4px"></div>
          <div style="font-size:10px;color:var(--t3);margin-top:5px"></div>
        </div>
      `;

      item.querySelector('.why-a').textContent = `${report.reference} - ${report.equipment}`;
      item.querySelector('.tag').textContent = report.severity;
      item.querySelector('.why-q').textContent = report.description;
      item.querySelector('div[style*="font-size:10px"]').textContent =
        `${report.location} - ${report.date}`;
      history.appendChild(item);
    });
  };

  if (dateInput && !dateInput.value) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    dateInput.value = now.toISOString().slice(0, 16);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const reports = readReports();
    const reference = `SIG-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${String(
      reports.length + 1,
    ).padStart(3, '0')}`;
    const report = {
      reference,
      equipment: data.get('equipment'),
      location: data.get('location'),
      severity: data.get('severity'),
      date: data.get('date').replace('T', ' '),
      downtime: data.get('downtime') || 'Non estime',
      symptom: data.get('symptom'),
      description: data.get('description'),
      isolated: data.get('isolated') === 'on',
    };

    window.localStorage.setItem(storageKey, JSON.stringify([report, ...reports]));
    form.reset();
    if (dateInput) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      dateInput.value = now.toISOString().slice(0, 16);
    }
    if (notice) {
      notice.textContent = `Signalement ${reference} transmis au responsable maintenance.`;
      notice.style.display = 'block';
    }
    renderReports();
  });

  renderReports();
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

  if (!root.querySelector('#page-failure-report')) {
    const failureReportPage = document.createElement('div');
    failureReportPage.className = 'page';
    failureReportPage.id = 'page-failure-report';
    failureReportPage.innerHTML = `
      <div class="page-header">
        <div>
          <div class="page-title">Signalement de la panne</div>
          <div class="page-sub">Declaration terrain · Transmission maintenance · Suivi local</div>
        </div>
        <span class="tag risk"><span class="tag-dot"></span>Espace Technicien</span>
      </div>
      <div class="g-3-2">
        <section class="card">
          <div class="ch">
            <span class="ct">Nouveau signalement</span>
            <span class="ca">Champs obligatoires *</span>
          </div>
          <div class="cb">
            <form id="failure-report-form">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label" for="failure-equipment">Equipement <span class="req">*</span></label>
                  <input class="form-input" id="failure-equipment" name="equipment" required placeholder="Ex: Broyeur B-204">
                </div>
                <div class="form-group">
                  <label class="form-label" for="failure-location">Zone / Site <span class="req">*</span></label>
                  <select class="form-select" id="failure-location" name="location" required>
                    <option value="">Selectionner...</option>
                    <option>Khouribga - Zone broyage</option>
                    <option>Khouribga - Laverie</option>
                    <option>Jorf Lasfar - Ligne P4</option>
                    <option>Safi - Unite process</option>
                    <option>Laayoune - Installation energie</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="failure-severity">Niveau d'urgence <span class="req">*</span></label>
                  <select class="form-select" id="failure-severity" name="severity" required>
                    <option value="">Selectionner...</option>
                    <option>Critique</option>
                    <option>Elevee</option>
                    <option>Moderee</option>
                    <option>Faible</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="failure-date">Date et heure <span class="req">*</span></label>
                  <input class="form-input" id="failure-date" name="date" type="datetime-local" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="failure-downtime">Arret estime</label>
                  <input class="form-input" id="failure-downtime" name="downtime" placeholder="Ex: 2 heures">
                </div>
                <div class="form-group">
                  <label class="form-label" for="failure-symptom">Symptome principal <span class="req">*</span></label>
                  <select class="form-select" id="failure-symptom" name="symptom" required>
                    <option value="">Selectionner...</option>
                    <option>Arret complet</option>
                    <option>Bruit anormal</option>
                    <option>Vibration excessive</option>
                    <option>Surchauffe</option>
                    <option>Fuite</option>
                    <option>Defaut electrique</option>
                    <option>Autre</option>
                  </select>
                </div>
                <div class="form-group full">
                  <label class="form-label" for="failure-description">Description de la panne <span class="req">*</span></label>
                  <textarea class="form-textarea" id="failure-description" name="description" required minlength="10" placeholder="Decrivez les signes observes, le contexte et les premieres actions effectuees."></textarea>
                </div>
                <div class="form-group full">
                  <label class="auth-check">
                    <input type="checkbox" name="isolated">
                    <span>L'equipement a ete mis en securite et isole avant le signalement.</span>
                  </label>
                </div>
              </div>
              <div id="failure-report-notice" style="display:none;margin-top:14px;padding:10px 12px;border-radius:7px;background:rgba(0,132,61,.08);border:1px solid rgba(0,132,61,.2);color:var(--g);font-size:12px"></div>
              <div style="display:flex;justify-content:flex-end;margin-top:16px">
                <button class="btn-submit" type="submit">Transmettre le signalement</button>
              </div>
            </form>
          </div>
        </section>
        <section class="card">
          <div class="ch">
            <span class="ct">Signalements recents</span>
            <span class="ca">5 derniers</span>
          </div>
          <div class="cb" id="failure-report-history"></div>
        </section>
      </div>
    `;
    main.insertBefore(failureReportPage, footer);
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

  if (!root.querySelector('[data-page-id="failure-report"]')) {
    const failureReportNav = document.createElement('div');
    failureReportNav.className = 'nav-btn';
    failureReportNav.setAttribute('data-page-id', 'failure-report');
    failureReportNav.setAttribute('onclick', "showPage('failure-report',this)");
    failureReportNav.innerHTML = `
      <svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.6L2.4 17.3A2 2 0 004.1 20h15.8a2 2 0 001.7-2.7L13.7 3.6a2 2 0 00-3.4 0z"/></svg>
      <span class="nav-tip">Signalement de la panne</span>
    `;
    navBottom.parentNode.insertBefore(failureReportNav, navBottom);
  }

  setupFailureReporting(root);
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
  const emptyNewsPagePattern = /<div class="page" id="page-news">\s*<\/div>/;
  const appMarkup = emptyNewsPagePattern.test(markup)
    ? markup.replace(emptyNewsPagePattern, NEWS_PAGE_MARKUP)
    : markup.includes('id="page-news"')
      ? markup
      : markup.replace('<!-- FOOTER -->', `${NEWS_PAGE_MARKUP}\n\n<!-- FOOTER -->`);

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
      setupNewsArticles(appRef.current);
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
    return <div ref={appRef} dangerouslySetInnerHTML={{ __html: appMarkup }} />;
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
