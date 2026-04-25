// ── CONFIG ──────────────────────────────────────────────────────────────────
const API_KEY = "92964dfef8d957bf56e23ee2e3c3a354";
const PROXY = "https://corsproxy.io/?";
const GNEWS_BASE = PROXY + encodeURIComponent("https://gnews.io/api/v4/search");
const SHEET_ID = "1G7QeP0_gE79KBAgDzcgJ79r6PWHxhy-Blywb9eLlREM";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&sheet=Sheet1`;
const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfRJ8JTuz4icXf-X8M9k9qN_S5gfsx0fqvNW4zSnisCulkDig/formResponse";

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
  { id: "childrensrights", name: "Children's Rights", desc: "Advocacy updates", url: "https://childrensrights.org/feed", badge: "b-rights" },
];

const SOURCE_FILTERS = [
  { id: "all", label: "All Sources" },
  { id: "gnews", label: "News Search" },
  { id: "substack", label: "CWN Editorial" },
  { id: "imprint", label: "The Imprint" },
  { id: "casey", label: "Casey Foundation" },
  { id: "cwmonitor", label: "Child Welfare Monitor" },
  { id: "nccpr", label: "NCCPR" },
  { id: "childrensrights", label: "Children's Rights" },
  { id: "curated", label: "Curated" },
];

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
  TOPICS.filter(t => t.label !== "All").forEach(t => {
    const el = document.createElement("button");
    el.className = "form-tag";
    el.textContent = t.label;
    el.onclick = () => {
      if (selectedFormTags.includes(t.label)) {
        selectedFormTags = selectedFormTags.filter(x => x !== t.label);
        el.classList.remove("selected");
      } else {
        selectedFormTags.push(t.label);
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

  const [gnewsResult, rssResult, sheetResult] = await Promise.allSettled([
    fetchGNews(q),
    rssLoaded ? Promise.resolve([]) : fetchAllRSS(),
    fetchSheet(),
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

  allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));

  pill.textContent = "Live";
  pill.className = "api-pill live";
  updateFooter();
  currentPage = 1;
  renderArticles();
  renderDigestSections();
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
      return { title, source: source.name, topic: inferTopic(title + " " + desc), date, desc, url: link, image, badge: source.badge, sourceId: source.id, type: "Article" };
    });
  } catch(e) { return []; }
}

async function fetchSheet() {
  try {
    const res = await fetch(PROXY + encodeURIComponent(SHEET_URL));
    const text = await res.text();
    const rows = text.trim().split("\n").slice(1);
    return rows.filter(r => r.trim()).map(row => {
      const cols = parseCSVRow(row);
      const [title, url, source, date, topic, note] = cols;
      return {
        title: title?.trim() || "Untitled",
        url: url?.trim() || "#",
        source: source?.trim() || "Curated",
        date: date?.trim() || "",
        topic: topic?.trim() || "General",
        desc: note?.trim() || "",
        image: null,
        badge: "b-substack",
        sourceId: "curated",
        type: "Curated",
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
  const monthItems = allArticles.filter(a => a.date && a.date.startsWith(thisMonth) && a.date !== today).slice(0, 8);
  const researchItems = allArticles.filter(a => ["Research", "Policy & legislation"].includes(a.topic)).slice(0, 5);
  const fedsItems = allArticles.filter(a => a.sourceId === "acf").slice(0, 5);

  renderDigestList("todayList", todayItems);
  renderDigestList("monthList", monthItems);
  renderDigestList("researchList", researchItems);
  renderDigestList("fedsList", fedsItems);
}

function renderDigestList(id, items) {
  const el = document.getElementById(id);
  if (!items.length) {
    el.innerHTML = `<p style="font-size:13px;color:var(--text-tertiary);padding:1rem 0;font-style:italic;">No items to show yet.</p>`;
    return;
  }
  el.innerHTML = items.map(a => `
    <div class="digest-item" onclick="window.open('${esc(a.url)}','_blank')">
      <span class="digest-arrow">→</span>
      <div class="digest-item-body">
        <p class="digest-item-title">${esc(a.title)}</p>
        <span class="digest-item-meta">${esc(a.source)} · ${fmtDate(a.date)}</span>
      </div>
    </div>
  `).join("");
}

// ── SUBMIT FORM ──────────────────────────────────────────────────────────────
async function submitForm() {
  const title = document.getElementById("submitTitle").value.trim();
  const url = document.getElementById("submitUrl").value.trim();
  const source = document.getElementById("submitSource").value.trim();
  const date = document.getElementById("submitDate").value.trim();
  const name = document.getElementById("submitName").value.trim();
  const tags = selectedFormTags.join(", ");

  if (!title || !url) { alert("Please fill in at least a title and URL."); return; }

  const formData = new FormData();
  formData.append("entry.1", title);
  formData.append("entry.2", url);
  formData.append("entry.3", source);
  formData.append("entry.4", date);
  formData.append("entry.5", tags);
  formData.append("entry.6", name);

  try {
    await fetch(FORM_URL, { method: "POST", mode: "no-cors", body: formData });
  } catch(e) {}

  document.getElementById("submitTitle").value = "";
  document.getElementById("submitUrl").value = "";
  document.getElementById("submitSource").value = "";
  document.getElementById("submitDate").value = "";
  document.getElementById("submitName").value = "";
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