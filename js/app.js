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
  { id: "casey", name: "Annie E. Casey Foundation", desc: "Research, data and policy on child well-being", url: "https://www.aecf.org/blog/rss.xml", badge: "b-casey" },
  { id: "cwmonitor", name: "Child Welfare Monitor", desc: "Policy analysis and child advocacy", url: "https://childwelfaremonitor.org/feed", badge: "b-monitor" },
  { id: "nccpr", name: "NCCPR", desc: "Child protection reform news and commentary", url: "https://www.nccprblog.org/feeds/posts/default?alt=rss", badge: "b-nccpr" },
  { id: "childrensrights", name: "Children's Rights", desc: "National advocacy and litigation updates", url: "https://childrensrights.org/feed", badge: "b-rights" },
  { id: "substack", name: "Child Welfare News", desc: "Editorial picks and analysis", url: "https://childwelfarenews.substack.com/feed", badge: "b-substack" },
];

const SOURCE_FILTERS = [
  { id: "all", label: "All Sources" },
  { id: "gnews", label: "News Search" },
  { id: "imprint", label: "The Imprint" },
  { id: "casey", label: "Casey Foundation" },
  { id: "cwmonitor", label: "Child Welfare Monitor" },
  { id: "nccpr", label: "NCCPR" },
  { id: "childrensrights", label: "Children's Rights" },
  { id: "substack", label: "CWN Editorial" },
];

let activeTag = "All";
let activeSource = "all";
let allArticles = [];
let rssLoaded = false;

// Set today's date
document.getElementById("todayDate").textContent = new Date().toLocaleDateString("en-US", {
  weekday: "long", year: "numeric", month: "long", day: "numeric"
});

// Build topic filter tags
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

// Build source filter chips
function buildSourceFilters() {
  const row = document.getElementById("sourceFilterRow");
  row.innerHTML = "";
  SOURCE_FILTERS.forEach(s => {
    const el = document.createElement("button");
    el.className = "tag" + (activeSource === s.id ? " active" : "");
    el.textContent = s.label;
    el.onclick = () => { activeSource = s.id; buildSourceFilters(); renderArticles(); };
    row.appendChild(el);
  });
}

// Main search — fetches GNews then RSS
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

  // Fetch GNews and RSS in parallel
  const [gnewsResult, rssResult] = await Promise.allSettled([
    fetchGNews(q),
    rssLoaded ? Promise.resolve([]) : fetchAllRSS(),
  ]);

  if (gnewsResult.status === "fulfilled") {
    allArticles.push(...gnewsResult.value);
  }

  if (rssResult.status === "fulfilled" && rssResult.value.length > 0) {
    allArticles.push(...rssResult.value);
    rssLoaded = true;
  } else if (rssLoaded) {
    // RSS already loaded from previous search, pull from cache
    allArticles.push(...window._rssCache || []);
  }

  // Cache RSS articles
  if (rssResult.status === "fulfilled" && rssResult.value.length > 0) {
    window._rssCache = rssResult.value;
  }

  // Sort everything by date
  allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));

  pill.textContent = "Live";
  pill.className = "api-pill live";
  updateFooter();
  renderArticles();
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
    }));
  } catch (e) {
    return [];
  }
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
    const items = Array.from(xml.querySelectorAll("item")).slice(0, 10);
    return items.map(item => {
      const rawTitle = item.querySelector("title")?.textContent?.trim() || "Untitled";
      const title = rawTitle.replace(/<!\[CDATA\[|\]\]>/g, "").trim();
      const link = item.querySelector("link")?.textContent?.trim() || "#";
      const rawDesc = item.querySelector("description")?.textContent || "";
      const desc = stripHTML(rawDesc).slice(0, 280);
      const pubDate = item.querySelector("pubDate")?.textContent?.trim() || "";
      const date = pubDate ? new Date(pubDate).toISOString().slice(0, 10) : "";
      const image = item.querySelector("enclosure")?.getAttribute("url") || item.querySelector("image url")?.textContent?.trim() || null;
      return { title, source: source.name, topic: inferTopic(title + " " + desc), date, desc, url: link, image: image, badge: source.badge, sourceId: source.id };
    });
  } catch (e) {
    return [];
  }
}

function renderArticles() {
  const grid = document.getElementById("articleGrid");
  const sort = document.getElementById("sortSelect").value;

  let filtered = [...allArticles];

  // Filter by source
  if (activeSource !== "all") {
    filtered = filtered.filter(a => a.sourceId === activeSource);
  }

  // Sort
  if (sort === "topic") filtered.sort((a, b) => a.topic.localeCompare(b.topic));
  else filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  document.getElementById("resultsCount").textContent = filtered.length
    ? `${filtered.length} article${filtered.length !== 1 ? "s" : ""}`
    : "No results";

  grid.innerHTML = filtered.length
    ? '<div class="article-grid">' + filtered.map(cardHTML).join("") + '</div>'
    : '<div class="state-box">No articles found. Try different keywords or select a topic.</div>';
}

function cardHTML(a) {
  const img = a.image
    ? `<img class="card-thumb" src="${esc(a.image)}" alt="" loading="lazy" onerror="this.style.display='none'" />`
    : `<div class="card-thumb card-thumb-placeholder"><span>${esc(a.source.charAt(0))}</span></div>`;

  return `<div class="article-card" onclick="window.open('${esc(a.url)}','_blank')">
    <div class="card-inner">
      <div class="card-body">
        <div class="card-meta">
          <span class="source-badge ${a.badge}">${esc(a.source)}</span>
          <span class="topic-pill">${esc(a.topic)}</span>
          <span class="card-date">${fmtDate(a.date)}</span>
        </div>
        <p class="card-title">${esc(a.title)}</p>
        ${a.desc ? `<p class="card-desc">${esc(a.desc)}</p>` : ""}
        <a class="card-link" href="${esc(a.url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Read full article</a>
      </div>
      ${img}
    </div>
  </div>`;
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
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function updateFooter() {
  document.getElementById("footerUpdate").textContent = "Updated " + new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

document.getElementById("searchInput").addEventListener("keydown", e => {
  if (e.key === "Enter") runSearch();
});

// Init
buildTags();
buildSourceFilters();
runSearch();
