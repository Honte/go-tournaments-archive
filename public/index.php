<?php

function select_best_language($languages) {
    if (!$_SERVER['HTTP_ACCEPT_LANGUAGE']) return $languages[0];
    $default_q=100;
    foreach (explode(",",$_SERVER['HTTP_ACCEPT_LANGUAGE']) as $lqpair) {
        $lq=explode(";q=",$lqpair);
        if (isset($lq[1])) $lq[1]=floatval($lq[1]); else $lq[1]=$default_q--;
        $larr[$lq[0]]=$lq[1];
    }
    usort($languages,function($a,$b) use ($larr) { return $larr[$b]<=>$larr[$a]; });
    return $languages[0];
}

$locale = select_best_language(['pl', 'en']);
$server = $_SERVER['SERVER_NAME'];
$port = isset($_SERVER['HTTP_X_FORWARDED_PORT']) && !empty($_SERVER['HTTP_X_FORWARDED_PORT']) ? ':'. $_SERVER['HTTP_X_FORWARDED_PORT'] : '';
$protocol = $_SERVER['PROTOCOL'] = isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && !empty($_SERVER['HTTP_X_FORWARDED_PROTO']) ? "https://" : "http://";
$url = $protocol . $server . $port . "/" . $locale;

header("Location: " . $url);
exit();
