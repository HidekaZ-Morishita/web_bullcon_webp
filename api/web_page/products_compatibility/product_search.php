<?php
// ProductSearchInterfaceを読み込む
require_once './products_compatibility/product_search_interface.php';

class YearFuncProductsSearch implements ProductSearchInterface
{
    private $dbTableName;
    private $directInput;
    private $maker;
    private $model;
    private $userDateTimestamp;

    private $productToTableMap = [
        'televing' => 'televing_maker',
        'magicone_bk_un' => 'magicone_bk_un_maker',
        'magicone_bk_ha' => 'magicone_bk_ha_maker',
        'magicone_rm_un' => 'magicone_rm_un_maker',
        'magicone_rm_ha' => 'magicone_rm_ha_maker',
        'magicone_vtr_hdmi' => 'magicone_vtr_hdmi_maker',
        'camera_selector' => 'camera_selector',
        'steering_swt_ctrl' => 'steering_switch_controller',
        'dvd_cd_player' => 'dvd_cd_player',
    ];

    public function __construct($product, $directInput, $maker, $model, $year, $month)
    {
        if (!isset($this->productToTableMap[$product]) || $this->productToTableMap[$product] === '') {
            throw new \InvalidArgumentException("無効な製品名またはテーブルが未定義です: " . $product);
        }
        $this->dbTableName = $this->productToTableMap[$product];
        $this->directInput = $directInput;
        $this->maker = $maker;
        $this->model = $model;

        if (empty($year)) {
            $this->userDateTimestamp = false;
        } else {
            if (!empty($month)) {
                $this->userDateTimestamp = strtotime("{$year}-{$month}-01");
            } else {
                $this->userDateTimestamp = strtotime("{$year}-01-01"); //yearのみ入力のケース
            }
        }
    }

    public function getSql(): string
    {
        $sql = "";
        if($this->directInput) {
            $sql = "SELECT * FROM $this->dbTableName WHERE model_number LIKE ?"; // 型式直接入力の場合
        } else {
            $sql = "SELECT * FROM $this->dbTableName WHERE maker = ? AND car_model LIKE ?";
        }

        if ($this->userDateTimestamp !== false) {
            // start_date がNULL または userDate以前
            // かつ
            // end_date がNULL または userDate以後
            $sql .= " AND (start_date IS NULL OR start_date <= ?) AND (end_date IS NULL OR end_date >= ?)";
        }

        $sql .= " ORDER BY car_model ASC, start_date ASC";

        return $sql;
    }

    public function getParams(): array
    {
        $params = [];
        if($this->directInput) {
            $params[] = "%{$this->directInput}%";
        } else {
            $params[] = $this->maker;
            $params[] = "{$this->model}%";
        }

        if ($this->userDateTimestamp !== false) {
            $dateStr = date('Y-m-d', $this->userDateTimestamp);
            $params[] = $dateStr;
            $params[] = $dateStr;
        }

        return $params;
    }

    public function postProcess(array $data): array
    {
        // SQL側で絞り込み済みのため、そのまま返却
        return $data;
    }


}

class ProductCodeFuncSearch implements ProductSearchInterface
{
    private $dbTableName;
    private $maker;
    private $productCode;

    private $productToTableMap = [
        'televing' => 'televing_dealer',
        'magicone_bk_un' => 'magicone_bk_un_dealer',
        'magicone_bk_ha' => 'magicone_bk_ha_dealer',
        'magicone_rm_ha' => 'magicone_rm_ha_dealer',
        'magicone_vtr_hdmi' => 'magicone_vtr_hdmi_dealer'
    ];

    public function __construct($product, $maker, $productCode)
    {
        if (!isset($this->productToTableMap[$product]) || $this->productToTableMap[$product] === '') {
            throw new \InvalidArgumentException("無効な製品名またはテーブルが未定義です: " . $product);
        }
        $this->dbTableName = $this->productToTableMap[$product];
        $this->maker = $maker;
        $this->productCode = $productCode;
    }

    public function getSql(): string
    {
        if ($this->maker) {
            return "SELECT * FROM $this->dbTableName WHERE maker = ? AND monitor_number LIKE ? ORDER BY year DESC";
        } else {
            return "SELECT * FROM $this->dbTableName WHERE monitor_number LIKE ? ORDER BY year DESC";
        }
    }

    public function getParams(): array
    {
        if ($this->maker) {
            return [$this->maker, "{$this->productCode}%"];
        } else {
            return ["%{$this->productCode}%"];
        }
        
    }

    public function postProcess(array $data): array
    {
        // ディーラーオプションの場合はフィルタリング不要
        return $data;
    }
}