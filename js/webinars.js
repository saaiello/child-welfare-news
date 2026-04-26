// ── CONFIG ───────────────────────────────────────────────────────────────────
const SHEET_ID = "1G7QeP0_gE79KBAgDzcgJ79r6PWHxhy-Blywb9eLlREM";
const WEBINAR_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=519660052`;
const PAGE_SIZE = 10;

// ── STATE ────────────────────────────────────────────────────────────────────
let allWebinars = [];
let activeTab = "all";
let currentPage = 1;

// ── INIT ─────────────────────────────────────────────────────────────────────
async function init() {
  allWebinars = await fetchWebinars();
  allWebinars.sort((a, b) => {
    // Upcoming sorted ascending (soonest first), Recorded descending (newest first)
    if (a.type === "Upcoming" && b.type === "Upcoming") return new Date(a.date) - new Date(b.date);
    if (a.type === "Recorded" && b.type === "Recorded") return new Date(b.date) - new Date(a.date);
    if (a.type === "Upcoming") return -1;
    return 1;
  });

  document.getElementById("webinarPill").textContent = "Updated";
  document.getElementById("webinarPill").className = "api-pill live";
  document.getElementById("footerUpdate").textContent = "Updated " + new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  renderWebinars();
}

// ── FETCH ────────────────────────────────────────────────────────────────────
async function fetchWebinars() {
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
        desc: desc?.trim() || "",
        type: type?.trim() || "Upcoming",
        image: image?.trim() || null,
      };
    }).filter(a => a.title && a.url && a.url !== "#");
  } catch(e) { return []; }
}

// ── TAB SWITCHING ────────────────────────────────────────────────────────────
function switchTab(tab) {
  activeTab = tab;
  currentPage = 1;
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById("tab" + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add("active");
  renderWebinars();
}

// ── RENDER ───────────────────────────────────────────────────────────────────
function renderWebinars() {
  const grid = document.getElementById("webinarGrid");
  const count = document.getElementById("webinarCount");
  const today = new Date().toISOString().slice(0, 10);

  let filtered = [...allWebinars];
  if (activeTab === "upcoming") filtered = filtered.filter(w => w.type?.toLowerCase() === "upcoming");
  if (activeTab === "recorded") filtered = filtered.filter(w => w.type?.toLowerCase() === "recorded");

  const total = filtered.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  count.textContent = total ? `${total} webinar${total !== 1 ? "s" : ""}` : "No webinars found";

  if (pageItems.length === 0) {
    grid.innerHTML = '<div class="state-box">No webinars found. <a href="index.html#missing">Submit one →</a></div>';
    document.getElementById("webinarPagination").innerHTML = "";
    return;
  }

  grid.innerHTML = pageItems.map(webinarCardHTML).join("");
  renderPagination(totalPages);
}

function webinarCardHTML(w) {
  const isUpcoming = w.type?.toLowerCase() === "upcoming";
  const img = w.image
    ? `<img src="${esc(w.image)}" alt="" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:8px 8px 0 0;display:block;" loading="lazy" onerror="this.style.display='none'" />`
    : "";

  return `<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:1rem;cursor:pointer;transition:border-color 0.15s;box-shadow:0 1px 3px rgba(0,0,0,0.06);" onclick="window.open('${esc(w.url)}','_blank')" onmouseover="this.style.borderColor='var(--teal)'" onmouseout="this.style.borderColor='var(--border)'">
    ${img}
    <div style="padding:1.25rem 1.5rem;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap;">
        <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:3px;background:${isUpcoming ? 'var(--teal)' : 'var(--bg)'};color:${isUpcoming ? 'var(--yellow)' : 'var(--text-tertiary)'};border:1px solid ${isUpcoming ? 'var(--teal)' : 'var(--border)'};">${esc(w.type)}</span>
        <span style="font-size:11px;color:var(--text-tertiary);">${esc(w.source)}</span>
        <span style="font-size:11px;color:var(--text-tertiary);margin-left:auto;">${fmtDate(w.date)}</span>
      </div>
      <p style="font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:var(--text-primary);line-height:1.35;margin-bottom:8px;">${esc(w.title)}</p>
      ${w.desc ? `<p style="font-size:13px;color:var(--text-secondary);line-height:1.65;margin-bottom:12px;">${esc(w.desc.slice(0, 300))}${w.desc.length > 300 ? '...' : ''}</p>` : ''}
      <a href="${esc(w.url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="font-size:12px;font-weight:600;color:var(--teal);border-bottom:1.5px solid var(--teal);padding-bottom:2px;">${isUpcoming ? 'Register →' : 'Watch recording →'}</a>
    </div>
  </div>`;
}

// ── PAGINATION ───────────────────────────────────────────────────────────────
function renderPagination(totalPages) {
  const el = document.getElementById("webinarPagination");
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
  renderWebinars();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

init();
