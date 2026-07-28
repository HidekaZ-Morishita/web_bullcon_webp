import { initializeAndGetCarModel, initializeAndGetMonitorNumber } from './match.js';
import { PRODUCTS_DATA, CAR_YEARS, BASIC_YEARS, MONTHS } from './data_mapper.js';

function populateOptions(selectElement, options, emptyOptionText) {
    if (!selectElement) {
        return;
    }
    selectElement.innerHTML = `<option value="">${emptyOptionText}</option>`;
    options.forEach(option => {
        const opt = document.createElement('option');
        if (typeof option === 'object' && option !== null) {
            opt.value = option.value;
            opt.textContent = option.text;
            if (option.value === 'unknown') {
                opt.classList.add('unknown-option');
            }
        } else {
            opt.value = option;
            opt.textContent = option;
        }
        selectElement.appendChild(opt);
    });
}

async function generateSpecificProductForm(formContainer, productInfo, state) {
    const { selectedOptionType, selectedMaker, selectedModel, selectedYear, selectedMonth, selectedProductCode, selectedInputType, selectedDirectInputText } = state;
    const carModel = await initializeAndGetCarModel();
    const monitorList = await initializeAndGetMonitorNumber();

    let currentOptionType;
    const isFixedOptionType =
        productInfo.name === 'リアモニター出力ユニット' ||
        productInfo.name === 'カメラセレクター' ||
        productInfo.name === 'ステアリングスイッチコントローラー' ||
        productInfo.name === 'DVD/CDプレイヤー';

    if (isFixedOptionType) {
        currentOptionType = 'maker';
    } else {
        const optionGroup = document.createElement('div');
        optionGroup.className = 'form-group';
        optionGroup.innerHTML = `
            <label>オプションタイプ</label>
            <div class="option-group">
                <input type="radio" id="maker-option" name="option-type" value="maker">
                <label for="maker-option">標準装備/メーカーオプション</label>
                <input type="radio" id="dealer-option" name="option-type" value="dealer">
                <label for="dealer-option">ディーラーオプション</label>
            </div>
        `;
        formContainer.appendChild(optionGroup);
        currentOptionType = selectedOptionType || null;
        if (currentOptionType) {
            document.getElementById(`${currentOptionType}-option`).checked = true;
        }
    }

    if (currentOptionType) {
        let directInputLabelText;
        if (selectedOptionType === 'maker') {
            directInputLabelText = '車両型式';
        } else if (selectedOptionType === 'dealer') {
            directInputLabelText = 'モニター品番';
        } else {
            directInputLabelText = '型式またはモニター品番';
        }

        const inputTypeGroup = document.createElement('div');
        inputTypeGroup.className = 'form-group';
        inputTypeGroup.innerHTML = `
            <label>適合情報の入力方法</label>
            <div class="option-group">
                <input type="radio" id="select-input" name="input-type" value="select">
                <label for="select-input">選択肢から選ぶ</label>
                <input type="radio" id="text-input" name="input-type" value="text">
                <label for="text-input">${directInputLabelText}を直接入力</label>
            </div>
        `;
        formContainer.appendChild(inputTypeGroup);

        const currentInputType = selectedInputType || 'select';
        if (currentInputType) {
            document.getElementById(`${currentInputType}-input`).checked = true;
        }

        if (currentInputType === 'text') {
            const directInputGroup = document.createElement('div');
            directInputGroup.className = 'form-group';
            directInputGroup.innerHTML = `
                <label for="direct-input-text">${directInputLabelText}</label>
                <input type="text" id="direct-input-text" class="form-input" placeholder="${directInputLabelText}を入力してください(部分一致)" value="${selectedDirectInputText || ''}">
            `;
            formContainer.appendChild(directInputGroup);
        } else {
            const currentProcessType = productInfo.optionFlows[currentOptionType]?.processType;
            const makerGroup = document.createElement('div');
            makerGroup.className = 'form-group';
            makerGroup.innerHTML = `
                <label for="maker-select">メーカー</label>
                <select id="maker-select" class="form-select"></select>
            `;
            formContainer.appendChild(makerGroup);

            let makerOptions;
            if (currentOptionType === 'maker') {
                makerOptions = Object.keys(carModel);
            } else {
                makerOptions = Object.keys(monitorList);
            }
            populateOptions(document.getElementById('maker-select'), makerOptions, 'メーカーを選択してください');
            if (selectedMaker) {
                document.getElementById('maker-select').value = selectedMaker;
            }

            if (selectedMaker) {
                if (currentProcessType === 'maker_process') {
                    const modelGroup = document.createElement('div');
                    modelGroup.className = 'form-group';
                    modelGroup.innerHTML = `
                        <label for="model-select">車種</label>
                        <select id="model-select" class="form-select"></select>
                    `;
                    formContainer.appendChild(modelGroup);

                    const modelNames = carModel[selectedMaker];
                    populateOptions(document.getElementById('model-select'), modelNames, '車種を選択してください');
                    if (selectedModel) {
                        document.getElementById('model-select').value = selectedModel;
                    }

                    if (selectedModel) {
                        const yearMonthGroup = document.createElement('div');
                        yearMonthGroup.className = 'form-group';
                        yearMonthGroup.innerHTML = `
                            <label for="year-select">年式</label>
                            <div class="year-month-group">
                                <select id="year-select" class="form-select"></select>
                                <span>/</span>
                                <select id="month-select" class="form-select"></select>
                            </div>
                        `;
                        formContainer.appendChild(yearMonthGroup);

                        populateOptions(document.getElementById('year-select'), CAR_YEARS, '年');
                        populateOptions(document.getElementById('month-select'), MONTHS, '月 (未入力：1月固定)');

                        if (selectedYear) document.getElementById('year-select').value = selectedYear;
                        if (selectedMonth) document.getElementById('month-select').value = selectedMonth;
                    }
                } else if (currentProcessType === 'dealer_process') {
                    const yearGroup = document.createElement('div');
                    yearGroup.className = 'form-group';
                    yearGroup.innerHTML = `
                        <label for="year-select">モニターモデル年</label>
                        <select id="year-select" class="form-select"></select>
                    `;
                    formContainer.appendChild(yearGroup);

                    const availableYears = monitorList[selectedMaker] ? [...new Set(monitorList[selectedMaker].map(item => String(item.year)))] : [];
                    const processedYears = BASIC_YEARS
                        .filter(year => availableYears.includes(year.match(/\d{4}/)?.[0] || year))
                        .map(year => {
                            const yearMatch = year.match(/\d{4}/);
                            return { value: yearMatch ? yearMatch[0] : year, text: year };
                        });

                    populateOptions(document.getElementById('year-select'), [{ value: 'unknown', text: '【年式不明の方はこちら】' }, ...processedYears], '年');

                    if (selectedYear) {
                        document.getElementById('year-select').value = selectedYear;
                    }

                    if (selectedYear) {
                        const productCodeGroup = document.createElement('div');
                        productCodeGroup.className = 'form-group';
                        productCodeGroup.innerHTML = `<label>モニター型番</label>`;

                        if (selectedYear === 'unknown') {
                            const inputValue = selectedProductCode !== null ? selectedProductCode : '';
                            productCodeGroup.innerHTML += `
                                <input type="search" id="product-code-input" class="form-input" placeholder="モニター型番を入力" value="${inputValue}">
                                <ul id="product-code-suggestions" class="suggestions-list"></ul>
                            `;
                            formContainer.appendChild(productCodeGroup);
                        } else {
                            const selectElement = document.createElement('select');
                            selectElement.id = 'product-code-select';
                            selectElement.className = 'form-select';
                            productCodeGroup.appendChild(selectElement);
                            formContainer.appendChild(productCodeGroup);

                            const codes = monitorList[selectedMaker] || [];
                            const filteredCodes = codes
                                .filter(item => String(item.year) === selectedYear)
                                .map(item => item.product_code);

                            populateOptions(selectElement, filteredCodes, '品番を選択してください');
                            if (selectedProductCode) {
                                selectElement.value = selectedProductCode;
                            }
                        }
                    }
                }
            }
        }
    }
}

