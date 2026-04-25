// ── CONFIG ──────────────────────────────────────────────────────────────────
const API_KEY = "92964dfef8d957bf56e23ee2e3c3a354";
const PROXY = "https://corsproxy.io/?";
const GNEWS_BASE = PROXY + encodeURIComponent("https://gnews.io/api/v4/search");
const SHEET_ID = "1G7QeP0_gE79KBAgDzcgJ79r6PWHxhy-Blywb9eLlREM";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;
const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfRJ8JTuz4icXf-X8M9k9qN_S5gfsx0fqvNW4zSnisCulkDig/formResponse";
const FEDERAL_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=207882433`;

const TOPICS = [
  { label: "All", query: "child welfare" },
  { label: "Foster care", query: "foster care children" },
  { label: "Family preservation", query: "family preservation reunification" },
  { label: "Substance use", query: "substance use disorder families child welfare" },
  { label: "Family treatment court", query: "family treatment court" },
  { label: "Adoption", query: "adoption foster care" },
  { label: "Kinship care", query: "kinship care relative caregiver" },
  { label: "Child abuse & neglect", query: "child abuse neglect prevention" },
  { label: "Policy & legislation", query: "child welfare policy legislation" },
  { label: "Mental health", query: "child welfare mental health youth" },
  { label: "Racial equity", query: "racial equity child welfare disparity" },
  { label: "Research", query: "child welfare research outcomes evidence" },
  { label: "Federal", query: "child welfare federal ACF children bureau" },
];

const RSS_SOURCES = [
  { id: "substack", name: "Child Welfare News", desc: "Editorial picks", url: "https://childwelfarenews.substack.com/feed", badge: "b-substack" },
  { id: "imprint", name: "The Imprint", desc: "Daily child welfare news", url: "https://imprintnews.org/feed", badge: "b-imprint" },
  { id: "casey", name: "Annie E. Casey Foundation", desc: "Research & policy", url: "https://www.aecf.org/blog/rss.xml", badge: "b-casey" },
  { id: "cwmonitor", name: "Child Welfare Monitor", desc: "Policy analysis", url: "https://childwelfaremonitor.org/feed", badge: "b-monitor" },
  { id: "nccpr", name: "NCCPR", desc: "Reform news", url: "https://www.nccprblog.org/feeds/posts/default?alt=rss", badge: "b-nccpr" },
  { id: "firstfocus", name: "First Focus on Children", desc: "Child advocacy and policy", url: "https://firstfocus.org/feed", badge: "b-rights" },
];

const SOURCE_FILTERS = [
  { id: "all", label: "All Sources" },
  { id: "gnews", label: "News Search" },
  { id: "substack", label: "CWN Editorial" },
  { id: "imprint", label: "The Imprint" },
  { id: "casey", label: "Casey Foundation" },
  { id: "cwmonitor", label: "Child Welfare Monitor" },
  { id: "nccpr", label: "NCCPR" },
  { id: "firstfocus", label: "First Focus" },
  { id: "curated", label: "Curated" },
  { id: "acf", label: "Federal" },
];

const CONTENT_TYPES = ["Article", "Webinar", "Podcast", "Research", "Federal"];

const FEATURED = {
  label: "Featured Story",
  title: "August: When Child Welfare Chooses",
  source: "Child Welfare News",
  url: "https://childwelfarenews.substack.com/p/august-when-child-welfare-chooses",
  note: "Every August, the child welfare system reveals its priorities. This piece examines what those choices say about who we protect — and who we don't.",
  date: "2024-08-01",
  image: null,
  isEditorsPick: false,
};

const EDITORS_PICK = {
  label: "Editor's Pick",
  title: "August: When Child Welfare Chooses",
  source: "Child Welfare News",
  url: "https://childwelfarenews.substack.com/p/august-when-child-welfare-chooses",
  note: "Why August is the hardest month in the system — and what it reveals about how we prioritize children.",
  date: "2024-08-01",
  image: null,
  isEditorsPick: true,
};

const STATE_NAMES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming"
];

// ── STATE ────────────────────────────────────────────────────────────────────
let activeTag = "All";
let activeSource = "all";
let allArticles = [];
let rssLoaded = false;
let currentPage = 1;
const PAGE_SIZE = 10;
let selectedFormTags = [];

// ── INIT ─────────────────────────────────────────────────────────────────────
renderHero();
buildSourceFilters();
buildFormTags();
runSearch();

// ── HERO ─────────────────────────────────────────────────────────────────────
function renderHero() {
  const f = FEATURED;
  document.getElementById("heroLabel").textContent = f.label;
  document.getElementById("heroLabel").className = f.isEditorsPick ? "hero-label-pick" : "hero-label";
  document.getElementById("heroSource").textContent = f.source;
  document.getElementById("heroDate").textContent = fmtDate(f.date);
  document.getElementById("heroTitle").textContent = f.title;
  document.getElementById("heroNote").textContent = f.note;
  document.getElementById("heroLink").href = f.url;

  const wrap = document.getElementById("heroImageWrap");
  if (f.image) {
    wrap.innerHTML = `<img class="hero-image" src="${esc(f.image)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML=''" />`;
  } else {
    wrap.innerHTML = `<div class="hero-image-placeholder">CWN</div>`;
  }
}

// ── TAGS ─────────────────────────────────────────────────────────────────────

function buildSourceFilters() {
  const row = document.getElementById("sourceFilterRow");
  row.innerHTML = "";
  SOURCE_FILTERS.forEach(s => {
    const el = document.createElement("button");
    el.className = "search-filter" + (activeSource === s.id ? " active" : "");
    el.textContent = s.label;
    el.onclick = () => { activeSource = s.id; buildSourceFilters(); renderArticles(); };
    row.appendChild(el);
  });
}

function buildFormTags() {
  const wrap = document.getElementById("formTags");
  wrap.innerHTML = "";
  CONTENT_TYPES.forEach(t => {
    const el = document.createElement("button");
    el.className = "form-tag";
    el.textContent = t;
    el.onclick = () => {
      if (selectedFormTags.includes(t)) {
        selectedFormTags = selectedFormTags.filter(x => x !== t);
        el.classList.remove("selected");
      } else {
        selectedFormTags.push(t);
        el.classList.add("selected");
      }
    };
    wrap.appendChild(el);
  });
}

// ── SEARCH ───────────────────────────────────────────────────────────────────
async function runSearch() {
  const btn = document.getElementById("searchBtn");
  const pill = document.getElementById("apiPill");
  const grid = document.getElementById("articleGrid");

  btn.disabled = true;
  pill.textContent = "Loading...";
  pill.className = "api-pill loading";
  grid.innerHTML = '<div class="state-box"><div class="spinner"></div>Loading articles...</div>';
  document.getElementById("resultsCount").textContent = "";

  allArticles = [];

  const manual = document.getElementById("searchInput").value.trim();
  const q = manual || (TOPICS.find(t => t.label === activeTag) || TOPICS[0]).query;

  const [gnewsResult, rssResult, sheetResult, federalSheetResult] = await Promise.allSettled([
    fetchGNews(q),
    rssLoaded ? Promise.resolve([]) : fetchAllRSS(),
    fetchSheet(),
    fetchFederalSheet(),
  ]);

  if (gnewsResult.status === "fulfilled") allArticles.push(...gnewsResult.value);

  if (rssResult.status === "fulfilled" && rssResult.value.length > 0) {
    allArticles.push(...rssResult.value);
    window._rssCache = rssResult.value;
    rssLoaded = true;
  } else if (rssLoaded && window._rssCache) {
    allArticles.push(...window._rssCache);
  }

if (sheetResult.status === "fulfilled") allArticles.push(...sheetResult.value);
  if (federalSheetResult.status === "fulfilled") allArticles.push(...federalSheetResult.value);

  allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));

  pill.textContent = "Live";
  pill.className = "api-pill live";
  updateFooter();
  currentPage = 1;
  renderArticles();
  setTimeout(() => {
  renderDigestSections();
  }, 100);
  btn.disabled = false;
}

async function fetchGNews(q) {
  try {
    const res = await fetch(`${GNEWS_BASE}?q=${encodeURIComponent(q)}&lang=en&country=us&max=10&sortby=publishedAt&apikey=${API_KEY}`);
    const data = await res.json();
    if (data.errors || !data.articles) return [];
    return data.articles.map(a => ({
      title: a.title || "Untitled",
      source: a.source?.name || "Unknown",
      topic: inferTopic(a.title + " " + (a.description || "")),
      date: a.publishedAt ? a.publishedAt.slice(0, 10) : "",
      desc: a.description || "",
      url: a.url || "#",
      image: a.image || null,
      badge: "b-default",
      sourceId: "gnews",
      type: "Article",
      state: detectState(a.title + " " + (a.description || "")),
    }));
  } catch(e) { return []; }
}

async function fetchAllRSS() {
  const results = await Promise.allSettled(RSS_SOURCES.map(fetchFeed));
  const articles = [];
  results.forEach(r => { if (r.status === "fulfilled") articles.push(...r.value); });
  return articles;
}

async function fetchFeed(source) {
  try {
    const res = await fetch(PROXY + encodeURIComponent(source.url));
    const text = await res.text();
    const xml = new DOMParser().parseFromString(text, "text/html");
    return Array.from(xml.querySelectorAll("item")).slice(0, 12).map(item => {
      const rawTitle = item.querySelector("title")?.textContent?.trim() || "Untitled";
      const title = rawTitle.replace(/<!\[CDATA\[|\]\]>/g, "").trim();
      const linkEl = item.querySelector("link");
      const link = linkEl?.textContent?.trim() || linkEl?.getAttribute("href") || item.querySelector("guid")?.textContent?.trim() || "#";
      const rawDesc = item.querySelector("description")?.textContent || "";
      const desc = stripHTML(rawDesc).replace(/<!\[CDATA\[|\]\]>/g, "").trim().slice(0, 280);
      const pubDate = item.querySelector("pubDate")?.textContent?.trim() || "";
      const date = pubDate ? new Date(pubDate).toISOString().slice(0, 10) : "";
      const image = item.querySelector("enclosure")?.getAttribute("url") || item.querySelector("image url")?.textContent?.trim() || null;
      return { title, source: source.name, topic: inferTopic(title + " " + desc), date, desc, state: detectState(title + " " + desc), url: link, image, badge: source.badge, sourceId: source.id, type: "Article" };
    });
  } catch(e) { return []; }
}

async function fetchSheet() {
  try {
    const res = await fetch(PROXY + encodeURIComponent(SHEET_URL + "&t=" + Date.now()));
    const text = await res.text();
    const rows = text.trim().split("\n").slice(1);
    return rows.filter(r => r.trim()).map(row => {
      const cols = parseCSVRow(row);
      const [title, url, source, date, topic, note, state] = cols;
      return {
        title: title?.trim() || "Untitled",
        url: url?.trim() || "#",
        source: source?.trim() || "Curated",
        date: date?.trim() || "",
        topic: topic?.trim() || "General",
        desc: note?.trim() || "",
        state: state?.trim() || detectState(title + " " + (note || "")),
        image: null,
        badge: "b-substack",
        sourceId: "curated",
        type: "Curated",
      };
    }).filter(a => a.title && a.url && a.url !== "#");
  } catch(e) { return []; }
}

async function fetchFederalSheet() {
  try {
    const res = await fetch(PROXY + encodeURIComponent(FEDERAL_SHEET_URL + "&t=" + Date.now()));
    const text = await res.text();
    const rows = text.trim().split("\n").slice(1);
    return rows.filter(r => r.trim()).map(row => {
      const cols = parseCSVRow(row);
      const [title, url, source, date, topic, note, state] = cols;
      return {
        title: title?.trim() || "Untitled",
        url: url?.trim() || "#",
        source: source?.trim() || "ACF",
        date: (() => { try { const d = new Date(date?.trim()); return isNaN(d) ? "" : d.toISOString().slice(0, 10); } catch(e) { return ""; } })(),
        topic: "Federal",
        desc: note?.trim() || "",
        state: state?.trim() || detectState(title + " " + (note || "")),
        image: null,
        badge: "b-acf",
        sourceId: "acf",
        type: "Federal",
      };
    }).filter(a => a.title && a.url && a.url !== "#");
  } catch(e) { return []; }
}

function parseCSVRow(row) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    if (row[i] === '"') { inQuotes = !inQuotes; }
    else if (row[i] === "," && !inQuotes) { result.push(current); current = ""; }
    else { current += row[i]; }
  }
  result.push(current);
  return result;
}

// ── RENDER ARTICLES ──────────────────────────────────────────────────────────
function renderArticles() {
  const grid = document.getElementById("articleGrid");
  const sort = document.getElementById("sortSelect").value;

  let filtered = [...allArticles];
  if (activeSource !== "all") filtered = filtered.filter(a => a.sourceId === activeSource);
  const stateFilter = document.getElementById("stateSelect")?.value;
  if (stateFilter) filtered = filtered.filter(a => a.state === stateFilter);
  if (sort === "topic") filtered.sort((a, b) => a.topic.localeCompare(b.topic));
  else filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  const total = filtered.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  document.getElementById("resultsCount").textContent = total ? `${total} article${total !== 1 ? "s" : ""}` : "No results";

  if (pageItems.length === 0) {
    grid.innerHTML = '<div class="state-box">No articles found. Try different keywords or select a topic.</div>';
    document.getElementById("pagination").innerHTML = "";
    return;
  }

  grid.innerHTML = '<div class="article-list">' + pageItems.map(articleCardHTML).join("") + '</div>';
  renderPagination(totalPages);
}

function articleCardHTML(a) {
  const img = a.image
    ? `<img class="article-thumb" src="${esc(a.image)}" alt="" loading="lazy" onerror="this.style.display='none'" />`
    : `<div class="article-thumb-placeholder">${esc(a.source.charAt(0))}</div>`;

  return `<div class="article-card" onclick="window.open('${esc(a.url)}','_blank')">
    <div class="article-card-body">
      <div class="article-card-meta">
        <span class="source-badge ${a.badge}">${esc(a.source)}</span>
        <span class="type-badge">${esc(a.type || "Article")}</span>
        ${a.state ? `<span class="state-badge">${esc(a.state)}</span>` : ""}
        <span class="card-date">${fmtDate(a.date)}</span>
      </div>
      <p class="article-card-title">${esc(a.title)}</p>
      ${a.desc ? `<p class="article-card-desc">${esc(a.desc)}</p>` : ""}
      <div class="article-card-actions">
        <a class="card-link" href="${esc(a.url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Read full article</a>
        <div class="share-buttons">
          <a class="share-btn" href="mailto:?subject=${encodeURIComponent(a.title)}&body=${encodeURIComponent(a.url)}" onclick="event.stopPropagation()" title="Share via email">Email</a>
          <a class="share-btn" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(a.url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">LinkedIn</a>
          <button class="share-btn" onclick="event.stopPropagation(); navigator.clipboard.writeText('${esc(a.url)}'); this.textContent='Copied!'; setTimeout(()=>this.textContent='Copy link',2000)">Copy link</button>
        </div>
      </div>
    </div>
    ${img}
  </div>`;
}

  function filterByState() {
    currentPage = 1;
    renderArticles();
  }

// ── PAGINATION ───────────────────────────────────────────────────────────────
function renderPagination(totalPages) {
  const el = document.getElementById("pagination");
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
  renderArticles();
  document.getElementById("articles").scrollIntoView({ behavior: "smooth" });
}

// ── DIGEST SECTIONS ──────────────────────────────────────────────────────────
function renderDigestSections() {
  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = today.slice(0, 7);

  const todayItems = allArticles.filter(a => a.date === today).slice(0, 5);
  const monthItems = allArticles.filter(a => a.date && a.date.startsWith(thisMonth) && a.date !== today).slice(0, 5);
  const researchItems = allArticles.filter(a =>
    ["Research", "Policy & legislation"].includes(a.topic) &&
    ["casey", "cwmonitor", "nccpr", "childrensrights", "curated", "chapinhall", "childtrends", "urban", "firstfocus"].includes(a.sourceId)
  ).slice(0, 5);
  const fedsItems = allArticles.filter(a => a.sourceId === "acf").slice(0, 5);

  renderDigestList("todayList", todayItems, "today");
  renderDigestList("monthList", monthItems, "month");
  renderDigestList("researchList", researchItems, "research");
  renderDigestList("fedsList", fedsItems, "feds");
}

function renderDigestList(id, items, type) {
  const el = document.getElementById(id);
  if (!items.length) {
    el.innerHTML = `<p style="font-size:13px;color:var(--text-tertiary);padding:1rem 0;font-style:italic;">No items to show yet.</p>`;
    return;
  }

  const seeAllLabels = {
    today: "See all today's news",
    month: "See everything this month",
    research: "See all research & policy",
    feds: "See all federal guidance",
  };

  el.innerHTML = items.map(a => `
    <div class="digest-item" onclick="window.open('${esc(a.url)}','_blank')">
      <span class="digest-arrow">→</span>
      <div class="digest-item-body">
        <p class="digest-item-title">${esc(a.title)}</p>
        <span class="digest-item-meta">${esc(a.source)} · ${fmtDate(a.date)}</span>
      </div>
    </div>
  `).join("") + `<div class="digest-see-all-wrap"><a class="digest-see-all" href="#articles" onclick="scrollToArticles()">${seeAllLabels[type]} →</a></div>`;
}

// ── SUBMIT FORM ──────────────────────────────────────────────────────────────
async function submitForm() {
  const title = document.getElementById("submitTitle").value.trim();
  const url = document.getElementById("submitUrl").value.trim();
  const source = document.getElementById("submitSource").value.trim();
  const date = document.getElementById("submitDate").value.trim();
  const name = document.getElementById("submitName").value.trim();
  const email = document.getElementById("submitEmail").value.trim();
  const notes = document.getElementById("submitNotes").value.trim();
  const state = document.getElementById("submitState").value.trim();
  const tags = selectedFormTags.join(", ");

  if (!title || !url) { alert("Please fill in at least a title and URL."); return; }

  try {
    const baseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfRJ8JTuz4icXf-X8M9k9qN_S5gfsx0fqvNW4zSnisCulkDig/viewform";
    const params = new URLSearchParams();
    params.append("entry.1396869931", title);
    params.append("entry.1336107118", url);
    params.append("entry.1380709668", source);
    params.append("entry.858367272", date);
    params.append("entry.1967969508", tags);
    params.append("entry.300271338", state);
    params.append("entry.1501976415", name);
    params.append("entry.1817029821", email);
    params.append("entry.486365505", notes);
    window.open(`${baseUrl}?${params.toString()}`, "_blank");
  } catch(e) {}

  document.getElementById("submitTitle").value = "";
  document.getElementById("submitUrl").value = "";
  document.getElementById("submitSource").value = "";
  document.getElementById("submitDate").value = "";
  document.getElementById("submitName").value = "";
  document.getElementById("submitEmail").value = "";
  document.getElementById("submitNotes").value = "";
  document.getElementById("submitState").value = "";
  selectedFormTags = [];
  document.querySelectorAll(".form-tag").forEach(t => t.classList.remove("selected"));

  const success = document.getElementById("formSuccess");
  success.style.display = "block";
  setTimeout(() => success.style.display = "none", 4000);
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
function openAbout() { document.getElementById("modalOverlay").classList.add("open"); }
function closeAbout() { document.getElementById("modalOverlay").classList.remove("open"); }

function scrollToArticles() {
  document.getElementById("articles").scrollIntoView({ behavior: "smooth" });
}

// ── UTILITIES ─────────────────────────────────────────────────────────────────
function detectState(text) {
  if (!text) return "";
  const t = text.toLowerCase();
  for (const state of STATE_NAMES) {
    if (t.includes(state.toLowerCase())) return state;
  }
  return "";
}

function inferTopic(t) {
  t = t.toLowerCase();
  if (t.includes("foster")) return "Foster care";
  if (t.includes("adopt")) return "Adoption";
  if (t.includes("kinship") || t.includes("relative caregiver")) return "Kinship care";
  if (t.includes("substance") || t.includes("opioid") || t.includes("treatment court")) return "Substance use";
  if (t.includes("family treatment court")) return "Family treatment court";
  if (t.includes("abuse") || t.includes("neglect")) return "Child abuse & neglect";
  if (t.includes("mental health") || t.includes("behavioral health")) return "Mental health";
  if (t.includes("legislat") || t.includes("policy") || t.includes("bill") || t.includes("congress")) return "Policy & legislation";
  if (t.includes("racial") || t.includes("disparity") || t.includes("equity")) return "Racial equity";
  if (t.includes("research") || t.includes("study") || t.includes("outcomes")) return "Research";
  if (t.includes("preserv") || t.includes("reunif")) return "Family preservation";
  if (t.includes("federal") || t.includes("acf") || t.includes("children's bureau")) return "Federal";
  return "General";
}

function stripHTML(html) {
  const d = document.createElement("div");
  d.innerHTML = html;
  return (d.textContent || d.innerText || "").replace(/\s+/g, " ").trim();
}

function fmtDate(d) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function esc(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function updateFooter() {
  document.getElementById("footerUpdate").textContent = "Updated " + new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

document.getElementById("searchInput").addEventListener("keydown", e => {
  if (e.key === "Enter") runSearch();
});

function switchWebinarTab(tab) {
  document.getElementById("webinarUpcoming").style.display = tab === "upcoming" ? "flex" : "none";
  document.getElementById("webinarArchive").style.display = tab === "recorded" ? "flex" : "none";
  document.getElementById("webinarTagUpcoming").className = "tag" + (tab === "upcoming" ? " active" : "");
  document.getElementById("webinarTagRecorded").className = "tag" + (tab === "recorded" ? " active" : "");
}