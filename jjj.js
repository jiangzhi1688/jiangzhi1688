var rule = {
    title: '麻豆传媒',
    host: 'https://madou.club',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
    },
    timeout: 5000,

    class_name: '麻豆传媒&麻豆番外篇&麻豆花絮&HongKongDoll&91制片厂&果冻传媒&蜜桃影像&天美传媒&皇家华人&兔子先生&星空无限&大象传媒&精东影业&7天热门&30天热门&点赞排行',
    class_url: 'category/%e9%ba%bb%e8%b1%86%e4%bc%a0%e5%aa%92&category/%e9%ba%bb%e8%b1%86%e7%95%aa%e5%a4%96%e7%af%87&category/%e9%ba%bb%e8%b1%86%e8%8a%b1%e7%b5%ae&category/hongkongdoll&category/91%e5%88%b6%e7%89%87%e5%8e%82&category/%e6%9e%9c%e5%86%bb%e4%bc%a0%e5%aa%92&category/%e8%9c%9c%e6%a1%83%e5%bd%b1%e5%83%8f&category/%e5%a4%a9%e7%be%8e%e4%bc%a0%e5%aa%92&category/%e7%9a%87%e5%ae%b6%e5%8d%8e%e4%ba%ba&category/%e5%85%94%e5%ad%90%e5%85%88%e7%94%9f&category/%e6%98%9f%e7%a9%ba%e6%97%a0%e9%99%90%e4%bc%a0%e5%aa%92&category/%e5%a4%a7%e8%b1%a1%e4%bc%a0%e5%aa%92&category/%e7%b2%be%e4%b8%9c%e5%bd%b1%e4%b8%9a&week&month&likes',

    url: '/fyclass/page/fypage[/fyclass/]',
    searchUrl: '/page/fypage?s=**',
    searchable: 1,
    quickSearch: 1,

    一级: '.excerpts-wrapper article;h2&&Text;img&&data-src;.post-view&&Text;a&&href',
    搜索: '.excerpts-wrapper article;h2&&Text;img&&data-src;;a&&href',
    二级: '*',

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