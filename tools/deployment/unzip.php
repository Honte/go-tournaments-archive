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

    // Append &mode=TEST to validate without creating, extracting, moving or deleting files.
    $mode = isset($_GET['mode']) ? $_GET['mode'] : 'DEPLOY';
    if ($mode !== 'DEPLOY' && $mode !== 'TEST') {
        respond(400, 'Invalid mode; use TEST or DEPLOY.');
    }

    $archive = __DIR__ . DIRECTORY_SEPARATOR . 'site.zip';
    if (!is_file($archive)) {
        respond(400, 'Archive not found: site.zip');
    }

    if (!is_readable($archive)) {
        respond(400, 'Archive is not readable: site.zip');
    }

    $zip = new ZipArchive();
    $result = $zip->open($archive, $mode === 'TEST' ? ZipArchive::CHECKCONS : 0);
    if ($result !== true) {
        respond(400, 'Could not open site.zip (ZipArchive error ' . $result . ').');
    }

    validateZipEntries($zip);

    if ($mode === 'TEST') {
        testDeployment($zip);
    }

    $backup = __DIR__ . DIRECTORY_SEPARATOR . 'backup';
    if (file_exists($backup) || is_link($backup)) {
        respond(500, 'Backup directory already exists; recover or remove it before deploying.');
    }
    if (!mkdir($backup, 0700)) {
        respond(500, 'Could not create backup directory.');
    }

    $backedUpNames = array();
    $extractedRoots = array();
    $active = true;
    register_shutdown_function(function () use (&$active, &$backedUpNames, &$extractedRoots, $backup) {
        if ($active) {
            $active = false;
            try {
                rollbackDeployment($backup, $backedUpNames, $extractedRoots);
            } catch (Exception $error) {
                respond(500, 'Rollback failed; backup retained: ' . $error->getMessage());
            }
        }
    });

    try {
        foreach (new DirectoryIterator(__DIR__) as $item) {
            $path = $item->getPathname();
            $name = $item->getFilename();
            if ($item->isDot() || $path === __FILE__ || $path === $archive || $path === $backup) {
                continue;
            }
            $target = $backup . DIRECTORY_SEPARATOR . $name;
            if ($name === 'index.php' || $name === '.htaccess') {
                if (!is_file($path) || is_link($path) || !copy($path, $target)) {
                    throw new Exception('Could not back up preserved file: ' . $name);
                }
            } elseif (!rename($path, $target)) {
                throw new Exception('Could not back up: ' . $name);
            }
            $backedUpNames[] = $name;
        }

        $extractedRoots = archiveRoots($zip);
        if (!$zip->extractTo(__DIR__)) {
            throw new Exception('Archive extraction failed.');
        }
        if (!$zip->close()) {
            throw new Exception('Could not close archive.');
        }
        if (!unlink($archive) || !unlink(__FILE__)) {
            throw new Exception('Could not remove deployment files.');
        }
    } catch (Exception $error) {
        $active = false;
        try {
            rollbackDeployment($backup, $backedUpNames, $extractedRoots);
        } catch (Exception $rollbackError) {
            respond(500, 'Deployment failed: ' . $error->getMessage()
                . '; rollback failed, backup retained: ' . $rollbackError->getMessage());
        }
        respond(500, 'Deployment failed; previous site restored: ' . $error->getMessage());
    }

    // The deployment is committed; deleting the old snapshot cannot be rolled back.
    $active = false;
    try {
        removePath($backup);
    } catch (Exception $error) {
        respond(200, 'Deployment complete. Backup cleanup failed: ' . $error->getMessage());
    }
    respond(200, 'Deployment complete.');
}

function testDeployment($zip)
{
    if ($zip->numFiles === 0) {
        respond(400, 'Archive is empty.');
    }
    $names = array();
    for ($index = 0; $index < $zip->numFiles; $index++) {
        $stat = $zip->statIndex($index);
        if ($stat === false || isset($names[$stat['name']])) {
            respond(400, 'Archive contains an unreadable or duplicate entry.');
        }
        $names[$stat['name']] = true;
        if (substr($stat['name'], -1) === '/') {
            continue;
        }
        $stream = $zip->getStream($stat['name']);
        if ($stream === false) {
            respond(400, 'Could not read archive entry: ' . $stat['name']);
        }
        $hash = hash_init('crc32b');
        try {
            $size = hash_update_stream($hash, $stream);
        } catch (Exception $error) {
            fclose($stream);
            respond(400, 'Could not validate archive entry: ' . $stat['name']);
        }
        fclose($stream);
        if ($size !== $stat['size'] || hash_final($hash) !== sprintf('%08x', $stat['crc'])) {
            respond(400, 'Archive entry failed size or CRC validation: ' . $stat['name']);
        }
    }
    if (!$zip->close()) {
        respond(500, 'Could not close archive.');
    }

    $disabled = array_map('trim', explode(',', strtolower(ini_get('disable_functions'))));
    if (!function_exists('unlink') || in_array('unlink', $disabled, true)
        || !is_writable(__DIR__)
        || (DIRECTORY_SEPARATOR === '/' && !is_executable(__DIR__))
        || (DIRECTORY_SEPARATOR === '\\' && !is_writable(__FILE__))) {
        respond(500, 'TEST: Archive validated, but self-removal permission check failed. No files changed.');
    }
    respond(200, 'TEST complete. site.zip is readable; archive paths, sizes and CRCs validated. '
        . 'Self-removal permission checks passed (deletion not attempted or guaranteed). No files changed.');
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

        if (in_array(strtolower($parts[0]), array('backup', 'site.zip', strtolower(basename(__FILE__))), true)) {
            respond(400, 'Archive contains a reserved deployment path.');
        }

        foreach ($parts as $partIndex => $part) {
            if ($part === '..' || $part === '.' || ($part === '' && $partIndex !== count($parts) - 1)) {
                respond(400, 'Archive contains an unsafe entry: ' . $entry);
            }
        }
    }
}

function archiveRoots($zip)
{
    $roots = array();
    for ($index = 0; $index < $zip->numFiles; $index++) {
        $parts = explode('/', str_replace('\\', '/', $zip->getNameIndex($index)));
        $roots[$parts[0]] = true;
    }
    return array_keys($roots);
}

function rollbackDeployment($backup, $backedUpNames, $extractedRoots)
{
    foreach ($extractedRoots as $name) {
        removePath(__DIR__ . DIRECTORY_SEPARATOR . $name);
    }

    foreach ($backedUpNames as $name) {
        $target = __DIR__ . DIRECTORY_SEPARATOR . $name;
        removePath($target);
        if (!rename($backup . DIRECTORY_SEPARATOR . $name, $target)) {
            throw new Exception('Could not restore: ' . $name);
        }
    }

    if (!rmdir($backup)) {
        throw new Exception('Could not remove empty backup directory.');
    }
}

function removePath($path)
{
    if (is_link($path) || is_file($path)) {
        if (!unlink($path)) {
            throw new Exception('Could not remove: ' . $path);
        }
    } elseif (is_dir($path)) {
        foreach (new DirectoryIterator($path) as $item) {
            if (!$item->isDot()) {
                removePath($item->getPathname());
            }
        }
        if (!rmdir($path)) {
            throw new Exception('Could not remove directory: ' . $path);
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
