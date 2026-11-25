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
$cacheKey = 'monitor_list';
$cacheTTL = CacheManager::getTTL('monitor_list');

// キャッシュから取得を試みる
$cachedData = CacheManager::get($cacheKey, $cacheTTL);
if ($cachedData !== false) {
    echo $cachedData;
    exit;
}

// データベース共通接続ローダーを読み込み
require_once __DIR__ . '/db.php';

$tableName  = 'monitor_number_list';

$desiredMakerOrder = [
    'トヨタ',
    'レクサス',
    'ニッサン',
    'ホンダ',
    'ミツビシ',
    'スバル',
    'スズキ',
    'ダイハツ',
    'マツダ',
    'イスズ',
];

try {
    $pdo = getDbConnection();

    $sql = "SELECT * FROM $tableName";

    $stmt = $pdo->query($sql);
    $result = $stmt->fetchAll();

    $organizedData = [];

foreach ($result as $row) {
    // 必要なデータを抽出
    $makerName = $row['maker'] ?? '不明なメーカー';
    $year = $row['year'] ?? '不明な年度';
    $monitorNum = $row['monitor_number'] ?? '不明なモニター品番';
    
    $organizedData[$makerName][] = [
        'year' => $year,
        'product_code' => $monitorNum
    ];
}

// 'product_code' の値を比較し、昇順 (辞書順 A-Z) でソート
foreach ($organizedData as &$products) {
    usort($products, function ($a, $b) {
        return $a['product_code'] <=> $b['product_code'];
    });
}
unset($products);

// uksort() を使用して、キー（メーカー名）をカスタム比較関数でソートします。
$orderMap = array_flip($desiredMakerOrder);
uksort($organizedData, function ($keyA, $keyB) use ($orderMap) {
    // AとBがどちらも指定順に含まれている場合
    $orderA = $orderMap[$keyA] ?? null;
    $orderB = $orderMap[$keyB] ?? null;

    if ($orderA !== null && $orderB !== null) {
        // Spaceship演算子を使用して、定義した順番でソート
        return $orderA <=> $orderB;
    } 
    
    // Aだけが指定順に含まれている場合 (AをBより前にする)
    if ($orderA !== null) {
        return -1;
    }
    
    // Bだけが指定順に含まれている場合 (BをAより後にする)
    if ($orderB !== null) {
        return 1;
    }

    // どちらも指定順に含まれない場合（キー名で昇順ソート）
    return $keyA <=> $keyB;
});

// JSONオブジェクトを生成
$jsonOutput = json_encode($organizedData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

// キャッシュに保存
CacheManager::set($cacheKey, $jsonOutput, $cacheTTL);

// 出力
echo $jsonOutput;

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
}
?>