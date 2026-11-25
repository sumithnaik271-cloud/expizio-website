# Local preview server for the EXPIXIO site (development only, not part of the website).
param([int]$Port = 5500)
$Root = Split-Path -Parent $PSScriptRoot
$types = @{ ".html"="text/html; charset=utf-8"; ".css"="text/css; charset=utf-8"; ".js"="application/javascript; charset=utf-8";
  ".svg"="image/svg+xml"; ".png"="image/png"; ".jpg"="image/jpeg"; ".jpeg"="image/jpeg"; ".webp"="image/webp";
  ".mp4"="video/mp4"; ".xml"="application/xml"; ".txt"="text/plain; charset=utf-8"; ".ico"="image/x-icon" }
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$Port/")
$l.Start()
Write-Host "Serving $Root at http://localhost:$Port/"
while ($l.IsListening) {
  try {
    $c = $l.GetContext()
    $p = [Uri]::UnescapeDataString($c.Request.Url.AbsolutePath.TrimStart('/'))
    if ($p -eq "" -or $p.EndsWith("/")) { $p += "index.html" }
    $full = [IO.Path]::GetFullPath((Join-Path $Root $p))
    if ($full.StartsWith($Root) -and -not $full.Contains("\.claude\") -and (Test-Path $full -PathType Leaf)) {
      $b = [IO.File]::ReadAllBytes($full)
      $t = $types[[IO.Path]::GetExtension($full).ToLower()]
      if ($t) { $c.Response.ContentType = $t }
      $c.Response.Headers.Add("Cache-Control", "no-store")
      $c.Response.OutputStream.Write($b, 0, $b.Length)
    } else { $c.Response.StatusCode = 404 }
    $c.Response.Close()
  } catch { }
}
