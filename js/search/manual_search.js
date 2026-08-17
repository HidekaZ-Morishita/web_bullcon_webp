// search/manual-search.js

import { setupSearch, normalizeString } from './common_search.js';

export function initializeManualSearch() {
    if (document.getElementById('manual-search-autocomplete-list')) {
        return;
    }

    const searchInput = document.getElementById('manual-search-input');
    if (!searchInput) {
        console.error("ERROR: #manual-search-input要素が見つかりません。初期化を中止します。");
        return;
    }

    setupSearch({
        tabId: 'manual-search',
        dataPath: '../products/products_data.json',
        isManualSearch: true,
        filterLogic: (query, searchData) => {
            const keywords = normalizeString(query).split(/\s+/).filter(k => k.length > 0);
            if (keywords.length === 0) return [];

            let tempResults = [];
            const categories = searchData.products_data && Array.isArray(searchData.products_data.categories)
                ? searchData.products_data.categories
                : [];

            categories.forEach(category => {
                const products = Array.isArray(category.products) ? category.products : [];
                products.forEach(item => {
                    const itemName = normalizeString(item.name);
                    if (item.sub_pages) {
                        item.sub_pages.forEach(sub_page => {
                            const subName = normalizeString(sub_page.name);

                            // すべてのキーワードが商品名またはサブページ名に含まれているか（AND検索）
                            const isMatch = keywords.every(word =>
                                itemName.includes(word) || subName.includes(word)
                            );

                            if (isMatch) {
                                tempResults.push({
                                    name: sub_page.name,
                                    manual_url: sub_page.manual_url || '',
                                    product_name: item.name,
                                    product_code: sub_page.name,
                                    url: item.url || sub_page.url || ''
                                });
                            }
                        });
                    }
                });
            });
            return tempResults;
        },
        onDataLoaded: (searchData, searchInput, performSearch) => {
            const autocompleteList = document.createElement('div');
            autocompleteList.setAttribute('id', `manual-search-autocomplete-list`);
            autocompleteList.classList.add('autocomplete-items');

            searchInput.insertAdjacentElement('afterend', autocompleteList);

            searchInput.addEventListener('input', function () {
                const query = this.value;
                if (!query) {
                    autocompleteList.innerHTML = '';
                    return;
                }

                let filteredSuggestions = [];
                const searchKeywords = normalizeString(query).split(/\s+/).filter(k => k.length > 0);
                if (searchKeywords.length === 0) {
                    autocompleteList.innerHTML = '';
                    return;
                }

                const categories = searchData.products_data && Array.isArray(searchData.products_data.categories)
                    ? searchData.products_data.categories
                    : [];

                categories.forEach(category => {
                    const products = Array.isArray(category.products) ? category.products : [];
                    products.forEach(item => {
                        const itemName = normalizeString(item.name);
                        if (item.sub_pages) {
                            item.sub_pages.forEach(sub_page => {
                                const subName = normalizeString(sub_page.name);
                                const isMatch = searchKeywords.every(word =>
                                    itemName.includes(word) || subName.includes(word)
                                );

                                if (isMatch && (sub_page.manual_url || item.url)) {
                                    filteredSuggestions.push(sub_page.name);
                                }
                            });
                        }
                    });
                });

                if (filteredSuggestions.length === 0) {
                    autocompleteList.innerHTML = '';
                    return;
                }

                autocompleteList.innerHTML = '';
                filteredSuggestions.forEach(item => {
                    const b = document.createElement("div");
                    const charsForRegex = normalizeString(query).replace(/\s+/g, '').split('');
                    if (charsForRegex.length > 0) {
                        const escapedChars = charsForRegex.map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
                        const regexPattern = escapedChars.join('[ー‐‑‒–—―−\\s-]*');
                        const regex = new RegExp(regexPattern, 'i');
                        const match = item.match(regex);
                        if (match) {
                            const index = match.index;
                            const matchLength = match[0].length;
                            b.innerHTML = item.substr(0, index);
                            b.innerHTML += "<strong>" + item.substr(index, matchLength) + "</strong>";
                            b.innerHTML += item.substr(index + matchLength);
                        } else {
                            b.innerHTML = item;
                        }
                    } else {
                        b.innerHTML = item;
                    }
                    b.innerHTML += `<input type='hidden' value='${item}'>`;
                    b.addEventListener("click", () => {
                        searchInput.value = item;
                        closeAllLists();
                        performSearch(searchInput.value);
                    });
                    autocompleteList.appendChild(b);
                });
            });

            function closeAllLists(elmnt) {
                const x = document.getElementsByClassName("autocomplete-items");
                for (let i = 0; i < x.length; i++) {
                    if (elmnt != x[i] && elmnt != searchInput) {
                        if (x[i].parentNode) {
                            x[i].innerHTML = '';
                        }
                    }
                }
            }
            document.addEventListener("click", (e) => closeAllLists(e.target));
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const manualTabButton = document.querySelector('[data-tab="manual-search"]');

    if (manualTabButton) {
        manualTabButton.addEventListener('click', () => {
            initializeManualSearch();
        });
    }
});