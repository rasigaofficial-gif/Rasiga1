const { spawn, execSync } = require('child_process');
const fs = require('fs');

const PORT = 8081;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const ARTIFACT_DIR = 'C:\\Users\\aroma\\.gemini\\antigravity-ide\\brain\\efae51b2-1668-4206-a2a5-55c186a064ba';

const serverProcess = spawn(/^win/.test(process.platform) ? 'npx.cmd' : 'npx', ['http-server', '../', '-p', PORT, '-c-1', '--cors'], {
  stdio: 'ignore', shell: true
});

setTimeout(() => {
  try {
    console.log('Running lighthouse CLI...');
    execSync(`npx.cmd lighthouse ${BASE_URL}/#/ --output=json --output-path=lh-report.json --chrome-flags="--headless"`, { stdio: 'inherit' });
    const data = JSON.parse(fs.readFileSync('lh-report.json', 'utf8'));
    let perfMd = `# Lighthouse Performance Report\n\n## Route: Home\n`;
    perfMd += `- **Performance**: ${Math.round(data.categories.performance.score * 100)}\n`;
    perfMd += `- **Accessibility**: ${Math.round(data.categories.accessibility.score * 100)}\n`;
    perfMd += `- **Best Practices**: ${Math.round(data.categories['best-practices'].score * 100)}\n`;
    perfMd += `- **SEO**: ${Math.round(data.categories.seo.score * 100)}\n\n`;
    fs.writeFileSync(`${ARTIFACT_DIR}\\performance-report.md`, perfMd);
    console.log('Done.');
  } catch (e) {
    console.error(e);
  } finally {
    serverProcess.kill();
    process.exit(0);
  }
}, 2000);
