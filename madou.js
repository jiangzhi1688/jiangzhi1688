var rule = {
    title: '麻豆传媒',
    host: 'https://madou.club',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
    timeout: 5000,

    class_parse: '.sitenav a&&Text&&href&&*首页|*其他|*热门标签|*筛选',

    // 列表页
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
        vod_pic: 'body > script:nth-child(1)&&Text&&shareimage\\s+:\\s+\'(.+)\'',
        type_name: '.article-tags&&Text',
        vod_play_url: '',
    },

    play_parse: true,
    lazy: $js.toString(() => {
        // 获取 iframe src
        var iframeSrc = pdfa(html, 'body&&.article-content iframe')[0];
        iframeSrc = pdfh(iframeSrc, '&&src');

        if (!iframeSrc) {
            return { 'msg': 'iframe not found' };
        }

        var dashHost = iframeSrc.match(/^(https?:\/\/[^\/]+)/)[1];

        // 请求 iframe 页面
        var iframeResp = request(iframeSrc, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
                'Referer': 'https://madou.club/'
            }
        });

        var scripts = pdfa(iframeResp, 'body&&script');
        var targetScript = '';
        for (var i = 0; i < scripts.length; i++) {
            var t = pdfh(scripts[i], '&&Text');
            if (t && t.indexOf('var token') !== -1 && t.indexOf('var m3u8') !== -1) {
                targetScript = t;
                break;
            }
        }

        if (!targetScript) {
            return { 'msg': 'script not found' };
        }

        var tokenMatch = targetScript.match(/var token\s*=\s*['"]?([^'";]+)['"]?/);
        var m3u8Match = targetScript.match(/var m3u8\s*=\s*['"]([^'"]+)['"]/);

        if (!tokenMatch || !m3u8Match) {
            return { 'msg': 'token or m3u8 not matched' };
        }

        var token = tokenMatch[1].trim();
        var m3u8 = m3u8Match[1].trim();

        var playUrl = dashHost + m3u8 + '?token=' + token;

        return { 'parse': 0, 'url': playUrl };
    }),
};
