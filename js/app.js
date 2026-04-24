const API_KEY = "92964dfef8d957bf56e23ee2e3c3a354";
const PROXY = "https://corsproxy.io/?";
const GNEWS_BASE = PROXY + encodeURIComponent("https://gnews.io/api/v4/search");

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
];

const RSS_SOURCES = [
  { id: "imprint", name: "The Imprint", desc: "Daily child welfare and juvenile justice news", url: "https://imprintnews.org/feed", badge: "b-imprint" },
  { id: "casey", name: "Annie E. Casey Foundation", desc: "Research, data and policy on child well-being", url: "https://www.aecf.org/feed", badge: "b-casey" },
  { id: "acf", name: "Children's Bureau", desc: "Federal guidance, data and program updates", url: "https://www.acf.hhs.gov/cb/rss.xml", badge: "b-acf" },
];

let activeTag = "All";
let gnewsArticles = [];
let rssArticles = [];
let activeSource = "all";
let rssLoaded = false;

document.getElementById("todayDate").textContent = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

function switchTab(tab) {
  document.querySelectorAll(".tab").forEach((t, i) => t.classList.toggle("active", (i === 0) === (tab === "search")));
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById("tab-" + tab).classList.add("active");
  if (tab === "sources" && !rssLoaded) loadRSS(false);
}

function buildTags() {
  const row = document.getElementById("tagRow");
  row.innerHTML = "";
  TOPICS.forEach(t => {
    const el = document.createElement("button");
    el.className = "tag" + (t.label === activeTag ? " active" : "");
    el.textContent = t.label;
    el.onclick = () => { activeTag = t.label; buildTags(); runSearch(); };
    row.appendChild(el);
  });
}

function buildSourceGrid() {
  const all = [{ id: "all", name: "All Sources", desc: "Show everything from all feeds" }, ...RSS_SOURCES];
  document.getElementById("sourceGrid").innerHTML = all.map(s =>
    `<div class="source-card ${activeSource === s.id ? 'active' : ''}" onclick="filterRSS('${s.id}')"><div class="source-card-name">${s.name}</div><div class="source-card-desc">${s.desc}</div></div>`
  ).join("");
}

function filterRSS(id) {
  activeSource = id;
  buildSourceGrid();
  renderRSS();
}

async function runSearch() {
  const btn = document.getElementById("searchBtn");
  const pill = document.getElementById("apiPill");
  const grid = document.getElementById("articleGrid");
  btn.disabled = true;
  pill.textContent = "Fetching...";
  pill.className = "api-pill loading";
  grid.innerHTML = '<div class="state-box"><div class="spinner"></div>Loading articles...</div>';
  document.getElementById("resultsCount").textContent = "";
  const manual = document.getElementById("searchInput").value.trim();
  const q = manual || (TOPICS.find(t => t.label === activeTag) || TOPICS[0]).query;
  try {
    const res = await fetch(`${GNEWS_BASE}?q=${encodeURIComponent(q)}&lang=en&country=us&max=10&sortby=publishedAt&apikey=${API_KEY}`);
    const data = await res.json();
    if (data.errors || !data.articles) {
      pill.textContent = "API error"; pill.className = "api-pill error";
      grid.innerHTML = '<div class="state-box">Could not load articles. Check your API key or try again later.</div>';
    } else {
      gnewsArticles = data.articles.map(a => ({ title: a.title || "Untitled", source: a.source?.name || "Unknown", topic: activeTag !== "All" ? activeTag : inferTopic(a.title + " " + (a.description || "")), date: a.publishedAt ? a.publishedAt.slice(0,10) : "", desc: a.description || "", url: a.url || "#", badge: "b-default" }));
      pill.textContent = "Live"; pill.className = "api-pill live";
      updateFooter(); renderArticles();
    }
  } catch(e) {
    pill.textContent = "Network error"; pill.className = "api-pill error";
    grid.innerHTML = '<div class="state-box">Network error — check your connection and try again.</div>';
  }
  btn.disabled = false;
}

function renderArticles() {
  const sort = document.getElementById("sortSelect").value;
  let sorted = [...gnewsArticles];
  if (sort === "topic") sorted.sort((a,b) => a.topic.localeCompare(b.topic));
  else sorted.sort((a,b) => new Date(b.date) - new Date(a.date));
  document.getElementById("resultsCount").textContent = sorted.length ? `${sorted.length} article${sorted.length !== 1 ? "s" : ""}` : "No results";
  document.getElementById("articleGrid").innerHTML = sorted.length
    ? '<div class="article-grid">' + sorted.map(cardHTML).join("") + '</div>'
    : '<div class="state-box">No articles found. Try different keywords or select a topic.</div>';
}

async function loadRSS(force) {
  if (rssLoaded && !force) { renderRSS(); return; }
  document.getElementById("rssGrid").innerHTML = '<div class="state-box"><div class="spinner"></div>Loading feeds from The Imprint, Casey Foundation, and Children\'s Bureau...</div>';
  document.getElementById("rssCount").textContent = "";
  const results = await Promise.allSettled(RSS_SOURCES.map(fetchFeed));
  rssArticles = [];
  results.forEach(r => { if (r.status === "fulfilled") rssArticles.push(...r.value); });
  rssArticles.sort((a,b) => new Date(b.date) - new Date(a.date));
  rssLoaded = true;
  buildSourceGrid(); renderRSS(); updateFooter();
}

async function fetchFeed(source) {
  const res = await fetch(PROXY + encodeURIComponent(source.url));
  const text = await res.text();
  const xml = new DOMParser().parseFromString(text, "text/xml");
  return Array.from(xml.querySelectorAll("item")).slice(0, 12).map(item => {
    const title = item.querySelector("title")?.textContent?.trim() || "Untitled";
    const link = item.querySelector("link")?.textContent?.trim() || "#";
    const rawDesc = item.querySelector("description")?.textContent || "";
    const desc = stripHTML(rawDesc).slice(0, 280);
    const pubDate = item.querySelector("pubDate")?.textContent?.trim() || "";
    const date = pubDate ? new Date(pubDate).toISOString().slice(0,10) : "";
    return { title, source: source.name, topic: inferTopic(title + " " + desc), date, desc, url: link, badge: source.badge, sourceId: source.id };
  });
}

function renderRSS() {
  const filtered = activeSource === "all" ? rssArticles : rssArticles.filter(a => a.sourceId === activeSource);
  document.getElementById("rssCount").textContent = filtered.length ? `${filtered.length} article${filtered.length !== 1 ? "s" : ""}` : "No articles";
  document.getElementById("rssGrid").innerHTML = filtered.length
    ? '<div class="article-grid">' + filtered.map(cardHTML).join("") + '</div>'
    : '<div class="state-box">No articles loaded. Some feeds may be temporarily unavailable.<p>Try refreshing or check back later.</p></div>';
}

function cardHTML(a) {
  return `<div class="article-card" onclick="window.open('${esc(a.url)}','_blank')"><div class="card-meta"><span class="source-badge ${a.badge}">${esc(a.source)}</span><span class="topic-pill">${esc(a.topic)}</span><span class="card-date">${fmtDate(a.date)}</span></div><p class="card-title">${esc(a.title)}</p>${a.desc ? `<p class="card-desc">${esc(a.desc)}</p>` : ''}<a class="card-link" href="${esc(a.url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Read full article</a></div>`;
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

buildTags();
buildSourceGrid();
runSearch();