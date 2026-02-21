var rule = {
    title: '麻豆传媒',
    host: 'https://madou.club',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
    timeout: 5000,

    // 导航分类：从顶部菜单取，排除首页/热门标签/筛选
    class_parse: 'nav ul li a&&Text&&href&&*首页|*热门标签|*筛选|*其他原创',

    // 分类列表页，分页格式 /category/xxx/page/2
    列表: '.excerpts-wrapper article',
    列表_url: '/page/fypage',
    列表_id: 'a&&href',
    列表_img: 'img&&data-src',
    列表_name: 'h2&&Text',
    列表_remarks: '.post-view&&Text',

    // 搜索
    搜索: '.excerpts-wrapper article',
    搜索_url: '/page/fypage?s=**',
    搜索_id: 'a&&href',
    搜索_img: 'img&&data-src',
    搜索_name: 'h2&&Text',

    // 详情
    detail_find: 'body',
    detailObj: {
        vod_name: '.article-title&&Text',
        vod_pic: 'body > script&&Html&&shareimage\\s*:\\s*\'([^\']+)\'',
        type_name: '.article-tags a&&Text',
        vod_play_url: '',
    },

    play_parse: true,
    lazy: $js.toString(() => {
        var iframeEl = pdfa(html, 'body&&.article-content iframe');
        if (!iframeEl || iframeEl.length === 0) {
            return { 'msg': 'iframe未找到' };
        }
        var iframeSrc = pdfh(iframeEl[0], '&&src');
        if (!iframeSrc) {
            return { 'msg': 'iframe src为空' };
        }

        var dashHost = iframeSrc.match(/^(https?:\/\/[^\/]+)/)[1];

        var iframeResp = request(iframeSrc, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
                'Referer': 'https://madou.club/'
            }
        });

        if (!iframeResp) {
            return { 'msg': 'iframe请求失败' };
        }

        var scripts = pdfa(iframeResp, 'body&&script');
        var targetScript = '';
        for (var i = 0; i < scripts.length; i++) {
            var t = pdfh(scripts[i], '&&Html');
            if (t && t.indexOf('var token') !== -1 && t.indexOf('var m3u8') !== -1) {
                targetScript = t;
                break;
            }
        }

        if (!targetScript) {
            return { 'msg': 'script未找到token/m3u8' };
        }

        var tokenMatch = targetScript.match(/var token\s*=\s*['"]?([^'"\s;]+)/);
        var m3u8Match = targetScript.match(/var m3u8\s*=\s*['"]([^'"]+)['"]/);

        if (!tokenMatch || !m3u8Match) {
            return { 'msg': 'token或m3u8匹配失败' };
        }

        var token = tokenMatch[1].trim();
        var m3u8path = m3u8Match[1].trim();
        var playUrl = dashHost + m3u8path + '?token=' + token;

        return { 'parse': 0, 'url': playUrl };
    }),
};