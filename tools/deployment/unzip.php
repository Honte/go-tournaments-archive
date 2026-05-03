<?php
const EXPECTED_TOKEN = '__DEPLOY_TOKEN__';
const DEFAULT_ARCHIVE = 'site.zip';

header('Content-Type: text/plain; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', '1');
ini_set('max_execution_time', '120');
ob_start();

set_error_handler('deployErrorHandler');
register_shutdown_function('deployShutdownHandler');

try {
    deploy();
} catch (Exception $error) {
    fail(500, 'Deployment failed: ' . $error->getMessage());
}

function deploy()
{
    if (EXPECTED_TOKEN === '' || EXPECTED_TOKEN === '__DEPLOY_TOKEN__') {
        fail(500, 'Deployment token is not configured.');
    }

    $token = getQueryString('token', '');
    if ($token === '' || EXPECTED_TOKEN !== $token) {
        fail(403, 'Unauthorized.');
    }

    $archiveName = DEFAULT_ARCHIVE;
    $root = realpath(__DIR__);
    $scriptPath = realpath(__FILE__);
    $archivePath = $root . DIRECTORY_SEPARATOR . $archiveName;

    if (!is_file($archivePath)) {
        fail(400, 'Archive not found: ' . $archiveName);
    }

    $archiveRealPath = realpath($archivePath);
    $zip = new ZipArchive();
    $openResult = $zip->open($archiveRealPath);

    if ($openResult !== true) {
        fail(400, 'Could not open archive: ' . $archiveName . ' (' . zipOpenErrorMessage($openResult) . ').');
    }

    validateZipEntries($zip);

    clearDirectory($root, array($scriptPath, $archiveRealPath));

    if (!$zip->extractTo($root)) {
        $zip->close();
        fail(500, 'Archive extraction failed.');
    }
    $zip->close();

    if (is_file($archiveRealPath) && !unlink($archiveRealPath)) {
        fail(500, 'Could not remove archive after extraction.');
    }

    setHttpStatus(200);
    succeedAndRemoveScript('Deployment complete.', $scriptPath);
}

function getQueryString($name, $default)
{
    if (!isset($_GET[$name])) {
        return $default;
    }

    $value = (string) $_GET[$name];
    if (function_exists('get_magic_quotes_gpc') && get_magic_quotes_gpc()) {
        $value = stripslashes($value);
    }

    return $value;
}

function validateZipEntries($zip)
{
    for ($index = 0; $index < $zip->numFiles; $index++) {
        $entryName = $zip->getNameIndex($index);
        if ($entryName === false) {
            fail(400, 'Archive contains an unreadable entry.');
        }

        $normalized = str_replace('\\', '/', $entryName);
        if (
            $normalized === '' ||
            strpos($normalized, '/') === 0 ||
            preg_match('/^[A-Za-z]:\//', $normalized) === 1
        ) {
            fail(400, 'Archive contains an unsafe entry: ' . $entryName);
        }

        $parts = explode('/', $normalized);
        $lastIndex = count($parts) - 1;
        foreach ($parts as $partIndex => $part) {
            if ($part === '..' || $part === '.') {
                fail(400, 'Archive contains an unsafe entry: ' . $entryName);
            }

            if ($part === '' && $partIndex !== $lastIndex) {
                fail(400, 'Archive contains an unsafe entry: ' . $entryName);
            }
        }
    }
}

function zipOpenErrorMessage($code)
{
    $messages = array(
        ZipArchive::ER_EXISTS => 'file already exists',
        ZipArchive::ER_INCONS => 'zip archive inconsistent',
        ZipArchive::ER_INVAL => 'invalid argument',
        ZipArchive::ER_MEMORY => 'memory allocation failure',
        ZipArchive::ER_NOENT => 'file does not exist',
        ZipArchive::ER_NOZIP => 'not a zip archive',
        ZipArchive::ER_OPEN => 'cannot open file',
        ZipArchive::ER_READ => 'read error',
        ZipArchive::ER_SEEK => 'seek error',
    );

    return isset($messages[$code]) ? $messages[$code] : 'ZipArchive error code ' . $code;
}

function clearDirectory($root, $preservedPaths)
{
    foreach (new DirectoryIterator($root) as $item) {
        if ($item->isDot()) {
            continue;
        }

        $path = $item->getPathname();
        if (isPreservedPath($path, $preservedPaths)) {
            continue;
        }

        deletePath($path);
    }
}

function deletePath($path)
{
    if (is_link($path) || is_file($path)) {
        if (!unlink($path)) {
            fail(500, 'Could not remove file: ' . basename($path));
        }

        return;
    }

    if (is_dir($path)) {
        foreach (new DirectoryIterator($path) as $item) {
            if (!$item->isDot()) {
                deletePath($item->getPathname());
            }
        }

        if (!rmdir($path)) {
            fail(500, 'Could not remove directory: ' . basename($path));
        }

        return;
    }

    fail(500, 'Could not identify path type: ' . basename($path));
}

function isPreservedPath($path, $preservedPaths)
{
    $realPath = realpath($path);
    if ($realPath === false) {
        return false;
    }

    foreach ($preservedPaths as $preservedPath) {
        if ($realPath === $preservedPath) {
            return true;
        }
    }

    return false;
}

function deployErrorHandler($severity, $message, $file, $line)
{
    if (!(error_reporting() & $severity)) {
        return false;
    }

    throw new ErrorException($message, 0, $severity, $file, $line);
}

function deployShutdownHandler()
{
    $error = error_get_last();
    if ($error === null) {
        return;
    }

    $fatalTypes = array(E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR);
    if (!in_array($error['type'], $fatalTypes, true)) {
        return;
    }

    setHttpStatus(500);
    echo 'ERROR 500: Fatal PHP error: ' . $error['message'] . ' in ' . $error['file'] . ':' . $error['line'] . "\n";
}

function succeed($message)
{
    clearOutputBuffer();
    echo 'SUCCESS: ' . $message . "\n";
}

function succeedAndRemoveScript($message, $scriptPath)
{
    clearOutputBuffer();
    echo 'SUCCESS: ' . $message . "\n";

    if (!unlink($scriptPath)) {
        echo 'WARNING: Could not remove unzip script.' . "\n";
    }
}

function fail($status, $message)
{
    setHttpStatus($status);
    clearOutputBuffer();
    echo 'ERROR ' . $status . ': ' . $message . "\n";
    exit;
}

function clearOutputBuffer()
{
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
}

function setHttpStatus($status)
{
    if (function_exists('http_response_code')) {
        http_response_code($status);
        return;
    }

    $messages = array(
        200 => 'OK',
        400 => 'Bad Request',
        403 => 'Forbidden',
        500 => 'Internal Server Error',
    );
    $message = isset($messages[$status]) ? $messages[$status] : 'Status';

    header('HTTP/1.1 ' . $status . ' ' . $message);
}
