// Loads data.json (or inline fallback) and fills in the HTML

const $ = (sel) => document.querySelector(sel);
const el = (tag, opts = {}) => Object.assign(document.createElement(tag), opts);

async function loadData() {
  // Try external data.json first (works on GitHub Pages / any static server)
  try {
    const res = await fetch('data.json', { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {
    // Likely file:// CORS or not found; fallback to inline script tag
    console.warn('Could not fetch data.json; falling back to inline JSON if present.');
  }
  const inline = document.getElementById('portfolio-data');
  if (!inline) throw new Error('No data source found. Add data.json or inline #portfolio-data.');
  return JSON.parse(inline.textContent);
}

function renderHeader(data) {
  $('#name').textContent = data.name || '';
  $('#name-footer').textContent = data.name || '';
  $('#tagline').textContent = data.tagline || '';
  $('#year').textContent = new Date().getFullYear();

  const avatar = $('#avatar');
  if (data.avatar) { avatar.src = data.avatar; avatar.hidden = false; } else { avatar.hidden = true; }

  const links = $('#links');
  links.innerHTML = '';
  (data.links || []).forEach(l => {
    const a = el('a', { href: l.href, target: '_blank', rel: 'noopener noreferrer' });
    a.append(document.createTextNode(l.label));
    links.append(a);
  });
}

// --- Updated: multi-paragraph About ---
function renderAbout(data) {
  const container = document.getElementById('about-text');
  container.innerHTML = '';
  const parts = Array.isArray(data.about)
    ? data.about
    : String(data.about || '').split(/\n{2,}/); // split on blank lines
  parts.forEach(p => {
    const para = document.createElement('p');
    para.textContent = p.trim();
    if (para.textContent) container.appendChild(para);
  });
}

// --- Updated: grouped Skills support (also supports old flat array) ---
function renderSkills(data) {
  const old = document.getElementById('skills-list');

  // Flat array → render simple chips and keep existing <ul>
  if (Array.isArray(data.skills)) {
    old.innerHTML = '';
    (data.skills || []).forEach(s => old.appendChild(el('li', { textContent: s })));
    return;
  }

  // Grouped object → replace <ul id="skills-list"> with a wrapper div using same id
  const wrapper = document.createElement('div');
  wrapper.id = 'skills-list';
  wrapper.className = 'skills-groups';

  const groups = data.skills || {};
  Object.entries(groups).forEach(([title, items]) => {
    const section = document.createElement('section');
    section.className = 'skills-group';

    const h = document.createElement('h3');
    h.className = 'skills-title';
    h.textContent = title;

    const ul = document.createElement('ul');
    ul.className = 'chips';
    (items || []).forEach(s => ul.appendChild(el('li', { textContent: s })));

    section.append(h, ul);
    wrapper.appendChild(section);
  });

  old.replaceWith(wrapper);
}

function renderProjects(data) {
  const grid = $('#projects-grid');
  grid.innerHTML = '';
  (data.projects || []).forEach(p => {
    const card = el('div', { className: 'project-card' });
    const title = el('h3', { textContent: p.name || 'Untitled Project' });
    const desc = el('p', { textContent: p.description || '' });

    const tags = el('div', { className: 'tags' });
    (p.tags || []).forEach(t => tags.append(el('span', { textContent: t })));

    const links = el('div', { className: 'links' });
    (p.links || []).forEach(l => {
      const a = el('a', { href: l.href, target: '_blank', rel: 'noopener noreferrer', textContent: l.label });
      links.append(a);
    });

    card.append(title, desc, tags, links);
    grid.append(card);
  });
}

function renderExperience(data) {
  const list = $('#experience-timeline');
  list.innerHTML = '';
  (data.experience || []).forEach(e => {
    const li = el('li');
    const h = el('strong', { textContent: `${e.role || ''} · ${e.company || ''}`.trim() });
    const meta = el('div', { className: 'where', textContent: `${e.start || ''} — ${e.end || ''}`.trim() });
    const p = el('p', { textContent: e.summary || '' });
    li.append(h, meta, p);
    list.append(li);
  });
}

function renderContact(data) {
  const list = $('#contact-list');
  list.innerHTML = '';
  (data.contact || []).forEach(c => {
    const li = el('li');
    const a = el('a', { href: c.href, target: '_blank', rel: 'noopener noreferrer' });
    a.append(document.createTextNode(c.label));
    li.append(a);
    list.append(li);
  });
}

function hydrate(data) {
  renderHeader(data);
  renderAbout(data);
  renderSkills(data);
  renderProjects(data);
  renderExperience(data);
  renderContact(data);
}

loadData()
  .then(hydrate)
  .catch(err => {
    console.error(err);
    const main = document.querySelector('main');
    const warn = el('div', { className: 'card' });
    warn.append(document.createTextNode('Could not load portfolio data. Ensure data.json exists or inline #portfolio-data is set.'));
    main.prepend(warn);
  });
