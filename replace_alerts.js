const fs = require('fs');
let code = fs.readFileSync('c:\\Project Apps\\Rasiga\\Rasiga\\js\\app.js', 'utf8');

const showToast = `window.showToast = function(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  
  const icon = type === 'success' ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>' : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
  
  toast.innerHTML = icon + '<span>' + message + '</span>';
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('toast-fadeout');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3000);
};

window.RasigaApp = {`;

code = code.replace(/window\.RasigaApp\s*=\s*\{/, showToast);

code = code.replace(/alert\((['"])(.*?)\1\)/g, (match, quote, msg) => {
    let type = 'success';
    if (msg.toLowerCase().includes('fail') || msg.toLowerCase().includes('error') || msg.toLowerCase().includes('please') || msg.toLowerCase().includes('cannot') || msg.toLowerCase().includes('empty') || msg.toLowerCase().includes('taken') || msg.toLowerCase().includes('mandatory') || msg.toLowerCase().includes('must be')) {
        type = 'error';
    }
    return `window.showToast(${quote}${msg}${quote}, '${type}')`;
});

code = code.replace(/alert\((.+?)\)/g, (match, p1) => {
    if (p1.startsWith('window.showToast')) return match;
    let type = 'success';
    if (p1.toLowerCase().includes('fail') || p1.toLowerCase().includes('error') || p1.toLowerCase().includes('please')) {
        type = 'error';
    }
    return `window.showToast(${p1}, '${type}')`;
});

fs.writeFileSync('c:\\Project Apps\\Rasiga\\Rasiga\\js\\app.js', code);
console.log('Toasts implemented!');
