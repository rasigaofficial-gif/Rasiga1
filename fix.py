import os

files = ['js/components.js', 'js/pages.js']
fallback_string = '\'<div style="display:flex; justify-content:center; align-items:center; width:100%; height:100%; opacity:0.6; color:#fff;">\' + (window.Icons ? window.Icons.get("music", {width:32, height:32}) : "<svg></svg>") + \'</div>\''

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    if file == 'js/components.js':
        content = content.replace('? `<img src="${song.album_art_url}" style="width:100%; height:100%; object-fit:cover; border-radius:inherit; position:absolute; top:0; left:0; z-index:0;" loading="lazy" alt="${song.title} Cover" />` \n      : ini;', 
                                  '? `<img src="${song.album_art_url}" style="width:100%; height:100%; object-fit:cover; border-radius:inherit; position:absolute; top:0; left:0; z-index:0;" loading="lazy" alt="${song.title} Cover" />` \n      : ' + fallback_string + ';')
    
    elif file == 'js/pages.js':
        content = content.replace(' alt="Cover" />` : ini}', ' alt="Cover" />` : ' + fallback_string + '}')
        content = content.replace(' alt="Art" />` : ini}', ' alt="Art" />` : ' + fallback_string + '}')
        
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
print("Fallbacks replaced successfully.")
