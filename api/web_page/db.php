<?php
/**
 * データベース共通接続ローダー
 * 
 * 優先順位:
 * 1. secret/database.json の "database_mysql" 設定 (MySQL 8.4)
 * 2. secret/database.json の "database" 設定 (旧 PostgreSQL)
 * 3. secret/hp_config.php (フォールバック)
 */

class Database {
    private static ?PDO $pdo = null;
    private static ?string $driver = null;
    private static ?array $config = null;

    /**
     * 設定をロード
     */
    public static function loadConfig(): array {
        if (self::$config !== null) {
            return self::$config;
        }

        // 1. database.json の探索
        $jsonPath = self::findConfigFile('secret/database.json');
        if ($jsonPath && file_exists($jsonPath)) {
            $content = @file_get_contents($jsonPath);
            if ($content !== false) {
                $json = json_decode($content, true);
                if (is_array($json)) {
                    // "database_mysql" が存在すれば最優先
                    if (!empty($json['database_mysql'])) {
                        $c = $json['database_mysql'];
                        self::$driver = 'mysql';
                        self::$config = [
                            'driver'   => 'mysql',
                            'host'     => $c['host'] ?? '127.0.0.1',
                            'port'     => (int)($c['port'] ?? 3307),
                            'dbname'   => $c['dbname'] ?? $c['database'] ?? 'web_page',
                            'user'     => $c['user'] ?? $c['username'] ?? 'root',
                            'password' => $c['password'] ?? 'Bullcon-530',
                            'charset'  => $c['charset'] ?? 'utf8mb4'
                        ];
                        return self::$config;
                    }

                    // "database" キーが存在する場合（PostgreSQL等）
                    if (!empty($json['database'])) {
                        $c = $json['database'];
                        $drv = strtolower($c['driver'] ?? 'pgsql');
                        self::$driver = $drv;
                        self::$config = [
                            'driver'   => $drv,
                            'host'     => $c['host'] ?? '127.0.0.1',
                            'port'     => (int)($c['port'] ?? ($drv === 'mysql' ? 3307 : 5432)),
                            'dbname'   => $c['dbname'] ?? $c['database'] ?? 'web_page',
                            'user'     => $c['user'] ?? $c['username'] ?? '',
                            'password' => $c['password'] ?? '',
                            'charset'  => $c['charset'] ?? 'utf8mb4',
                            'sslmode'  => $c['sslmode'] ?? 'prefer'
                        ];
                        return self::$config;
                    }
                }
            }
        }

        // 2. hp_config.php の探索（フォールバック）
        $phpPath = self::findConfigFile('secret/hp_config.php');
        if ($phpPath && file_exists($phpPath)) {
            $c = require $phpPath;
            if (is_array($c)) {
                if (!empty($c['database_mysql'])) {
                    $m = $c['database_mysql'];
                    self::$driver = 'mysql';
                    self::$config = [
                        'driver'   => 'mysql',
                        'host'     => $m['host'] ?? '127.0.0.1',
                        'port'     => (int)($m['port'] ?? 3307),
                        'dbname'   => $m['dbname'] ?? 'web_page',
                        'user'     => $m['user'] ?? 'root',
                        'password' => $m['password'] ?? 'Bullcon-530',
                        'charset'  => 'utf8mb4'
                    ];
                    return self::$config;
                }

                $drv = strtolower($c['DB_DRIVER'] ?? 'pgsql');
                self::$driver = $drv;
                self::$config = [
                    'driver'   => $drv,
                    'host'     => $c['DB_HOST'] ?? '127.0.0.1',
                    'port'     => (int)($c['DB_PORT'] ?? ($drv === 'mysql' ? 3307 : 5432)),
                    'dbname'   => $c['DB_NAME'] ?? 'web_page',
                    'user'     => $c['DB_USER'] ?? '',
                    'password' => $c['DB_PASS'] ?? '',
                    'charset'  => 'utf8mb4'
                ];
                return self::$config;
            }
        }

        // デフォルト: MySQL 8.4 設定
        self::$driver = 'mysql';
        self::$config = [
            'driver'   => 'mysql',
            'host'     => '127.0.0.1',
            'port'     => 3307,
            'dbname'   => 'web_page',
            'user'     => 'root',
            'password' => 'Bullcon-530',
            'charset'  => 'utf8mb4'
        ];
        return self::$config;
    }

    /**
     * PDOインスタンスを取得
     */
    public static function getConnection(): PDO {
        if (self::$pdo !== null) {
            return self::$pdo;
        }

        $config = self::loadConfig();
        $driver = $config['driver'];
        $host   = $config['host'];
        $port   = $config['port'];
        $dbname = $config['dbname'];
        $user   = $config['user'];
        $pass   = $config['password'];

        if ($driver === 'mysql') {
            $charset = $config['charset'] ?? 'utf8mb4';
            $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset={$charset}";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::ATTR_CASE               => PDO::CASE_LOWER,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES {$charset}"
            ];
            self::$pdo = new PDO($dsn, $user, $pass, $options);
        } else {
            // PostgreSQL
            $sslmode = $config['sslmode'] ?? 'prefer';
            $dsn = "pgsql:host={$host};port={$port};dbname={$dbname};sslmode={$sslmode}";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::ATTR_CASE               => PDO::CASE_LOWER
            ];
            self::$pdo = new PDO($dsn, $user, $pass, $options);
        }

        return self::$pdo;
    }

    /**
     * 現在のドライバー名 ('mysql' | 'pgsql') を取得
     */
    public static function getDriver(): string {
        if (self::$driver === null) {
            self::loadConfig();
        }
        return self::$driver ?? 'mysql';
    }

    /**
     * 上位階層に向かって設定ファイルを探索
     */
    private static function findConfigFile(string $relativePath): ?string {
        $searchDir = __DIR__;
        for ($i = 0; $i < 6; $i++) {
            $target = $searchDir . '/' . $relativePath;
            if (file_exists($target)) {
                return $target;
            }
            $parent = dirname($searchDir);
            if ($parent === $searchDir) break;
            $searchDir = $parent;
        }
        return null;
    }
}

/**
 * 簡易関数ラッパー
 */
function getDbConnection(): PDO {
    return Database::getConnection();
}

function getDbDriver(): string {
    return Database::getDriver();
}

function getDbConfig(): array {
    return Database::loadConfig();
}
