with open('js/pages.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'onclick="location.hash=\\\'#/discover\\\'"',
    'onclick="location.hash=&#39;#/discover&#39;"'
)

with open('js/pages.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Replaced quotes in pages.js')
