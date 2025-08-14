// This loads data.json and fills into the HTML

const $ = (sel) => document.querySelector(sel);
const el = (tag, opts = {}) => Object.assign(document.createElement(tag), opts);

async function loadData() {
  try {
    const res = await fetch('data.json', { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Could not fetch data.json, using inline data if available.");
  }

  const inline = document.getElementById('portfolio-data');
  if (!inline) throw new Error('No portfolio data found.');
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
    const a = el('a', { href: l.href, target: '_blank', rel: 'noopener noreferrer', textContent: l.label });
    links.append(a);
  });
}

function renderAbout(data) {
  $('#about-text').textContent = data.about || '';
}

function renderSkills(data) {
  const ul = $('#skills-list');
  ul.innerHTML = '';
  (data.skills || []).forEach(s => ul.append(el('li', { textContent: s })));
}

function renderProjects(data) {
  const grid = $('#projects-grid');
  grid.innerHTML = '';
  (data.projects || []).forEach(p => {
    const card = el('div', { className: 'project-card' });
    card.append(el('h3', { textContent: p.name || 'Untitled Project' }));
    card.append(el('p', { textContent: p.description || '' }));

    const tags = el('div', { className: 'tags' });
    (p.tags || []).forEach(t => tags.append(el('span', { textContent: t })));
    card.append(tags);

    const links = el('div', { className: 'links' });
    (p.links || []).forEach(l => {
      const a = el('a', { href: l.href, target: '_blank', rel: 'noopener noreferrer', textContent: l.label });
      links.append(a);
    });
    card.append(links);

    grid.append(card);
  });
}

function renderExperience(data) {
  const list = $('#experience-timeline');
  list.innerHTML = '';
  (data.experience || []).forEach(e => {
    const li = el('li');
    li.append(el('strong', { textContent: `${e.role} · ${e.company}` }));
    li.append(el('div', { className: 'where', textContent: `${e.start} — ${e.end}` }));
    li.append(el('p', { textContent: e.summary || '' }));
    list.append(li);
  });
}

function renderContact(data) {
  const list = $('#contact-list');
  list.innerHTML = '';
  (data.contact || []).forEach(c => {
    const li = el('li');
    const a = el('a', { href: c.href, target: '_blank', rel: 'noopener noreferrer', textContent: c.label });
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
    const warn = el('div', { className: 'card', textContent: 'Could not load portfolio data. Ensure data.json exists or inline #portfolio-data is set.' });
    main.prepend(warn);
  });
