// match.js
import { renderForm } from './form_ui.js';
import { setupEventListeners } from './event_handler.js';
import { exportTableToPdf, generatePdfPreviewUrl } from './result_table_exporter.js';
import { getCompatibilityData } from './match_api_client.js';
import { loadProductUrlMap } from './product_url_loader.js';

const CAR_MODEL_API = '../../api/web_page/get_car_model.php';
const MONITOR_NUMBER_LIST_API = '../../api/web_page/get_monitor_list.php';
const NOTE_LIST_API = '../../api/web_page/get_note_list.php';

let carModelCache = null;
let monitorNumberCache = null;
let noteCash = null;

// DOM読み込み後の初期処理
document.addEventListener('DOMContentLoaded', async() => {
    // 必要なデータをAPIから取得し、キャッシュに保存（初回アクセス時のみ実行）
    await initializeAndGetCarModel();
    await initializeAndGetMonitorNumber();
    await initializeAndGetMapNotes();

    // フォームを初期描画
    // この時点ではformStateが空なので、製品選択のみが表示されます
    renderForm('form-container', {
        selectedProduct: null,
        selectedOptionType: null,
        selectedInputType: null, 
        selectedMaker: null,
        selectedModel: null,
        selectedYear: null,
        selectedMonth: null,
        selectedProductCode: null,
    });

    // フォームの変更やクリックイベントのリスナーを設定
    setupEventListeners();

    // 適合結果テーブルのPDF出力ボタンのイベント処理
    const exportButton    = document.getElementById('export-pdf-button');
    const pdfDialog       = document.getElementById('pdf-export-dialog');
    const pdfDialogCancel = document.getElementById('pdf-dialog-cancel');
    const pdfDialogPreview = document.getElementById('pdf-dialog-preview');
    const pdfDialogSave   = document.getElementById('pdf-dialog-save');
    const pdfPreviewFrame = document.getElementById('pdf-preview-frame');
    const pdfPreviewLoading = document.getElementById('pdf-preview-loading');

    let currentPreviewUrl = null; // 現在のプレビューBlobURL（不要になったら解放する）

    /** モーダルを閉じ、プレビュー状態をリセットする */
    const closePdfDialog = () => {
        pdfDialog.close();
        pdfDialog.classList.remove('preview-active');
        pdfPreviewFrame.src = '';
        _removeStaleOverlay();
        if (currentPreviewUrl) {
            URL.revokeObjectURL(currentPreviewUrl);
            currentPreviewUrl = null;
        }
    };

    /** staleオーバーレイを追加する（設定変更後にプレビューが古いことを示す） */
    const _showStaleOverlay = () => {
        const wrapper = document.getElementById('pdf-preview-frame-wrapper');
        if (!wrapper || wrapper.querySelector('.pdf-preview-stale')) return;
        const overlay = document.createElement('div');
        overlay.className = 'pdf-preview-stale';
        overlay.innerHTML = '<span class="pdf-preview-stale-icon">&#8635;</span><span>設定が変更されました。<br>「プレビュー」ボタンで更新してください。</span>';
        wrapper.appendChild(overlay);
    };

    /** staleオーバーレイを削除する */
    const _removeStaleOverlay = () => {
        const wrapper = document.getElementById('pdf-preview-frame-wrapper');
        wrapper?.querySelector('.pdf-preview-stale')?.remove();
    };

    if (exportButton && pdfDialog) {

        // ボタン押下でモーダルを開く
        exportButton.addEventListener('click', () => {
            pdfDialog.showModal();
        });

        // キャンセルでモーダルを閉じる
        pdfDialogCancel.addEventListener('click', closePdfDialog);

        // Escキーでモーダルを閉じた場合もリセット
        pdfDialog.addEventListener('close', () => {
            pdfDialog.classList.remove('preview-active');
            pdfPreviewFrame.src = '';
            _removeStaleOverlay();
            if (currentPreviewUrl) {
                URL.revokeObjectURL(currentPreviewUrl);
                currentPreviewUrl = null;
            }
        });

        // 設定変更時にstaleオーバーレイを表示
        pdfDialog.addEventListener('change', () => {
            if (pdfDialog.classList.contains('preview-active')) {
                _showStaleOverlay();
            }
        });

        // 「プレビュー」ボタン
        pdfDialogPreview.addEventListener('click', async () => {
            const orientation = document.querySelector('input[name="pdf-orientation"]:checked')?.value || 'landscape';
            const format = document.getElementById('pdf-format-select')?.value || 'a4';

            // プレビューパネルを展開してローディング表示
            pdfDialog.classList.add('preview-active');
            pdfPreviewFrame.src = '';
            _removeStaleOverlay();
            pdfPreviewLoading.style.display = 'flex';
            pdfDialogPreview.disabled = true;

            // 前のBlobURLを解放
            if (currentPreviewUrl) {
                URL.revokeObjectURL(currentPreviewUrl);
                currentPreviewUrl = null;
            }

            try {
                const blobUrl = await generatePdfPreviewUrl('result', { orientation, format });
                currentPreviewUrl = blobUrl;
                pdfPreviewFrame.src = blobUrl;
            } catch (error) {
                console.error('プレビュー生成エラー:', error);
            } finally {
                pdfPreviewLoading.style.display = 'none';
                pdfDialogPreview.disabled = false;
            }
        });

        // 「PDFを保存」ボタン
        pdfDialogSave.addEventListener('click', async () => {
            const orientation = document.querySelector('input[name="pdf-orientation"]:checked')?.value || 'landscape';
            const format = document.getElementById('pdf-format-select')?.value || 'a4';
            const rawFilename = document.getElementById('pdf-filename-input')?.value.trim() || 'compatibility_result';

            closePdfDialog();

            pdfDialogSave.disabled = true;
            await exportTableToPdf('result', { orientation, format, filename: rawFilename });
            pdfDialogSave.disabled = false;
        });
    }
});

