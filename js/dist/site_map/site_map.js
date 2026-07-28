const JSON_FILE_PATH = '../../html/products/products_data.json'; function renderSitemap(productCategories) { const container = document.getElementById('product-sitemap'); if (!container) return; let html = ''; productCategories.forEach(category => { let cardHtml = `
<div class="category-card">
<h3>${category.name}</h3>
<ul>
`; category.products.forEach(product => { cardHtml += `
<li><a href="${product.main_page.url}">${product.name}</a></li>
`; }); cardHtml += `
</ul>
</div>
`; html += cardHtml; }); container.innerHTML = html; } async function loadSitemapData() { try { const response = await fetch(JSON_FILE_PATH); if (!response.ok) { throw new Error(`Failed to fetch ${JSON_FILE_PATH}: ${response.statusText}`); } const productData = await response.json(); renderSitemap(productData.products_data.categories); } catch (error) { console.error('サイトマップデータの読み込み中にエラーが発生しました:', error); const container = document.getElementById('product-sitemap'); if(container) { container.innerHTML = '<p style="color: red;">製品情報を読み込めませんでした。</p>'; } } } document.addEventListener('DOMContentLoaded', loadSitemapData);