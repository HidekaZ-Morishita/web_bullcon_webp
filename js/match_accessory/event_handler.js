import { renderForm, checkFieldsFilled } from './form_ui.js';
import { PRODUCTS_DATA } from './data_mapper.js';
import { handleSearchResults, handleReverseSearchResults } from './result_renderer.js';
import { initializeAndGetMonitorNumber } from './match.js';

let formState = {
    searchMode: 'car',              // 'car' (車種から探す) または 'reverse' (製品品番から探す)
    reversePartNumber: '',          // 逆引き検索用の入力品番
    selectedProduct: null,
    selectedOptionType: null,
    selectedInputType: null,        // 入力タイプ (select or text)
    selectedDirectInputText: null,  // 直接入力されたテキスト
    selectedMaker: null,
    selectedModel: null,
    selectedYear: null,
    selectedMonth: null,
    selectedProductCode: null
};

// --- 適合情報関連の項目をリセットするためのヘルパー関数 (今回は未使用だが定義は残す) ---
function resetModelOnward(state) {
    state.selectedModel = null;
}
// --------------------------------------------------------

/**
 * フォームの変更を処理し、UIの状態を更新する
 * @param {Event} event - changeイベントオブジェクト
 */
function handleFormChange(event) {
    const target = event.target;
    resetResultArea();

    // テキスト入力フィールド (inputイベントで個別に処理するため、changeでは無視)
    if (target.id === 'product-code-input' || target.id === 'direct-input-text') {
        return;
    }

    // OptionTypeの処理
    if (target.name === 'option-type') {
        formState.selectedOptionType = target.value;
        formState.selectedDirectInputText = null;
    } 
    // InputTypeの処理
    else if (target.name === 'input-type') {
        formState.selectedInputType = target.value;
    }
    // ドロップダウンの変更処理
    else {
        switch (target.id) {
            case 'product-select':
                formState.selectedProduct = target.value || null;
                
                // 1. Option Type と Input Type の状態維持
                const productInfo = Object.values(PRODUCTS_DATA).find(p => p.name === formState.selectedProduct);
                
                // 特定製品のOptionType固定処理
                const isFixedOptionTypeProduct = productInfo && (
                    productInfo.name === 'リアモニター出力ユニット' ||
                    productInfo.name === 'カメラセレクター' ||
                    productInfo.name === 'ステアリングスイッチコントローラー' ||
                    productInfo.name === 'DVD/CDプレイヤー');
                
                if (isFixedOptionTypeProduct) {
                    // 固定オプションの製品は強制上書き
                    formState.selectedOptionType = 'maker';
                    formState.selectedInputType = 'select';
                }
                
                // 2. 適合情報（メーカー以下の項目）の選択状態を完全に維持します。
                // すべてのリストが共通であるため、リセット処理は行いません。
                // 以前のリセット処理: resetModelOnward(formState); は削除されました。
                
                break;
            case 'maker-select':
                formState.selectedMaker = target.value || null;
                resetModelOnward(formState); 
                break;
            case 'model-select':
                formState.selectedModel = target.value || null;
                break;
            case 'year-select':
                formState.selectedYear = target.value || null;
                if (formState.selectedYear === 'unknown') {
                    formState.selectedProductCode = ''; // 年式不明の場合はテキスト入力のため空文字列で初期化
                }
                break;
            case 'month-select':
                formState.selectedMonth = target.value || null;
                break;
            case 'product-code-select':
                formState.selectedProductCode = target.value || null;
                break;
        }
    }

    renderForm('form-container', formState);

    // 検索ボタンの状態更新は、renderForm内またはinput/changeイベントの最後にcheckFieldsFilledを使って行うのが確実
    const searchButton = document.getElementById('search-button');
    const productInfo = Object.values(PRODUCTS_DATA).find(p => p.name === formState.selectedProduct);
    if (searchButton && checkFieldsFilled(formState, productInfo)) {
        searchButton.removeAttribute('disabled');
    } else if (searchButton) {
        searchButton.setAttribute('disabled', 'true');
    }
}

