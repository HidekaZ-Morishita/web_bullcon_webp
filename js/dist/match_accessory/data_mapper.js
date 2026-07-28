export const PRODUCTS_DATA = { 'freeTVing': { name: 'フリーテレビング/テレナビング', productKey: 'televing', optionFlows: { 'maker': { processType: 'maker_process', pdf_paths: { 'トヨタ': '../../pdf/products/TVing/TVing_New_m_toyota.pdf', 'レクサス': '../../pdf/products/TVing/TVing_New_m_lexus.pdf', 'ニッサン': '../../pdf/products/TVing/TVing_New_m_nissan.pdf', 'ホンダ': '../../pdf/products/TVing/TVing_New_m_honda.pdf', 'マツダ': '../../pdf/products/TVing/TVing_New_m_mazda.pdf', 'スバル': '../../pdf/products/TVing/TVing_New_m_subaru.pdf', 'スズキ': '../../pdf/products/TVing/TVing_New_m_suzuki.pdf', 'ダイハツ': '../../pdf/products/TVing/TVing_New_m_daihatsu.pdf', 'ミツビシ': '../../pdf/products/TVing/TVing_New_m_mitsubishi.pdf', 'イスズ': ''
}, header: [
{ label: '車両情報', subHeaders: [
{ key: 'car_model', label: '車名' }, { key: 'print_date', label: '年式' }, { key: 'model_number', label: '型式' }, { key: 'specification', label: '仕様' }, ]
}, { label: 'フリーテレビング', subHeaders: [
{ key: 'ft_auto_type', label: 'オートタイプ', priceKeys: { excl: 'ft_auto_price_excl_tax', incl: 'ft_auto_price_incl_tax' }, option: { nav: 'ft_auto_navigation_control', vehicle_pos: 'ft_auto_vehicle_position', dvd: 'ft_led_sh_st_dvd_playback' } }, { key: 'ft_led_switch_type', label: 'LEDスイッチ切替タイプ', priceKeys: { excl: 'ft_led_price_excl_tax', incl: 'ft_led_price_incl_tax' }, option: { nav: 'ft_led_sh_st_navigation_control', vehicle_pos: 'ft_led_sh_st_vehicle_position', dvd: 'ft_led_sh_st_dvd_playback' } }, { key: 'ft_service_hole_switch_type', label: 'サービスホールスイッチ切替タイプ', priceKeys: { excl: 'ft_service_hole_price_excl_tax', incl: 'ft_service_hole_price_incl_tax' }, option: { nav: 'ft_led_sh_st_navigation_control', vehicle_pos: 'ft_led_sh_st_vehicle_position', dvd: 'ft_led_sh_st_dvd_playback' } }, { key: 'ft_steering_switch_type', label: 'ステアリングスイッチ切替タイプ', priceKeys: { excl: 'ft_steering_price_excl_tax', incl: 'ft_steering_price_incl_tax' }, option: { nav: 'ft_led_sh_st_navigation_control', vehicle_pos: 'ft_led_sh_st_vehicle_position', dvd: 'ft_led_sh_st_dvd_playback' } }, ]
}, { label: 'テレナビング', subHeaders: [
{ key: 'nav_product_number', label: 'LEDスイッチ切替タイプ', priceKeys: { excl: 'nav_price_excl_tax', incl: 'nav_price_incl_tax' }, option: { dvd: 'nav_dvd_playback_2' } }, { key: 'nav_product_number_2', label: 'nav_col_2', priceKeys: { excl: 'nav_price_excl_tax_2', incl: 'nav_price_incl_tax_2' }, option: { dvd: 'nav_dvd_playback_2' } }, ]
}, { label: '注意事項', subHeaders: [
{ key: 'notes', label: '備考' } ]
} ]
}, 'dealer': { processType: 'dealer_process', pdf_paths: { 'トヨタ': '../../pdf/products/TVing/TVing_New_d_toyota.pdf', 'レクサス': '../../pdf/products/TVing/TVing_New_d_lexus.pdf', 'ニッサン': '../../pdf/products/TVing/TVing_New_d_nissan.pdf', 'ホンダ': '../../pdf/products/TVing/TVing_New_d_honda.pdf', 'マツダ': '../../pdf/products/TVing/TVing_New_d_mazda.pdf', 'スバル': '../../pdf/products/TVing/TVing_New_d_subaru.pdf', 'スズキ': '../../pdf/products/TVing/TVing_New_d_suzuki.pdf', 'ダイハツ': '../../pdf/products/TVing/TVing_New_d_daihatsu.pdf', 'ミツビシ': '../../pdf/products/TVing/TVing_New_d_mitsubishi.pdf', 'イスズ': ''
}, header: [
{ label: 'モニター情報', subHeaders: [
{ key: 'year', label: 'モデル年' }, { key: 'monitor_number', label: 'モニター型番' }, { key: 'maker', label: 'メーカー' }, { key: 'specification', label: '特徴' }, ]
}, { label: 'フリーテレビング', subHeaders: [
{ key: 'ft_auto_type', label: 'オートタイプ', priceKeys: { excl: 'ft_auto_price_excl_tax', incl: 'ft_auto_price_incl_tax' }, option: { nav: 'ft_auto_navigation_control', vehicle_pos: 'ft_auto_vehicle_position', dvd: 'ft_led_sh_st_dvd_playback' } }, { key: 'ft_led_switch_type', label: 'LEDスイッチ切替タイプ', priceKeys: { excl: 'ft_led_price_excl_tax', incl: 'ft_led_price_incl_tax' }, option: { nav: 'ft_led_sh_st_navigation_control', vehicle_pos: 'ft_led_sh_st_vehicle_position', dvd: 'ft_led_sh_st_dvd_playback' } }, { key: 'ft_service_hole_switch_type', label: 'サービスホールスイッチ切替タイプ', priceKeys: { excl: 'ft_service_hole_price_excl_tax', incl: 'ft_service_hole_price_incl_tax' }, option: { nav: 'ft_led_sh_st_navigation_control', vehicle_pos: 'ft_led_sh_st_vehicle_position', dvd: 'ft_led_sh_st_dvd_playback' } } ]
}, { label: 'テレナビング', subHeaders: [
{ key: 'nav_product_number', label: 'LEDスイッチ切替タイプ', priceKeys: { excl: 'nav_price_excl_tax', incl: 'nav_price_incl_tax' }, option: { dvd: 'nav_dvd_playback_2' } }, { key: 'nav_product_number_2', label: 'nav_col_2', priceKeys: { excl: 'nav_price_excl_tax_2', incl: 'nav_price_incl_tax_2' }, option: { dvd: 'nav_dvd_playback_2' } }, ]
}, { label: '注意事項', subHeaders: [
{ key: 'notes', label: '備考' } ]
} ]
} } }, 'magicone_bk_un': { name: 'バックカメラ接続ユニット', productKey: 'magicone_bk_un', optionFlows: { 'maker': { processType: 'maker_process', pdf_paths: { 'トヨタ': '../../pdf/products/MAGICONE/magicone_c_m_toyota.pdf', 'レクサス': '', 'ニッサン': '../../pdf/products/MAGICONE/magicone_c_m_nissan.pdf', 'ホンダ': '../../pdf/products/MAGICONE/magicone_c_m_honda.pdf', 'マツダ': '../../pdf/products/MAGICONE/magicone_c_m_mazda.pdf', 'スバル': '../../pdf/products/MAGICONE/magicone_c_m_subaru.pdf', 'スズキ': '../../pdf/products/MAGICONE/magicone_c_m_suzuki.pdf', 'ダイハツ': '../../pdf/products/MAGICONE/magicone_c_m_daihatsu.pdf', 'ミツビシ': '../../pdf/products/MAGICONE/magicone_c_m_mitsubishi.pdf', 'イスズ': ''
}, header: [
{ label: '車両情報', subHeaders: [
{ key: 'car_model', label: '車名' }, { key: 'print_date', label: '年式' }, { key: 'model_number', label: '型式' }, { key: 'specification', label: '仕様' }, ]
}, { label: 'バックカメラ接続ユニット', subHeaders: [
{ key: 'un_product_number_1', label: '品番１', priceKeys: { excl: 'un_price_excl_tax_1', incl: 'un_price_incl_tax_1' }, }, { key: 'un_product_number_2', label: '品番2', priceKeys: { excl: 'un_price_excl_tax_2', incl: 'un_price_incl_tax_2' }, }, ]
}, { label: '注意事項', subHeaders: [
{ key: 'notes', label: '備考' } ]
} ]
}, 'dealer': { processType: 'dealer_process', pdf_paths: { 'トヨタ': '../../pdf/products/MAGICONE/magicone_c_d_toyota.pdf', 'レクサス': '', 'ニッサン': '../../pdf/products/MAGICONE/magicone_c_d_nissan.pdf', 'ホンダ': '../../pdf/products/MAGICONE/magicone_c_d_honda.pdf', 'マツダ': '../../pdf/products/MAGICONE/magicone_c_d_mazda.pdf', 'スバル': '', 'スズキ': '../../pdf/products/MAGICONE/magicone_c_d_suzuki.pdf', 'ダイハツ': '../../pdf/products/MAGICONE/magicone_c_d_daihatsu.pdf', 'ミツビシ': '../../pdf/products/MAGICONE/magicone_c_d_mitsubishi.pdf', 'イスズ': ''
}, header: [
{ label: '車両情報', subHeaders: [
{ key: 'year', label: 'モデル年' }, { key: 'monitor_number', label: 'モニター型番' }, { key: 'maker', label: 'メーカー' }, { key: 'specification', label: '仕様' }, ]
}, { label: 'バックカメラ接続ユニット', subHeaders: [
{ key: 'product_number_1', label: '品番', priceKeys: { excl: 'un_price_excl_tax_1', incl: 'un_price_incl_tax_1' }, } ]
}, { label: '注意事項', subHeaders: [
{ key: 'notes', label: '備考' } ]
} ]
}, } }, 'magicone_bk_ha': { name: 'バックカメラ接続ハーネス', productKey: 'magicone_bk_ha', optionFlows: { 'maker': { processType: 'maker_process', pdf_paths: { 'トヨタ': '../../pdf/products/MAGICONE/magicone_c_m_toyota.pdf', 'レクサス': '', 'ニッサン': '../../pdf/products/MAGICONE/magicone_c_m_nissan.pdf', 'ホンダ': '../../pdf/products/MAGICONE/magicone_c_m_honda.pdf', 'マツダ': '../../pdf/products/MAGICONE/magicone_c_m_mazda.pdf', 'スバル': '../../pdf/products/MAGICONE/magicone_c_m_subaru.pdf', 'スズキ': '../../pdf/products/MAGICONE/magicone_c_m_suzuki.pdf', 'ダイハツ': '../../pdf/products/MAGICONE/magicone_c_m_daihatsu.pdf', 'ミツビシ': '../../pdf/products/MAGICONE/magicone_c_m_mitsubishi.pdf', 'イスズ': ''
}, header: [
{ label: '車両情報', subHeaders: [
{ key: 'car_model', label: '車名' }, { key: 'print_date', label: '年式' }, { key: 'model_number', label: '型式' }, { key: 'specification', label: '仕様' }, ]
}, { label: 'バックカメラ接続ハーネス', subHeaders: [
{ key: 'ha_product_number_1', label: '品番', priceKeys: { excl: 'ha_price_excl_tax_1', incl: 'ha_price_incl_tax_1' }, }, ]
}, { label: '注意事項', subHeaders: [
{ key: 'notes', label: '備考' } ]
} ]
}, 'dealer': { processType: 'dealer_process', pdf_paths: { 'トヨタ': '../../pdf/products/MAGICONE/magicone_c_d_toyota.pdf', 'レクサス': '', 'ニッサン': '../../pdf/products/MAGICONE/magicone_c_d_nissan.pdf', 'ホンダ': '../../pdf/products/MAGICONE/magicone_c_d_honda.pdf', 'マツダ': '../../pdf/products/MAGICONE/magicone_c_d_mazda.pdf', 'スバル': '', 'スズキ': '../../pdf/products/MAGICONE/magicone_c_d_suzuki.pdf', 'ダイハツ': '../../pdf/products/MAGICONE/magicone_c_d_daihatsu.pdf', 'ミツビシ': '../../pdf/products/MAGICONE/magicone_c_d_mitsubishi.pdf', 'イスズ': ''
}, header: [
{ label: '車両情報', subHeaders: [
{ key: 'year', label: 'モデル年' }, { key: 'monitor_number', label: 'モニター型番' }, { key: 'maker', label: 'メーカー' }, { key: 'specification', label: '仕様' }, ]
}, { label: 'バックカメラ接続ハーネス', subHeaders: [
{ key: 'product_number_1', label: '品番', priceKeys: { excl: 'ha_price_excl_tax_1', incl: 'ha_price_incl_tax_1' }, } ]
}, { label: '注意事項', subHeaders: [
{ key: 'notes', label: '備考' } ]
} ]
}, } }, 'magicone_rm_un': { name: 'リアモニター出力ユニット', productKey: 'magicone_rm_un', optionFlows: { 'maker': { processType: 'maker_process', pdf_paths: { 'トヨタ': '../../pdf/products/MAGICONE/magicone_r_m_toyota.pdf', 'レクサス': '../../pdf/products/MAGICONE/magicone_r_m_lexus.pdf', 'ニッサン': '../../pdf/products/MAGICONE/magicone_r_m_nissan.pdf', 'ホンダ': '../../pdf/products/MAGICONE/magicone_r_m_honda.pdf', 'マツダ': '', 'スバル': '', 'スズキ': '', 'ダイハツ': '', 'ミツビシ': '', 'イスズ': ''
}, header: [
{ label: '車両情報', subHeaders: [
{ key: 'car_model', label: '車名' }, { key: 'print_date', label: '年式' }, { key: 'model_number', label: '型式' }, { key: 'specification', label: '仕様' }, ]
}, { label: 'モニター情報', subHeaders: [
{ key: 'monitor_number', label: 'モニター型番' }, ]
}, { label: 'リアモニター出力ユニット', subHeaders: [
{ key: 'product_number_1', label: '品番', priceKeys: { excl: 'price_excl_tax_1', incl: 'price_incl_tax_1' }, }, ]
}, { label: '注意事項', subHeaders: [
{ key: 'notes', label: '備考' } ]
} ]
} } }, 'magicone_rm_ha': { name: 'リアモニター出力ハーネス', productKey: 'magicone_rm_ha', optionFlows: { 'maker': { processType: 'maker_process', pdf_paths: { 'トヨタ': '../../pdf/products/MAGICONE/magicone_r_m_toyota.pdf', 'レクサス': '../../pdf/products/MAGICONE/magicone_r_m_lexus.pdf', 'ニッサン': '../../pdf/products/MAGICONE/magicone_r_m_nissan.pdf', 'ホンダ': '../../pdf/products/MAGICONE/magicone_r_m_honda.pdf', 'マツダ': '', 'スバル': '', 'スズキ': '', 'ダイハツ': '', 'ミツビシ': '', 'イスズ': ''
}, header: [
{ label: '車両情報', subHeaders: [
{ key: 'car_model', label: '車名' }, { key: 'print_date', label: '年式' }, { key: 'model_number', label: '型式' }, { key: 'specification', label: '仕様' }, ]
}, { label: 'リアモニター出力ハーネス', subHeaders: [
{ key: 'product_number_1', label: '品番', priceKeys: { excl: 'price_excl_tax_1', incl: 'price_incl_tax_1' }, option: { excl_input: 'input', tv: 'tv', dvd: 'dvd' } }, ]
}, { label: '注意事項', subHeaders: [
{ key: 'notes', label: '備考' } ]
} ]
}, 'dealer': { processType: 'dealer_process', pdf_paths: { 'トヨタ': '../../pdf/products/MAGICONE/magicone_r_d_toyota.pdf', 'レクサス': '', 'ニッサン': '../../pdf/products/MAGICONE/magicone_r_d_nissan.pdf', 'ホンダ': '../../pdf/products/MAGICONE/magicone_r_d_honda.pdf', 'マツダ': '', 'スバル': '', 'スズキ': '', 'ダイハツ': '../../pdf/products/MAGICONE/magicone_r_d_daihatsu.pdf', 'ミツビシ': '../../pdf/products/MAGICONE/magicone_r_d_mitsubishi.pdf', 'イスズ': ''
}, header: [
{ label: '車両情報', subHeaders: [
{ key: 'year', label: 'モデル年' }, { key: 'monitor_number', label: 'モニター型番' }, { key: 'maker', label: 'メーカー' }, { key: 'specification', label: '仕様' }, ]
}, { label: 'リアモニター出力ハーネス', subHeaders: [
{ key: 'product_number_1', label: '品番', priceKeys: { excl: 'price_excl_tax_1', incl: 'price_incl_tax_1' }, option: { excl_input: 'input', tv: 'tv', dvd: 'dvd' } } ]
}, { label: '注意事項', subHeaders: [
{ key: 'notes', label: '備考' } ]
} ]
}, } }, 'magicone_vtr_hdmi': { name: 'VTR/HDMI ハーネス', productKey: 'magicone_vtr_hdmi', optionFlows: { 'maker': { processType: 'maker_process', pdf_paths: { 'トヨタ': '../../pdf/products/MAGICONE/magicone_r_m_toyota.pdf', 'レクサス': '../../pdf/products/MAGICONE/magicone_r_m_lexus.pdf', 'ニッサン': '../../pdf/products/MAGICONE/magicone_r_m_nissan.pdf', 'ホンダ': '../../pdf/products/MAGICONE/magicone_r_m_honda.pdf', 'マツダ': '', 'スバル': '', 'スズキ': '', 'ダイハツ': '', 'ミツビシ': '', 'イスズ': ''
}, header: [
{ label: '車両情報', subHeaders: [
{ key: 'car_model', label: '車名' }, { key: 'print_date', label: '年式' }, { key: 'model_number', label: '型式' }, { key: 'specification', label: '仕様' }, ]
}, { label: 'RCA接続品番', subHeaders: [
{ key: 'product_number_1', label: '品番1', priceKeys: { excl: 'price_excl_tax_1', incl: 'price_incl_tax_1' } }, { key: 'product_number_2', label: '品番2', priceKeys: { excl: 'price_excl_tax_2', incl: 'price_incl_tax_2' } }, ]
}, { label: 'HDMI接続品番', subHeaders: [
{ key: 'product_number_3', label: '品番3', priceKeys: { excl: 'price_excl_tax_3', incl: 'price_incl_tax_3' }, }, { key: 'product_number_4', label: '品番4', priceKeys: { excl: 'price_excl_tax_4', incl: 'price_incl_tax_4' }, }, ]
}, { label: '注意事項', subHeaders: [
{ key: 'notes', label: '備考' } ]
} ]
}, 'dealer': { processType: 'dealer_process', pdf_paths: { 'トヨタ': '../../pdf/products/MAGICONE/magicone_r_d_toyota.pdf', 'レクサス': '', 'ニッサン': '../../pdf/products/MAGICONE/magicone_r_d_nissan.pdf', 'ホンダ': '../../pdf/products/MAGICONE/magicone_r_d_honda.pdf', 'マツダ': '', 'スバル': '', 'スズキ': '', 'ダイハツ': '../../pdf/products/MAGICONE/magicone_r_d_daihatsu.pdf', 'ミツビシ': '../../pdf/products/MAGICONE/magicone_r_d_mitsubishi.pdf', 'イスズ': ''
}, header: [
{ label: '車両情報', subHeaders: [
{ key: 'year', label: 'モデル年' }, { key: 'monitor_number', label: 'モニター型番' }, { key: 'maker', label: 'メーカー' }, { key: 'specification', label: '仕様' }, ]
}, { label: 'RCA/HDMI 入力ハーネス', subHeaders: [
{ key: 'product_number_1', label: '品番', priceKeys: { excl: 'price_excl_tax_1', incl: 'price_incl_tax_1' } } ]
}, { label: '注意事項', subHeaders: [
{ key: 'notes', label: '備考' } ]
} ]
}, } }, 'camera_selector': { name: 'カメラセレクター', productKey: 'camera_selector', optionFlows: { 'maker': { processType: 'maker_process', pdf_paths: { 'トヨタ': '../../pdf/products/CAMERA/AV-CSml.pdf', 'レクサス': '', 'ニッサン': '', 'ホンダ': '', 'マツダ': '', 'スバル': '', 'スズキ': '', 'ダイハツ': '', 'ミツビシ': '', 'イスズ': ''
}, header: [
{ label: '車両情報', subHeaders: [
{ key: 'car_model', label: '車名' }, { key: 'print_date', label: '年式' }, { key: 'model_number', label: '型式' }, { key: 'specification', label: '仕様' }, ]
}, { label: 'カメラセレクター', subHeaders: [
{ key: 'product_number_1', label: '品番', priceKeys: { excl: 'price_excl_tax_1', incl: 'price_incl_tax_1' } } ]
}, { label: '注意事項', subHeaders: [
{ key: 'notes', label: '備考' } ]
} ]
}, } }, 'steering_switch_controller': { name: 'ステアリングスイッチコントローラー', productKey: 'steering_swt_ctrl', optionFlows: { 'maker': { processType: 'maker_process', pdf_paths: { 'トヨタ': '../../pdf/products/AV_ACCESSORY/swc_m_toyota.pdf', 'レクサス': '../../pdf/products/AV_ACCESSORY/swc_m_lexus.pdf', 'ニッサン': '../../pdf/productsAV_ACCESSORY/swc_m_nissan.pdf', 'ホンダ': '../../pdf/products/AV_ACCESSORY/swc_m_honda.pdf', 'マツダ': '', 'スバル': '', 'スズキ': '', 'ダイハツ': '', 'ミツビシ': '', 'イスズ': ''
}, header: [
{ label: '車両情報', subHeaders: [
{ key: 'car_model', label: '車名' }, { key: 'print_date', label: '年式' }, { key: 'model_number', label: '型式' }, { key: 'specification', label: '仕様' }, ]
}, { label: 'ステアリングスイッチコントローラー/切替ユニット', subHeaders: [
{ key: 'product_number_1', label: '品番', priceKeys: { excl: 'price_excl_tax_1', incl: 'price_incl_tax_1' } } ]
}, { label: '注意事項', subHeaders: [
{ key: 'notes', label: '備考' } ]
} ]
}, } }, 'dvd_cd_player': { name: 'DVD/CDプレイヤー', productKey: 'dvd_cd_player', optionFlows: { 'maker': { processType: 'maker_process', pdf_paths: { 'トヨタ': '../../pdf/products/AV_ACCESSORY/cdv01-toyota.pdf', 'レクサス': '../../pdf/products/AV_ACCESSORY/cdv01-lexus.pdf', 'ニッサン': '', 'ホンダ': '', 'マツダ': '', 'スバル': '', 'スズキ': '', 'ダイハツ': '', 'ミツビシ': '', 'イスズ': ''
}, header: [
{ label: '車両情報', subHeaders: [
{ key: 'car_model', label: '車名' }, { key: 'print_date', label: '年式' }, { key: 'model_number', label: '型式' }, { key: 'specification', label: '仕様' }, ]
}, { label: 'DVD/CDプレイヤー', subHeaders: [
{ key: 'product_number', label: '品番', priceKeys: { excl: 'price_excl_tax', incl: 'price_incl_tax' }, option: { cd: 'cd', dvd: 'dvd', rear: 'リアモニター表示' } }, { key: 'usb', label: '接続先車両USBタイプ' } ]
}, { label: '注意事項', subHeaders: [
{ key: 'notes', label: '備考' } ]
} ]
}, } } }; export const BASIC_YEARS = [
'2026(R08)', '2025(R07)', '2024(R06)', '2023(R05)', '2022(R04)', '2021(R03)', '2020(R02)', '2019(H31/R01)', '2018(H30)', '2017(H29)', '2016(H28)', '2015(H27)', '2014(H26)', '2013(H25)', '2012(H24)', '2011(H23)', '2010(H22)', '2009(H21)', '2008(H20)', '2007(H19)', '2006(H18)', '2005(H17)', '2004(H16)', '2003(H15)', '2002(H14)', '2001(H13)', '2000(H12)', '1999(H11)'
]; export const CAR_YEARS = [
"R8 / 2026", "R7 / 2025", "R6 / 2024", "R5 / 2023", "R4 / 2022", "R3 / 2021", "R2 / 2020", "R1 / 2019", "H31 / 2019", "H30 / 2018", "H29 / 2017", "H28 / 2016", "H27 / 2015", "H26 / 2014", "H25 / 2013", "H24 / 2012", "H23 / 2011", "H22 / 2010", "H21 / 2009", "H20 / 2008", "H19 / 2007", "H18 / 2006", "H17 / 2005", "H16 / 2004", "H15 / 2003", "H14 / 2002", "H13 / 2001", "H12 / 2000"
]; export const MONTHS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];