// ── CONFIG ───────────────────────────────────────────────────────────────────
const SHEET_ID = "1G7QeP0_gE79KBAgDzcgJ79r6PWHxhy-Blywb9eLlREM";
const RESEARCH_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=2073939782`;
const PAGE_SIZE = 10;

const CONTENT_TYPES = ["Research", "Policy", "Practice", "Data", "Legislation", "Toolkit"];

const TOPICS = [
  "Foster care", "Family preservation", "Substance use", "Family treatment court",
  "Adoption", "Kinship care", "Child abuse & neglect", "Policy & legislation",
  "Mental health", "Racial equity", "Federal", "Home visiting", "Prevention", "General"
];

// ── STATE ────────────────────────────────────────────────────────────────────
let allResources = [];
let activeTypes = [];
let activeTopics = [];
let currentPage = 1;

// ── INIT ─────────────────────────────────────────────────────────────────────
async function init() {
  allResources = await fetchResearch();
  allResources.sort((a, b) => new Date(b.date) - new Date(a.date));

  document.getElementById("footerUpdate").textContent = "Updated " + new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  buildTypeTags();
  buildTopicTags();
  applyFilters();
}

// ── FETCH ────────────────────────────────────────────────────────────────────
async function fetchResearch() {
  try {
    const res = await fetch(PROXY + encodeURIComponent(RESEARCH_SHEET_URL + "&t=" + Date.now()));
    const text = await res.text();
    const rows = text.trim().split("\n").slice(1);
    return rows.filter(r => r.trim()).map(row => {
      const cols = parseCSVRow(row);
      const [title, url, source, date, desc, contentType, topicTags, image] = cols;
      return {
        title: title?.trim() || "Untitled",
        url: url?.trim() || "#",
        source: source?.trim() || "Unknown",
        date: (() => { try { const d = new Date(date?.trim()); return isNaN(d) ? "" : d.toISOString().slice(0, 10); } catch(e) { return ""; } })(),
        desc: desc?.trim() || "",
        contentType: contentType?.trim() || "Research",
        topicTags: topicTags?.trim() || "",
        image: image?.trim() || null,
      };
    }).filter(a => a.title && a.url && a.url !== "#");
  } catch(e) { return []; }
}

// ── TAG BUILDERS ─────────────────────────────────────────────────────────────
function buildTypeTags() {
  const row = document.getElementById("typeTags");
  row.innerHTML = CONTENT_TYPES.map(t => `
    <button class="webinar-topic-tag ${activeTypes.includes(t) ? 'active' : ''}" onclick="toggleType('${t}')">${t}</button>
  `).join("");
}

function buildTopicTags() {
  const row = document.getElementById("topicTags");
  row.innerHTML = TOPICS.map(t => `
    <button class="webinar-topic-tag ${activeTopics.includes(t) ? 'active' : ''}" onclick="toggleTopic('${t}')">${t}</button>
  `).join("");
}

function toggleType(type) {
  if (activeTypes.includes(type)) {
    activeTypes = activeTypes.filter(t => t !== type);
  } else {
    activeTypes.push(type);
  }
  currentPage = 1;
  buildTypeTags();
  applyFilters();
}

function toggleTopic(topic) {
  if (activeTopics.includes(topic)) {
    activeTopics = activeTopics.filter(t => t !== topic);
  } else {
    activeTopics.push(topic);
  }
  currentPage = 1;
  buildTopicTags();
  applyFilters();
}

// ── SEARCH + FILTER ──────────────────────────────────────────────────────────
function applyFilters() {
  const query = document.getElementById("researchSearch").value.toLowerCase().trim();
  let filtered = [...allResources];

  if (query) {
    filtered = filtered.filter(r =>
      r.title.toLowerCase().includes(query) ||
      r.desc.toLowerCase().includes(query) ||
      r.source.toLowerCase().includes(query)
    );
  }

  if (activeTypes.length > 0) {
    filtered = filtered.filter(r =>
      activeTypes.some(t => r.contentType.toLowerCase().includes(t.toLowerCase()))
    );
  }

  if (activeTopics.length > 0) {
    filtered = filtered.filter(r =>
      activeTopics.some(t => r.topicTags.toLowerCase().includes(t.toLowerCase()))
    );
  }

  renderResearch(filtered);
}

// ── RENDER ───────────────────────────────────────────────────────────────────
function renderResearch(filtered) {
  const grid = document.getElementById("researchGrid");
  const count = document.getElementById("researchCount");

  const total = filtered.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  count.textContent = total ? `${total} resource${total !== 1 ? "s" : ""}` : "No resources found";

  if (pageItems.length === 0) {
    grid.innerHTML = '<div class="state-box">No resources found. Try a different search or filter. <a href="index.html#missing" style="color:var(--teal);">Submit one →</a></div>';
    document.getElementById("researchPagination").innerHTML = "";
    return;
  }

  grid.innerHTML = pageItems.map(resourceCardHTML).join("");
  renderPagination(totalPages);
}

function resourceCardHTML(r) {
  const typeColors = {
    research: { bg: "#EEF4FA", color: "#1D4E7A", border: "#B5CDE0" },
    policy: { bg: "#F0EDF8", color: "#4A3A8A", border: "#CECBF6" },
    practice: { bg: "#EAF3DE", color: "#3B6D11", border: "#9FE1CB" },
    data: { bg: "#FEF3E2", color: "#92400E", border: "#FCD34D" },
    legislation: { bg: "#FDF2F8", color: "#9D174D", border: "#F9A8D4" },
    toolkit: { bg: "#E8F5F1", color: "#0D5C4A", border: "#6BBFA8" },
  };

  const typeKey = r.contentType.toLowerCase();
  const colors = typeColors[typeKey] || typeColors.research;

  const topics = r.topicTags ? r.topicTags.split(",").map(t => t.trim()).filter(Boolean).slice(0, 3) : [];

  return `<div class="webinar-card" onclick="window.open('${esc(r.url)}','_blank')">
    <div class="webinar-card-meta">
      <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:3px;background:${colors.bg};color:${colors.color};border:1px solid ${colors.border};text-transform:uppercase;letter-spacing:0.04em;">${esc(r.contentType)}</span>
      ${topics.map(t => `<span class="webinar-tag">${esc(t)}</span>`).join("")}
      <span class="webinar-card-source">${esc(r.source)}</span>
      <span class="webinar-card-date">${fmtDate(r.date)}</span>
    </div>
    <p class="webinar-card-title">${esc(r.title)}</p>
    ${r.desc ? `<p class="webinar-card-desc">${esc(r.desc)}</p>` : ''}
    <a class="webinar-card-link" href="${esc(r.url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Read resource →</a>
  </div>`;
}

// ── PAGINATION ───────────────────────────────────────────────────────────────
function renderPagination(totalPages) {
  const el = document.getElementById("researchPagination");
  if (totalPages <= 1) { el.innerHTML = ""; return; }

  let html = `<button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? "disabled" : ""}>← Prev</button>`;
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

document.getElementById("researchSearch").addEventListener("keydown", e => {
  if (e.key === "Enter") applyFilters();
});

document.getElementById("researchSearch").addEventListener("input", e => {
  if (e.target.value === "") applyFilters();
});

init();
