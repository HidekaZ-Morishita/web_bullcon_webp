<?php
header('Content-Type: application/json; charset=UTF-8');
require_once __DIR__ . '/security_check.php';
header('Access-Control-Allow-Methods: GET');

require_once __DIR__ . '/cache_manager.php';

// データベース接続設定の読み込み
$configPath = null;
$searchDir = __DIR__;
for ($i = 0; $i < 5; $i++) {
    if (file_exists($searchDir . '/secret/hp_config.php')) {
        $configPath = $searchDir . '/secret/hp_config.php';
        break;
    }
    $searchDir = dirname($searchDir);
}
if (!$configPath) {
    $configPath = __DIR__ . '/../../../secret/hp_config.php';
}
$config = require $configPath;

define('DB_HOST', $config['DB_HOST']);
define('DB_NAME', $config['DB_NAME']);
define('DB_USER', $config['DB_USER']);
define('DB_PASS', $config['DB_PASS']);
define('DB_PORT', $config['DB_PORT']);

$dsn = 'pgsql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME;

try {
    $pdo = new PDO($dsn, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    error_log('Database connection error: ' . $e->getMessage());
    echo json_encode(['error' => 'サーバーエラーが発生しました。']);
    exit;
}

$rawPartNumber = trim($_GET['part_number'] ?? '');

// 1. 全角英数字を半角英数字に統一
$partNumber = mb_convert_kana($rawPartNumber, 'a', 'UTF-8');
// 2. 様々な種類のハイフン・長音記号を半角ハイフンに統一
$partNumber = preg_replace('/[ー−―–]/u', '-', $partNumber);

if (mb_strlen($partNumber, 'UTF-8') < 3) {
    http_response_code(400);
    echo json_encode(['error' => '品番は3文字以上で入力してください。']);
    exit;
}

// キャッシュキーの更新
$cacheKey = 'reverse_comp_v7_' . md5($partNumber);
$cacheTTL = CacheManager::getTTL('compatibility');

$cachedData = CacheManager::get($cacheKey, $cacheTTL);
if ($cachedData !== false) {
    echo $cachedData;
    exit;
}


// データベースの実際のカラム名に基づいた検索マッピング
$tableTargets = [
    [
        'category' => 'フリーテレビング（メーカー装着ナビ）',
        'table' => 'televing_maker',
        'columns' => ['ft_auto_type', 'ft_led_switch_type', 'ft_service_hole_switch_type', 'ft_steering_switch_type', 'nav_product_number', 'nav_product_number_2'],
        'has_car_model' => true
    ],
    [
        'category' => 'フリーテレビング（ディーラーオプションナビ）',
        'table' => 'televing_dealer',
        'columns' => ['ft_auto_type', 'ft_led_switch_type', 'ft_service_hole_switch_type', 'nav_product_number', 'monitor_number'],
        'has_car_model' => false
    ],
    [
        'category' => 'バックカメラ接続ユニット（メーカー装着ナビ）',
        'table' => 'magicone_bk_un_maker',
        'columns' => ['un_product_number_1', 'un_product_number_2'],
        'has_car_model' => true
    ],
    [
        'category' => 'バックカメラ接続ユニット（ディーラーオプションナビ）',
        'table' => 'magicone_bk_un_dealer',
        'columns' => ['product_number_1', 'monitor_number'],
        'has_car_model' => false
    ],
    [
        'category' => 'バックカメラハーネス（メーカー装着ナビ）',
        'table' => 'magicone_bk_ha_maker',
        'columns' => ['ha_product_number_1', 'ha_product_number_2'],
        'has_car_model' => true
    ],
    [
        'category' => 'バックカメラハーネス（ディーラーオプションナビ）',
        'table' => 'magicone_bk_ha_dealer',
        'columns' => ['product_number_1', 'monitor_number'],
        'has_car_model' => false
    ],
    [
        'category' => 'リアモニター出力ユニット（メーカー装着ナビ）',
        'table' => 'magicone_rm_un_maker',
        'columns' => ['product_number_1', 'monitor_number'],
        'has_car_model' => true
    ],
    [
        'category' => 'リアモニターハーネス（メーカー装着ナビ）',
        'table' => 'magicone_rm_ha_maker',
        'columns' => ['product_number_1'],
        'has_car_model' => true
    ],
    [
        'category' => 'リアモニターハーネス（ディーラーオプションナビ）',
        'table' => 'magicone_rm_ha_dealer',
        'columns' => ['product_number_1', 'monitor_number'],
        'has_car_model' => false
    ],
    [
        'category' => 'VTR/HDMIアダプター（メーカー装着ナビ）',
        'table' => 'magicone_vtr_hdmi_maker',
        'columns' => ['product_number_1', 'product_number_2', 'product_number_3', 'product_number_4'],
        'has_car_model' => true
    ],
    [
        'category' => 'VTR/HDMIアダプター（ディーラーオプションナビ）',
        'table' => 'magicone_vtr_hdmi_dealer',
        'columns' => ['product_number_1', 'monitor_number'],
        'has_car_model' => false
    ],
    [
        'category' => 'カメラセレクター',
        'table' => 'camera_selector',
        'columns' => ['product_number_1'],
        'has_car_model' => true
    ],
    [
        'category' => 'ステアリングスイッチコントローラー',
        'table' => 'steering_switch_controller',
        'columns' => ['product_number_1'],
        'has_car_model' => true
    ],
    [
        'category' => 'DVD/CDプレーヤー',
        'table' => 'dvd_cd_player',
        'columns' => ['product_number'],
        'has_car_model' => true
    ]
];

$categoryGroupMap = [];
$totalCount = 0;
$maxLimit = 100;
$truncated = false;

$searchTerm = "%{$partNumber}%";
$cleanPartNumber = str_replace('-', '', $partNumber);
$cleanSearchTerm = "%{$cleanPartNumber}%";

foreach ($tableTargets as $target) {
    if ($totalCount >= $maxLimit) {
        $truncated = true;
        break;
    }

    $table = $target['table'];
    $columns = $target['columns'];
    $categoryName = $target['category'];
    $whereClauses = [];
    $params = [];

    foreach ($columns as $col) {
        $whereClauses[] = "{$col} ILIKE ?";
        $params[] = $searchTerm;

        // ハイフンが含まれていない入力の場合、DB列のハイフンを除去した値でもマッチを試みる
        if ($cleanPartNumber !== $partNumber && strlen($cleanPartNumber) >= 3) {
            $whereClauses[] = "REPLACE({$col}, '-', '') ILIKE ?";
            $params[] = $cleanSearchTerm;
        }
    }

    $whereSql = implode(' OR ', $whereClauses);
    $remainingLimit = $maxLimit - $totalCount;

    $sql = "SELECT * FROM {$table} WHERE {$whereSql} LIMIT {$remainingLimit}";


    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        if (!empty($rows)) {
            if (!isset($categoryGroupMap[$categoryName])) {
                $categoryGroupMap[$categoryName] = [
                    'category' => $categoryName,
                    'has_car_model' => $target['has_car_model'],
                    'items' => [],
                    'unique_keys' => []
                ];
            }

            foreach ($rows as $row) {
                $hitParts = [];
                foreach ($columns as $col) {
                    if (isset($row[$col]) && $row[$col] !== '' && $row[$col] !== '-' && stripos($row[$col], $partNumber) !== false) {
                        $hitParts[] = $row[$col];
                    }
                }
                $row['matched_part_number'] = implode(', ', array_unique($hitParts));

                $maker = trim($row['maker'] ?? '');
                $carModel = trim($row['car_model'] ?? '');
                $modelNumber = trim($row['model_number'] ?? '');
                $monitorNumber = trim($row['monitor_number'] ?? '');

                $uniqueKey = "{$maker}|{$carModel}|{$modelNumber}|{$monitorNumber}";

                if (!isset($categoryGroupMap[$categoryName]['unique_keys'][$uniqueKey])) {
                    $categoryGroupMap[$categoryName]['unique_keys'][$uniqueKey] = true;
                    $categoryGroupMap[$categoryName]['items'][] = $row;
                    $totalCount++;
                }
            }
        }
    } catch (Exception $e) {
        error_log("Table query failed ({$table}): " . $e->getMessage());
    }
}

// 構造のクリーンアップ（内部ユニークキー削除）
$results = [];
foreach ($categoryGroupMap as $group) {
    if (!empty($group['items'])) {
        unset($group['unique_keys']);
        $results[] = $group;
    }
}

$response = [
    'query' => $partNumber,
    'total_count' => $totalCount,
    'truncated' => $truncated,
    'results' => $results
];

$jsonOutput = json_encode($response, JSON_UNESCAPED_UNICODE);

CacheManager::set($cacheKey, $jsonOutput, $cacheTTL);

echo $jsonOutput;
