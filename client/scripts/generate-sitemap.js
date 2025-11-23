#!/usr/bin/env node

/**
 * Sitemap Generator for Eduhire
 * Generates sitemap.xml and sitemap-jobs.xml for SEO
 * Run: node generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');

const DOMAIN = process.env.REACT_APP_DOMAIN || 'https://eduhire.com';
const SITEMAP_DIR = path.join(__dirname, 'public');

/**
 * Main routes for sitemap
 */
const mainRoutes = [
  { url: '/', priority: 1.0, changefreq: 'daily' },
  { url: '/register', priority: 0.8, changefreq: 'monthly' },
  { url: '/login', priority: 0.8, changefreq: 'monthly' },
  { url: '/jobs', priority: 0.9, changefreq: 'hourly' },
  { url: '/subscriptions', priority: 0.7, changefreq: 'weekly' },
  { url: '/help', priority: 0.5, changefreq: 'monthly' },
  { url: '/profile', priority: 0.6, changefreq: 'weekly' },
  { url: '/notifications', priority: 0.6, changefreq: 'weekly' },
  { url: '/settings', priority: 0.5, changefreq: 'monthly' },
];

/**
 * Generate main sitemap
 */
function generateMainSitemap() {
  const sitemapEntries = mainRoutes.map((route) => `
  <url>
    <loc>${DOMAIN}${route.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</urlset>`;

  fs.writeFileSync(path.join(SITEMAP_DIR, 'sitemap.xml'), sitemap, 'utf8');
  console.log('✓ Main sitemap generated: sitemap.xml');
}

/**
 * Generate jobs sitemap (dynamic - would be populated from DB in production)
 */
function generateJobsSitemap() {
  // In production, fetch from database
  const jobRoutes = [
    { url: '/jobs', priority: 0.9, changefreq: 'hourly' },
    // Add individual job routes dynamically from DB if needed
  ];

  const sitemapEntries = jobRoutes.map((route) => `
  <url>
    <loc>${DOMAIN}${route.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</urlset>`;

  fs.writeFileSync(path.join(SITEMAP_DIR, 'sitemap-jobs.xml'), sitemap, 'utf8');
  console.log('✓ Jobs sitemap generated: sitemap-jobs.xml');
}

/**
 * Generate sitemap index (for large sitemaps)
 */
function generateSitemapIndex() {
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${DOMAIN}/sitemap.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${DOMAIN}/sitemap-jobs.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
</sitemapindex>`;

  fs.writeFileSync(path.join(SITEMAP_DIR, 'sitemap-index.xml'), sitemapIndex, 'utf8');
  console.log('✓ Sitemap index generated: sitemap-index.xml');
}

// Generate all sitemaps
console.log('🗺️  Generating sitemaps...');
generateMainSitemap();
generateJobsSitemap();
generateSitemapIndex();
console.log('✓ All sitemaps generated successfully!');
