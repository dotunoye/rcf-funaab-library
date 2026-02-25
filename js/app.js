/**
 * RCF FUNAAB Digital Library — app.js
 * =====================================
 * All department data lives in data/departments.json
 * Edit that file to add/remove departments or update Drive links.
 *
 * HOW TO UPDATE A DRIVE LINK:
 *   Open data/departments.json → find the department → set "live": true
 *   → paste the Google Drive URL in the relevant level's "url" field.
 *
 * HOW TO UPDATE YOUR WHATSAPP NUMBER:
 *   Open index.html → search "wa.me/" → replace the number after it.
 *   Format: wa.me/2348012345678  (country code + number, no spaces or +)
 */

'use strict';

// ─── State ────────────────────────────────────────────────────
let departments   = [];
let currentFilter = 'all';

// ─── Boot ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  await loadDepartments();
  renderCards(departments);
  updateStats();
});

// ─── Load JSON ────────────────────────────────────────────────
async function loadDepartments() {
  try {
    const res  = await fetch('data/departments.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    departments = await res.json();
    departments.sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error('Could not load departments.json:', err);
    // Graceful fallback — show empty state
    departments = [];
  }
}

// ─── Stats bar ────────────────────────────────────────────────
function updateStats() {
  const liveCount = departments.filter(d => d.live).length;
  document.getElementById('live-count').textContent = liveCount;
}

// ─── Render cards ─────────────────────────────────────────────
function renderCards(list) {
  const grid   = document.getElementById('dept-grid');
  const noRes  = document.getElementById('no-results');
  const statEl = document.getElementById('result-count-text');
  const query  = document.getElementById('search-input').value.trim();
  const liveCount = departments.filter(d => d.live).length;

  // Update stat text
  if (query) {
    statEl.textContent = `${list.length} result${list.length !== 1 ? 's' : ''} for "${query}"`;
  } else {
    const labels = {
      live: `${liveCount} live department${liveCount !== 1 ? 's' : ''}`,
      soon: `${departments.length - liveCount} coming soon`,
      all:  `Showing all ${departments.length} departments`,
    };
    statEl.textContent = labels[currentFilter] || labels.all;
  }

  if (list.length === 0) {
    grid.innerHTML   = '';
    grid.style.border = 'none';
    document.getElementById('search-term').textContent = query;
    noRes.classList.add('visible');
    return;
  }

  noRes.classList.remove('visible');
  grid.style.border = '';

  grid.innerHTML = list.map((dept, animIdx) => {
    const origIdx    = departments.indexOf(dept);
    const iconBg     = dept.color + '18';
    const iconBorder = dept.color + '30';
    const badge      = dept.live
      ? '<span class="badge live">Live</span>'
      : '<span class="badge soon">Coming Soon</span>';

    return `
      <button
        class="dept-card${dept.live ? '' : ' soon-card'}"
        onclick="handleCardClick(${origIdx})"
        aria-label="${dept.name} — ${dept.live ? 'Select level to open library' : 'Resources coming soon'}"
        style="animation-delay:${animIdx * 25}ms"
      >
        <div class="card-top">
          <div class="card-icon" style="background:${iconBg};border:1px solid ${iconBorder}" aria-hidden="true">${dept.icon}</div>
          <span class="card-arrow" aria-hidden="true">↗</span>
        </div>
        <div class="card-body">
          <div class="card-faculty">${dept.faculty}</div>
          <div class="card-name">${dept.name}</div>
        </div>
        <div>${badge}</div>
      </button>`;
  }).join('');
}

// ─── Search & filter ──────────────────────────────────────────
function filterCards() {
  const query    = document.getElementById('search-input').value.toLowerCase().trim();
  const clearBtn = document.getElementById('search-clear');
  clearBtn.style.display = query ? 'inline-block' : 'none';

  let list = departments;
  if (currentFilter === 'live') list = list.filter(d =>  d.live);
  if (currentFilter === 'soon') list = list.filter(d => !d.live);
  if (query) {
    list = list.filter(d =>
      d.name.toLowerCase().includes(query) ||
      d.faculty.toLowerCase().includes(query)

    );
  }

  renderCards(list);
}

function setFilter(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  btn.classList.add('active');
  btn.setAttribute('aria-selected', 'true');
  filterCards();
}

function clearSearch() {
  document.getElementById('search-input').value = '';
  document.getElementById('search-clear').style.display = 'none';
  filterCards();
}

// ─── Card click ───────────────────────────────────────────────
function handleCardClick(origIdx) {
  const dept = departments[origIdx];
  if (!dept) return;

  if (!dept.live) {
    showComingSoon(dept.name);
    return;
  }

  // Live dept → open level modal
  openLevelModal(dept);
}

// ─── Level modal ──────────────────────────────────────────────
function openLevelModal(dept) {
  const modal   = document.getElementById('level-modal');
  const grid    = document.getElementById('level-grid');
  const iconEl  = document.getElementById('modal-icon');
  const titleEl = document.getElementById('modal-title');
  const facEl   = document.getElementById('modal-faculty');

  // Populate header
  iconEl.textContent  = dept.icon;
  iconEl.style.cssText = `background:${dept.color}18;border:1px solid ${dept.color}30;`;
  facEl.textContent   = dept.faculty;
  titleEl.textContent = dept.name;

  // Build level buttons
  grid.innerHTML = dept.levels.map(({ level, url }) => `
    <a
      class="level-btn"
      href="${url}"
      target="_blank"
      rel="noopener noreferrer"
      role="listitem"
      aria-label="Open ${dept.name} Level ${level} library"
      ${!url ? 'onclick="return false;" style="opacity:0.45;cursor:not-allowed;"' : ''}
    >
      <span class="level-number">${level}</span>
      <span class="level-label">Level</span>
    </a>
  `).join('');

  // Show modal
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Focus close button
  setTimeout(() => modal.querySelector('.modal-close')?.focus(), 100);
}

function closeModal() {
  const modal = document.getElementById('level-modal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Close modal on backdrop click
document.getElementById('level-modal').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

// ─── Coming soon page ─────────────────────────────────────────
function showComingSoon(name) {
  document.getElementById('cs-dept-name').textContent = name;
  const page = document.getElementById('coming-soon-page');
  const main = document.getElementById('main-page');
  page.classList.add('active');
  page.setAttribute('aria-hidden', 'false');
  main.setAttribute('aria-hidden', 'true');
  main.style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'instant' });
  setTimeout(() => page.querySelector('.back-btn')?.focus(), 100);
}

function goBack() {
  const page = document.getElementById('coming-soon-page');
  const main = document.getElementById('main-page');
  page.classList.remove('active');
  page.setAttribute('aria-hidden', 'true');
  main.setAttribute('aria-hidden', 'false');
  main.style.display = '';
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// ─── Keyboard shortcuts ───────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // Close modal first if open, else close coming-soon page
    const modal = document.getElementById('level-modal');
    if (modal.classList.contains('open')) { closeModal(); return; }
    const cs = document.getElementById('coming-soon-page');
    if (cs.classList.contains('active')) goBack();
  }
});
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('contribute');
    const closeBtn = document.querySelector('.close-modal-btn');
    
    // Select any button with the class 'open-modal-btn' OR any link pointing to '#contribute'
    const triggerBtns = document.querySelectorAll('.open-modal-btn, a[href="#contribute"]');

    // 1. OPEN THE MODAL (And stop the footer scroll)
    triggerBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); // This is the magic line that stops the anchor jump
            modal.classList.add('modal-active');
            document.body.style.overflow = 'hidden'; // Kills background scrolling
        });
    });

    // 2. CLOSE MODAL: Click the X Button
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('modal-active');
        document.body.style.overflow = ''; // Restores background scroll
    });

    // 3. CLOSE MODAL: Click the Dark Background
    modal.addEventListener('click', (e) => {
        // If they click the container or the dark void, close it. Don't close if they click the white box.
        if (e.target === modal || e.target.classList.contains('container')) {
            modal.classList.remove('modal-active');
            document.body.style.overflow = '';
        }
    });
    
    // 4. CLOSE MODAL: Hit the 'Escape' Key (Pro-level UX)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('modal-active')) {
            modal.classList.remove('modal-active');
            document.body.style.overflow = '';
        }
    });
});