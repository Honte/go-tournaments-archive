<?php
const EXPECTED_TOKEN = '__DEPLOY_TOKEN__';

header('Content-Type: text/plain; charset=utf-8', true, 500);
error_reporting(E_ALL);
ini_set('display_errors', '1');
ini_set('max_execution_time', '120');
ob_start();

set_error_handler('deployErrorHandler');

try {
    deploy();
} catch (Exception $error) {
    respond(500, 'Deployment failed: ' . $error->getMessage());
}

function deploy()
{
    if (EXPECTED_TOKEN === '' || EXPECTED_TOKEN === '__DEPLOY_TOKEN__') {
        respond(500, 'Deployment token is not configured.');
    }

    $token = isset($_GET['token']) && is_string($_GET['token']) ? $_GET['token'] : '';
    if (function_exists('get_magic_quotes_gpc') && get_magic_quotes_gpc()) {
        $token = stripslashes($token);
    }
    if ($token === '' || EXPECTED_TOKEN !== $token) {
        respond(403, 'Unauthorized.');
    }

    $archive = __DIR__ . DIRECTORY_SEPARATOR . 'site.zip';
    if (!is_file($archive)) {
        respond(400, 'Archive not found: site.zip');
    }

    $zip = new ZipArchive();
    $result = $zip->open($archive);
    if ($result !== true) {
        respond(400, 'Could not open site.zip (ZipArchive error ' . $result . ').');
    }

    validateZipEntries($zip);
    clearDirectory(__DIR__, array(__FILE__, $archive));

    if (!$zip->extractTo(__DIR__)) {
        respond(500, 'Archive extraction failed.');
    }
    if (!$zip->close()) {
        respond(500, 'Could not close archive.');
    }
    if (!unlink($archive) || !unlink(__FILE__)) {
        respond(500, 'Could not remove deployment files.');
    }

    respond(200, 'Deployment complete.');
}

function validateZipEntries($zip)
{
    for ($index = 0; $index < $zip->numFiles; $index++) {
        $entry = $zip->getNameIndex($index);
        if ($entry === false) {
            respond(400, 'Archive contains an unreadable entry.');
        }

        $normalized = str_replace('\\', '/', $entry);
        if ($normalized === '' || $normalized[0] === '/' || preg_match('/^[A-Za-z]:/', $normalized)) {
            respond(400, 'Archive contains an unsafe entry: ' . $entry);
        }

        $parts = explode('/', $normalized);
        foreach ($parts as $partIndex => $part) {
            if ($part === '..' || $part === '.' || ($part === '' && $partIndex !== count($parts) - 1)) {
                respond(400, 'Archive contains an unsafe entry: ' . $entry);
            }
        }
    }
}

function clearDirectory($directory, $preservedPaths = array())
{
    foreach (new DirectoryIterator($directory) as $item) {
        $path = $item->getPathname();
        if ($item->isDot() || in_array($path, $preservedPaths, true)) {
            continue;
        }

        if (is_link($path) || is_file($path)) {
            $removed = unlink($path);
        } elseif (is_dir($path)) {
            clearDirectory($path);
            $removed = rmdir($path);
        } else {
            respond(500, 'Could not identify path type: ' . basename($path));
        }

        if (!$removed) {
            respond(500, 'Could not remove: ' . basename($path));
        }
    }
}

function deployErrorHandler($severity, $message, $file, $line)
{
    if (!(error_reporting() & $severity)) {
        return false;
    }
    throw new ErrorException($message, 0, $severity, $file, $line);
}

function respond($status, $message)
{
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    header('Content-Type: text/plain; charset=utf-8', true, $status);
    echo ($status === 200 ? 'SUCCESS: ' : 'ERROR ' . $status . ': ') . $message . "\n";
    exit;
}
