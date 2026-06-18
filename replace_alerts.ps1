$file = "c:\Project Apps\Rasiga\Rasiga\js\app.js"
$content = Get-Content -Raw $file

$showToast = "window.showToast = function(message, type = 'success') {`n" +
"  let container = document.getElementById('toast-container');`n" +
"  if (!container) {`n" +
"    container = document.createElement('div');`n" +
"    container.id = 'toast-container';`n" +
"    document.body.appendChild(container);`n" +
"  }`n" +
"  const toast = document.createElement('div');`n" +
"  toast.className = 'toast toast-' + type;`n" +
"  const icon = type === 'success' ? '<svg width=`"20`" height=`"20`" viewBox=`"0 0 24 24`" fill=`"none`" stroke=`"currentColor`" stroke-width=`"2`" stroke-linecap=`"round`" stroke-linejoin=`"round`"><path d=`"M22 11.08V12a10 10 0 1 1-5.93-9.14`"></path><polyline points=`"22 4 12 14.01 9 11.01`"></polyline></svg>' : '<svg width=`"20`" height=`"20`" viewBox=`"0 0 24 24`" fill=`"none`" stroke=`"currentColor`" stroke-width=`"2`" stroke-linecap=`"round`" stroke-linejoin=`"round`"><circle cx=`"12`" cy=`"12`" r=`"10`"></circle><line x1=`"12`" y1=`"8`" x2=`"12`" y2=`"12`"></line><line x1=`"12`" y1=`"16`" x2=`"12.01`" y2=`"16`"></line></svg>';`n" +
"  toast.innerHTML = icon + '<span>' + message + '</span>';`n" +
"  container.appendChild(toast);`n" +
"  setTimeout(() => {`n" +
"    toast.classList.add('toast-fadeout');`n" +
"    toast.addEventListener('animationend', () => toast.remove());`n" +
"  }, 3000);`n" +
"};`n`nwindow.RasigaApp = {"

$content = $content -replace "window\.RasigaApp\s*=\s*\{", $showToast

# Replace alert("string")
$content = [System.Text.RegularExpressions.Regex]::Replace($content, "alert\((['`"'])(.*?)\1\)", {
    param($match)
    $msg = $match.Groups[2].Value.ToLower()
    $type = 'success'
    if ($msg -match 'fail|error|please|cannot|empty|taken|mandatory|must be') {
        $type = 'error'
    }
    return "window.showToast(" + $match.Groups[1].Value + $match.Groups[2].Value + $match.Groups[1].Value + ", '" + $type + "')"
})

# Replace alert(var + "string")
$content = [System.Text.RegularExpressions.Regex]::Replace($content, "alert\((.+?)\)", {
    param($match)
    $p1 = $match.Groups[1].Value
    if ($p1.StartsWith("window.showToast")) { return $match.Value }
    $type = 'success'
    if ($p1.ToLower() -match 'fail|error|please') {
        $type = 'error'
    }
    return "window.showToast(" + $p1 + ", '" + $type + "')"
})

Set-Content -Path $file -Value $content -NoNewline
Write-Host "Alerts Replaced Successfully!"
