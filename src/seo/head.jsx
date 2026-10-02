/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect } from 'react';
import { SITE_NAME, SITE_URL } from '../site';

// Pages declare their <head> with useHead(). While prerendering, the values are
// collected through this context and written into the static HTML; in the
// browser they are applied to document.head on navigation.
const HeadContext = createContext(null);
export const HeadCollector = HeadContext.Provider;

const DEFAULT_IMAGE = `${SITE_URL}/og.png`;

const escape = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The tags for a page head. Every tag carries data-head so it can be replaced. */
export function headToHtml({ title, description, path = '/', image = DEFAULT_IMAGE, type = 'website', noindex = false, jsonLd = [] }) {
  const url = SITE_URL + (path === '/' ? '/' : path);
  const tags = [
    `<title data-head>${escape(title)}</title>`,
    `<meta data-head name="description" content="${escape(description)}">`,
    noindex ? '<meta data-head name="robots" content="noindex">' : `<link data-head rel="canonical" href="${escape(url)}">`,
    `<meta data-head property="og:type" content="${type}">`,
    `<meta data-head property="og:site_name" content="${SITE_NAME}">`,
    `<meta data-head property="og:title" content="${escape(title)}">`,
    `<meta data-head property="og:description" content="${escape(description)}">`,
    `<meta data-head property="og:url" content="${escape(url)}">`,
    `<meta data-head property="og:image" content="${escape(image)}">`,
    '<meta data-head property="og:image:width" content="1200">',
    '<meta data-head property="og:image:height" content="630">',
    '<meta data-head name="twitter:card" content="summary_large_image">',
    `<meta data-head name="twitter:title" content="${escape(title)}">`,
    `<meta data-head name="twitter:description" content="${escape(description)}">`,
    `<meta data-head name="twitter:image" content="${escape(image)}">`,
    ...jsonLd.map((data) => `<script data-head type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`),
  ];
  return tags.join('\n    ');
}

export function useHead(head) {
  const collector = useContext(HeadContext);
  if (collector) Object.assign(collector, head);
  const key = JSON.stringify(head);
  useEffect(() => {
    const template = document.createElement('template');
    template.innerHTML = headToHtml(JSON.parse(key));
    document.head.querySelectorAll('[data-head]').forEach((el) => el.remove());
    document.head.append(template.content);
  }, [key]);
}

// --- structured data helpers ---

export const breadcrumbs = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name,
    item: SITE_URL + path,
  })),
});

export const faq = (pairs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: pairs.map(([q, a]) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
});
