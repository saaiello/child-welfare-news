// ── CONFIG ──────────────────────────────────────────────────────────────────
const API_KEY = "92964dfef8d957bf56e23ee2e3c3a354";
const GNEWS_BASE = PROXY + encodeURIComponent("https://gnews.io/api/v4/search");
const SHEET_ID = "1G7QeP0_gE79KBAgDzcgJ79r6PWHxhy-Blywb9eLlREM";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;
const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfRJ8JTuz4icXf-X8M9k9qN_S5gfsx0fqvNW4zSnisCulkDig/formResponse";
const FEDERAL_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=207882433`;
const PODCAST_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=2004516310`;
const WEBINAR_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=519660052`;
const RESEARCH_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=2073939782`;

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
  { label: "Racial equity", query: "racial equity child welfare disparity disproportionately abolition" },
  { label: "Research", query: "child welfare research outcomes evidence" },
  { label: "Federal", query: "child welfare federal ACF children bureau" },
  { label: "Prevention", query: "child welfare prevention child abuse prevention family separation prevention" },
  { label: "Home Visiting", query: "home visiting" },
];

const RSS_SOURCES = [
  { id: "substack", name: "Child Welfare News", desc: "Editorial picks", url: "https://childwelfarenews.substack.com/feed", badge: "b-substack" },
  { id: "imprint", name: "The Imprint", desc: "Daily child welfare news", url: "https://imprintnews.org/feed", badge: "b-imprint" },
  { id: "casey", name: "Annie E. Casey Foundation", desc: "Research & policy", url: "https://www.aecf.org/blog/rss.xml", badge: "b-casey" },
  { id: "cwmonitor", name: "Child Welfare Monitor", desc: "Policy analysis", url: "https://childwelfaremonitor.org/feed", badge: "b-monitor" },
  { id: "nccpr", name: "NCCPR", desc: "Reform news", url: "https://www.nccprblog.org/feeds/posts/default?alt=rss", badge: "b-nccpr" },
  { id: "firstfocus", name: "First Focus on Children", desc: "Child advocacy and policy", url: "https://firstfocus.org/feed", badge: "b-rights" },{ id: "kqed", name: "KQED", url: "https://ww2.kqed.org/news/feed", badge: "b-default", filtered: true },
];