/**
 * 適合品番検索処理を実行する
 * @param {object} formState - 現在のフォームの状態
 * @param {object} productInfo - 選択された製品の情報
 */
async function handleSearch(formState, productInfo) {
    const currentInputType = formState.selectedInputType || 'select';
    const productKey = productInfo.productKey;
    const optionFlow = productInfo.optionFlows[formState.selectedOptionType];

    let params = {};
    let headerData = optionFlow.header;
    let pdfPath = null;
    
    if (currentInputType === 'text') {
        // InputTypeが直接入力の場合
        if (!formState.selectedDirectInputText) return; 

        params = {
            product: productKey,
            option: formState.selectedOptionType,
            directInput: formState.selectedDirectInputText.trim() // 直接入力されたテキストを使用
        };
        pdfPath = null; 

    } else {
        // InputTypeがドロップダウン選択 ('select') の場合 (従来のロジック)
        const { selectedMaker, selectedModel, selectedYear, selectedMonth, selectedProductCode } = formState;

        let queryModel = selectedModel;
        let queryYear = selectedYear;
        let queryMonth = selectedMonth;
        let queryProductCode = selectedProductCode;
        
        if (optionFlow.processType === 'dealer_process') {
            queryModel = '';
            if (selectedYear !== 'unknown') {
                queryMonth = '1';
            } else {
                queryMonth = '';
                queryProductCode = selectedProductCode;
            }
        } else {
            // maker_process: 未選択は null または空文字列としてAPIに渡す
            queryModel = selectedModel === '' ? null : selectedModel;
            queryYear = selectedYear === '' ? null : selectedYear;
            queryMonth = selectedMonth === '' ? null : selectedMonth;
            queryProductCode = selectedProductCode === '' ? null : selectedProductCode;
        }

        const yearMatch = queryYear ? queryYear.match(/\d{4}/) : null;
        const yearForQuery = yearMatch ? yearMatch[0] : null;
        
        params = {
            product: productKey,
            option: formState.selectedOptionType,
            maker: selectedMaker,
            model: queryModel,
            year: yearForQuery,
            month: queryMonth,
            productCode: queryProductCode
        };

        pdfPath = optionFlow?.pdf_paths?.[selectedMaker];
    }
    
    await handleSearchResults(params, headerData, pdfPath);
}

/**
 * アプリケーションのイベントリスナーを初期設定する
 */
