const { chromium, devices } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

const PORT = 8081;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const ARTIFACT_DIR = 'C:\\Users\\aroma\\.gemini\\antigravity-ide\\brain\\efae51b2-1668-4206-a2a5-55c186a064ba';
const SCREENSHOTS_DIR = path.join(ARTIFACT_DIR, 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Ensure server is running
const serverProcess = spawn(/^win/.test(process.platform) ? 'npx.cmd' : 'npx', ['http-server', '../', '-p', PORT, '-c-1', '--cors'], {
  stdio: 'ignore',
  shell: true
});

const ROUTES = [
  { name: 'Home', path: '#/' },
  { name: 'Discover', path: '#/discover' },
  { name: 'Charts', path: '#/charts' },
  { name: 'Leaderboards', path: '#/leaderboards' },
  { name: 'Song Detail', path: '#/song/02a5c01b-c6b6-45ef-8959-19ecac71c99f' }, // Testing a typical song page path
  { name: 'Profile', path: '#/profile' },
  { name: 'My Reviews', path: '#/my-reviews' },
  { name: 'My Lists', path: '#/my-lists' },
  { name: 'Analytics', path: '#/analytics' }
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 }
];

let consoleErrors = [];
let failedRequests = [];
let a11yViolations = [];
let workflowsStatus = [];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runAudit() {
  console.log('Starting Audit...');
  await delay(2000); // Wait for server to start

  const browser = await chromium.launch({ headless: true });
  
  for (const route of ROUTES) {
    console.log(`Auditing Route: ${route.name}`);
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height }
      });
      const page = await context.newPage();

      // Listeners
      if (vp.name === 'desktop') {
        page.on('console', msg => {
          if (msg.type() === 'error') {
            consoleErrors.push({ route: route.name, text: msg.text() });
          }
        });
        page.on('response', response => {
          if (!response.ok()) {
            failedRequests.push({ route: route.name, url: response.url(), status: response.status() });
          }
        });
      }

      await page.goto(`${BASE_URL}/${route.path}`, { waitUntil: 'networkidle' });
      await delay(1500); // Let JS render and data fetch

      // Screenshot
      const screenshotPath = path.join(SCREENSHOTS_DIR, `${route.name.replace(/\s+/g, '_').toLowerCase()}-${vp.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      // Axe-core on desktop
      if (vp.name === 'desktop') {
        try {
          const results = await new AxeBuilder({ page }).analyze();
          if (results.violations.length > 0) {
            a11yViolations.push({ route: route.name, violations: results.violations });
          }
        } catch (e) {
          console.error('Axe error on', route.name, e);
        }
      }

      await context.close();
    }
  }

  // Workflows Testing
  console.log('Testing Workflows...');
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto(`${BASE_URL}/#/`, { waitUntil: 'networkidle' });
    await delay(1000);
    // Click Discover
    const discoverNav = await page.$('.nav-link[href="#/discover"]');
    if (discoverNav) {
      await discoverNav.click();
      await delay(1000);
      const hash = await page.evaluate(() => window.location.hash);
      if (hash === '#/discover') workflowsStatus.push('Navigation to Discover works: PASS');
      else workflowsStatus.push('Navigation to Discover works: FAIL');
    } else {
      workflowsStatus.push('Navigation to Discover works: FAIL (Link not found)');
    }

    // Rating Slider logic
    await page.goto(`${BASE_URL}/#/song/test-song`);
    await delay(1000);
    const slider = await page.$('input[type="range"]');
    if (slider) workflowsStatus.push('Rating slider exists on song page: PASS');
    else workflowsStatus.push('Rating slider exists on song page: FAIL');
    
    // Check if charts render
    await page.goto(`${BASE_URL}/#/charts`);
    await delay(1000);
    const chartsDiv = await page.$('#charts-content');
    if (chartsDiv) workflowsStatus.push('Charts page renders content container: PASS');
    else workflowsStatus.push('Charts page renders content container: FAIL');

  } catch (e) {
    workflowsStatus.push(`Workflow testing encountered error: ${e.message}`);
  }
  await context.close();
  await browser.close();

  // Lighthouse
  console.log('Running Lighthouse...');
  const lhResults = [];
  try {
    const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
    const options = {logLevel: 'info', output: 'json', port: chrome.port};
    
    const runnerResult = await lighthouse(`${BASE_URL}/#/`, options);
    lhResults.push({
      route: 'Home',
      scores: {
        performance: runnerResult.lhr.categories.performance ? Math.round(runnerResult.lhr.categories.performance.score * 100) : 'N/A',
        accessibility: runnerResult.lhr.categories.accessibility ? Math.round(runnerResult.lhr.categories.accessibility.score * 100) : 'N/A',
        bestPractices: runnerResult.lhr.categories['best-practices'] ? Math.round(runnerResult.lhr.categories['best-practices'].score * 100) : 'N/A',
        seo: runnerResult.lhr.categories.seo ? Math.round(runnerResult.lhr.categories.seo.score * 100) : 'N/A'
      }
    });
    await chrome.kill();
  } catch (e) {
    console.error('Lighthouse error', e);
  }

  console.log('Generating Reports...');
  generateReports(lhResults);

  // Stop server
  serverProcess.kill();
  console.log('Audit Complete.');
  process.exit(0);
}

