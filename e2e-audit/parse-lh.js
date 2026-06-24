const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\aroma\\.gemini\\antigravity-ide\\brain\\efae51b2-1668-4206-a2a5-55c186a064ba';

try {
  const data = JSON.parse(fs.readFileSync('lh-report.json', 'utf8'));
  let perfMd = `# Lighthouse Performance Report\n\n## Route: Home\n`;
  perfMd += `- **Performance**: ${Math.round(data.categories.performance.score * 100)}\n`;
  perfMd += `- **Accessibility**: ${Math.round(data.categories.accessibility.score * 100)}\n`;
  perfMd += `- **Best Practices**: ${Math.round(data.categories['best-practices'].score * 100)}\n`;
  perfMd += `- **SEO**: ${Math.round(data.categories.seo.score * 100)}\n\n`;
  
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'performance-report.md'), perfMd);
  console.log('Report generated successfully.');
} catch (e) {
  console.error('Error generating report:', e);
}
