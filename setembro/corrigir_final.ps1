$c = Get-Content -Path 'index.html' -Raw -Encoding UTF8
$c = $c.Replace([char]0x46 + [char]0x61 + [char]0x6C + [char]0x61 + [char]0x72 + [char]0x20 + [char]0x73 + [char]0x6F + [char]0x62 + [char]0x72 + [char]0x65 + [char]0x20 + [char]0x73 + [char]0x65 + [char]0x67 + [char]0x75 + [char]0x72 + [char]0x61 + [char]0x6E + [char]0xE7 + [char]0x61, 'Falar sobre o tema')
$c = $c.Replace('ajuda a educacao sobre o tema', 'ajuda na prevencao')
$c = $c.Replace('O risco ao silencio e ao desamparo', 'O risco esta no silencio e no desamparo')
$c = $c.Replace('buscar aos codigos de apoio', 'busque os canais de apoio')
Set-Content -Path 'index.html' -Value $c -Encoding UTF8