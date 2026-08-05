<?php
/**
 * キャッシュクリア管理ツール
 * 
 * データベース更新後にキャッシュをクリアするための管理者用エンドポイント
 * セキュリティのため、トークン認証を実装しています
 */

header('Content-Type: application/json; charset=UTF-8');
require_once __DIR__ . '/security_check.php';
header('Access-Control-Allow-Methods: GET');

require_once __DIR__ . '/cache_manager.php';

// 設定を読み込む
$config = require __DIR__ . '/cache_config.php';

// トークン認証
$token = $_GET['token'] ?? '';
if ($token !== $config['clear_token']) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'Unauthorized: Invalid token'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// アクションを取得
$action = $_GET['action'] ?? 'all';

$result = [
    'success' => true,
    'action' => $action,
    'cleared_count' => 0,
    'message' => ''
];

try {
    switch ($action) {
        case 'all':
            // すべてのキャッシュをクリア
            $count = CacheManager::clear();
            $result['cleared_count'] = $count;
            $result['message'] = "すべてのキャッシュをクリアしました（{$count}ファイル）";
            break;
            
        case 'car_model':
            // 車種リストのキャッシュをクリア
            $count = CacheManager::clear('car_model');
            $result['cleared_count'] = $count;
            $result['message'] = "車種リストのキャッシュをクリアしました（{$count}ファイル）";
            break;
            
        case 'monitor_list':
            // モニターリストのキャッシュをクリア
            $count = CacheManager::clear('monitor_list');
            $result['cleared_count'] = $count;
            $result['message'] = "モニターリストのキャッシュをクリアしました（{$count}ファイル）";
            break;
            
        case 'note_list':
            // 注意事項リストのキャッシュをクリア
            $count = CacheManager::clear('note_list');
            $result['cleared_count'] = $count;
            $result['message'] = "注意事項リストのキャッシュをクリアしました（{$count}ファイル）";
            break;
            
        case 'announcements':
            // お知らせのキャッシュをクリア
            $count = CacheManager::clear('announcements');
            $result['cleared_count'] = $count;
            $result['message'] = "お知らせのキャッシュをクリアしました（{$count}ファイル）";
            break;
            
        case 'compatibility':
            // 製品互換性のキャッシュをクリア
            $count = CacheManager::clear('compatibility');
            $result['cleared_count'] = $count;
            $result['message'] = "製品互換性のキャッシュをクリアしました（{$count}ファイル）";
            break;
            
        case 'cleanup':
            // 期限切れキャッシュのみクリア
            $count = CacheManager::cleanup();
            $result['cleared_count'] = $count;
            $result['message'] = "期限切れキャッシュをクリアしました（{$count}ファイル）";
            break;
            
        default:
            $result['success'] = false;
            $result['error'] = "無効なアクション: {$action}";
            $result['available_actions'] = [
                'all' => 'すべてのキャッシュをクリア',
                'car_model' => '車種リストのキャッシュをクリア',
                'monitor_list' => 'モニターリストのキャッシュをクリア',
                'note_list' => '注意事項リストのキャッシュをクリア',
                'announcements' => 'お知らせのキャッシュをクリア',
                'compatibility' => '製品互換性のキャッシュをクリア',
                'cleanup' => '期限切れキャッシュのみクリア'
            ];
            break;
    }
} catch (Exception $e) {
    $result['success'] = false;
    $result['error'] = $e->getMessage();
}

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
