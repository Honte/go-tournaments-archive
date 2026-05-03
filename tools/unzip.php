<?php
declare(strict_types=1);

const EXPECTED_TOKEN = '__DEPLOY_TOKEN__';
const DEFAULT_ARCHIVE = 'site.zip';

header('Content-Type: text/plain; charset=utf-8');

try {
    deploy();
} catch (Throwable $error) {
    fail(500, 'Deployment failed: ' . $error->getMessage());
}

function deploy(): void
{
    if (EXPECTED_TOKEN === '' || EXPECTED_TOKEN === '__DEPLOY_TOKEN__') {
        fail(500, 'Deployment token is not configured.');
    }

    $token = isset($_GET['token']) ? (string) $_GET['token'] : '';
    if ($token === '' || !hash_equals(EXPECTED_TOKEN, $token)) {
        fail(403, 'Unauthorized.');
    }

    $archiveName = isset($_GET['archive']) ? (string) $_GET['archive'] : DEFAULT_ARCHIVE;
    validateArchiveName($archiveName);

    $root = realpath(__DIR__);
    if ($root === false) {
        fail(500, 'Could not resolve deployment directory.');
    }

    $scriptPath = realpath(__FILE__);
    if ($scriptPath === false) {
        fail(500, 'Could not resolve deploy script path.');
    }

    $archivePath = $root . DIRECTORY_SEPARATOR . $archiveName;
    if (!is_file($archivePath)) {
        fail(400, 'Archive not found: ' . $archiveName);
    }

    if (is_link($archivePath)) {
        fail(400, 'Archive must not be a symbolic link.');
    }

    $archiveRealPath = realpath($archivePath);
    if ($archiveRealPath === false) {
        fail(500, 'Could not resolve archive path.');
    }

    if (!class_exists('ZipArchive')) {
        fail(500, 'PHP ZipArchive extension is not available.');
    }

    $zip = new ZipArchive();
    $openResult = $zip->open($archiveRealPath);
    if ($openResult !== true) {
        fail(400, 'Could not open archive: ' . $archiveName);
    }

    try {
        validateZipEntries($zip);
        clearDirectory($root, [$scriptPath, $archiveRealPath]);

        if (!$zip->extractTo($root)) {
            fail(500, 'Archive extraction failed.');
        }
    } finally {
        $zip->close();
    }

    if (is_file($archiveRealPath) && !unlink($archiveRealPath)) {
        fail(500, 'Could not remove archive after extraction.');
    }

    http_response_code(200);
    echo "Deployment complete.\n";
}

function validateArchiveName(string $archiveName): void
{
    if (
        $archiveName === '' ||
        $archiveName === '.' ||
        $archiveName === '..' ||
        strpos($archiveName, "\0") !== false ||
        strpos($archiveName, '/') !== false ||
        strpos($archiveName, '\\') !== false ||
        $archiveName !== basename($archiveName)
    ) {
        fail(400, 'Archive must be a plain filename.');
    }
}

function validateZipEntries(ZipArchive $zip): void
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

function clearDirectory(string $root, array $preservedPaths): void
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

function deletePath(string $path): void
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

function isPreservedPath(string $path, array $preservedPaths): bool
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

function fail(int $status, string $message): void
{
    http_response_code($status);
    echo $message . "\n";
    exit;
}
