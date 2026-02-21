var rule = {
    title: '麻豆传媒',
    host: 'https://madou.club',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
    timeout: 5000,

    classes: [
        { type_id: 'https://madou.club/category/%e9%ba%bb%e8%b1%86%e4%bc%a0%e5%aa%92', type_name: '麻豆传媒' },
        { type_id: 'https://madou.club/category/%e9%ba%bb%e8%b1%86%e7%95%aa%e5%a4%96%e7%af%87', type_name: '麻豆番外篇' },
        { type_id: 'https://madou.club/category/%e9%ba%bb%e8%b1%86%e8%8a%b1%e7%b5%ae', type_name: '麻豆花絮' },
        { type_id: 'https://madou.club/category/hongkongdoll', type_name: 'HongKongDoll' },
        { type_id: 'https://madou.club/category/91%e5%88%b6%e7%89%87%e5%8e%82', type_name: '91制片厂' },
        { type_id: 'https://madou.club/category/%e6%9e%9c%e5%86%bb%e4%bc%a0%e5%aa%92', type_name: '果冻传媒' },
        { type_id: 'https://madou.club/category/%e8%9c%9c%e6%a1%83%e5%bd%b1%e5%83%8f', type_name: '蜜桃影像' },
        { type_id: 'https://madou.club/category/%e5%a4%a9%e7%be%8e%e4%bc%a0%e5%aa%92', type_name: '天美传媒' },
        { type_id: 'https://madou.club/category/%e7%9a%87%e5%ae%b6%e5%8d%8e%e4%ba%ba', type_name: '皇家华人' },
        { type_id: 'https://madou.club/category/%e5%85%94%e5%ad%90%e5%85%88%e7%94%9f', type_name: '兔子先生' },
        { type_id: 'https://madou.club/category/%e6%98%9f%e7%a9%ba%e6%97%a0%e9%99%90%e4%bc%a0%e5%aa%92', type_name: '星空无限传媒' },
        { type_id: 'https://madou.club/category/%e5%a4%a7%e8%b1%a1%e4%bc%a0%e5%aa%92', type_name: '大象传媒' },
        { type_id: 'https://madou.club/category/%e7%b2%be%e4%b8%9c%e5%bd%b1%e4%b8%9a', type_name: '精东影业' },
        { type_id: 'https://madou.club/week', type_name: '7天热门' },
        { type_id: 'https://madou.club/month', type_name: '30天热门' },
        { type_id: 'https://madou.club/likes', type_name: '点赞排行' },
    ],

    列表: '.excerpts-wrapper article',
    列表_url: '/page/fypage',
    列表_id: 'a&&href',
    列表_img: 'img&&data-src',
    列表_name: 'h2&&Text',
    列表_remarks: '.post-view&&Text',

    搜索: '.excerpts-wrapper article',
    搜索_url: '/page/fypage?s=**',
    搜索_id: 'a&&href',
    搜索_img: 'img&&data-src',
    搜索_name: 'h2&&Text',

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