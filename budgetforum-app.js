
(() => {
  const html = document.documentElement;
  const body = document.body;
  const initialLang = body.dataset.lang === 'fr' ? 'fr' : 'nl';
  const initialDoc = body.dataset.doc === 'opinie' ? 'opinie' : 'brief';
  const currentPath = body.dataset.path || '';

  const PAGE_MAP = {
    'brief:nl': './open-brief-nl.html',
    'brief:fr': './open-brief-fr.html',
    'opinie:nl': './opinie-nl.html',
    'opinie:fr': './opinie-fr.html'
  };

  const DEBATE_BUTTON = {
    enabled: false,
    href: {
      nl: './debat-nl.html',
      fr: './debat-fr.html'
    },
    label: {
      nl: 'Debat',
      fr: 'Débat'
    }
  };

  const SOURCES = {
    brief:  { nl: './content/open-brief.nl.md', fr: './content/open-brief.fr.md' },
    opinie: { nl: './content/opinie.nl.md',     fr: './content/opinie.fr.md' }
  };

  const PDFS = {
    brief:  { nl: './pdf/open-brief_nl.pdf', fr: './pdf/open-brief_fr.pdf' },
    opinie: { nl: './pdf/opinie_nl.pdf',     fr: './pdf/opinie_fr.pdf' }
  };

  const TITLES = {
    nl: {
      brief:  'Open brief — Voorstel tot hervorming van het Belgische begrotingsproces',
      opinie: 'Opinie — Voorstel tot hervorming van het Belgische begrotingsproces'
    },
    fr: {
      brief:  'Lettre ouverte — Proposition de réforme du processus budgétaire belge',
      opinie: 'Tribune — Proposition de réforme du processus budgétaire belge'
    }
  };

  const MAIN_TITLES = {
    nl: 'Voorstel tot hervorming van het Belgische begrotingsproces',
    fr: 'Proposition de réforme du processus budgétaire belge'
  };

  const SIGNATORIES_CSV = './content/namen.csv';

  const OPINION_LINKS = {
    nl: [
      { label: 'De Tijd', href: '#link-de-tijd' },
      { label: 'Knack', href: '#link-knack' }
    ],
    fr: [
      { label: "L\'Echo", href: '#link-lecho' },
      { label: 'Le Vif', href: '#link-levif' }
    ]
  };

  const INTRO = {
    nl: {
      brief: 'Open brief met vier voorstellen om het Belgische begrotingsproces structureel te versterken.',
      opinie: ''
    },
    fr: {
      brief: 'Lettre ouverte avec quatre propositions pour renforcer durablement le processus budgétaire belge.',
      opinie: ''
    }
  };

  const SPACING_MARKERS = {
    nl: {
      salutationStarts: ['Geachte ministers'],
      sectionLeadStarts: ['De voorgestelde hervormingen bieden', 'Met de meeste hoogachting']
    },
    fr: {
      salutationStarts: ['Messieurs les ministres'],
      sectionLeadStarts: ['Les réformes proposées', 'Avec nos sincères salutations']
    }
  };

  const EMBARGO_END_ISO = '2026-03-27T06:00:00+01:00';
  const md = window.markdownit({ html: false, linkify: true, typographer: true });

  let state = { lang: initialLang, doc: initialDoc };

  function escapeHTML(s) {
    return (s ?? '').toString()
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'", '&#39;');
  }

  function announce(message) {
    const el = document.getElementById('sr-status');
    if (!el) return;
    el.textContent = '';
    window.setTimeout(() => { el.textContent = message; }, 20);
  }

  function setActiveButtons() {
    document.querySelectorAll('[data-lang]').forEach(b => {
      const active = b.dataset.lang === state.lang;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    document.querySelectorAll('[data-doc]').forEach(b => {
      const active = b.dataset.doc === state.doc;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    html.lang = state.lang;
  }

  function setHeaderCopy() {
    const isFR = state.lang === 'fr';
    const debateBtn = document.getElementById('btn-doc-debat');

    document.querySelector('.controls').setAttribute('aria-label', isFR ? 'Sélections' : 'Selecties');
    document.querySelector('.seg--doc').setAttribute('aria-label', 'Document');
    document.querySelector('.seg--lang').setAttribute('aria-label', isFR ? 'Langue' : 'Taal');
    document.getElementById('skip-link').textContent = isFR ? 'Aller au contenu' : 'Ga naar inhoud';

    document.getElementById('btn-doc-brief').textContent = isFR ? 'Lettre ouverte' : 'Open brief';
    document.getElementById('btn-doc-opinie').textContent = isFR ? 'Tribune' : 'Opinie';

    if (debateBtn) {
      debateBtn.textContent = DEBATE_BUTTON.label[state.lang];
      debateBtn.hidden = !DEBATE_BUTTON.enabled;
      debateBtn.setAttribute('aria-hidden', DEBATE_BUTTON.enabled ? 'false' : 'true');
      debateBtn.tabIndex = DEBATE_BUTTON.enabled ? 0 : -1;
    }

    const docLabel = state.doc === 'brief'
      ? (isFR ? 'Lettre ouverte' : 'Open brief')
      : (isFR ? 'Tribune' : 'Opinie');

    document.getElementById('doc-kicker').textContent = docLabel;
    document.getElementById('doc-title').textContent = MAIN_TITLES[state.lang];
    document.getElementById('doc-intro').textContent = INTRO[state.lang][state.doc];
    document.getElementById('stickytitle').textContent = docLabel;
    document.title = TITLES[state.lang][state.doc];

    const metaLine = isFR ? 'Date de publication: 27 mars 2026' : 'Publicatiedatum: 27 maart 2026';
    const pdfHref = PDFS[state.doc][state.lang];
    const pdfLabel = isFR ? 'Télécharger le PDF' : 'PDF downloaden';
	const jumpLabel = isFR ? 'Signataires' : 'Ondertekenaars';
    document.getElementById('doc-meta').innerHTML =
      `${escapeHTML(metaLine)} <span class="meta-sep">•</span> ` +
      `<a href="${pdfHref}" download aria-label="${escapeHTML(pdfLabel)} (${state.doc.toUpperCase()}, ${state.lang.toUpperCase()})">${escapeHTML(pdfLabel)}</a>`+
	  `<span class="meta-sep">•</span> ` +
	  `<a href="#signatories-title">${escapeHTML(jumpLabel)}</a>`;
	
	const toLine = state.doc === 'brief'
      ? (isFR ? 'À l’attention des ministres belges du Budget.' : 'Aan de Belgische ministers van Begroting.')
      : '';
    document.getElementById('doc-to').innerHTML = toLine;

    document.getElementById('signatories-title').textContent = isFR ? 'Signataires' : 'Ondertekenaars';
    document.getElementById('presscontact').innerHTML = isFR
      ? 'Contact presse: <a href="https://www.eur.nl/en/people/kevin-spiritus">Kevin Spiritus</a>'
      : 'Perscontact: <a href="https://www.eur.nl/en/people/kevin-spiritus">Kevin Spiritus</a>';

    const errEl = document.getElementById('signatories-error');
    errEl.style.display = 'none';
    errEl.textContent = '';
  }

  function renderPubNote() {
    const pub = document.getElementById('pubnote');
    if (state.doc !== 'opinie') {
      pub.style.display = 'none';
      pub.innerHTML = '';
      return;
    }

    const isFR = state.lang === 'fr';
    const links = OPINION_LINKS[state.lang] || [];
    const sep = isFR ? ' et ' : ' en ';
    const linksHtml = links.map(x => `<a href="${x.href}" style="white-space: nowrap;">${escapeHTML(x.label)}</a>`).join(sep);

    pub.innerHTML = isFR
      ? `Cette tribune est parue dans ${linksHtml}.`
      : `Deze opinie verscheen in ${linksHtml}.`;
    pub.style.display = 'block';
  }

  function numberTopHeadings(rootEl, maxCount) {
    const hs = Array.from(rootEl.querySelectorAll('h1'));
    const headings = hs.length ? hs : Array.from(rootEl.querySelectorAll('h2'));
    headings.forEach((h, i) => {
      const n = i + 1;
      if (n > maxCount) return;
      if (!h.id) h.id = `sec-${n}`;
      const txt = h.textContent.trim();
      const prefix = `${n}. `;
      if (!txt.startsWith(prefix)) h.textContent = prefix + txt;
    });
  }

  function applyExtraWhitespace(rootEl) {
    const markers = SPACING_MARKERS[state.lang] || {};
    const salut = markers.salutationStarts || [];
    const lead = markers.sectionLeadStarts || [];

    Array.from(rootEl.querySelectorAll('p')).forEach(p => {
      const t = (p.textContent || '').trim();
      if (!t) return;
      if (salut.some(s => t.startsWith(s))) p.classList.add('salutation');
      if (lead.some(s => t.startsWith(s))) p.classList.add('section-lead');
    });
  }

  function detectDelimiter(sampleLine) {
    const commas = (sampleLine.match(/,/g) || []).length;
    const semis = (sampleLine.match(/;/g) || []).length;
    return (semis > commas) ? ';' : ',';
  }

  function parseCSV(text) {
    const lines = text.split(/\n/);
    const firstNonEmpty = lines.find(l => l.trim().length > 0) || '';
    const delim = detectDelimiter(firstNonEmpty);

    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const next = text[i + 1];
      if (inQuotes) {
        if (c === '"' && next === '"') { field += '"'; i++; }
        else if (c === '"') { inQuotes = false; }
        else { field += c; }
      } else {
        if (c === '"') { inQuotes = true; }
        else if (c === delim) { row.push(field); field = ''; }
        else if (c === '\n') {
          row.push(field); field = '';
          if (row.some(v => v.trim() !== '')) rows.push(row);
          row = [];
        } else if (c !== '\r') {
          field += c;
        }
      }
    }
    row.push(field);
    if (row.some(v => v.trim() !== '')) rows.push(row);
    return rows.map(r => r.map(x => x.trim()));
  }

  function looksLikeHeader(row) {
    const joined = row.join(' ').toLowerCase();
    return /naam|name|organisation|organisatie|affiliat|institution/.test(joined);
  }

  async function loadSignatories() {
    const listEl = document.getElementById('signatories-list');
    const errEl = document.getElementById('signatories-error');
    listEl.innerHTML = '';
    errEl.style.display = 'none';
    errEl.textContent = '';

    try {
      const res = await fetch(SIGNATORIES_CSV, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Kon CSV niet laden: ${SIGNATORIES_CSV}`);
      const csvText = await res.text();
      const rows = parseCSV(csvText);
      const data = (rows.length && looksLikeHeader(rows[0])) ? rows.slice(1) : rows;

      data
        .map(r => {
          const cols = r.filter(x => x.trim() !== '');
          const name = (cols[0] || '').trim();
          const org = (cols[1] || '').trim();
          return { name, org };
        })
        .filter(x => x.name.length > 0)
        .forEach(item => {
          const li = document.createElement('li');
          if (item.org) {
            li.textContent = item.name + ' — ';
            const span = document.createElement('span');
            span.className = 'org';
            span.textContent = item.org;
            li.appendChild(span);
          } else {
            li.textContent = item.name;
          }
          listEl.appendChild(li);
        });
    } catch (e) {
      const isFR = state.lang === 'fr';
      errEl.style.display = 'block';
      errEl.textContent = isFR
        ? `Impossible de charger la liste des signataires. (${e.message})`
        : `Kon de lijst met ondertekenaars niet laden. (${e.message})`;
    }
  }

  async function getAuthoritativeNow() {
    try {
      const r = await fetch(window.location.href, { method: 'HEAD', cache: 'no-store' });
      const dateHdr = r.headers.get('date');
      if (dateHdr) {
        const d = new Date(dateHdr);
        if (!isNaN(d.getTime())) return d;
      }
    } catch (e) {}

    try {
      const r = await fetch('https://worldtimeapi.org/api/timezone/Europe/Brussels', { cache: 'no-store' });
      if (r.ok) {
        const data = await r.json();
        const d = new Date(data.datetime);
        if (!isNaN(d.getTime())) return d;
      }
    } catch (e) {}

    return new Date();
  }

  async function renderEmbargoBanner() {
    const el = document.getElementById('embargo');
    if (!el) return;

    const now = await getAuthoritativeNow();
    const embargoEnd = new Date(EMBARGO_END_ISO);
    const underEmbargo = now.getTime() < embargoEnd.getTime();

    if (!underEmbargo) {
      el.style.display = 'none';
      el.innerHTML = '';
      return;
    }

    el.innerHTML = state.lang === 'fr'
      ? `<strong>Sous embargo</strong> jusqu’au vendredi 27 mars 2026 à 6 h 00 (heure belge).`
      : `<strong>Onder embargo</strong> tot vrijdag 27 maart 2026, 06:00 (Belgische tijd).`;
    el.style.display = 'block';
  }

  async function loadAndRender() {
    setActiveButtons();
    setHeaderCopy();
    renderPubNote();
    await renderEmbargoBanner();

    const path = SOURCES[state.doc][state.lang];
    const contentEl = document.getElementById('content');
    const docLabel = state.doc === 'brief'
      ? (state.lang === 'fr' ? 'lettre ouverte' : 'open brief')
      : (state.lang === 'fr' ? 'tribune' : 'opinie');

    announce(state.lang === 'fr' ? `Chargement de la ${docLabel}.` : `${docLabel[0].toUpperCase() + docLabel.slice(1)} laden.`);
    contentEl.setAttribute('aria-busy', 'true');

    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) {
      contentEl.textContent = state.lang === 'fr'
        ? `Impossible de charger le fichier : ${path}`
        : `Kon bestand niet laden: ${path}`;
      announce(state.lang === 'fr'
        ? `Impossible de charger la ${docLabel}.`
        : `${docLabel[0].toUpperCase() + docLabel.slice(1)} kon niet worden geladen.`);
    } else {
      const mdText = await res.text();
      const rawHtml = md.render(mdText);
      const cleanHtml = DOMPurify.sanitize(rawHtml);
      contentEl.innerHTML = cleanHtml;
      numberTopHeadings(contentEl, 4);
      applyExtraWhitespace(contentEl);
      announce(state.lang === 'fr' ? `La ${docLabel} est chargée.` : `${docLabel[0].toUpperCase() + docLabel.slice(1)} geladen.`);
    }

    contentEl.setAttribute('aria-busy', 'false');
    localStorage.setItem('budgetforum:lastPage', currentPath);
    localStorage.setItem('budgetforum:lastLang', state.lang);
    await loadSignatories();
  }

  function navigateTo(doc, lang) {
    const key = `${doc}:${lang}`;
    const target = PAGE_MAP[key];
    if (!target) return;
    if (target === currentPath || target === `.${window.location.pathname}` || target === window.location.pathname) return;
    localStorage.setItem('budgetforum:lastPage', target);
    localStorage.setItem('budgetforum:lastLang', lang);
    window.location.href = target;
  }

  document.getElementById('btn-lang-nl').addEventListener('click', () => navigateTo(state.doc, 'nl'));
  document.getElementById('btn-lang-fr').addEventListener('click', () => navigateTo(state.doc, 'fr'));
  document.getElementById('btn-doc-brief').addEventListener('click', () => navigateTo('brief', state.lang));
  document.getElementById('btn-doc-opinie').addEventListener('click', () => navigateTo('opinie', state.lang));

  const debateBtn = document.getElementById('btn-doc-debat');
  if (debateBtn) {
    debateBtn.addEventListener('click', () => {
      if (!DEBATE_BUTTON.enabled) return;
      const target = DEBATE_BUTTON.href[state.lang];
      if (target) window.location.href = target;
    });
  }

  loadAndRender();
})();