export function setupEventListeners() {
    const formContainer = document.getElementById('form-container');
    if (!formContainer) {
        return;
    }

    // changeイベントでフォームの構造とドロップダウンの状態を更新
    formContainer.addEventListener('change', handleFormChange);

    // inputイベントでテキストフィールドの状態を更新し、検索ボタンの活性化をチェック
    formContainer.addEventListener('input', async(event) => {
        const target = event.target;
        const suggestionsList = document.getElementById('product-code-suggestions');
        
        // 0. NEW: 逆引き検索用のテキストフィールド
        if (target.id === 'reverse-part-input') {
            formState.reversePartNumber = target.value;
            const reverseSearchBtn = document.getElementById('reverse-search-button');
            if (reverseSearchBtn) {
                reverseSearchBtn.disabled = target.value.trim().length < 3;
            }
            return;
        }

        // 1. NEW: 直接入力モードのテキストフィールド
        if (target.id === 'direct-input-text') {
            formState.selectedDirectInputText = target.value.trim();
        } 
        // 2. dealer_processの年式不明時のテキストフィールド
        else if (target.id === 'product-code-input') {
            const inputValue = target.value;
            formState.selectedProductCode = inputValue;

            if (inputValue.length === 0) {
                suggestionsList.style.display = 'none';
                // 検索ボタンの活性化チェックは後続で行う
            } else {
                // オートコンプリートのロジック (変更なし)
                suggestionsList.innerHTML = '';
                const monitorList = await initializeAndGetMonitorNumber();
                const allCodes = monitorList[formState.selectedMaker] || [];
                const matchedCodes = allCodes
                    .filter(item => item.product_code.toLowerCase().includes(inputValue.toLowerCase()))
                    .map(item => item.product_code);

                if (matchedCodes.length > 0) {
                    suggestionsList.style.display = 'block';
                    matchedCodes.forEach(code => {
                        const li = document.createElement('li');
                        li.textContent = code;
                        li.dataset.code = code;
                        suggestionsList.appendChild(li);
                    });
                } else {
                    suggestionsList.style.display = 'none';
                }
            }
        }
        
        // 💡 inputイベントでも検索ボタンの状態を更新
        const searchButton = document.getElementById('search-button');
        const productInfo = Object.values(PRODUCTS_DATA).find(p => p.name === formState.selectedProduct);
        if (searchButton && checkFieldsFilled(formState, productInfo)) {
            searchButton.removeAttribute('disabled');
        } else if (searchButton) {
            searchButton.setAttribute('disabled', 'true');
        }
    });

    formContainer.addEventListener('click', async (event) => {
        const target = event.target;
        const suggestionsList = document.getElementById('product-code-suggestions');

        // モード切替タブのクリック処理
        const modeTab = target.closest('.search-mode-tab');
        if (modeTab) {
            const newMode = modeTab.dataset.mode;
            if (newMode && newMode !== formState.searchMode) {
                formState.searchMode = newMode;
                resetResultArea();
                await renderForm('form-container', formState);
            }
            return;
        }

        // 逆引き検索ボタンのクリック処理
        if (target && target.id === 'reverse-search-button' && !target.disabled) {
            if (formState.reversePartNumber.trim().length >= 3) {
                await handleReverseSearchResults(formState.reversePartNumber.trim());
                const scrollTarget = document.getElementById('results-table-container');
                if (scrollTarget) {
                    scrollTarget.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
            return;
        }
        
        // オートコンプリートの候補リストのクリックを処理
        if (suggestionsList && suggestionsList.contains(target) && target.tagName === 'LI') {
            const selectedCode = target.dataset.code;
            
            if (selectedCode) {
                formState.selectedProductCode = selectedCode;
                suggestionsList.style.display = 'none';
                // 選択された値を反映するため再レンダリング
                renderForm('form-container', formState);
            }
            return;
        }

        // 検索ボタンのクリックを処理
        if (target && target.id === 'search-button' && !target.hasAttribute('disabled')) {
            const productInfo = Object.values(PRODUCTS_DATA).find(p => p.name === formState.selectedProduct);

            if (!productInfo || !checkFieldsFilled(formState, productInfo)) {
                // ここはcheckFieldsFilledでチェックされているはずだが、念のため
                console.error('すべての必須項目を入力してください。');
                return;
            }

            await handleSearch(formState, productInfo);

            //
            const scrollTarget = document.getElementById('export-pdf-button');
            scrollTarget.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
        }
    });
}


/**
 * 検索結果表示エリアを初期状態にリセットする
 */
function resetResultArea() {
    const messageContainer = document.getElementById('message-container');
    const tableContainer = document.getElementById('results-table-container');
    const exportPdfButton = document.getElementById('export-pdf-button');
    const notesContainer = document.getElementById('notes-list-container');
    const pdfLinkContainer = document.getElementById('pdf-link-container');

    const reverseWrapper = document.getElementById('reverse-results-wrapper');
    if (reverseWrapper) {
        reverseWrapper.remove();
    }

    const standardTable = document.querySelector('.result-table');
    if (standardTable) {
        standardTable.style.display = '';
    }

    if (messageContainer) {
        messageContainer.textContent = '検索結果がここに表示されます。';
        messageContainer.style.display = 'block';
    }
    if (tableContainer) {
        tableContainer.style.display = 'none';
        if (exportPdfButton) {
            exportPdfButton.style.display = 'none';
            exportPdfButton.disabled = true;
        }
    }
    if (notesContainer) {
        notesContainer.style.display = 'none';
    }
    if (pdfLinkContainer) {
        pdfLinkContainer.innerHTML = '';
        pdfLinkContainer.style.display = 'none';
    }
}

