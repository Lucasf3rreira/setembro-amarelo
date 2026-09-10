$c = Get-Content -Path 'index.html' -Raw -Encoding UTF8
$old = 'buscar aos c' + [char]0x00F3 + 'digos de apoio'
$new = 'busque os canais de apoio'
$c = $c.Replace($old, $new)
Set-Content -Path 'index.html' -Value $c -Encoding UTF8