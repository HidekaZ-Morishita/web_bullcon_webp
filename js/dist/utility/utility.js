function loadHtml(tagId, url) { const container = document.getElementById(tagId); container.innerHTML = '<p>読み込み中...</p>'; fetch(url)
.then(response => { if (!response.ok) throw new Error('読み込み失敗'); return response.text(); })
.then(html => { container.innerHTML = html; })
.catch(err => { container.innerHTML = '<p>エラーが発生しました</p>'; console.error(err); }); }