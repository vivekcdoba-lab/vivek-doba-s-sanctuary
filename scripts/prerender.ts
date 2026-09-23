import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { chromium } from 'playwright';

const SITE_URL = 'https://vivekdoba.com';
const PORT = 4173;
const courseSlugs = ['know-your-triangle', 'loa', 'udyog-sanjivani', 'lgt', 'practitioner', 'ram-nirvana', 'sales-sanjivani', 'leadership', 'book'];
const locations = ['india', 'maharashtra', 'pune', 'mumbai'];
const routes = [
  '/', '/about', '/courses', ...courseSlugs.map(slug => `/courses/${slug}`),
  '/shop', '/shop/lifes-golden-triangle-book-workbook', '/gallery', '/blog', '/contact', '/testimonials', '/score',
  '/life-coaching', '/business-coaching', '/manifestation', '/meditation', '/dharma-philosophy', '/nlp-coach', '/sales-coach',
  ...locations.flatMap(location => [`/life-coach-in-${location}`, `/business-coach-in-${location}`]),
  '/book-appointment', '/register-workshop', '/help', '/terms', '/privacy', '/refund-policy',
];

const escapeXml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const writeSitemap = (paths: string[]) => {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = paths.map(path => `  <url><loc>${escapeXml(`${SITE_URL}${path}`)}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n');
  writeFileSync(resolve('public/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  writeFileSync(resolve('dist/sitemap.xml'), readFileSync(resolve('public/sitemap.xml')));
};

const waitForServer = async () => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { if ((await fetch(`http://127.0.0.1:${PORT}`)).ok) return; } catch { /* server is starting */ }
    await new Promise(resolveDelay => setTimeout(resolveDelay, 250));
  }
  throw new Error('Preview server did not start.');
};

const resolveChromiumExecutable = () => {
  const bundledPath = chromium.executablePath();
  if (existsSync(bundledPath)) return bundledPath;

  const browsersRoot = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!browsersRoot || !existsSync(browsersRoot)) return undefined;

  const candidates = readdirSync(browsersRoot)
    .filter(name => name.startsWith('chromium-'))
    .sort()
    .reverse()
    .flatMap(name => [
      resolve(browsersRoot, name, 'chrome-linux64', 'chrome'),
      resolve(browsersRoot, name, 'chrome-linux', 'chrome'),
    ]);

  return candidates.find(existsSync);
};

const server = spawn('vite', ['preview', '--host', '127.0.0.1', '--port', String(PORT)], { stdio: 'ignore', shell: true });
try {
  await waitForServer();
  const executablePath = resolveChromiumExecutable();
  const browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1800 } });
  const blogRoutes: string[] = [];
  for (const route of [...routes.filter(route => route !== '/'), '/']) {
    await page.goto(`http://127.0.0.1:${PORT}${route}`, { waitUntil: 'networkidle', timeout: 45000 });
    await page.locator('h1').first().waitFor({ state: 'attached', timeout: 15000 });
    if (route === '/blog') {
      const hrefs = await page.locator('a[href^="/blog/"]').evaluateAll(links => links.map(link => link.getAttribute('href')).filter((href): href is string => Boolean(href)));
      blogRoutes.push(...hrefs);
    }
    const html = '<!doctype html>\n' + await page.content();
    const target = route === '/' ? resolve('dist/index.html') : resolve('dist', route.slice(1), 'index.html');
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, html);
    console.log(`Prerendered ${route}`);
  }
  for (const route of [...new Set(blogRoutes)]) {
    await page.goto(`http://127.0.0.1:${PORT}${route}`, { waitUntil: 'networkidle', timeout: 45000 });
    await page.locator('h1').first().waitFor({ state: 'attached', timeout: 15000 });
    const target = resolve('dist', route.slice(1), 'index.html');
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, '<!doctype html>\n' + await page.content());
  }
  await browser.close();
  writeSitemap([...routes, ...new Set(blogRoutes)]);
} finally {
  server.kill('SIGTERM');
}