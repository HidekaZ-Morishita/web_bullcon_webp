// ライブラリの動的取得関数（Rocket Loader等による遅延読み込みに対応）
function _getHtml2Canvas() {
    return window.html2canvas || null;
}

function _getJsPdf() {
    if (window.jspdf && window.jspdf.jsPDF) {
        return window.jspdf.jsPDF;
    }
    if (window.jsPDF) {
        return window.jsPDF;
    }
    return null;
}

// キャプチャの高さが確定するのを待つための遅延時間 (ミリ秒)
const CAPTURE_DELAY_MS = 100;

// PDF出力用の圧縮スタイルを緩和し、視認性を重視
const PDF_COMPRESSION_STYLE = `
    /* ラッパー全体にパディングを適用し、PDF端からの余白を確保 */
    #pdf-capture-wrapper {
        padding: 10px !important;
    }
    /* テーブル全体の文字サイズを緩和 */
    #pdf-capture-wrapper, #pdf-capture-wrapper table, #pdf-capture-wrapper p, #pdf-capture-wrapper li {
        font-size: 10pt !important;
        line-height: 1.3 !important;
    }
    /* セル（th, td）のパディングを適度に削減 */
    #pdf-capture-wrapper th, #pdf-capture-wrapper td {
        padding: 4px 6px !important;
    }
    /* テーブルのボーダー間隔を詰める */
    #pdf-capture-wrapper table {
        border-collapse: collapse !important;
    }
    /* 注意事項のリストの余白を詰める */
    #pdf-capture-wrapper ul, #pdf-capture-wrapper ol {
        padding-left: 15px !important;
        margin-top: 5px !important;
        margin-bottom: 5px !important;
    }
`;

// ------------------------------------
// 内部共通関数
// ------------------------------------

/**
 * テーブル要素をhtml2canvasでキャプチャする内部共通関数
 * @param {string} tableContainerId - テーブルコンテナのID
 * @returns {Promise<{canvas: HTMLCanvasElement, cleanup: Function}>}
 */
async function _captureTableToCanvas(tableContainerId) {
    const html2canvasLib = _getHtml2Canvas();
    const jsPdfLib = _getJsPdf();
    if (!html2canvasLib || !jsPdfLib) {
        throw new Error('PDF出力ライブラリがロードされていません。ライブラリのロードを確認してください。');
    }


    const reverseWrapper = document.getElementById('reverse-results-wrapper');
    const standardTableContainer = document.getElementById('results-table-container');
    const standardTable = standardTableContainer ? standardTableContainer.querySelector('.result-table') : null;

    let targetElementToCapture = null;
    let isReverseMode = false;

    if (reverseWrapper && reverseWrapper.children.length > 0) {
        targetElementToCapture = reverseWrapper;
        isReverseMode = true;
    } else if (standardTableContainer && standardTable && standardTableContainer.style.display !== 'none') {
        targetElementToCapture = standardTableContainer;
    } else {
        const fallbackContainer = document.getElementById(tableContainerId) || document.getElementById('result');
        if (fallbackContainer) {
            targetElementToCapture = fallbackContainer;
        }
    }

    if (!targetElementToCapture) {
        throw new Error('PDF出力対象の適合結果テーブルが見つかりません。');
    }

    const tableHeaders = targetElementToCapture.querySelectorAll('thead');

    // スタイル変更前の状態を保存
    const originalBodyOverflowX = document.body.style.overflowX;

    // bodyのoverflow-xを解除
    document.body.style.overflowX = 'visible';

    // 固定ヘッダーの解除
    tableHeaders.forEach(th => {
        th.style.position = 'static';
    });

    // 一時的な統合ラッパーを作成
    const tempWrapper = document.createElement('div');
    tempWrapper.id = 'pdf-capture-wrapper';

    const styleElement = document.createElement('style');
    styleElement.textContent = PDF_COMPRESSION_STYLE;
    tempWrapper.appendChild(styleElement);

    // 表示中の対象コンテンツをクローンして追加
    tempWrapper.appendChild(targetElementToCapture.cloneNode(true));

    // 標準モードかつ注意事項が表示されている場合、注意事項をクローンして追加
    const originalNotesContainer = document.getElementById('notes-list-container');
    if (!isReverseMode && originalNotesContainer && originalNotesContainer.style.display !== 'none') {
        tempWrapper.appendChild(originalNotesContainer.cloneNode(true));
    }


    // 画面外に配置
    Object.assign(tempWrapper.style, {
        position: 'absolute',
        left: '-9999px',
        top: '0',
        zIndex: '9999',
        overflow: 'visible',
        maxWidth: 'none',
        maxHeight: 'none',
        width: 'fit-content',
    });
    document.body.appendChild(tempWrapper);

    // レイアウト計算完了のための遅延
    await new Promise(resolve => setTimeout(resolve, CAPTURE_DELAY_MS));

    const captureWidth = tempWrapper.offsetWidth;
    const captureHeight = tempWrapper.scrollHeight;
    tempWrapper.style.width = `${captureWidth}px`;

    const canvas = await html2canvasLib(tempWrapper, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        letterRendering: true,
        width: captureWidth,
        height: captureHeight,
    });

    // クリーンアップ関数（呼び出し元が責任を持って実行する）
    const cleanup = () => {
        document.body.style.overflowX = originalBodyOverflowX;
        if (tempWrapper.parentNode) {
            tempWrapper.parentNode.removeChild(tempWrapper);
        }
    };


    return { canvas, cleanup };
}

