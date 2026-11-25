<?php
header('Content-Type: application/json; charset=UTF-8');
require_once __DIR__ . '/security_check.php';
header('Access-Control-Allow-Methods: GET');

if (!isset($_SERVER['HTTP_X_REQUESTED_WITH']) || strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) !== 'xmlhttprequest') {
    header('HTTP/1.1 403 Forbidden');
    exit;
}

// キャッシュマネージャーを読み込み
require_once __DIR__ . '/cache_manager.php';

// キャッシュキーを生成
$cacheKey = 'note_list';
$cacheTTL = CacheManager::getTTL('note_list');

// キャッシュから取得を試みる
$cachedData = CacheManager::get($cacheKey, $cacheTTL);
if ($cachedData !== false) {
    echo $cachedData;
    exit;
}

// データベース共通接続ローダーを読み込み
require_once __DIR__ . '/db.php';

$tableNameList = [
    'notes_tving',
    'notes_rearmonitor_vtr_hdmi',
    'notes_dvd_player',
    'notes_camera_selector',
    'notes_back_camera',
    'notes_steering_switch_controller'
];

try {
    $pdo = getDbConnection();

    // MySQL 8.4 / PostgreSQL 両対応: 各注記テーブルから全件取得
    $organizedData = [];
    foreach ($tableNameList as $name) {
        try {
            $stmt = $pdo->query("SELECT * FROM {$name}");
            $organizedData[$name] = $stmt ? $stmt->fetchAll() : [];
        } catch (Exception $te) {
            error_log("Note table query failed ({$name}): " . $te->getMessage());
            $organizedData[$name] = [];
        }
    }

    $retData = formatNoteStructure($organizedData);

    // JSONオブジェクトを生成
    $jsonOutput = json_encode($retData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
    // キャッシュに保存
    CacheManager::set($cacheKey, $jsonOutput, $cacheTTL);
    
    // 出力
    echo $jsonOutput;

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
}

function formatNoteStructure($noteMap) {
    $retList = [];
    foreach ($noteMap as $tableName => $tableData) {
        $formatted_data = [
            'common' => []
        ];
        if (is_array($tableData)) {
            foreach ($tableData as $note) {
                $note_num = isset($note['note_num']) ? (int)$note['note_num'] : null;
                $content = $note['content'] ?? '';
                
                if ($note_num === 0) {
                    $formatted_data['common'][] = $content;
                } elseif ($note_num !== null) {
                    $formatted_data[(string)$note_num] = $content;
                }
            }
        }
        $retList[$tableName] = $formatted_data;
    }
    return $retList;
}