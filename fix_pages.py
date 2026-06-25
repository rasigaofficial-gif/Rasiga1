import re

with open('js/pages.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace hardcoded teal colors in headers and contact link
content = content.replace(
    '<h3 class="section-title page-enter" style="color: var(--accent-teal);',
    '<h3 class="section-title page-enter" style="color: var(--accent-saffron);'
)
content = content.replace(
    '<h3 style="margin-bottom: 1.5rem; font-family:\'Cinzel Decorative\', serif; color:var(--accent-teal);">Song Suggestions</h3>',
    '<h3 style="margin-bottom: 1.5rem; font-family:\'Cinzel Decorative\', serif; color:var(--accent-saffron);">Song Suggestions</h3>'
)
content = content.replace(
    '<h3 style="margin-bottom:1.5rem; font-family:\'Cinzel Decorative\', serif; color:var(--accent-teal);">Most Popular Songs</h3>',
    '<h3 style="margin-bottom:1.5rem; font-family:\'Cinzel Decorative\', serif; color:var(--accent-saffron);">Most Popular Songs</h3>'
)
content = content.replace(
    '<h3 style="margin-bottom:1.5rem; font-family:\'Cinzel Decorative\', serif; color:var(--accent-teal);">Most Popular Singers</h3>',
    '<h3 style="margin-bottom:1.5rem; font-family:\'Cinzel Decorative\', serif; color:var(--accent-saffron);">Most Popular Singers</h3>'
)
content = content.replace(
    '<h3 style="margin-bottom:1.5rem; font-family:\'Cinzel Decorative\', serif; color:var(--accent-teal);">Most Popular Music Directors</h3>',
    '<h3 style="margin-bottom:1.5rem; font-family:\'Cinzel Decorative\', serif; color:var(--accent-saffron);">Most Popular Music Directors</h3>'
)
content = content.replace(
    'href="#/contact" style="color: var(--accent-teal);',
    'href="#/contact" style="color: var(--accent-saffron);'
)

with open('js/pages.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated pages.js successfully.")
