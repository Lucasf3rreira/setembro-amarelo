$c = Get-Content -Path 'index.html' -Raw -Encoding UTF8
$c = $c.Replace('Falar sobre seguran', 'Falar sobre o tem')
$c = $c.Replace('ajuda a educacao sobre o tema', 'ajuda na prevencao')
$c = $c.Replace('O risco ao silencio e ao desamparo', 'O risco esta no silencio e no desamparo')
$c = $c.Replace('buscar aos codigos de apoio', 'busque os canais de apoio')
Set-Content -Path 'index.html' -Value $c -Encoding UTF8