import { getCompatibilityData } from './match_api_client.js';
import { initializeAndGetMapNotes } from './match.js';
import { loadProductUrlMap, getProductUrl, getProductLinkInfo } from './product_url_loader.js';

const MATCH_API_URL = '../../api/web_page/get_products_compatibility.php';
const MAKER_HONDA = 'ホンダ';
let allSearchResultsCache = [];
let currentHeaderData = [];

export function getSavedItemsMap() {
    const saved = localStorage.getItem('compatibility_saved_data_map');
    try {
        return saved ? JSON.parse(saved) : {};
    } catch (e) {
        console.error("Error parsing saved items map from localStorage:", e);
        return {};
    }
}

export function setSavedItemsMap(map) {
    try {
        localStorage.setItem('compatibility_saved_data_map', JSON.stringify(map));
    } catch (e) {
        console.error("Error setting saved items map to localStorage:", e);
    }
}

export function getRowUniqueId(item) {
    const model = item.car_model || '';
    const date = item.print_date || '';
    const modelNum = item.model_number || '';
    const monitorNum = item.monitor_number || '';
    return `${model}|${date}|${modelNum}|${monitorNum}`;
}

function handleCheckboxChange(event) {
    const checkbox = event.target;
    const rowId = checkbox.dataset.rowId;
    const productName = checkbox.dataset.productName;

    if (!rowId || !productName) return;

    let savedData = getSavedItemsMap();

    if (checkbox.checked) {
        const itemToSave = allSearchResultsCache.find(item => getRowUniqueId(item) === rowId);
        if (itemToSave) {
            if (!savedData[productName]) {
                savedData[productName] = {
                    headerData: currentHeaderData,
                    items: {}
                };
            }
            savedData[productName].items[rowId] = itemToSave;
        }
    } else {
        if (savedData[productName] && savedData[productName].items[rowId]) {
            delete savedData[productName].items[rowId];
            if (Object.keys(savedData[productName].items).length === 0) {
                delete savedData[productName];
            }
        }
    }
    setSavedItemsMap(savedData);
}

export async function handleSearchResults(params, headerData, pdfPath) {
    const tableContainer = document.getElementById('results-table-container');
    const exportPdfButton = document.getElementById('export-pdf-button');
    const messageContainer = document.getElementById('message-container');
    const pdfLinkContainer = document.getElementById('pdf-link-container');

    if (messageContainer) {
        messageContainer.textContent = '適合品番を検索中...';
        messageContainer.style.display = 'block';
    }
    if (tableContainer) {
        tableContainer.style.display = 'none';
        exportPdfButton.style.display = 'none';
        exportPdfButton.disabled = true;
    }

    updatePdfLink(pdfLinkContainer, pdfPath);
    allSearchResultsCache = [];
    currentHeaderData = headerData;

    try {
        await loadProductUrlMap();
        const partsData = await getCompatibilityData(MATCH_API_URL, params);
        allSearchResultsCache = partsData || [];

        if (partsData && Array.isArray(partsData) && partsData.length > 0) {
            if (messageContainer) messageContainer.style.display = 'none';
            generateTable(partsData, headerData, params.product);
            displayNotes(partsData, params.product);

            if (tableContainer) {
                tableContainer.style.display = 'block';
                exportPdfButton.style.display = 'block';
                exportPdfButton.disabled = false;
            }
        } else {
            const noResultMessage = 'お探しの条件に適合する品番は見つかりませんでした。';
            if (messageContainer) {
                messageContainer.textContent = noResultMessage;
                messageContainer.style.display = 'block';
            }
            if (tableContainer) {
                tableContainer.style.display = 'none';
                exportPdfButton.style.display = 'none';
                exportPdfButton.disabled = true;
            }
            displayNotes([], null);
            if (pdfLinkContainer && pdfPath) {
                const pdfLink = pdfLinkContainer.querySelector('.pdf-link');
                if (pdfLink) {
                    pdfLink.textContent = '適合品番は見つかりませんでした。一部車種マイナーチェンジの判別方法、およびPDF適合表も併せてご確認ください。';
                }
            }
        }
    } catch (error) {
        const errorMessage = `検索中にエラーが発生しました: ${error.message}`;
        if (messageContainer) {
            messageContainer.textContent = errorMessage;
            messageContainer.style.display = 'block';
        }
        if (tableContainer) {
            tableContainer.style.display = 'none';
            exportPdfButton.style.display = 'none';
            exportPdfButton.disabled = true;
        }
        if (pdfLinkContainer && pdfPath) {
            const pdfLink = pdfLinkContainer.querySelector('.pdf-link');
            if (pdfLink) {
                pdfLink.textContent = '適合品番は見つかりませんでした。詳しくはPDFをご参照ください。';
            }
        }
    }
}