export async function renderForm(containerId, state) {
    const { searchMode = 'car', selectedProduct, reversePartNumber = '' } = state;
    const formContainer = document.getElementById(containerId);
    if (!formContainer) {
        return;
    }
    formContainer.innerHTML = '';

    // モード切替タブの生成
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'search-mode-tabs';
    tabsContainer.innerHTML = `
        <div class="search-mode-tab ${searchMode === 'car' ? 'active' : ''}" data-mode="car">製品・車種から探す</div>
        <div class="search-mode-tab ${searchMode === 'reverse' ? 'active' : ''}" data-mode="reverse">品番から逆引きする</div>
    `;

    formContainer.appendChild(tabsContainer);

    if (searchMode === 'reverse') {
        // 逆引き検索用フォームの生成
        const reverseGroup = document.createElement('div');
        reverseGroup.className = 'form-group';
        const isMinLength = reversePartNumber.trim().length >= 3;
        reverseGroup.innerHTML = `
            <label for="reverse-part-input">製品品番</label>
            <input type="text" id="reverse-part-input" class="form-input" placeholder="製品品番を入力してください (例: ADM-102, SWC-N008)" value="${reversePartNumber}">
            <div class="reverse-search-note">
                ※ 3文字以上で入力してください。製品カテゴリを跨いで横断検索します。<br>
                <span class="note-warning-red">※ 一部の製品データは未登録のため、正しい品番であっても表示されない場合がございます。</span>
            </div>
        `;


        formContainer.appendChild(reverseGroup);

        const searchButton = document.createElement('button');
        searchButton.id = 'reverse-search-button';
        searchButton.className = 'btn-primary';
        searchButton.textContent = '対応車種を逆引き検索';
        searchButton.disabled = !isMinLength;
        formContainer.appendChild(searchButton);
    } else {
        // 従来の車種からの適合検索フォーム
        const productGroup = document.createElement('div');
        productGroup.className = 'form-group';
        productGroup.innerHTML = `
            <label for="product-select">製品名</label>
            <select id="product-select" class="form-select"></select>
        `;
        formContainer.appendChild(productGroup);

        const productNames = Object.values(PRODUCTS_DATA).map(p => p.name);
        populateOptions(document.getElementById('product-select'), productNames, '製品を選択してください');
        if (selectedProduct) {
            document.getElementById('product-select').value = selectedProduct;
        }

        const productInfo = Object.values(PRODUCTS_DATA).find(p => p.name === selectedProduct);
        if (productInfo) {
            await generateSpecificProductForm(formContainer, productInfo, state);
        }

        const searchButton = document.createElement('button');
        searchButton.id = 'search-button';
        searchButton.className = 'btn-primary';
        searchButton.textContent = '適合品番を検索';
        searchButton.disabled = !checkFieldsFilled(state, productInfo);
        formContainer.appendChild(searchButton);
    }
}

export function checkFieldsFilled(state, productInfo) {
    const { selectedProduct, selectedMaker, selectedModel, selectedYear, selectedMonth, selectedOptionType, selectedProductCode, selectedInputType, selectedDirectInputText } = state;
    if (!productInfo) return false;
    const currentOptionType = selectedOptionType;
    const currentInputType = selectedInputType || 'select';
    if (!(selectedProduct && currentOptionType)) {
        return false;
    }
    if (currentInputType === 'text') {
        return !!selectedDirectInputText;
    }
    const processType = productInfo.optionFlows[currentOptionType]?.processType;
    if (processType === 'maker_process') {
        return selectedMaker && selectedModel;
    } else if (processType === 'dealer_process') {
        if (!(selectedMaker && selectedYear)) {
            return false;
        }
        return !!selectedProductCode;
    }
    return false;
}
