# Child Welfare News

A content aggregator pulling child welfare news articles from multiple sources into one place so practitioners, researchers, and policymakers don't have to go looking across a dozen different sites to stay current.

Live site: [childwelfarenews.github.io/child-welfare-news](https://childwelfarenews.github.io/child-welfare-news)

Weekly digest: [childwelfarenews.substack.com](https://childwelfarenews.substack.com)

---

## What it does

- Search across child welfare news by keyword or topic
- Browse curated RSS feeds from trusted field sources
- Filter by topic — foster care, substance use, family treatment court, policy, research, racial equity, and more
- Dark mode support, mobile responsive

## Built with

- [GNews API](https://gnews.io) — broad news search across 150,000+ sources
- RSS feeds from:
  - [The Imprint](https://imprintnews.org) — daily child welfare and juvenile justice news
  - [Annie E. Casey Foundation](https://aecf.org) — research, data, and policy
  - [Children's Bureau (ACF)](https://acf.hhs.gov/cb) — federal guidance and program updates
- Hosted on GitHub Pages

---

## Roadmap

### Now

- [x] GNews API search with topic filters
- [x] RSS feeds from The Imprint, Casey Foundation, and Children's Bureau
- [x] CORS proxy fix for browser-based API calls
- [ ] Substack newsletter callout on the site
- [ ] About page modal the project and its purpose
- [ ] Weekly editorial picks section ("From the Editor")

### Next

- [ ] Curated trusted source list baked into GNews searches

### Later

- [ ] Article annotations — "why this matters" notes on selected pieces
- [ ] Email signup flow integrated with Substack
- [ ] Caching layer so RSS feeds don't require live fetching on every visit
- [ ] Additional RSS sources (Chapin Hall, Child Trends, Urban Institute)
