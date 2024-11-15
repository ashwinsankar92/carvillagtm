var _bsaPRO_loaded = false;

function _bsaPRO() {
    if (_bsaPRO_loaded) return;
    _bsaPRO_loaded = true;
    var apiurl = '//srv.buysellads.com';
    var writescript = null,
        scripts = 0;

    function doc_write(write) {
        flushWrite(writescript, write, true)
    }

    function flushWrite(which, data, incremental) {
        var id = 'write_' + which.id,
            writer = document.getElementById(id);
        if (!writer && data.length) writer = which.parentNode.insertBefore(document.createElement('div'), which);
        if (writer) {
            writer.id = id;
            writer.className = 'document_write';
            setInnerHtmlAndExec(writer, data, incremental)
        }
    }
    var scriptqueue = [];

    function stepQueue(which) {
        if (scriptqueue.length > 0 && scriptqueue[0].which == which && !scriptqueue[0].run) scriptqueue.shift();
        runQueue()
    }

    function runQueue() {
        if (scriptqueue.length > 0 && scriptqueue[0].run) {
            var func = scriptqueue[0].run;
            scriptqueue[0].run = null;
            func()
        }
    }

    function scriptLoaded(script) {
        flushWrite(script, '', false);
        stepQueue(script._bsapauto)
    }
    var setwrite = false;

    function gotScript(sc) {
        if (!setwrite && !(sc.hasAttribute("data-capture-write") && sc.getAttribute("data-capture-write") == "false")) {
            document.write = function(x) {
                doc_write(x)
            };
            document.writeln = function(x) {
                doc_write(x + '\n')
            };
            setwrite = true
        }
        scripts++;
        var id = 'auto_' + scripts;
        scriptqueue.push({
            which: id,
            run: (function(id, sc) {
                return function() {
                    var data = sc.text || sc.textContent || sc.innerHTML;
                    writescript = sc.parentNode.insertBefore(document.createElement('script'), sc);
                    writescript.type = 'text/javascript';
                    writescript.async = false;
                    writescript.id = sc.id || id;
                    writescript.className = 'ignoreme';
                    writescript._bsapauto = id;
                    var myload = (function(loadscript) {
                        return function() {
                            loadscript.onload = loadscript.onreadystatechange = null;
                            scriptLoaded(loadscript)
                        }
                    })(writescript);
                    writescript.onload = function() {
                        myload()
                    };
                    writescript.onreadystatechange = function() {
                        if (this.readyState == 'loaded' || this.readyState == 'complete') myload()
                    };
                    if (sc.src) writescript.src = sc.src;
                    else {
                        try {
                            writescript.appendChild(document.createTextNode(data))
                        } catch (e) {
                            writescript.text = data
                        }
                        myload()
                    }
                    sc.parentNode.removeChild(sc)
                }
            })(id, sc)
        });
        if (scriptqueue.length == 1) runQueue()
    }

    function findScripts(t) {
        for (var i = 0; i < t.childNodes.length; i++) t.childNodes[i].nodeName.toLowerCase() == 'script' && t.childNodes[i].className != 'ignoreme' && (!t.childNodes[i].type || t.childNodes[i].type.indexOf('script') != -1) ? gotScript(t.childNodes[i]) : findScripts(t.childNodes[i])
    }
    var htmls = {};

    function isValidHtml(html) {
        var started = 0,
            smallstr = false,
            bigstr = false,
            tags = {},
            tagnames = 'a|abbr|acronym|address|applet|article|aside|audio|b|bdi|bdo|big|blockquote|body|button|canvas|caption|center|cite|code|colgroup|command|datalist|dd|del|details|dfn|dialog|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frameset|head|header|hgroup|h1|h2|h3|h4|h5|h6|html|i|iframe|ins|kbd|keygen|label|legend|li|map|mark|menu|meter|nav|noframes|noscript|object|ol|optgroup|output|p|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video'.split('|'),
            tagnames = ['script', 'div', 'span'],
            temp = null;
        for (var i = 0; i < html.length; i++) {
            var ch = html[i];
            if (ch == '"') {
                bigstr = !bigstr
            } else if (ch == '\'') {
                smallstr = !smallstr
            } else if (smallstr || bigstr) {} else if (ch == '<') {
                started++;
                temp = ''
            } else if (started > 0 && (ch == ' ' || ch == '>')) {
                if (temp !== null) {
                    var tag = temp,
                        close = tag[0] == '/';
                    if (close) tag = tag.substring(1);
                    temp = null;
                    if (arrayIndexOf(tagnames, tag) != -1) {
                        if (!tags[tag]) tags[tag] = 0;
                        tags[tag] += (close ? -1 : 1)
                    }
                }
                if (ch == '>') started--
            } else if (started > 0) {
                if (temp !== null) {
                    temp += ch
                }
            }
        }
        if (started > 0) {
            return false
        }
        for (var i = 0; i < tagnames.length; i++) {
            if (typeof(tags[tagnames[i]]) == 'number' && tags[tagnames[i]] != 0) {
                return false
            }
        }
        return true
    }

    function setInnerHtmlAndExec(el, html, incremental) {
        if (!htmls[el.id]) htmls[el.id] = '';
        if (html.length) htmls[el.id] += html;
        if (isValidHtml(htmls[el.id]) || !incremental) {
            var temp = document.createElement('div');
            temp.innerHTML = htmls[el.id];
            htmls[el.id] = '';
            while (temp.childNodes.length > 0) el.appendChild(temp.childNodes[0])
        }
        if (!incremental) findScripts(el)
    }

    function arrayIndexOf(arr, w) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] && arr[i] === w) {
                return i
            }
        }
        return -1
    }
    window['_bsap_serving_callback'] = function(banner, zone, freqcap) {
        var append = function(w, data, days) {
            var c = document.cookie,
                i = c.indexOf(w + '='),
                existing = i >= 0 ? c.substring(i + w.length + 1).split(';')[0] + ',' : '',
                d = new Date();
            d.setTime(days * 3600000 + d);
            data = existing + data;
            data = data.substring(0, 2048);
            document.cookie = w + '=' + data + '; expires=' + d.toGMTString() + '; path=\/'
        };
        if (freqcap) {
            append('_bsap_daycap', banner, 1);
            append('_bsap_lifecap', banner, 365)
        }
    };
    for (var zones = [], zonesegments = {}, cl = function(cl) {
            for (var n = !!document.getElementsByClassName, ret = [], els = n ? document.getElementsByClassName(cl) : document.getElementsByTagName('*'), p = n ? false : new RegExp('(^|\\s)' + cl + '(\\s|$)'), i = 0; i < els.length; i++)
                if (!p || p.test(els[i].className)) ret.push(els[i]);
            return ret
        }, bs = cl('bsaPROrocks'), segments = [], seg, zoneid, id, p = /bsap_([a-f0-9]+)/i, i = 0; i < bs.length && (zoneid = bs[i].getAttribute('data-serve')) && (bs[i].className = bs[i].className.replace(/\bbsaPROrocks\b/, 'bsap')); i++) {
        if (window['bsa_' + zoneid]) continue;
        seg = [];
        for (var k = 0; k < bs[i].attributes.length; k++) {
            if (bs[i].attributes[k].name.substring(0, 12) == 'data-segment') {
                var segkey = bs[i].attributes[k].name.substring(13),
                    vals = bs[i].attributes[k].value.split(';');
                for (var valsi = 0; valsi < vals.length; valsi++) seg.push([segkey, vals[valsi]])
            }
        }
        segments.push([zoneid, seg]);
        window['bsa_' + zoneid] = (function(el, zoneid) {
            return function(html) {
                setInnerHtmlAndExec(el, html);
                var as = el.getElementsByTagName('a');
                for (var ai = 0; as && ai < as.length; ai++) {
                    if (as[ai] && zonesegments[zoneid]) {
                        as[ai].href = as[ai].href + '?segment=' + zonesegments[zoneid]
                    }
                }
                window['bsa_' + zoneid] = function() {}
            }
        })(bs[i], zoneid);
        zones.push(zoneid)
    }
    var nostats = window.location.href.match(/bsaprostats=no/),
        force = window.location.href.match(/bsaproforce=([0-9]+)/),
        ignore = window.location.href.match(/bsaproignore=([0-9]+)/),
        ignoretarg = window.location.href.match(/bsaproignoretargeting/),
        maxp = window.location.href.match(/bsapromaxp=([0-9]+)/),
        preview = window.location.href.match(/preview=([A-Z0-9]+)/);
    if (zones.length) {
        var c = document.createElement('script'),
            d = new Date();
        d.setMinutes(0);
        d.setSeconds(0);
        d.setMilliseconds(0);
        c.type = 'text\/javascript';
        c.id = '_bsaPRO_js';
        var url = apiurl + '/ads/get/ids/' + zones.join(';') + '/?r=' + d.getTime();
        if (force) url += '&forcebanner=' + force[1];
        else if (window['_bsap_forcebanner']) url += '&forcebanner=' + window['_bsap_forcebanner'];
        if (ignore) url += '&ignorebanner=' + ignore[1];
        else if (window['_bsap_ignorebanner']) url += '&ignorebanner=' + window['_bsap_ignorebanner'];
        if (ignoretarg) url += '&ignoretargeting=yes';
        else if (window['_bsap_ignoretargeting']) url += '&ignorebanner=yes';
        if (maxp) url += '&maxpriority=' + maxp[1];
        else if (window['_bsap_maxpriority']) url += '&maxpriority=' + window['_bsap_maxpriority'];
        if (nostats) url += '&ignore=yes';
        if (preview) segments.push([preview[1],
            [
                ['SEGMENT', 'previewonly']
            ]
        ]);
        for (k = 0; k < segments.length; k++) {
            seg = [];
            for (var j = 0; j < segments[k][1].length; j++) seg.push(segments[k][1][j][0] + ':' + segments[k][1][j][1]);
            zonesegments[segments[k][0]] = seg.join(';');
            if (seg.length) url += '&segment_' + segments[k][0] + '=' + seg.join(';')
        }
    }
    var ck = document.cookie,
        day = ck.indexOf('_bsap_daycap='),
        life = ck.indexOf('_bsap_lifecap=');
    day = day >= 0 ? ck.substring(day + 12 + 1).split(';')[0].split(',') : [];
    life = life >= 0 ? ck.substring(life + 13 + 1).split(';')[0].split(',') : [];
    if (day.length || life.length) {
        var freqcap = [];
        for (var i = 0; i < day.length; i++) {
            var adspot = day[i];
            for (var found = -1, find = 0; find < freqcap.length && found == -1; find++)
                if (freqcap[find][0] == adspot) found = find;
            if (found == -1) freqcap.push([adspot, 1, 0]);
            else freqcap[found][1]++
        }
        for (var i = 0; i < life.length; i++) {
            var adspot = day[i];
            for (var found = -1, find = 0; find < freqcap.length && found == -1; find++)
                if (freqcap[find][0] == adspot) found = find;
            if (found == -1) freqcap.push([adspot, 0, 1]);
            else freqcap[found][2]++
        }
        for (var i = 0; i < freqcap.length; i++) freqcap[i] = freqcap[i][0] + ':' + freqcap[i][1] + ',' + freqcap[i][2];
        if (freqcap.length) url += '&freqcap=' + encodeURIComponent(freqcap.join(';'))
    }
    c.src = url;
    c.setAttribute('async', 'async');
    document.getElementsByTagName('head')[0].appendChild(c)
}
if (document.addEventListener) document.addEventListener('DOMContentLoaded', function() {
    _bsaPRO()
}, false);
else if ((/msie/.test(navigator.userAgent.toLowerCase())) && window == top) {
    (function() {
        try {
            document.documentElement.doScroll('left')
        } catch (error) {
            setTimeout(arguments.callee, 0);
            return
        }
        _bsaPRO()
    })();
    window.document.onreadystatechange = function() {
        if (window.document.readyState == 'complete') {
            window.document.onreadystatechange = null;
            _bsaPRO()
        }
    }
}
oldproonload = window.onload;
window.onload = function() {
    _bsaPRO();
    if (oldproonload) oldproonload()
};