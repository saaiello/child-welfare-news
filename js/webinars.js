// ── CONFIG ───────────────────────────────────────────────────────────────────
const SHEET_ID = "1G7QeP0_gE79KBAgDzcgJ79r6PWHxhy-Blywb9eLlREM";
const WEBINAR_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=519660052`;
const PAGE_SIZE = 10;

const TOPICS = [
  "Foster care", "Family preservation", "Substance use", "Family treatment court",
  "Adoption", "Kinship care", "Child abuse & neglect", "Policy & legislation",
  "Mental health", "Racial equity", "Research", "Federal", "General"
];

// ── STATE ────────────────────────────────────────────────────────────────────
let allWebinars = [];
let activeTopic = "";
let currentPage = 1;
let activeTypeFilter = "all";

// ── INIT ─────────────────────────────────────────────────────────────────────
async function init() {
  allWebinars = await fetchWebinars();

  // Sort: upcoming first (soonest first), recorded after (newest first)
  allWebinars.sort((a, b) => {
    const aUp = a.type?.toLowerCase() === "upcoming";
    const bUp = b.type?.toLowerCase() === "upcoming";
    if (aUp && bUp) return new Date(a.date) - new Date(b.date);
    if (!aUp && !bUp) return new Date(b.date) - new Date(a.date);
    if (aUp) return -1;
    return 1;
  });

  document.getElementById("footerUpdate").textContent = "Updated " + new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  renderHero();
  buildTopicTags();
  applyFilters();
}

// ── FETCH ────────────────────────────────────────────────────────────────────
async function fetchWebinars() {
  try {
    const res = await fetch(PROXY + encodeURIComponent(WEBINAR_SHEET_URL + "&t=" + Date.now()));
    const text = await res.text();
    const rows = text.trim().split("\n").slice(1);
    return rows.filter(r => r.trim()).map(row => {
      const cols = parseCSVRow(row);
      const [title, url, source, date, desc, type, image, tags] = cols;
      return {
        title: title?.trim() || "Untitled",
        url: url?.trim() || "#",
        source: source?.trim() || "Webinar",
        date: (() => { try { const d = new Date(date?.trim()); return isNaN(d) ? "" : d.toISOString().slice(0, 10); } catch(e) { return ""; } })(),
        desc: desc?.trim() || "",
        type: type?.trim() || "Upcoming",
        image: image?.trim() || null,
        tags: tags?.trim() || "",
      };
    }).filter(a => a.title && a.url && a.url !== "#");
  } catch(e) { return []; }
}

// ── HERO ─────────────────────────────────────────────────────────────────────
function renderHero() {
  const heroEl = document.getElementById("webinarHero");
  const today = new Date().toISOString().slice(0, 10);
  const featured = allWebinars.find(w => w.type?.toLowerCase() === "upcoming" && w.date >= today)
    || allWebinars[0];

  if (!featured) { heroEl.innerHTML = ""; return; }

  const img = featured.image
    ? `<img class="webinar-hero-image" src="${esc(featured.image)}" alt="" loading="lazy" onerror="this.style.display='none'" />`
    : `<div class="webinar-hero-placeholder">CWN</div>`;

  heroEl.innerHTML = `
    <div class="webinar-hero" onclick="window.open('${esc(featured.url)}','_blank')" style="cursor:pointer;">
      ${img}
      <div class="webinar-hero-body">
        <div class="webinar-hero-eyebrow">
          <span class="webinar-hero-label">${esc(featured.type)}</span>
          <span class="webinar-hero-source">${esc(featured.source)}</span>
          <span class="webinar-hero-date">${fmtDate(featured.date)}</span>
        </div>
        <p class="webinar-hero-title">${esc(featured.title)}</p>
        ${featured.desc ? `<p class="webinar-hero-desc">${esc(featured.desc.slice(0, 250))}${featured.desc.length > 250 ? '...' : ''}</p>` : ''}
        <a class="webinar-hero-btn" href="${esc(featured.url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">
          ${featured.type?.toLowerCase() === 'upcoming' ? 'Register →' : 'Watch recording →'}
        </a>
      </div>
    </div>
  `;
}

// ── TOPIC TAGS ───────────────────────────────────────────────────────────────
function buildTopicTags() {
  const row = document.getElementById("topicTags");
  row.innerHTML = TOPICS.map(t => `
    <button class="webinar-topic-tag ${activeTopic === t ? 'active' : ''}" onclick="filterByTopic('${t}')">${t}</button>
  `).join("");
}

function filterByTopic(topic) {
  activeTopic = activeTopic === topic ? "" : topic;
  currentPage = 1;
  buildTopicTags();
  applyFilters();
}

function filterByType(type) {
  activeTypeFilter = type;
  currentPage = 1;
  document.querySelectorAll(".webinar-type-filter").forEach(b => b.classList.remove("active"));
  document.getElementById("filter" + type.charAt(0).toUpperCase() + type.slice(1)).classList.add("active");
  applyFilters();
}

// ── SEARCH + FILTER ──────────────────────────────────────────────────────────
function applyFilters() {
  const query = document.getElementById("webinarSearch").value.toLowerCase().trim();
  let filtered = [...allWebinars];

  if (query) {
    filtered = filtered.filter(w =>
      w.title.toLowerCase().includes(query) ||
      w.desc.toLowerCase().includes(query)
    );
  }

  if (activeTypeFilter !== "all") {
    filtered = filtered.filter(w => w.type?.toLowerCase() === activeTypeFilter);
  }

  if (activeTopic) {
    filtered = filtered.filter(w =>
      w.tags.toLowerCase().includes(activeTopic.toLowerCase())
    );
  }

  renderWebinars(filtered);
}

// ── RENDER ───────────────────────────────────────────────────────────────────
function renderWebinars(filtered) {
  const grid = document.getElementById("webinarGrid");
  const count = document.getElementById("webinarCount");

  const total = filtered.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  count.textContent = total ? `${total} webinar${total !== 1 ? "s" : ""}` : "No webinars found";

  if (pageItems.length === 0) {
    grid.innerHTML = '<div class="state-box">No webinars found. Try a different search or topic. <a href="index.html#missing" style="color:var(--teal);">Submit one →</a></div>';
    document.getElementById("webinarPagination").innerHTML = "";
    return;
  }

  grid.innerHTML = pageItems.map(webinarCardHTML).join("");
  renderPagination(totalPages, filtered);
}

function webinarCardHTML(w) {
  const isUpcoming = w.type?.toLowerCase() === "upcoming";
  return `<div class="webinar-card" onclick="window.open('${esc(w.url)}','_blank')">
    <div class="webinar-card-meta">
      <span class="webinar-type-badge ${isUpcoming ? 'webinar-type-upcoming' : 'webinar-type-recorded'}">${esc(w.type)}</span>
      ${w.tags ? `<span class="webinar-tag">${esc(w.tags.split(',')[0].trim())}</span>` : ''}
      <span class="webinar-card-source">${esc(w.source)}</span>
      <span class="webinar-card-date">${fmtDate(w.date)}</span>
    </div>
    <p class="webinar-card-title">${esc(w.title)}</p>
    ${w.desc ? `<p class="webinar-card-desc">${esc(w.desc)}</p>` : ''}
    <a class="webinar-card-link" href="${esc(w.url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">${isUpcoming ? 'Register →' : 'Watch recording →'}</a>
  </div>`;
}

// ── PAGINATION ───────────────────────────────────────────────────────────────
function renderPagination(totalPages, filtered) {
  const el = document.getElementById("webinarPagination");
  if (totalPages <= 1) { el.innerHTML = ""; return; }

  let html = `<button class="page-btn" onclick="changePage(${currentPage - 1}, filtered)" ${currentPage === 1 ? "disabled" : ""}>← Prev</button>`;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    } else if (Math.abs(i - currentPage) === 2) {
      html += `<span style="color:var(--text-tertiary);padding:0 4px;">…</span>`;
    }
  }
  html += `<button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? "disabled" : ""}>Next →</button>`;
  el.innerHTML = html;
}

function changePage(page) {
  currentPage = page;
  applyFilters();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.getElementById("webinarSearch").addEventListener("keydown", e => {
  if (e.key === "Enter") applyFilters();
});

document.getElementById("webinarSearch").addEventListener("input", e => {
  if (e.target.value === "") applyFilters();
});

init();