function updatePdfLink(container, path) {
    if (!container) return;

    if (path) {
        const pdfLink = document.createElement('a');
        pdfLink.href = path;
        pdfLink.target = '_blank';
        pdfLink.style.borderBottom = '1px solid #337ab7';
        pdfLink.classList.add('pdf-link');
        pdfLink.textContent = '一部車種マイナーチェンジの判別方法、およびPDF適合表はこちら';

        container.innerHTML = '';
        container.appendChild(pdfLink);
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
    }
}

function customSort(a, b) {
    const safeString = (value) => (value || '').toString();

    if (safeString(a.car_model) < safeString(b.car_model)) return -1;
    if (safeString(a.car_model) > safeString(b.car_model)) return 1;

    if (safeString(a.print_date) < safeString(b.print_date)) return -1;
    if (safeString(a.print_date) > safeString(b.print_date)) return 1;

    if (safeString(a.year) < safeString(b.year)) return -1;
    if (safeString(a.year) > safeString(b.year)) return 1;

    if (safeString(a.model_number) < safeString(b.model_number)) return -1;
    if (safeString(a.model_number) > safeString(b.model_number)) return 1;

    if (safeString(a.monitor_number) < safeString(b.monitor_number)) return -1;
    if (safeString(a.monitor_number) > safeString(b.monitor_number)) return 1;

    return 0;
}

function resolveRelativeUrl(url) {
    if (!url) return '';
    const trimmed = url.trim();
    if (trimmed.startsWith('/html/')) {
        return '../../' + trimmed.substring(1);
    }
    if (trimmed.startsWith('/pdf/')) {
        return '../../' + trimmed.substring(1);
    }
    return trimmed;
}

