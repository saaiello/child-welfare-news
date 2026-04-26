const SHEET_ID = "1G7QeP0_gE79KBAgDzcgJ79r6PWHxhy-Blywb9eLlREM";
const PODCAST_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=2004516310`;

const PODCAST_SOURCES = [
  { id: "cwinfo", name: "Child Welfare Information Gateway", url: "https://feeds.soundcloud.com/users/soundcloud:users:596489397/sounds.rss" },
  { id: "caseycast", name: "CaseyCast", url: "https://feeds.soundcloud.com/users/soundcloud:users:212314004/sounds.rss" },
  { id: "wonkcast", name: "WonkCast", url: "https://api.substack.com/feed/podcast/3697421.rss" },
  { id: "audionuggets", name: "Audio Nuggets: Mining For Gold", url: "https://rss.buzzsprout.com/2243612.rss" },
  { id: "torn", name: "Torn Podcast", url: "https://anchor.fm/s/dc5f30ac/podcast/rss" },
  { id: "upend", name: "The upEND Podcast", url: "https://anchor.fm/s/e01cfbfc/podcast/rss" },
  { id: "imprintweekly", name: "The Imprint Weekly", url: "https://rss.buzzsprout.com/1376827.rss" },
  { id: "communityinsite", name: "Community In-Site", url: "https://rss.buzzsprout.com/2352800.rss" },
];

const PAGE_SIZE = 12;
let allEpisodes = [];
let activeShow = "all";
let currentPage = 1;

async function init() {
  const [rssResult, sheetResult] = await Promise.allSettled([
    fetchAllPodcastFeeds(),
    fetchPodcastSheet(),
  ]);

  if (rssResult.status === "fulfilled") allEpisodes.push(...rssResult.value);
  if (sheetResult.status === "fulfilled") allEpisodes.push(...sheetResult.value);

  allEpisodes.sort((a, b) => new Date(b.date) - new Date(a.date));

  document.getElementById("podcastPill").textContent = "Live";
  document.getElementById("podcastPill").className = "api-pill live";
  document.getElementById("footerUpdate").textContent = "Updated " + new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  buildShowFilters();
  renderPodcasts();
}

async function fetchAllPodcastFeeds() {
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
    return Array.from(xml.querySelectorAll("item")).slice(0, 5).map(item => {
      const rawTitle = item.querySelector("title")?.textContent?.trim() || "Untitled";
      const title = rawTitle.replace(/<!\[CDATA\[|\]\]>/g, "").trim();
      const linkEl = item.querySelector("link");
      const link = linkEl?.textContent?.trim() || linkEl?.getAttribute("href") || item.querySelector("guid")?.textContent?.trim() || "#";
      const rawDesc = item.querySelector("description")?.textContent || "";
      const desc = stripHTML(rawDesc).replace(/<!\[CDATA\[|\]\]>/g, "").trim().slice(0, 200);
      const pubDate = item.querySelector("pubDate")?.textContent?.trim() || "";
      const date = pubDate ? new Date(pubDate).toISOString().slice(0, 10) : "";
      const image = item.querySelector("itunes\\:image")?.getAttribute("href") ||
                    item.querySelector("[rel='image']")?.getAttribute("href") ||
                    null;
      return { title, source: source.name, sourceId: source.id, date, desc, url: link, image };
    });
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
        sourceId: "curated",
        date: (() => { try { const d = new Date(date?.trim()); return isNaN(d) ? "" : d.toISOString().slice(0, 10); } catch(e) { return ""; } })(),
        desc: desc?.trim() || "",
        image: image?.trim() || null,
      };
    }).filter(a => a.title && a.url && a.url !== "#");
  } catch(e) { return []; }
}

function buildShowFilters() {
  const row = document.getElementById("showFilters");
  const shows = ["all", ...PODCAST_SOURCES.map(s => s.id), "curated"];
  const labels = { all: "All Shows", curated: "Curated", ...Object.fromEntries(PODCAST_SOURCES.map(s => [s.id, s.name])) };

  row.innerHTML = shows.map(id => `
    <button class="show-filter ${activeShow === id ? 'active' : ''}" onclick="filterByShow('${id}')">${labels[id]}</button>
  `).join("");
}

function filterByShow(id) {
  activeShow = id;
  currentPage = 1;
  buildShowFilters();
  renderPodcasts();
}

function renderPodcasts() {
  const grid = document.getElementById("podcastGrid");
  const count = document.getElementById("podcastCount");

  let filtered = [...allEpisodes];
  if (activeShow !== "all") filtered = filtered.filter(e => e.sourceId === activeShow);
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  const total = filtered.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  count.textContent = total ? `${total} episode${total !== 1 ? "s" : ""}` : "No episodes";

  if (pageItems.length === 0) {
    grid.innerHTML = '<div class="state-box" style="grid-column:1/-1">No episodes found.</div>';
    document.getElementById("podcastPagination").innerHTML = "";
    return;
  }

  grid.innerHTML = pageItems.map(podcastCardHTML).join("");
  renderPagination(totalPages);
}

function podcastCardHTML(e) {
  const img = e.image
    ? `<img class="podcast-card-image" src="${esc(e.image)}" alt="" loading="lazy" onerror="this.style.display='none'" />`
    : `<div class="podcast-card-image-placeholder">${esc(e.source.charAt(0))}</div>`;

  return `<div class="podcast-card" onclick="window.open('${esc(e.url)}','_blank')">
    ${img}
    <div class="podcast-card-body">
      <div class="podcast-card-show">${esc(e.source)}</div>
      <p class="podcast-card-title">${esc(e.title)}</p>
      <p class="podcast-card-date">${fmtDate(e.date)}</p>
      ${e.desc ? `<p class="podcast-card-desc">${esc(e.desc)}</p>` : ""}
      <a class="podcast-listen-btn" href="${esc(e.url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Listen →</a>
    </div>
  </div>`;
}

function renderPagination(totalPages) {
  const el = document.getElementById("podcastPagination");
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
  renderPodcasts();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

init();