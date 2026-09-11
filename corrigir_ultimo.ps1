$c = Get-Content -Path 'index.html' -Raw -Encoding UTF8
$c = $c.Replace('buscar aos codigos de apoio', 'busque os canais de apoio')
Set-Content -Path 'index.html' -Value $c -Encoding UTF8