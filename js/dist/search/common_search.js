export function normalizeString(str) { if (!str) return ''; return String(str).replace(/[！-～]/g, function(s) { return String.fromCharCode(s.charCodeAt(0) - 0xFEE0); }).replace(/　/g, ' ')
.replace(/[ー‐‑‒–—―−-]/g, '')
.toLowerCase(); } export function setupSearch(options) { const { tabId, dataPath, filterLogic, onDataLoaded, isManualSearch = false} = options; const tabContent = document.getElementById(tabId); const form = tabContent.querySelector('.search-form'); const input = tabContent.querySelector(isManualSearch ? '#manual-search-input' : '#site-search-input'); const resultsList = tabContent.querySelector('.results-list'); const noResultsMessage = tabContent.querySelector('.no-results'); const urlParams = new URLSearchParams(window.location.search); const initialQuery = urlParams.get('q'); if (initialQuery && !isManualSearch) { input.value = initialQuery; } let searchData = null; fetch(dataPath)
.then(response => { if (!response.ok) { throw new Error('Network response was not ok'); } return response.json(); })
.then(data => { searchData = data; console.log(`LOG: Data loaded for ${tabId}.`); onDataLoaded(searchData, input, performSearch); if (initialQuery) { performSearch(initialQuery); } })
.catch(error => { console.error(`Error loading data for ${tabId}:`, error); }); const performSearch = (query) => { if (!searchData) { return; } const filteredResults = filterLogic(query, searchData); displayResults(filteredResults); }; const displayResults = (results) => { resultsList.innerHTML = ''; if (noResultsMessage) { noResultsMessage.style.display = 'none'; } if (results.length === 0) { if (noResultsMessage) { noResultsMessage.style.display = 'block'; } return; } results.forEach(item => { const li = document.createElement('li'); const link = document.createElement('a'); link.target = '_blank'; if (isManualSearch) { if (item.manual_url && item.manual_url.trim() !== '') { const absoluteUrl = new URL(item.manual_url, window.location.href).href; link.href = item.manual_url; link.innerHTML = `
<div class="result-product-name">${item.product_name}</div>
<div class="result-title">${item.product_code}　<img src="../../images/common/pdf_icon.webp"></div>
<div class="result-url">${absoluteUrl}</div>
`; } else { link.href = '../contact/contact.html'; link.innerHTML = `
<div class="result-product-name">${item.product_name}</div>
<div class="result-title">${item.product_code}</div>
<div class="result-url">該当製品の取扱説明書は公開されていません。お手数ですがお問い合わせフォームから問い合わせてください。<br><span style="color:red;">※クリックでお問い合わせページを開きます。</span></div>
`; } } else { const absoluteUrl = new URL(item.url, window.location.href).href; link.href = item.url; link.innerHTML = `
<div class="result-title">${item.title}</div>
<!-- <div class="result-description">${item.description}</div> -->
<div class="result-url">${absoluteUrl}</div>
`; } li.appendChild(link); resultsList.appendChild(li); }); }; form.addEventListener('submit', (event) => { event.preventDefault(); const query = input.value.trim(); if (query) { performSearch(query); } }); }