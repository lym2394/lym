// html-loader.js - HTML文件检测与加载模块
const HTMLLoader = (function() {
    const TOTAL_FILES = 100;
    const CONCURRENCY = 10;
    const cache = new Map();
    
    function padIndex(i) {
        return i.toString().padStart(2, '0');
    }
    
    // 检测HTML文件是否存在并提取标题
    async function checkHTMLDocInfo(index) {
        const padded = padIndex(index);
        const url = `./html/${padded}.html`;
        
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (!response.ok) return null;
            
            const contentResponse = await fetch(url);
            const text = await contentResponse.text();
            
            // 提取<title>标签内容作为标题
            let title = null;
            const match = text.match(/<title>(.*?)<\/title>/i);
            if (match && match[1]) {
                title = match[1].trim();
            }
            
            if (!title) title = `${padded}.html`;
            
            return {
                title: title,
                filename: `${padded}.html`,
                url: url,
                exists: true
            };
        } catch (error) {
            console.warn(`无法访问 ${url}:`, error);
            return null;
        }
    }
    
    // 加载HTML文件列表
    async function loadHTMLDocList() {
        const results = [];
        
        // 分批并发请求
        for (let i = 0; i < TOTAL_FILES; i += CONCURRENCY) {
            const batch = [];
            for (let j = i; j < Math.min(i + CONCURRENCY, TOTAL_FILES); j++) {
                batch.push(checkHTMLDocInfo(j + 1));
            }
            const batchResults = await Promise.all(batch);
            results.push(...batchResults);
        }
        
        // 缓存结果
        results.forEach((docInfo, idx) => {
            if (docInfo && docInfo.exists) {
                const index = idx + 1;
                const key = 'html-' + padIndex(index);
                cache.set(key, docInfo);
            }
        });
        
        return results;
    }
    
    // 获取缓存的HTML文档信息
    function getHTMLDocInfo(index) {
        const key = 'html-' + padIndex(index);
        return cache.get(key) || null;
    }
    
    // 获取HTML文档内容（用于显示）
    async function getHTMLContent(index) {
        const key = 'html-' + padIndex(index);
        if (cache.has(key)) {
            return cache.get(key);
        }
        
        const docInfo = await checkHTMLDocInfo(index);
        if (docInfo && docInfo.exists) {
            cache.set(key, docInfo);
        }
        return docInfo;
    }
    
    return {
        loadHTMLDocList: loadHTMLDocList,
        getHTMLDocInfo: getHTMLDocInfo,
        getHTMLContent: getHTMLContent,
        padIndex: padIndex
    };
})();
