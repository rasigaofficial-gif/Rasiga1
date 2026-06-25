import re

with open('js/pages.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Initialize expanded state in global object if not exists
init_state_code = """
window.RasigaApp.toggleChartExpand = function(chart) {
  if (!window.RasigaData.chartsExpanded) window.RasigaData.chartsExpanded = { topRated: false, mostPopular: false };
  window.RasigaData.chartsExpanded[chart] = !window.RasigaData.chartsExpanded[chart];
  window.RasigaApp.navigateTo('#/charts'); // Re-render the charts page
};
"""
# I'll inject this at the top of pages.js or in app.js. Actually, pages.js doesn't have a top-level execution context that persists cleanly, it's just a bunch of HTML strings. Wait, I can inject it where I inject other functions. I'll just put the inline `onclick` to mutate `window.RasigaData` and call `RasigaApp.renderCharts`! Wait, `#charts` is handled by `pages.js`. Calling `RasigaApp.handleRoute()` or `location.hash='#/charts'` works.

# Let's modify the slice logic
content = content.replace(
    'const topRated = [...songs].sort((a, b) => Number(b.avg_rating || 0) - Number(a.avg_rating || 0)).slice(0, 5);',
    'const isExpandedTR = window.RasigaData.chartsExpanded && window.RasigaData.chartsExpanded.topRated;\n    const topRated = [...songs].sort((a, b) => Number(b.avg_rating || 0) - Number(a.avg_rating || 0)).slice(0, isExpandedTR ? 100 : 5);'
)

content = content.replace(
    'const mostPopular = [...songs].sort((a, b) => Number(b.total_ratings || 0) - Number(a.total_ratings || 0)).slice(0, 5);',
    'const isExpandedMP = window.RasigaData.chartsExpanded && window.RasigaData.chartsExpanded.mostPopular;\n    const mostPopular = [...songs].sort((a, b) => Number(b.total_ratings || 0) - Number(a.total_ratings || 0)).slice(0, isExpandedMP ? 100 : 5);'
)

# Now inject the buttons at the end of the grid
# Highest Rated Grid
content = re.sub(
    r'(\s*)</div>\s*</div>\s*<div class="glass page-enter"',
    r'\1</div>\1<div style="text-align:center; margin-top:1rem;"><button class="btn btn-outline" onclick="if(!window.RasigaData.chartsExpanded) window.RasigaData.chartsExpanded = {}; window.RasigaData.chartsExpanded.topRated = !(window.RasigaData.chartsExpanded.topRated); RasigaApp.handleRoute()">${isExpandedTR ? "Show Less" : "Show Top 100"}</button></div>\n\1</div>\n\n\1<div class="glass page-enter"',
    content
)

# Most Popular Grid (this one is followed by Top Singers usually)
content = re.sub(
    r'(Most Popular Songs.*?</div>\s*</div>)(\s*)<div class="glass page-enter" style="flex:1; min-width:300px; padding:1.5rem; border-radius:var\(--radius-lg\); animation-delay:0.4s;">',
    r'\1\2<div style="text-align:center; margin-top:1rem;"><button class="btn btn-outline" onclick="if(!window.RasigaData.chartsExpanded) window.RasigaData.chartsExpanded = {}; window.RasigaData.chartsExpanded.mostPopular = !(window.RasigaData.chartsExpanded.mostPopular); RasigaApp.handleRoute()">${isExpandedMP ? "Show Less" : "Show Top 100"}</button></div>\n\2</div>\n\n\2<div class="glass page-enter" style="flex:1; min-width:300px; padding:1.5rem; border-radius:var(--radius-lg); animation-delay:0.4s;">',
    content, flags=re.DOTALL
)

with open('js/pages.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated Show More logic')
