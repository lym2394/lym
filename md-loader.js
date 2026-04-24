// md-loader.js - MD文件检测与加载模块
const MDLoader = (function() {
    const TOTAL_FILES = 100;
    const CONCURRENCY = 10;
    const cache = new Map();
    
    function padIndex(i) {
        return i.toString().padStart(2, '0');
    }
    
    // 检测MD文件是否存在并提取标题
    async function checkMDDocInfo(index) {
        const padded = padIndex(index);
        const url = `./md/${padded}.md`;
        
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (!response.ok) return null;
            
            const contentResponse = await fetch(url);
            const text = await contentResponse.text();
            
            // 提取一级标题
            let title = null;
            const match = text.match(/^#\s+(.*?)(?:\r?\n|$)/m);
            if (match && match[1]) {
                title = match[1].trim();
            }
            
            if (!title) title = `${padded}.md`;
            
            // 解析Markdown为HTML
            let html = '';
            if (typeof marked !== 'undefined') {
                html = marked.parse(text);
            } else {
                html = `<pre>${text}</pre>`;
            }
            
            return {
                title: title,
                html: html,
                filename: `${padded}.md`,
                exists: true
            };
        } catch (error) {
            console.warn(`无法访问 ${url}:`, error);
            return null;
        }
    }
    
    // 加载MD文件列表
    async function loadMDDocList() {
        const results = [];
        
        // 分批并发请求
        for (let i = 0; i < TOTAL_FILES; i += CONCURRENCY) {
            const batch = [];
            for (let j = i; j < Math.min(i + CONCURRENCY, TOTAL_FILES); j++) {
                batch.push(checkMDDocInfo(j + 1));
            }
            const batchResults = await Promise.all(batch);
            results.push(...batchResults);
        }
        
        // 缓存结果
        results.forEach((docInfo, idx) => {
            if (docInfo && docInfo.exists) {
                const index = idx + 1;
                const key = 'md-' + padIndex(index);
                cache.set(key, docInfo);
            }
        });
        
        return results;
    }
    
    // 获取缓存的MD文档信息
    function getMDDocInfo(index) {
        const key = 'md-' + padIndex(index);
        return cache.get(key) || null;
    }
    
    // 获取MD文档内容（用于显示）
    async function getMDContent(index) {
        const key = 'md-' + padIndex(index);
        if (cache.has(key)) {
            return cache.get(key);
        }
        
        const docInfo = await checkMDDocInfo(index);
        if (docInfo && docInfo.exists) {
            cache.set(key, docInfo);
        }
        return docInfo;
    }
    
    return {
        loadMDDocList: loadMDDocList,
        getMDDocInfo: getMDDocInfo,
        getMDContent: getMDContent,
        padIndex: padIndex
    };
})();
