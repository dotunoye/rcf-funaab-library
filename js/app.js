/**
 * RCF FUNAAB Digital Library — app.js
 * =====================================
 * All department data lives in data/departments.json
 */

'use strict';

// ─── State ────────────────────────────────────────────────────
let departments   = [];
let currentFilter = 'all';
let currentCollege = null; // NEW: Tracks which college is currently open

// ─── Boot ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  await loadDepartments();
  renderColleges(); // NEW: Render colleges first instead of all cards
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
    departments = [];
  }
}

// ─── Stats bar ────────────────────────────────────────────────
function updateStats(customList = null, query = '') {
  const listToCount = customList || departments;
  const statEl = document.getElementById('result-count-text');
  const liveCount = listToCount.filter(d => d.live).length;
  
  // Always update the live counter number
  document.getElementById('live-count').textContent = liveCount;

  if (query) {
    statEl.textContent = `${listToCount.length} result${listToCount.length !== 1 ? 's' : ''} for "${query}"`;
  } else if (currentCollege) {
    statEl.textContent = `Showing ${listToCount.length} departments in ${currentCollege}`;
  } else {
    // We are on the College view
    const uniqueColleges = new Set(departments.map(d => d.faculty)).size;
    statEl.textContent = `Showing ${uniqueColleges} Colleges`;
  }
}

// ─── NEW: Render Colleges ─────────────────────────────────────
function renderColleges() {
  const grid = document.getElementById('college-grid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  // Extract unique colleges
  const colleges = [...new Set(departments.map(d => d.faculty))].sort();

  grid.innerHTML = colleges.map((college, animIdx) => {
    const deptCount = departments.filter(d => d.faculty === college).length;
    const liveDepts = departments.filter(d => d.faculty === college && d.live).length;
    
    // Safety escape for single quotes in college names
    const safeCollegeName = college.replace(/'/g, "\\'"); 

    return `
      <button
        class="dept-card"
        onclick="openCollege('${safeCollegeName}')"
        style="animation-delay:${animIdx * 25}ms; text-align: left;"
      >
        <div class="card-top">
          <div class="card-icon" style="background:#3c3c3c;border:1px solid #000000" aria-hidden="true">🏛️</div>
          <span class="card-arrow" aria-hidden="true">→</span>
        </div>
        <div class="card-body">
          <div class="card-faculty">FUNAAB College</div>
          <div class="card-name">${college}</div>
        </div>
        <div>
          <span class="badge" style="background: #6b72801a; color: #989898">${deptCount} Departments</span>
          ${liveDepts > 0 ? `<span class="badge live" style="margin-left: 4px;">${liveDepts} Live</span>` : ''}
        </div>
      </button>`;
  }).join('');
}

// ─── NEW: Navigation Handlers ─────────────────────────────────
function openCollege(collegeName) {
  currentCollege = collegeName;
  
  // Switch Views
  document.getElementById('college-grid').style.display = 'none';
  document.getElementById('dept-view-container').style.display = 'block';
  document.getElementById('current-college-title').textContent = collegeName;
  
    // ---> NEW: Hide the Hero Section
  const heroSection = document.querySelector('.hero');
  if (heroSection) heroSection.style.display = 'none';
  
  // Clear search bar when entering a college
  document.getElementById('search-input').value = '';
  document.getElementById('search-clear').style.display = 'none';
  
  filterCards(); 
}

function showColleges() {
  currentCollege = null;
  
  // Switch Views
  document.getElementById('dept-view-container').style.display = 'none';
  document.getElementById('college-grid').style.display = 'grid'; // Ensure this matches your CSS grid class display type
  
  // ---> NEW: Show the Hero Section again
  const heroSection = document.querySelector('.hero');
  if (heroSection) heroSection.style.display = '';
  // Clear search bar
  document.getElementById('search-input').value = '';
  document.getElementById('search-clear').style.display = 'none';
  
  renderColleges();
  updateStats();
}

// ─── Render cards (Departments) ───────────────────────────────
function renderCards(list) {
  const grid   = document.getElementById('dept-grid');
  const noRes  = document.getElementById('no-results');
  const query  = document.getElementById('search-input').value.trim();

  if (list.length === 0) {
    grid.innerHTML   = '';
    grid.style.border = 'none';
    document.getElementById('search-term').textContent = query || currentFilter;
    noRes.classList.add('visible');
    noRes.style.display = 'block';
    return;
  }

  noRes.classList.remove('visible');
  noRes.style.display = 'none';
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
        aria-label="${dept.name}"
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

  // UX Magic: If typing a search, globally search and show department grid
  if (query) {
    document.getElementById('college-grid').style.display = 'none';
    document.getElementById('dept-view-container').style.display = 'block';
    document.getElementById('current-college-title').textContent = 'Global Search Results';
    
    list = list.filter(d =>
      d.name.toLowerCase().includes(query) ||
      d.faculty.toLowerCase().includes(query)
    );
  } else {
    // No search query
    if (currentCollege) {
      // We are inside a college view
      list = list.filter(d => d.faculty === currentCollege);
      document.getElementById('current-college-title').textContent = currentCollege;
    } else {
      // We are on the home screen, show colleges and stop processing dept cards
      showColleges();
      return; 
    }
  }

  // Apply tab filters (Live / Soon)
  if (currentFilter === 'live') list = list.filter(d =>  d.live);
  if (currentFilter === 'soon') list = list.filter(d => !d.live);

  renderCards(list);
  updateStats(list, query);
}

function setFilter(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  btn.classList.add('active');
  btn.setAttribute('aria-selected', 'true');
  
  // If we try to filter "Live" on the home page, switch to global view
  if (!currentCollege && !document.getElementById('search-input').value) {
     document.getElementById('college-grid').style.display = 'none';
     document.getElementById('dept-view-container').style.display = 'block';
     document.getElementById('current-college-title').textContent = 'All Departments';
  }
  
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
  openLevelModal(dept);
}

// ─── Level modal ──────────────────────────────────────────────
function openLevelModal(dept) {
  const modal   = document.getElementById('level-modal');
  const grid    = document.getElementById('level-grid');
  const iconEl  = document.getElementById('modal-icon');
  const titleEl = document.getElementById('modal-title');
  const facEl   = document.getElementById('modal-faculty');

  iconEl.textContent  = dept.icon;
  iconEl.style.cssText = `background:${dept.color}18;border:1px solid ${dept.color}30;`;
  facEl.textContent   = dept.faculty;
  titleEl.textContent = dept.name;

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

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setTimeout(() => modal.querySelector('.modal-close')?.focus(), 100);
}

function closeModal() {
  const modal = document.getElementById('level-modal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

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
    const modal = document.getElementById('level-modal');
    if (modal.classList.contains('open')) { closeModal(); return; }
    const cs = document.getElementById('coming-soon-page');
    if (cs.classList.contains('active')) goBack();
  }
});

// ─── Contribute Modal ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('contribute');
    const closeBtn = document.querySelector('.close-modal-btn');
    const triggerBtns = document.querySelectorAll('.open-modal-btn, a[href="#contribute"]');

    triggerBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); 
            modal.classList.add('modal-active');
            document.body.style.overflow = 'hidden'; 
        });
    });

    closeBtn?.addEventListener('click', () => {
        modal.classList.remove('modal-active');
        document.body.style.overflow = ''; 
    });

    modal?.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('container')) {
            modal.classList.remove('modal-active');
            document.body.style.overflow = '';
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.classList.contains('modal-active')) {
            modal.classList.remove('modal-active');
            document.body.style.overflow = '';
        }
    });
});