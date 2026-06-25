with open('js/pages.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if 'Daily Tasks' in line:
        start_idx = i - 2
    if 'Manage My Lists' in line:
        end_idx = i - 2
        break

if start_idx != -1 and end_idx != -1:
    new_block = """
        <div class="glass page-enter" style="padding: 1.5rem; border-radius: var(--radius-lg); margin-top: 2rem; animation-delay: 0.15s;">
          <h3 style="margin-bottom: 1rem; display:flex; align-items:center; gap:0.5rem; color:var(--accent-saffron);">
            ${Icons.get('target', {width:20, height:20})} Daily Tasks
          </h3>
          <div style="display:flex; flex-direction:column; gap:0.8rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:1rem; border-radius:var(--radius-md);">
              <div style="display:flex; align-items:center; gap:0.8rem;">
                <div style="color:${hasShared ? 'var(--accent-saffron)' : 'var(--glass-border)'};">
                  ${Icons.get('checkCircle', {width:24, height:24})}
                </div>
                <div>
                  <div style="font-weight:600; text-decoration:${hasShared ? 'line-through' : 'none'}; opacity:${hasShared ? '0.5' : '1'};">Share a Song</div>
                  <div style="font-size:0.8rem; color:var(--accent-gold);">+20 XP</div>
                </div>
              </div>
              ${hasShared ? '<span style="color:var(--accent-saffron); font-size:0.85rem; font-weight:600;">Completed!</span>' : '<button class="btn btn-outline" style="padding:0.4rem 0.8rem; font-size:0.8rem;" onclick="location.hash=&#39;#/discover&#39;">Go</button>'}
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:1rem; border-radius:var(--radius-md);">
              <div style="display:flex; align-items:center; gap:0.8rem;">
                <div style="color:${hasRated ? 'var(--accent-saffron)' : 'var(--glass-border)'};">
                  ${Icons.get('checkCircle', {width:24, height:24})}
                </div>
                <div>
                  <div style="font-weight:600; text-decoration:${hasRated ? 'line-through' : 'none'}; opacity:${hasRated ? '0.5' : '1'};">Rate or Review 1 Song</div>
                  <div style="font-size:0.8rem; color:var(--accent-gold);">+20 XP</div>
                </div>
              </div>
              ${hasRated ? '<span style="color:var(--accent-saffron); font-size:0.85rem; font-weight:600;">Completed!</span>' : '<button class="btn btn-outline" style="padding:0.4rem 0.8rem; font-size:0.8rem;" onclick="location.hash=&#39;#/discover&#39;">Go</button>'}
            </div>
          </div>
        </div>
"""
    lines = lines[:start_idx] + [new_block + '\n'] + lines[end_idx:]
    with open('js/pages.js', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print('Fixed daily tasks by exact lines')
else:
    print('Failed to find exact bounds')
