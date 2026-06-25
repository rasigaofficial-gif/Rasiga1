import re

with open('style.css', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update :root
content = content.replace(
    '--bg-gradient: radial-gradient(circle at 15% 50%, rgba(236, 72, 153, 0.25), transparent 40%),\n    radial-gradient(circle at 85% 30%, rgba(249, 115, 22, 0.25), transparent 40%),\n    radial-gradient(circle at 50% 80%, rgba(13, 148, 136, 0.2), transparent 40%);',
    '--theme-bg-color: 249, 115, 22;\n  --bg-gradient: radial-gradient(circle at 15% 50%, rgba(var(--theme-bg-color), 0.25), transparent 40%),\n    radial-gradient(circle at 85% 30%, rgba(13, 148, 136, 0.15), transparent 40%),\n    radial-gradient(circle at 50% 80%, rgba(236, 72, 153, 0.2), transparent 40%);'
)

# 2. Update [data-theme='dark']
content = content.replace(
    '--bg-gradient: radial-gradient(circle at 15% 50%, rgba(236, 72, 153, 0.2), transparent 40%),\n    radial-gradient(circle at 85% 30%, rgba(249, 115, 22, 0.2), transparent 40%),\n    radial-gradient(circle at 50% 80%, rgba(20, 184, 166, 0.15), transparent 40%);',
    '--bg-gradient: radial-gradient(circle at 15% 50%, rgba(var(--theme-bg-color), 0.2), transparent 40%),\n    radial-gradient(circle at 85% 30%, rgba(20, 184, 166, 0.1), transparent 40%),\n    radial-gradient(circle at 50% 80%, rgba(236, 72, 153, 0.15), transparent 40%);'
)

# 3. Update Theme Colors
content = content.replace(
    "[data-theme-color='red'] {\n  --accent-saffron: #ef4444;\n  --accent-rose: #b91c1c;\n}",
    "[data-theme-color='red'] {\n  --accent-saffron: #ef4444;\n  --accent-rose: #b91c1c;\n  --theme-bg-color: 239, 68, 68;\n}"
)
content = content.replace(
    "[data-theme-color='green'] {\n  --accent-saffron: #10b981;\n  --accent-rose: #047857;\n}",
    "[data-theme-color='green'] {\n  --accent-saffron: #10b981;\n  --accent-rose: #047857;\n  --theme-bg-color: 16, 185, 129;\n}"
)
content = content.replace(
    "[data-theme-color='blue'] {\n  --accent-saffron: #3b82f6;\n  --accent-rose: #1d4ed8;\n}",
    "[data-theme-color='blue'] {\n  --accent-saffron: #3b82f6;\n  --accent-rose: #1d4ed8;\n  --theme-bg-color: 59, 130, 246;\n}"
)
content = content.replace(
    "[data-theme-color='yellow'] {\n  --accent-saffron: #eab308;\n  --accent-rose: #a16207;\n}",
    "[data-theme-color='yellow'] {\n  --accent-saffron: #eab308;\n  --accent-rose: #a16207;\n  --theme-bg-color: 234, 179, 8;\n}"
)

with open('style.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated style.css successfully.")