const PODCAST_SOURCES = [
  { id: "cwinfo", name: "Child Welfare Information Gateway", url: "https://feeds.soundcloud.com/users/soundcloud:users:596489397/sounds.rss" },
  { id: "caseycast", name: "CaseyCast", url: "https://feeds.soundcloud.com/users/soundcloud:users:212314004/sounds.rss" },
  { id: "wonkcast", name: "WonkCast", url: "https://api.substack.com/feed/podcast/3697421.rss" },
  { id: "audionuggets", name: "Audio Nuggets: Mining For Gold", url: "https://rss.buzzsprout.com/2243612.rss" },
  { id: "torn", name: "Torn Podcast", url: "https://anchor.fm/s/dc5f30ac/podcast/rss" },
  { id: "upend", name: "The upEND Podcast", url: "https://anchor.fm/s/e01cfbfc/podcast/rss" },
  { id: "imprint", name: "The Imprint Weekly", url: "https://rss.buzzsprout.com/1376827.rss" },
  { id: "communityinsite", name: "Community In-Site", url: "https://rss.buzzsprout.com/2352800.rss" },
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

const KEYWORDS = [
  "child welfare", "foster care", "family preservation",
  "substance use", "treatment court", "kinship care",
  "child abuse", "child neglect", "adoption", "reunification",
  "racial equity", "disparity", "disproportionate",
  "family separation", "home visiting", "ACF",
  "children's bureau", "termination of parental rights",
  "group home", "residential care", "congregate care",
  "DCFS", "CPS", "child protective"
];

function matchesKeywords(text) {
  const lower = text.toLowerCase();
  return KEYWORDS.some(k => lower.includes(k.toLowerCase()));
}

const CONTENT_TYPES = ["Article", "Webinar", "Podcast", "Research", "Federal", "Resource", "Policy", "Data", "Toolkit"];

const FEATURED = [
  {
    label: "Featured Story",
    title: "Driving Change in Adoption Toolkit",
    source: "Chapin Hall",
    url: "https://www.chapinhall.org/project/driving-change-in-adoption/",
    note: "The Selfless Love Foundation (in partnership with Chapin Hall and the Child Welfare League of America) hosted the National Think Tank on Adoption Policy in October 2025. The convening brought together young people with lived experience in foster care and adoption alongside child welfare system professionals and researchers from across the country. ",
    date: "2025-25-03",
    image: "https://www.chapinhall.org/wp-content/uploads/Black-father-and-son-adoption-writing-homework-980x520-c-center.jpg",
    isEditorsPick: false,
  }
];

// ── STATE ────────────────────────────────────────────────────────────────────
let activeTag = "All";
let activeSource = "all";
let allArticles = [];
let rssLoaded = false;
let currentPage = 1;
const PAGE_SIZE = 10;
let selectedFormTags = [];
let carouselSlides = [];
let currentSlide = 0;
let carouselInterval = null;

// ── INIT ─────────────────────────────────────────────────────────────────────
renderHero();
buildSourceFilters();
buildFormTags();
loadPodcastPreview()
loadWebinarPreview();
loadResearchPreview();
runSearch();

// ── HERO ─────────────────────────────────────────────────────────────────────
async function buildCarousel() {
  // Start with manual slides
  carouselSlides = [...FEATURED];

  // Fetch from all sheets
  try {
    const [liveRes, federalRes, researchRes, webinarRes, podcastRes] = await Promise.allSettled([
      fetchCarouselSheet(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`, "live"),
      fetchCarouselSheet(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=207882433`, "federal"),
      fetchCarouselSheet(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=2073939782`, "research"),
      fetchCarouselSheet(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=519660052`, "webinar"),
      fetchCarouselSheet(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=2004516310`, "podcast"),
    ]);

    let autoSlides = [];
    [liveRes, federalRes, researchRes, webinarRes, podcastRes].forEach(r => {
      if (r.status === "fulfilled") autoSlides.push(...r.value);
    });

    // Sort by date, take 3 most recent
    autoSlides.sort((a, b) => new Date(b.date) - new Date(a.date));
    carouselSlides.push(...autoSlides.slice(0, 3));
  } catch(e) {}

  renderCarousel();
  startCarousel();
}

async function fetchCarouselSheet(url, type) {
  try {
    const res = await fetch(PROXY + encodeURIComponent(url + "&t=" + Date.now()));
    const text = await res.text();
    const rows = text.trim().split("\n").slice(1);
    return rows.filter(r => r.trim()).map(row => {
      const cols = parseCSVRow(row);
      const title = cols[0]?.trim() || "";
      const url = cols[1]?.trim() || "#";
      const source = cols[2]?.trim() || "";
      const date = (() => { try { const d = new Date(cols[3]?.trim()); return isNaN(d) ? "" : d.toISOString().slice(0, 10); } catch(e) { return ""; } })();
      const note = cols[4]?.trim() || "";
      const imageIndex = { live: null, federal: null, research: 7, webinar: 6, podcast: 5 };
      const imgCol = imageIndex[type];
      const image = imgCol !== null ? cols[imgCol]?.trim() || null : null;
      const typeLabels = { live: "Curated", federal: "Federal", research: "Research", webinar: "Webinar", podcast: "Podcast" };
      return { label: typeLabels[type], title, source, url, note, date, image: image || null, isEditorsPick: false };
    }).filter(a => a.title && a.url && a.url !== "#");
  } catch(e) { return []; }
}

function renderCarousel() {
  const wrap = document.getElementById("heroImageWrap");
  const body = document.getElementById("heroBody");
  if (!carouselSlides.length) return;

  const slide = carouselSlides[currentSlide];

  // Update content
  document.getElementById("heroLabel").textContent = slide.label || "Featured";
  document.getElementById("heroLabel").className = slide.isEditorsPick ? "hero-label-pick" : "hero-label";
  document.getElementById("heroSource").textContent = slide.source || "";
  document.getElementById("heroDate").textContent = fmtDate(slide.date);
  document.getElementById("heroTitle").textContent = slide.title;
  document.getElementById("heroNote").textContent = slide.note || "";
  document.getElementById("heroLink").href = slide.url;

  // Image
  if (slide.image) {
    wrap.innerHTML = `<img class="hero-image" src="${esc(slide.image)}" alt="" loading="lazy" onerror="this.innerHTML='<div class=hero-image-placeholder>CWN</div>'" />`;
  } else {
    wrap.innerHTML = `<div class="hero-image-placeholder">CWN</div>`;
  }

  // Dots
  renderCarouselDots();
}

function renderCarouselDots() {
  let dotsEl = document.getElementById("carouselDots");
  if (!dotsEl) return;
  dotsEl.innerHTML = carouselSlides.map((_, i) => `
    <button onclick="goToSlide(${i})" style="width:8px;height:8px;border-radius:50%;border:none;cursor:pointer;transition:all 0.15s;background:${i === currentSlide ? 'var(--teal)' : 'var(--border)' };padding:0;"></button>
  `).join("");
}

function goToSlide(index) {
  currentSlide = index;
  renderCarousel();
  resetCarousel();
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % carouselSlides.length;
  renderCarousel();
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + carouselSlides.length) % carouselSlides.length;
  renderCarousel();
}

function startCarousel() {
}

function resetCarousel() {
}

function renderHero() {
  buildCarousel();
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
    }).filter(article => {
      if (!source.filtered) return true;
    return matchesKeywords(article.title + " " + article.desc);
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
        date: (() => { try { const d = new Date(date?.trim()); return isNaN(d) ? "" : d.toISOString().slice(0, 10); } catch(e) { return ""; } })(),
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

async function fetchPodcastSheet() {
  try {
    const res = await fetch(PROXY + encodeURIComponent(PODCAST_SHEET_URL + "&t=" + Date.now()));
    const text = await res.text();
    const rows = text.trim().split("\n").slice(1);
    return rows.filter(r => r.trim()).map(row => {
      const cols = parseCSVRow(row);
      const [title, url, source, date, desc, image] = cols;
      return {
        title: title?.trim() || "Untitled",
        url: url?.trim() || "#",
        source: source?.trim() || "Podcast",
        date: (() => { try { const d = new Date(date?.trim()); return isNaN(d) ? "" : d.toISOString().slice(0, 10); } catch(e) { return ""; } })(),
        desc: desc?.trim() || "",
        image: image?.trim() || null,
      };
    }).filter(a => a.title && a.url && a.url !== "#");
  } catch(e) { return []; }
}

async function fetchPodcastFeeds() {
  const results = await Promise.allSettled(PODCAST_SOURCES.map(fetchPodcastFeed));
  const episodes = [];
  results.forEach(r => { if (r.status === "fulfilled") episodes.push(...r.value); });
  return episodes;
}

async function fetchPodcastFeed(source) {
  try {
    const res = await fetch(PROXY + encodeURIComponent(source.url));
    const text = await res.text();
    const xml = new DOMParser().parseFromString(text, "text/html");
    return Array.from(xml.querySelectorAll("item")).slice(0, 3).map(item => {
      const rawTitle = item.querySelector("title")?.textContent?.trim() || "Untitled";
      const title = rawTitle.replace(/<!\[CDATA\[|\]\]>/g, "").trim();
      const linkEl = item.querySelector("link");
      const link = linkEl?.textContent?.trim() || linkEl?.getAttribute("href") || item.querySelector("guid")?.textContent?.trim() || "#";
      const rawDesc = item.querySelector("description")?.textContent || "";
      const desc = stripHTML(rawDesc).replace(/<!\[CDATA\[|\]\]>/g, "").trim().slice(0, 200);
      const pubDate = item.querySelector("pubDate")?.textContent?.trim() || "";
      const date = pubDate ? new Date(pubDate).toISOString().slice(0, 10) : "";
      const image = item.querySelector("itunes\\:image")?.getAttribute("href") ||
                    item.querySelector("image")?.getAttribute("href") ||
                    item.querySelector("enclosure[type='image/jpeg']")?.getAttribute("url") ||
                    null;
      return { title, source: source.name, date, desc, url: link, image };
    });
  } catch(e) { return []; }
}

async function fetchWebinarSheet() {
  try {
    const res = await fetch(PROXY + encodeURIComponent(WEBINAR_SHEET_URL + "&t=" + Date.now()));
    const text = await res.text();
    const rows = text.trim().split("\n").slice(1);
    return rows.filter(r => r.trim()).map(row => {
      const cols = parseCSVRow(row);
      const [title, url, source, date, desc, type, image] = cols;
      return {
        title: title?.trim() || "Untitled",
        url: url?.trim() || "#",
        source: source?.trim() || "Webinar",
        date: (() => { try { const d = new Date(date?.trim()); return isNaN(d) ? "" : d.toISOString().slice(0, 10); } catch(e) { return ""; } })(),
        desc: desc?.trim().slice(0, 300) || "",
        type: type?.trim() || "Upcoming",
        image: image?.trim() || null,
      };
    }).filter(a => a.title && a.url && a.url !== "#");
  } catch(e) { return []; }
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

  const todayItems = allArticles.filter(a => a.date === today).slice(0, 2);
  const monthItems = allArticles.filter(a => a.date && a.date.startsWith(thisMonth) && a.date !== today).slice(0, 3);
  const fedsItems = allArticles.filter(a => a.sourceId === "acf").slice(0, 5);

  renderDigestList("todayList", todayItems, "today");
  renderDigestList("monthList", monthItems, "month");
  renderDigestList("fedsList", fedsItems, "feds");
}

// ── PODCAST PREVIEW ──────────────────────────────────────────────────────────
async function loadPodcastPreview() {
  const grid = document.getElementById("podcastPreviewGrid");
  if (!grid) return;

  try {
    const results = await Promise.allSettled(PODCAST_SOURCES.map(fetchPodcastPreview));
    let episodes = [];
    results.forEach(r => { if (r.status === "fulfilled") episodes.push(...r.value); });
    episodes.sort((a, b) => new Date(b.date) - new Date(a.date));
    episodes = episodes.slice(0, 6);

    if (!episodes.length) {
      grid.innerHTML = '<p class="media-placeholder">No episodes available.</p>';
      return;
    }

    grid.innerHTML = episodes.map(e => {
      const img = e.image
        ? `<img class="podcast-preview-img" src="${esc(e.image)}" alt="" loading="lazy" onerror="this.style.display='none'" />`
        : `<div class="podcast-preview-placeholder">${esc(e.source.charAt(0))}</div>`;
      return `<div class="podcast-preview-card" onclick="window.open('${esc(e.url)}','_blank')">
        ${img}
        <div class="podcast-preview-body">
          <div class="podcast-preview-show">${esc(e.source)}</div>
          <p class="podcast-preview-title">${esc(e.title)}</p>
        </div>
      </div>`;
    }).join("");
  } catch(e) {
    grid.innerHTML = '<p class="media-placeholder">Could not load episodes.</p>';
  }
}

// ── WEBINAR PREVIEW ──────────────────────────────────────────────────────────
async function loadWebinarPreview() {
  const featured = document.getElementById("webinarFeatured");
  const list = document.getElementById("webinarList");
  if (!featured || !list) return;

  try {
    const webinars = await fetchWebinarSheet();
    const today = new Date().toISOString().slice(0, 10);

    const upcoming = webinars
      .filter(w => w.type === "Upcoming" && w.date >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const recorded = webinars
      .filter(w => w.type === "Recorded" || w.date < today)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const featuredWebinar = upcoming[0] || recorded[0];
    const listItems = [...upcoming.slice(1), ...recorded].slice(0, 4);

    if (!featuredWebinar) {
      featured.innerHTML = '<p class="media-placeholder">No webinars yet. <a href="#missing">Submit one →</a></p>';
      list.innerHTML = "";
      return;
    }

    const img = featuredWebinar.image
      ? `<img src="${esc(featuredWebinar.image)}" alt="" style="width:100%;border-radius:10px;margin-bottom:1rem;object-fit:cover;aspect-ratio:16/9;" loading="lazy" />`
      : "";

    featured.innerHTML = `
      <div style="cursor:pointer;" onclick="window.open('${esc(featuredWebinar.url)}','_blank')">
        ${img}
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span class="featured-label" style="font-size:10px;">${esc(featuredWebinar.type)}</span>
          <span style="font-size:11px;color:var(--text-tertiary);">${esc(featuredWebinar.source)}</span>
          <span style="font-size:11px;color:var(--text-tertiary);margin-left:auto;">${fmtDate(featuredWebinar.date)}</span>
        </div>
        <p style="font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:var(--text-primary);line-height:1.3;margin-bottom:8px;">${esc(featuredWebinar.title)}</p>
        ${featuredWebinar.desc ? `<p style="font-size:13px;color:var(--text-secondary);line-height:1.6;margin-bottom:12px;">${esc(featuredWebinar.desc)}</p>` : ""}
        <a href="${esc(featuredWebinar.url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="font-size:12px;font-weight:600;color:var(--teal);border-bottom:1.5px solid var(--teal);padding-bottom:2px;">Register →</a>
      </div>
    `;

    if (!listItems.length) {
      list.innerHTML = '<p class="media-placeholder" style="font-style:italic;">More webinars coming soon.</p>';
      return;
    }

    list.innerHTML = listItems.map(w => `
      <div class="digest-item" onclick="window.open('${esc(w.url)}','_blank')">
        <span class="digest-arrow">→</span>
        <div class="digest-item-body">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="font-size:10px;font-weight:700;padding:1px 6px;border-radius:3px;background:${w.type === 'Upcoming' ? 'var(--teal)' : 'var(--bg)'};color:${w.type === 'Upcoming' ? 'var(--yellow)' : 'var(--text-tertiary)'};border:1px solid ${w.type === 'Upcoming' ? 'var(--teal)' : 'var(--border)'};">${esc(w.type)}</span>
            <span class="digest-item-meta">${esc(w.source)} · ${fmtDate(w.date)}</span>
          </div>
          <p class="digest-item-title">${esc(w.title)}</p>
          ${w.type?.toLowerCase() === 'recorded' && w.desc ? `<p style="font-size:12px;color:var(--text-secondary);line-height:1.5;margin-top:4px;">${esc(w.desc.slice(0, 200))}${w.desc.length > 200 ? '...' : ''}</p>` : ''}
        </div>
      </div>
    `).join("");
    list.innerHTML += `<div class="digest-see-all-wrap" style="margin-top:0.75rem;display:flex;gap:1.5rem;"><a class="digest-see-all" href="webinars.html">See all webinars →</a><a class="digest-see-all" href="#missing">Submit a webinar →</a></div>`;

  } catch(e) {
    featured.innerHTML = '<p class="media-placeholder">Could not load webinars.</p>';
  }
}

async function loadResearchPreview() {
  const list = document.getElementById("researchList");
  const featured = document.getElementById("researchFeatured");
  if (!list || !featured) return;

  try {
    const RESEARCH_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=2073939782`;
    const res = await fetch(PROXY + encodeURIComponent(RESEARCH_SHEET_URL + "&t=" + Date.now()));
    const text = await res.text();
    const rows = text.trim().split("\n").slice(1);
    const items = rows.filter(r => r.trim()).map(row => {
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

    items.sort((a, b) => new Date(b.date) - new Date(a.date));

    const featuredItem = items[0];
    const listItems = items.slice(1, 6);

    // Render featured on the right
    if (featuredItem) {
      const typeColors = {
        research: { bg: "#EEF4FA", color: "#1D4E7A", border: "#B5CDE0" },
        policy: { bg: "#F0EDF8", color: "#4A3A8A", border: "#CECBF6" },
        practice: { bg: "#EAF3DE", color: "#3B6D11", border: "#9FE1CB" },
        data: { bg: "#FEF3E2", color: "#92400E", border: "#FCD34D" },
        legislation: { bg: "#FDF2F8", color: "#9D174D", border: "#F9A8D4" },
        toolkit: { bg: "#E8F5F1", color: "#0D5C4A", border: "#6BBFA8" },
      };
      const colors = typeColors[featuredItem.contentType.toLowerCase()] || typeColors.research;
      const img = featuredItem.image
        ? `<img src="${esc(featuredItem.image)}" alt="" style="width:100%;border-radius:10px;margin-bottom:1rem;object-fit:cover;aspect-ratio:16/9;" loading="lazy" />`
        : "";

      featured.innerHTML = `
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:1.5rem;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,0.06);height:100%;" onclick="window.open('${esc(featuredItem.url)}','_blank')">
          ${img}
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap;">
            <span style="font-size:12px;font-weight:550;padding:2px 8px;border-radius:3px;background:${colors.bg};color:${colors.color};border:1px solid ${colors.border};text-transform:uppercase;">${esc(featuredItem.contentType)}</span>
            <span style="font-size:11px;color:var(--text-tertiary);">${esc(featuredItem.source)}</span>
            <span style="font-size:11px;color:var(--text-tertiary);margin-left:auto;">${fmtDate(featuredItem.date)}</span>
          </div>
          <p style="font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:var(--text-primary);line-height:1.3;margin-bottom:8px;">${esc(featuredItem.title)}</p>
          ${featuredItem.desc ? `<p style="font-size:13px;color:var(--text-secondary);line-height:1.6;margin-bottom:12px;">${esc(featuredItem.desc.slice(0, 250))}${featuredItem.desc.length > 250 ? '...' : ''}</p>` : ''}
          <a href="${esc(featuredItem.url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="font-size:12px;font-weight:600;color:var(--teal);border-bottom:1.5px solid var(--teal);padding-bottom:2px;">Read resource →</a>
        </div>
      `;
    }

    // Render list on the left
    if (!listItems.length) {
      list.innerHTML = `<p style="font-size:13px;color:var(--text-tertiary);font-style:italic;">More resources coming soon.</p>`;
      return;
    }

    list.innerHTML = listItems.map(a => `
      <div class="digest-item" onclick="window.open('${esc(a.url)}','_blank')">
        <span class="digest-arrow">→</span>
        <div class="digest-item-body">
          <p class="digest-item-title">${esc(a.title)}</p>
          <span class="digest-item-meta">${esc(a.source)} · ${fmtDate(a.date)}</span>
          ${a.desc ? `<p style="font-size:12px;color:var(--text-secondary);line-height:1.5;margin-top:4px;">${esc(a.desc.slice(0, 150))}${a.desc.length > 150 ? '...' : ''}</p>` : ''}
        </div>
      </div>
    `).join("");

    list.innerHTML += `<div class="digest-see-all-wrap"><a class="digest-see-all" href="research.html">See all research, policy & practice →</a></div>`;

  } catch(e) {
    list.innerHTML = `<p style="font-size:13px;color:var(--text-tertiary);font-style:italic;">Could not load resources.</p>`;
  }
}

async function fetchPodcastPreview(source) {
  try {
    const res = await fetch(PROXY + encodeURIComponent(source.url));
    const text = await res.text();
    const xml = new DOMParser().parseFromString(text, "text/html");
    return Array.from(xml.querySelectorAll("item")).slice(0, 1).map(item => {
      const rawTitle = item.querySelector("title")?.textContent?.trim() || "Untitled";
      const title = rawTitle.replace(/<!\[CDATA\[|\]\]>/g, "").trim();
      const guid = item.querySelector("guid")?.textContent?.trim() || "";
      const enclosureUrl = item.querySelector("enclosure")?.getAttribute("url") || "";
      const linkNext = item.querySelector("link")?.nextSibling?.textContent?.trim() || "";
      let link = (linkNext.startsWith("http") ? linkNext : null) ||
                 (enclosureUrl.startsWith("http") && !enclosureUrl.includes(".mp3") && !enclosureUrl.includes(".m4a") ? enclosureUrl : null) ||
                 "#";
      const pubDate = item.querySelector("pubDate")?.textContent?.trim() || "";
      const date = pubDate ? new Date(pubDate).toISOString().slice(0, 10) : "";
      const image = item.querySelector("itunes\\:image")?.getAttribute("href") ||
                    item.querySelector("[rel='image']")?.getAttribute("href") ||
                    null;
      return { title, source: source.name, sourceId: source.id, date, url: link, image };
    });
  } catch(e) { return []; }
}

// ── PODCAST PREVIEW ──────────────────────────────────────────────────────────
async function loadPodcastPreview() {
  const grid = document.getElementById("podcastPreviewGrid");
  if (!grid) return;

  try {
    const results = await Promise.allSettled(PODCAST_SOURCES.map(fetchPodcastPreview));
    let episodes = [];
    results.forEach(r => { if (r.status === "fulfilled") episodes.push(...r.value); });
    episodes.sort((a, b) => new Date(b.date) - new Date(a.date));
    episodes = episodes.slice(0, 5);

    if (!episodes.length) {
      grid.innerHTML = '<p class="media-placeholder">No episodes available.</p>';
      return;
    }

    grid.innerHTML = episodes.map(e => {
      const img = e.image
        ? `<img class="podcast-preview-img" src="${esc(e.image)}" alt="" loading="lazy" onerror="this.style.display='none'" />`
        : `<div class="podcast-preview-placeholder">${esc(e.source.charAt(0))}</div>`;
      return `<div class="podcast-preview-card" onclick="window.open('${esc(e.url)}','_blank')">
        ${img}
        <div class="podcast-preview-body">
          <div class="podcast-preview-show">${esc(e.source)}</div>
          <p class="podcast-preview-title">${esc(e.title)}</p>
        </div>
      </div>`;
    }).join("");
  } catch(e) {
    grid.innerHTML = '<p class="media-placeholder">Could not load episodes.</p>';
  }
}

async function fetchPodcastPreview(source) {
  try {
    const res = await fetch(PROXY + encodeURIComponent(source.url));
    const text = await res.text();
    const xml = new DOMParser().parseFromString(text, "text/html");
    return Array.from(xml.querySelectorAll("item")).slice(0, 1).map(item => {
      const rawTitle = item.querySelector("title")?.textContent?.trim() || "Untitled";
      const title = rawTitle.replace(/<!\[CDATA\[|\]\]>/g, "").trim();
      const guid = item.querySelector("guid")?.textContent?.trim() || "";
      const enclosureUrl = item.querySelector("enclosure")?.getAttribute("url") || "";
      const linkNext = item.querySelector("link")?.nextSibling?.textContent?.trim() || "";
      let link = (linkNext.startsWith("http") ? linkNext : null) ||
                 (enclosureUrl.startsWith("http") && !enclosureUrl.includes(".mp3") && !enclosureUrl.includes(".m4a") ? enclosureUrl : null) ||
                 "#";
      const pubDate = item.querySelector("pubDate")?.textContent?.trim() || "";
      const date = pubDate ? new Date(pubDate).toISOString().slice(0, 10) : "";
      const image = item.querySelector("itunes\\:image")?.getAttribute("href") ||
                    item.querySelector("[rel='image']")?.getAttribute("href") ||
                    null;
      return { title, source: source.name, sourceId: source.id, date, url: link, image };
    });
  } catch(e) { return []; }
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