<?php
// security_check.php
// 他社サイトからの不正API呼び出しを防ぐための共通セキュリティスクリプト

$allowed_domains = [
    'www.fuji-denki.co.jp',
    'fuji-denki.co.jp',
    'localhost'
];

// リクエスト元（Origin もしくは Referer）の情報を取得
$request_origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$request_referer = $_SERVER['HTTP_REFERER'] ?? '';

$request_host = '';
$parsed_port = '';
$parsed = [];

if (!empty($request_origin)) {
    // Originの例: "https://www.fuji-denki.co.jp"
    $parsed = parse_url($request_origin);
    $request_host = $parsed['host'] ?? '';
    $parsed_port = $parsed['port'] ?? '';
} elseif (!empty($request_referer)) {
    // Refererの例: "https://www.fuji-denki.co.jp/some/path.html"
    $parsed = parse_url($request_referer);
    $request_host = $parsed['host'] ?? '';
    $parsed_port = $parsed['port'] ?? '';
}

// ホスト名が許可リストに含まれているかチェック
if ($request_host !== '' && in_array($request_host, $allowed_domains, true)) {
    // 許可されているドメインの場合、動的にAccess-Control-Allow-Originを設定
    // リクエストのOriginをそのまま返すのがCORSの定石
    if (!empty($request_origin)) {
        header("Access-Control-Allow-Origin: " . $request_origin);
    } else {
        // OriginがなくてRefererだけある場合は、Refererのスキームとホストを組み立てる
        $scheme = $parsed['scheme'] ?? (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http');
        $port_str = !empty($parsed_port) ? (':' . $parsed_port) : '';
        header("Access-Control-Allow-Origin: " . $scheme . "://" . $request_host . $port_str);
    }
} else {
    // 許可されていない場合（OriginもRefererもない直叩きや、別ドメインからのアクセス）
    
    // 不正アクセスのログを記録
    $log_dir = __DIR__ . '/logs';
    if (!file_exists($log_dir)) {
        @mkdir($log_dir, 0777, true);
    }
    $log_file = $log_dir . '/unauthorized_access.log';
    
    // ログファイルが2MBを超えた場合、.oldとしてバックアップ（1世代のみ保存）
    if (file_exists($log_file) && filesize($log_file) > 2 * 1024 * 1024) {
        @rename($log_file, $log_file . '.old');
    }

    $ip = $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN_IP';
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'UNKNOWN_UA';
    $uri = $_SERVER['REQUEST_URI'] ?? 'UNKNOWN_URI';
    $timestamp = date('Y-m-d H:i:s');
    
    $log_message = sprintf("[%s] IP: %s | URI: %s | Origin: %s | Referer: %s | UA: %s\n",
        $timestamp, $ip, $uri, $request_origin, $request_referer, $ua);
        
    @file_put_contents($log_file, $log_message, FILE_APPEND | LOCK_EX);

    header('HTTP/1.1 403 Forbidden');
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['error' => 'Forbidden: Unauthorized Access']);
    exit;
}
?>
