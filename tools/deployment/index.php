<?php

$availableLocales = array('pl', 'en');
$basePath = '';

function select_best_language($languages) {
    $best = $languages[0];
    $best_q = 0;
    foreach (explode(',', (isset($_SERVER['HTTP_ACCEPT_LANGUAGE']) ? $_SERVER['HTTP_ACCEPT_LANGUAGE'] : '')) as $preference) {
        if (!preg_match('/^\s*([a-z]+(?:-[a-z0-9]+)*|\*)\s*(?:;\s*q\s*=\s*(0(?:\.\d{0,3})?|1(?:\.0{0,3})?))?\s*$/i', $preference, $match)) continue;
        $range = strtolower($match[1]);
        $q = isset($match[2]) ? (float) $match[2] : 1;
        if ($q <= $best_q) continue;
        foreach ($languages as $language) {
            $locale = strtolower($language);
            if ($range === '*' || $range === $locale || strpos($range, $locale . '-') === 0) {
                $best = $language;
                $best_q = $q;
                break;
            }
        }
    }
    return $best;
}

$locale = select_best_language($availableLocales);
$server = $_SERVER['SERVER_NAME'];
$port = isset($_SERVER['HTTP_X_FORWARDED_PORT']) && !empty($_SERVER['HTTP_X_FORWARDED_PORT']) ? ':'. $_SERVER['HTTP_X_FORWARDED_PORT'] : '';
$forwarded_protocol = strtolower(trim(isset($_SERVER['HTTP_X_FORWARDED_PROTO']) ? $_SERVER['HTTP_X_FORWARDED_PROTO'] : ''));
$https = strtolower((string) (isset($_SERVER['HTTPS']) ? $_SERVER['HTTPS'] : ''));
$protocol = in_array($forwarded_protocol, array('http', 'https'), true)
    ? $forwarded_protocol . '://'
    : (in_array($https, array('on', '1'), true) ? 'https://' : 'http://');
$url = $protocol . $server . $port . $basePath . "/" . $locale;

header("Location: " . $url);
exit();