function buildLinkTag(text, linkInfo) {
    if (linkInfo.url) {
        const href = resolveRelativeUrl(linkInfo.url);
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="product-part-link"><b>${text}</b></a>`;
    }
    if (linkInfo.mainPageUrl) {
        const href = resolveRelativeUrl(linkInfo.mainPageUrl);
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="product-part-link"><b>${text}</b></a>`;
    }
    if (linkInfo.manualUrl) {
        const href = resolveRelativeUrl(linkInfo.manualUrl);
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="product-part-manual-link"><b>${text}</b></a>`;
    }
    return `<b>${text}</b>`;
}

function cleanString(str) {
    if (!str) return '';
    return String(str).replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
}

export function renderPartNumberWithLinks(rawValue) {
    if (!rawValue || rawValue === '-' || rawValue === '←') {
        return rawValue || '';
    }

    const str = String(rawValue);

    // 1. 完全一致判定
    const trimmedStr = cleanString(str);
    const exactInfo = getProductLinkInfo(trimmedStr);
    if (exactInfo) {
        return buildLinkTag(trimmedStr, exactInfo);
    }

    // 2. 半角・全角スペース、スラッシュ、改行、カンマ、<br>タグ等で複数品番が並んでいる場合の個別判定
    const tokens = str.split(/([\s\u3000\/,]+|<br\s*\/?>)/gi);
    return tokens.map(token => {
        if (!token) return '';
        if (/^<br\s*\/?>$/i.test(token) || /^[\s\u3000\/,]+$/.test(token)) {
            return token;
        }

        const trimmed = cleanString(token);
        const info = getProductLinkInfo(trimmed);
        if (info) {
            return buildLinkTag(trimmed, info);
        }
        return token;
    }).join('');
}

export function createPriceCellHtml(item, column) {
    if (item[column.key] === '-' || item[column.key] === '←') {
        return item[column.key];
    }
    const value = item[column.key] || '';
    const valueHtml = renderPartNumberWithLinks(value);

    const priceExclTax = column.priceKeys?.excl ?
        `<span style="font-size: 0.9em;">税別: ${(item[column.priceKeys.excl] || '').replace('\\', '￥')}</span>` : '';
    const priceInclTax = column.priceKeys?.incl ?
        `<span style="font-size: 0.9em;">税込: ${(item[column.priceKeys.incl] || '').replace('\\', '￥')}</span>` : '';
    const navCtrl = column.option?.nav ?
        `<br><span style="font-size: 0.9em;">ナビ操作: ${(item[column.option.nav] || '-').replace('\\', '￥')}</span>` : '';
    const vehiclePos = column.option?.vehicle_pos ?
        `<br><span style="font-size: 0.9em;">自車位置: ${(item[column.option.vehicle_pos] || '-').replace('\\', '￥')}</span>` : '';
    const exclInput = column.option?.excl_input ?
        `<br><span style="font-size: 0.9em;">外部入力: ${(item[column.option.excl_input] || '-').replace('\\', '￥')}</span>` : '';
    const tv = column.option?.tv ?
        `<br><span style="font-size: 0.9em;">デジタルテレビ: ${(item[column.option.tv] || '-').replace('\\', '￥')}</span>` : '';
    const cd = column.option?.cd ?
        `<br><span style="font-size: 0.9em;">CD再生: ${(item[column.option.cd] || '-').replace('\\', '￥')}</span>` : '';
    const dvd = column.option?.dvd ?
        `<br><span style="font-size: 0.9em;">DVD視聴: ${(item[column.option.dvd] || '-').replace('\\', '￥')}</span>` : '';
    const rearDisplay = column.option?.rear ?
        `<br><span style="font-size: 0.9em;">リアモニター表示: ${(item[column.option.rear] || '-').replace('\\', '￥')}</span>` : '';

    return `${valueHtml}<br>${priceExclTax}<br>${priceInclTax}${navCtrl}${vehiclePos}${exclInput}${tv}${cd}${dvd}${rearDisplay}`;
}

export function createNotesCellHtml(item) {
    const notesString = item['notes'];
    if (!notesString) {
        return '';
    }

    const rawParts = notesString.replace(/[{}]/g, '').split(',').filter(p => p.trim() !== '');
    const processedParts = rawParts.map(part => {
        const partsInt = parseInt(part.trim(), 10);
        if (!isNaN(partsInt) && partsInt >= 900 && partsInt < 1000) {
            return `S${partsInt - 900}`;
        }
        return part.trim();
    });

    return processedParts.map(str => `※${str}`).join('<br>');
}

function generateTable(data, headerData, productName) {
    const selectedMaker = document.getElementById('maker-select')?.value;
    const table = document.querySelector('.result-table');
    if (!table) return;

    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');

    thead.innerHTML = '';
    tbody.innerHTML = '';

    const mainHeaderRow = document.createElement('tr');
    const emptyTh = document.createElement('th');
    emptyTh.textContent = '';
    mainHeaderRow.appendChild(emptyTh);

    headerData.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header.label;
        th.setAttribute('colspan', header.subHeaders.length);
        mainHeaderRow.appendChild(th);
    });
    thead.appendChild(mainHeaderRow);

    const subHeaderRow = document.createElement('tr');
    const checkboxTh = document.createElement('th');
    checkboxTh.textContent = '保存';
    checkboxTh.width = '10px';
    subHeaderRow.appendChild(checkboxTh);

    headerData.forEach(header => {
        header.subHeaders.forEach(subHeader => {
            const th = document.createElement('th');
            if (subHeader.label === 'nav_col_2') {
                if (selectedMaker === MAKER_HONDA) {
                    th.textContent = 'LEDスイッチ切替タイプ_2';
                } else {
                    th.textContent = 'サービスホールスイッチ切替タイプ';
                }
            } else {
                th.textContent = subHeader.label;
            }
            th.width = '80px';
            subHeaderRow.appendChild(th);
        });
    });
    thead.appendChild(subHeaderRow);

    const sortedData = data;
    const allColumns = headerData.flatMap(header => header.subHeaders);

    sortedData.forEach(item => {
        const row = document.createElement('tr');

        const checkTd = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'save-checkbox';
        const rowId = getRowUniqueId(item);
        checkbox.id = `checkbox-${rowId.replace(/[^a-zA-Z0-9-]/g, '_')}`;
        checkbox.dataset.rowId = rowId;
        checkbox.dataset.productName = productName;

        const savedData = getSavedItemsMap();
        checkbox.checked = !!(savedData[productName] && savedData[productName].items[rowId]);

        checkbox.addEventListener('change', handleCheckboxChange);
        checkTd.appendChild(checkbox);
        row.appendChild(checkTd);

        allColumns.forEach(col => {
            const td = document.createElement('td');
            if (col.priceKeys) {
                td.innerHTML = createPriceCellHtml(item, col);
            } else if (col.key === 'notes') {
                td.innerHTML = createNotesCellHtml(item);
            } else {
                td.innerHTML = (item[col.key] || '').replace(/\n/g, '<br>');
            }
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });
}

async function displayNotes(data, productName) {
    const notesContainer = document.getElementById('notes-list-container');
    if (!notesContainer) return;

    const noteMap = await initializeAndGetMapNotes();
    const noteSet = noteMap[productName] || {};

    const uniqueNotes = new Set();
    data.forEach(item => {
        if (item && item['notes']) {
            const notesString = item['notes'];
            const numbers = notesString.replace(/[{}]/g, '').split(',').filter(n => n.trim() !== '');
            numbers.forEach(num => uniqueNotes.add(num.trim()));
        }
    });

    const sortedNotes = Array.from(uniqueNotes).sort((a, b) => {
        const numA = parseInt(a, 10);
        const numB = parseInt(b, 10);
        if (isNaN(numA) || isNaN(numB)) {
            return a.localeCompare(b);
        }
        return numA - numB;
    });

    const noteItems = [];
    if (noteSet.common?.length > 0) {
        noteSet.common.forEach(text => {
            noteItems.push(`<li><span class="note-number">※共通</span><span class="note-text">：${text.replace(/\n/g, '<br>')}</span></li>`);
        });
    }

    if (sortedNotes.length > 0) {
        sortedNotes.forEach(numStr => {
            const num = parseInt(numStr, 10);
            let noteLabel = numStr;
            if (!isNaN(num) && num >= 900 && num < 1000) {
                noteLabel = `S${num - 900}`;
            }
            const noteText = noteSet[numStr];
            if (noteText) {
                noteItems.push(`<li><span class="note-number">※${noteLabel}</span><span class="note-text">：${noteText.replace(/\n/g, '<br>')}</span></li>`);
            }
        });
    }

    let notesHtml = '';
    if (noteItems.length > 0) {
        notesHtml = `<h3>注意事項</h3><ul class="compatibility-notes">${noteItems.join('')}</ul>`;
    }

    notesContainer.innerHTML = notesHtml;
    notesContainer.style.display = noteItems.length > 0 ? 'block' : 'none';
}