/**
 * canvasからjsPDFインスタンスを生成する内部関数
 * @param {HTMLCanvasElement} canvas
 * @param {{ orientation?: string, format?: string }} options
 * @returns {object} jsPDF インスタンス
 */
function _buildPdfFromCanvas(canvas, { orientation = 'landscape', format = 'a4' } = {}) {
    const jsPdfLib = _getJsPdf();
    if (!jsPdfLib) {
        throw new Error('PDF出力ライブラリ(jsPDF)が見つかりません。');
    }
    const pdf = new jsPdfLib({ orientation, unit: 'mm', format });


    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    const ratio = canvas.height / canvas.width;
    const imgWidth = pdfWidth;
    const imgHeight = imgWidth * ratio;

    let heightLeft = imgHeight;
    let position = 0;

    while (heightLeft > 0) {
        if (position !== 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, -position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
        position += pdfHeight;
    }

    return pdf;
}

// ------------------------------------
// 公開API
// ------------------------------------

/**
 * 適合結果テーブルと注意事項を統合してPDFとして保存する
 * @param {string} tableContainerId - テーブルコンテナのID ('result' など)
 * @param {object} [options] - PDF出力オプション
 * @param {string} [options.orientation='landscape'] - 用紙の向き ('landscape' | 'portrait')
 * @param {string} [options.format='a4'] - 用紙サイズ ('a4' | 'a3' | 'letter')
 * @param {string} [options.filename='compatibility_result'] - 保存ファイル名（拡張子なし）
 */
export async function exportTableToPdf(tableContainerId, options = {}) {
    const {
        orientation = 'landscape',
        format = 'a4',
        filename = 'compatibility_result',
    } = options;

    const exportButton = document.getElementById('export-pdf-button');
    if (exportButton) exportButton.disabled = true;

    let cleanup = null;
    try {
        const { canvas, cleanup: _cleanup } = await _captureTableToCanvas(tableContainerId);
        cleanup = _cleanup;
        const pdf = _buildPdfFromCanvas(canvas, { orientation, format });
        pdf.save(`${filename}.pdf`);
    } catch (error) {
        console.error('PDF生成中にエラーが発生しました:', error);
    } finally {
        if (cleanup) cleanup();
        if (exportButton) exportButton.disabled = false;
    }
}

/**
 * 適合結果テーブルのPDFプレビュー用 Blob URL を生成して返す
 * ※ 返却したURLは不要になったタイミングで URL.revokeObjectURL() で解放すること
 * @param {string} tableContainerId - テーブルコンテナのID ('result' など)
 * @param {object} [options] - PDF出力オプション
 * @param {string} [options.orientation='landscape'] - 用紙の向き ('landscape' | 'portrait')
 * @param {string} [options.format='a4'] - 用紙サイズ ('a4' | 'a3' | 'letter')
 * @returns {Promise<string>} PDFのBlob URL
 */
export async function generatePdfPreviewUrl(tableContainerId, options = {}) {
    const { orientation = 'landscape', format = 'a4' } = options;
    const { canvas, cleanup } = await _captureTableToCanvas(tableContainerId);
    try {
        const pdf = _buildPdfFromCanvas(canvas, { orientation, format });
        return pdf.output('bloburl');
    } finally {
        cleanup();
    }
}
