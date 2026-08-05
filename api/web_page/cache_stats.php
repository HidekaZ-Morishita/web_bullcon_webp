<?php
/**
 * キャッシュ統計情報表示ツール
 * 
 * キャッシュのヒット率、ミス率、ファイルサイズなどの統計情報を表示します
 */

header('Content-Type: application/json; charset=UTF-8');
require_once __DIR__ . '/security_check.php';
header('Access-Control-Allow-Methods: GET');

if (!isset($_SERVER['HTTP_X_REQUESTED_WITH']) || strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) !== 'xmlhttprequest') {
    header('HTTP/1.1 403 Forbidden');
    exit;
}

require_once __DIR__ . '/cache_manager.php';

// 設定を読み込む
$config = require __DIR__ . '/cache_config.php';
$cacheDir = $config['cache_dir'];

$stats = [
    'enabled' => CacheManager::isEnabled(),
    'cache_directory' => $cacheDir,
    'cache_files' => [],
    'total_size' => 0,
    'total_files' => 0,
    'hit_miss_stats' => CacheManager::getStats(),
    'summary' => []
];

// キャッシュディレクトリが存在する場合
if (is_dir($cacheDir)) {
    $files = glob($cacheDir . '*.json');
    
    foreach ($files as $file) {
        $basename = basename($file);
        
        // .cache_stats.json は統計から除外
        if ($basename === '.cache_stats.json') {
            continue;
        }
        
        $fileSize = filesize($file);
        $fileTime = filemtime($file);
        $age = time() - $fileTime;
        
        // ファイル名からキャッシュタイプを推測
        $type = 'unknown';
        foreach ($config['ttl'] as $typeName => $ttl) {
            if (strpos($basename, $typeName) !== false) {
                $type = $typeName;
                break;
            }
        }
        
        $stats['cache_files'][] = [
            'filename' => $basename,
            'type' => $type,
            'size' => $fileSize,
            'size_human' => formatBytes($fileSize),
            'age_seconds' => $age,
            'age_human' => formatAge($age),
            'last_modified' => date('Y-m-d H:i:s', $fileTime)
        ];
        
        $stats['total_size'] += $fileSize;
        $stats['total_files']++;
    }
}

// サマリー情報を生成
$stats['summary'] = [
    'total_files' => $stats['total_files'],
    'total_size' => formatBytes($stats['total_size']),
    'cache_enabled' => $stats['enabled'] ? 'Yes' : 'No'
];

// ヒット率を計算
foreach ($stats['hit_miss_stats'] as $key => $data) {
    $total = $data['hits'] + $data['misses'];
    $hitRate = $total > 0 ? round(($data['hits'] / $total) * 100, 2) : 0;
    $stats['hit_miss_stats'][$key]['total_requests'] = $total;
    $stats['hit_miss_stats'][$key]['hit_rate'] = $hitRate . '%';
}

echo json_encode($stats, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

/**
 * バイト数を人間が読みやすい形式に変換
 */
function formatBytes($bytes, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB'];
    
    for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
        $bytes /= 1024;
    }
    
    return round($bytes, $precision) . ' ' . $units[$i];
}

/**
 * 秒数を人間が読みやすい形式に変換
 */
function formatAge($seconds) {
    if ($seconds < 60) {
        return $seconds . '秒前';
    } elseif ($seconds < 3600) {
        return floor($seconds / 60) . '分前';
    } elseif ($seconds < 86400) {
        return floor($seconds / 3600) . '時間前';
    } else {
        return floor($seconds / 86400) . '日前';
    }
}