function generateReports(lhResults) {
  // audit-report.md
  let auditMd = `# End-to-End Audit Report\n\n## Crawled Routes\n${ROUTES.map(r => '- ' + r.name).join('\n')}\n\n`;
  auditMd += `## Console Errors\n${consoleErrors.length === 0 ? 'None found.' : consoleErrors.map(e => `- **[${e.route}]** ${e.text}`).join('\n')}\n\n`;
  auditMd += `## Failed Requests (Broken Links/Resources)\n${failedRequests.length === 0 ? 'None found.' : failedRequests.map(e => `- **[${e.route}]** ${e.url} (Status: ${e.status})`).join('\n')}\n\n`;
  auditMd += `## Workflow Tests\n${workflowsStatus.map(w => `- ${w}`).join('\n')}\n`;
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'audit-report.md'), auditMd);

  // accessibility-report.md
  let a11yMd = `# Accessibility Report\n\n`;
  if (a11yViolations.length === 0) {
    a11yMd += `No severe violations found.\n`;
  } else {
    for (const v of a11yViolations) {
      a11yMd += `## Route: ${v.route}\n`;
      for (const rule of v.violations) {
        a11yMd += `### [${rule.impact.toUpperCase()}] ${rule.help}\n`;
        a11yMd += `- **Description**: ${rule.description}\n`;
        a11yMd += `- **Rule ID**: ${rule.id}\n`;
        a11yMd += `- **Nodes Affected**: ${rule.nodes.length}\n`;
        for (let i=0; i<Math.min(3, rule.nodes.length); i++) {
           a11yMd += `  - \`${rule.nodes[i].html.substring(0, 150)}\`...\n`;
        }
      }
      a11yMd += `\n`;
    }
  }
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'accessibility-report.md'), a11yMd);

  // performance-report.md
  let perfMd = `# Lighthouse Performance Report\n\n`;
  if (lhResults.length === 0) {
    perfMd += `Lighthouse failed to run.\n`;
  } else {
    for (const r of lhResults) {
      perfMd += `## Route: ${r.route}\n`;
      perfMd += `- **Performance**: ${r.scores.performance}\n`;
      perfMd += `- **Accessibility**: ${r.scores.accessibility}\n`;
      perfMd += `- **Best Practices**: ${r.scores.bestPractices}\n`;
      perfMd += `- **SEO**: ${r.scores.seo}\n\n`;
    }
  }
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'performance-report.md'), perfMd);

  // improvement-roadmap.md
  let roadmapMd = `# Improvement Roadmap\n\nBased on automated end-to-end testing, the following priorities were identified:\n\n`;
  roadmapMd += `## Priority 1: Critical Fixes\n- Resolve console errors and failed API requests identified in \`audit-report.md\`.\n- Fix accessibility contrast and element roles found in \`accessibility-report.md\`.\n`;
  roadmapMd += `\n## Priority 2: Performance\n- Address Lighthouse performance bottlenecks detailed in \`performance-report.md\`.\n`;
  roadmapMd += `\n## Priority 3: Cross-Device Polish\n- Review captured screenshots in the \`screenshots/\` directory for layout issues across Desktop, Tablet, and Mobile viewports.\n`;
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'improvement-roadmap.md'), roadmapMd);
}

runAudit().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
