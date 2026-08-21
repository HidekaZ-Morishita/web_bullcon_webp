<?php
header('Content-Type: application/json; charset=UTF-8');
require_once __DIR__ . '/security_check.php';
header('Access-Control-Allow-Methods: GET');

// if (!isset($_SERVER['HTTP_X_REQUESTED_WITH']) || strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) !== 'xmlhttprequest') {
//     header('HTTP/1.1 403 Forbidden');
//     exit;
// }

// キャッシュマネージャーを読み込み
require_once __DIR__ . '/cache_manager.php';

// ファクトリークラスを読み込む
require_once './products_compatibility/product_search_factory.php';

// データベース接続設定
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

// ユーザーからのGETパラメータを配列にまとめる
$params = [
    'product' => convertNullString($_GET['product'] ?? ''),
    'option' => convertNullString($_GET['option'] ?? ''),
    'directInput' => convertNullString($_GET['directInput'] ?? ''),
    'maker' => convertNullString($_GET['maker'] ?? ''),
    'model' => convertNullString($_GET['model'] ?? ''),
    'year' => convertNullString($_GET['year'] ?? ''),
    'month' => convertNullString($_GET['month'] ?? ''),
    'productCode' => convertNullString($_GET['productCode'] ?? ($_GET['directInput'] ?? '')),
];

// キャッシュキーを生成（パラメータのハッシュを使用）
$cacheKey = 'compatibility_' . md5(json_encode($params));
$cacheTTL = CacheManager::getTTL('compatibility');

// キャッシュから取得を試みる
$cachedData = CacheManager::get($cacheKey, $cacheTTL);
if ($cachedData !== false) {
    echo $cachedData;
    exit;
}

try {
    // ファクトリーを使って適切な処理クラスのインスタンスを生成
    $searchProcessor = ProductSearchFactory::create($params['product'], $params['option'], $params);
    
    // SQLクエリとパラメータを取得し、データベースを実行
    $sql = $searchProcessor->getSql();
    $dbParams = $searchProcessor->getParams();
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($dbParams);
    $allPartsData = $stmt->fetchAll();

    // 後処理を実行
    $filteredData = $searchProcessor->postProcess($allPartsData);
    
    // JSONオブジェクトを生成
    $jsonOutput = json_encode($filteredData);
    
    // キャッシュに保存
    CacheManager::set($cacheKey, $jsonOutput, $cacheTTL);
    
    // フィルタリングされたデータをJSON形式で返す
    echo $jsonOutput;

} catch (Exception $e) {
    http_response_code(400);
    error_log('API Error: ' . $e->getMessage());
    echo json_encode(['error' => 'リクエスト処理中にエラーが発生しました。']);
    exit;
}

function convertNullString($value) {
    if ($value === 'null' || $value === '') {
        return null;
    }
    return $value;
}