/**
 * 車種モデルデータをAPIから取得し、キャッシュする
 * @returns {Promise<object>} 車種モデルデータ
 */
const initializeAndGetCarModel = async() => {
    // キャッシュが存在する場合は、即座にキャッシュデータを返す
    if (carModelCache) {
        return carModelCache;
    }

    // キャッシュが存在しない場合は、APIからデータを取得し、キャッシュする
    const carModel = await getCompatibilityData(CAR_MODEL_API , "");
    
    // 取得したデータをキャッシュに保存
    carModelCache = carModel;
    
    return carModel;
};

/**
 * モニター品番リストをAPIから取得し、キャッシュする
 * @returns {Promise<object>} モニター品番リスト
 */
const initializeAndGetMonitorNumber = async() => {
    // キャッシュが存在する場合は、即座にキャッシュデータを返す
    if (monitorNumberCache) {
        return monitorNumberCache;
    }

    // キャッシュが存在しない場合は、APIからデータを取得し、キャッシュする
    const monitorNumberList = await getCompatibilityData(MONITOR_NUMBER_LIST_API , "");
    
    // 取得したデータをキャッシュに保存
    monitorNumberCache = monitorNumberList;
    
    return monitorNumberList;
};

/**
 * 注意事項リストをAPIから取得し、キャッシュする
 * @returns {Promise<object>} 注意事項リスト
 */
const initializeAndGetMapNotes = async() => {
    // キャッシュが存在する場合は、即座にキャッシュデータを返す
    if (noteCash) {
        return noteCash;
    }

    // キャッシュが存在しない場合は、APIからデータを取得し、キャッシュする
    const noteList = await getCompatibilityData(NOTE_LIST_API , "");

    // 製品名と注意事項マップの対応
    const notesMap = {
        'televing': noteList.notes_tving || [],
        'magicone_bk_un': noteList.notes_back_camera || [],
        'magicone_bk_ha': noteList.notes_back_camera || [],
        'magicone_rm_un': noteList.notes_rearmonitor_vtr_hdmi || [],
        'magicone_rm_ha': noteList.notes_rearmonitor_vtr_hdmi || [],
        'magicone_vtr_hdmi': noteList.notes_rearmonitor_vtr_hdmi || [],
        'camera_selector': noteList.notes_camera_selector || [],
        'steering_swt_ctrl': noteList.notes_steering_switch_controller || [],
        'dvd_cd_player': noteList.notes_dvd_player || []
    };
    
    // 取得したデータをキャッシュに保存
    noteCash = notesMap;
    
    return notesMap;
};

export {
    initializeAndGetCarModel,
    initializeAndGetMonitorNumber,
    initializeAndGetMapNotes
};
