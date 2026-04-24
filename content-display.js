// content-display.js - 内容展示模块
const ContentDisplay = (function() {
    const contentBody = document.getElementById('contentBody');
    const currentDocTitle = document.getElementById('currentDocTitle');
    const docBadge = document.getElementById('docBadge');
    
    // 显示加载状态
    function showLoading() {
        contentBody.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
            </div>`;
        currentDocTitle.textContent = '加载中...';
        docBadge.style.display = 'none';
    }
    
    // 显示欢迎消息
    function showWelcome(category) {
        const title = category === 'md' ? '站内文档' : '站内网站';
        contentBody.innerHTML = `
            <div class="welcome-message">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 4h16v16H4z"/>
                    <path d="M8 8h8M8 12h8M8 16h5"/>
                </svg>
                <h3>${title}</h3>
                <p>点击左侧文件加载内容</p>
            </div>`;
        currentDocTitle.textContent = '选择导航文件';
        docBadge.style.display = 'none';
    }
    
    // 显示错误消息
    function showError(filename) {
        contentBody.innerHTML = `
            <div class="welcome-message">
                <h3>无法加载文件</h3>
                <p>${filename || '文件'} 可能已被移除或无法访问</p>
            </div>`;
        currentDocTitle.textContent = '选择导航文件';
        docBadge.style.display = 'none';
    }
    
    // 显示Markdown文档
    function displayMDDoc(docInfo) {
        currentDocTitle.textContent = docInfo.title;
        docBadge.textContent = docInfo.filename;
        docBadge.style.display = 'inline-block';
        
        contentBody.innerHTML = `<div class="markdown-body">${docInfo.html}</div>`;
        
        // 代码高亮
        if (typeof hljs !== 'undefined') {
            contentBody.querySelectorAll('pre code').forEach(block => {
                if (!block.classList.contains('hljs')) {
                    hljs.highlightElement(block);
                }
            });
        }
    }
    
    // 显示HTML文档（使用iframe）
    function displayHTMLDoc(docInfo) {
        currentDocTitle.textContent = docInfo.title;
        docBadge.textContent = docInfo.filename;
        docBadge.style.display = 'inline-block';
        
        contentBody.innerHTML = `
            <div class="iframe-container">
                <iframe src="./html/${docInfo.filename}" 
                        sandbox="allow-same-origin allow-scripts" 
                        title="${docInfo.title}">
                </iframe>
            </div>`;
    }
    
    // 创建文档列表项（左侧标题显示）
    function createDocItem(index, docInfo, category, onClickCallback) {
        const div = document.createElement('div');
        div.className = 'doc-item';
        div.dataset.index = index;
        div.dataset.cat = category;
        
        const displayTitle = docInfo.title.length > 30 ? 
            docInfo.title.slice(0, 28) + '…' : docInfo.title;
        
        div.innerHTML = `
            <svg class="doc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16v16H4z"/>
                <path d="M8 8h8M8 12h8M8 16h5"/>
            </svg>
            <div class="doc-info">
                <div class="doc-title">${escapeHtml(displayTitle)}</div>
                <div class="doc-filename">${docInfo.filename}</div>
            </div>
        `;
        
        div.addEventListener('click', () => {
            if (onClickCallback) onClickCallback(index, category);
        });
        
        return div;
    }
    
    // HTML转义
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    return {
        showLoading: showLoading,
        showWelcome: showWelcome,
        showError: showError,
        displayMDDoc: displayMDDoc,
        displayHTMLDoc: displayHTMLDoc,
        createDocItem: createDocItem
    };
})();
