document.addEventListener('DOMContentLoaded', () => { const counterContainer = document.querySelector('.access-counter'); if (!counterContainer) return; counterContainer.innerHTML = `
<div class="counter-display">
<div class="counter-item total">
<span class="counter-label"></span>
<span id="counter-total" class="counter-num">---</span>
</div>
</div>
`; fetch('./api/web_page/counter.php')
.then(response => response.json())
.then(data => { document.getElementById('counter-total').textContent = data.total.toLocaleString(); })
.catch(error => { console.error('Counter error:', error); counterContainer.style.display = 'none'; }); });