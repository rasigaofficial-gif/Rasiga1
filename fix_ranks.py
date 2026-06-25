import re

with open('js/pages.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'let rankClass = \'\';\s*if \(i === 0\) \{ rankClass = \'text-gradient-gold\'; \}\s*if \(i === 1\) \{ rankClass = \'text-gradient-silver\'; \}\s*if \(i === 2\) \{ rankClass = \'text-gradient-bronze\'; \}',
    '',
    content
)

content = content.replace(
    '<div class="${rankClass}" style="font-weight:bold; font-size:1.2rem; ${isTop3 ? \'\' : \'color:var(--text-light);\'} width:20px; text-align:center;">${i + 1}</div>',
    '<div style="font-weight:bold; font-size:1.2rem; color:var(--accent-saffron); width:20px; text-align:center;">${i + 1}</div>'
)

with open('js/pages.js', 'w', encoding='utf-8') as f:
    f.write(content)

with open('js/app.js', 'r', encoding='utf-8') as f:
    content2 = f.read()

content2 = re.sub(
    r'let rankColor = \'var\(--text-light\)\';\s*let rankClass = \'\';\s*if \(i === 0\) \{ rankColor = \'var\(--accent-gold\)\'; rankClass = \'text-gradient-gold\'; \}\s*if \(i === 1\) \{ rankColor = \'#e2e8f0\'; rankClass = \'text-gradient-silver\'; \}\s*if \(i === 2\) \{ rankColor = \'#fcd34d\'; rankClass = \'text-gradient-bronze\'; \}',
    'let rankColor = \'var(--accent-saffron)\';',
    content2
)

content2 = content2.replace(
    '<div class="${rankClass}" style="font-weight:bold; font-size:1.5rem; ${isTop3 ? \'\' : \'color:var(--text-light);\'} width:30px; text-align:center;">${i + 1}</div>',
    '<div style="font-weight:bold; font-size:1.5rem; color:var(--accent-saffron); width:30px; text-align:center;">${i + 1}</div>'
)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(content2)

print('Updated ranking colors successfully')
