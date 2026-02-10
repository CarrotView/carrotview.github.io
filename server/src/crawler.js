import * as cheerio from "cheerio";

const DEFAULT_PATHS = [
  "",
  "/pricing",
  "/features",
  "/product",
  "/use-cases",
  "/customers",
  "/about",
  "/blog",
  "/docs"
];

function normalizeUrl(input) {
  const url = new URL(input);
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

function sameOrigin(a, b) {
  return a.origin === b.origin;
}

async function fetchPage(url) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "CarrotViewBot/1.0"
    }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  const html = await res.text();
  const $ = cheerio.load(html);

  const title = $("title").text().trim();
  const description = $("meta[name='description']").attr("content") || "";

  $("script, style, nav, footer, header").remove();
  const text = $("body").text().replace(/\s+/g, " ").trim();

  const links = new Set();
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;
    try {
      const linkUrl = new URL(href, url);
      linkUrl.hash = "";
      links.add(linkUrl.toString().replace(/\/$/, ""));
    } catch {
      return;
    }
  });

  return {
    url,
    title,
    description,
    text,
    links: [...links]
  };
}

export async function crawlWebsite(startUrl, options = {}) {
  const maxPages = options.maxPages || 6;
  const target = new URL(startUrl);
  const origin = target.origin;

  const queue = new Set();
  DEFAULT_PATHS.forEach((path) => queue.add(normalizeUrl(origin + path)));
  queue.add(normalizeUrl(startUrl));

  const visited = new Set();
  const pages = [];

  while (queue.size > 0 && pages.length < maxPages) {
    const [next] = queue;
    queue.delete(next);

    if (visited.has(next)) continue;
    visited.add(next);

    let page;
    try {
      page = await fetchPage(next);
    } catch {
      continue;
    }

    pages.push(page);

    for (const link of page.links) {
      try {
        const linkUrl = new URL(link);
        if (!sameOrigin(linkUrl, new URL(origin))) continue;
        if (!visited.has(linkUrl.toString())) {
          queue.add(linkUrl.toString());
        }
      } catch {
        continue;
      }
    }
  }

  const combinedText = pages
    .map((p) => `${p.title}\n${p.description}\n${p.text}`)
    .join("\n\n")
    .slice(0, 15000);

  return {
    pages,
    combinedText
  };
}
