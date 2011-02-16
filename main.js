/*global $, clearInterval, setTimeout, setInterval, namespace, jQuery, window, document, Modernizr */
namespace.lookup('com.pageforest.flipper').defineOnce(function (ns) {
    var clientLib = namespace.lookup('com.pageforest.client'),
        letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        chars = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
        numbers = "0123456789",
        playloop,
        wwidth,
        boxW,
        boxH,
        psdelay = 5000,
        loopcount = 0,
        cols = 21,
        rows = 5,
        page = 0,
        curr = 0,
        prv = 1,
        loop = false,
        strloop = [],
        newpage = /\n-{3,}\n/m;

    function buildBox(c, r) {
        var i, j,
            $cboxa = $("<div id='1' class='spn top'></div >"),
            $cboxc = $("<div id='3' class='spn bottom'></div >"),
            $box = $("<div/>", { "class": "box" })
            .height(boxH)
            .width(boxW)
            .append($cboxa.clone(), $cboxc.clone()),
            $rdiv = $("<div/>", { "class": "rdiv" });
        for (j = 0; j < c; j = j + 1) {
            $rdiv.append($box.clone().attr('id', "c_" + j));
        }
        for (i = 0; i < r; i = i + 1) {
            $("#display").append($rdiv.clone().attr('id', "r_" + i));
        }
    }

    function onReady() {
        $.fn.textfill = function (options) {
            var fontSize = options.maxFontPixels,
                ourText = $('div', this),
                maxHeight = $(this).height(),
                maxWidth = $(this).width(),
                textHeight,
                textWidth;
            do {
                ourText.css('font-size', fontSize);
                textHeight = ourText.height();
                textWidth = ourText.width();
                fontSize = fontSize - 1;
            } while (textHeight > maxHeight || (textWidth > maxWidth && fontSize > 3));
            return this;
        };

        Array.prototype.clean = function () {
            while ($.trim(this[this.length - 1]) === '' && this.length) {
                this.splice(this.length - 1, 1);
            }
            return this;
        };

        if (!Modernizr.csstransforms || !Modernizr.csstransitions) {
            $("#warning").show();
        }

        wwidth = $('#main').width();
        wwidth = (wwidth) ? wwidth : $(window).width();
        boxW = Math.floor((wwidth - 20) / cols - 4);
        boxH = boxW * 1.25;
        buildBox(cols, rows);
        $('#input').focus();
        ns.client = new clientLib.Client(ns);
        if (document.getElementById('title')) {
            ns.client.addAppBar();
        }

        var $da = $('#da'), $db = $('#db'),
            $cboxa = $("<div class='dv up'><div class='text'><span></span></div></div>" +
                       "<div class='dv down sdown'><div class='text'><span></span></div></div>")
            .height(boxH / 2)
            .width(boxW)
            .css("line-height", (boxH - 4) + "px"),
            $cboxb = $("<div class='dv up'><div class='text'><span></span></div></div>" +
                   "<div class='dv down'><div class='text'><span></span></div></div>")
            .height(boxH / 2)
            .width(boxW)
            .css("line-height", (boxH - 4) + "px");

        // resize font based on bounding box size
        $("div.box > div").text('W');
        $("div.box").textfill({ maxFontPixels: 72 });
        $("div.box > div").html($cboxb.clone());
        $("div.box > div:not(#3)").html($cboxa.clone());

        // resize textarea and title width
        $('#display, #input, #title, #nav, #form').width($("#display").width());
        $('#stop').hide();

        if (window.location.hash !==  '') {
            $('#input').val('');
        } else {
            if ($('#input').val()) {
                ns.play();
            }
        }

        $db.unbind().bind("webkitTransitionEnd transitionend", function () {
            var $tmp = $('div.tmp');

            $tmp.each(function (a, b) {
                var loopthis = $.data(b, 'data').loop,
                    ctr = $.data(b, 'data').start;
                $(this).find("div#3 > div.down > div.text > span").text(loopthis.charAt(ctr));
            });

            $('div.animate > div#1 > div.down').removeClass('scaleb');
            $tmp.removeClass('tmp animate');
            $db.removeClass('sa');

            if (!$('div.loop').length) {
                if (loop) {
                    playloop = setTimeout(function () {
                        ns.fwdPage();
                    }, psdelay);
                }
                return;
            }

            $('div.animate').each(function (a, b) {
                var $that = $(this),
                    loopthis = $.data(b, 'data').loop,
                    ctr = $.data(b, 'data').start,
                    $d3 = $that.children('div#3');
                $d3.find("div.up > div.text > span").text(loopthis.charAt(ctr));
                $d3.find("div.down > div.text > span").text(loopthis.charAt(ctr - 1));
            });

            $da.addClass('sa');
            $('div.skip').removeClass('skip');
            $('div.loop > div#1 > div.up').addClass('scalea');
        });

        $da.unbind().bind("webkitTransitionEnd transitionend", function () {
            $da.removeClass('sa');
            if (!$('div.loop').length) {
                return;
            }
            $('div.loop:not(.skip)').addClass('animate').each(function (a, b) {
                var $that = $(this),
                    loopthis = $.data(b, 'data').loop,
                    ctr = $.data(b, 'data').start,
                    $above = $that.children('div#1');
                $above.find("div.up > div.text > span, div.down > div.text > span").text(loopthis.charAt(ctr));
                if (ctr === $.data(b, 'data').end) {
                    $that.removeClass('loop').addClass('tmp');
                } else {
                    ctr = ctr + 1;
                    if (ctr > loopthis.length) {
                        ctr = 0;
                    }
                    $.data(b, 'data').start = ctr;
                }
            });
            $('div.skip').removeClass('skip');
            $('div.animate > div#1 > div.down').addClass('scaleb');
            $('div.box > div#1 > div.up').removeClass('scalea');
            $db.addClass('sa');
        });

    }

    function getIndex(a, b) {
        var stype, etype, tmpStart, tmpEnd, loopthis;
        if (a !== ' ') {
            stype = letters;
            tmpStart = stype.indexOf(a);
            if (tmpStart < 0) {
                stype = numbers;
                tmpStart = numbers.indexOf(a);
            }
            if (tmpStart < 0) {
                stype = chars;
                tmpStart = chars.indexOf(a);
            }
        }
        if (b !== ' ') {
            etype = letters;
            tmpEnd = etype.indexOf(b);
            if (tmpEnd < 0) {
                etype = numbers;
                tmpEnd = numbers.indexOf(b);
            }
            if (tmpEnd < 0) {
                etype = chars;
                tmpEnd = chars.indexOf(b);
            }
            if (a === ' ') {
                stype = etype;
                tmpStart = 0;
            }
        } else {
            etype = stype += ' ';
            tmpEnd = etype.indexOf(b);
        }

        if (stype !== etype) {
            loopthis = stype + " " + etype;
            tmpEnd = tmpEnd + stype.length + 1;
        } else {
            loopthis = etype;
        }

        if (a === b && a === ' ') {
            loopthis = " ";
            tmpStart = tmpEnd = 0;
        }
        return {
            tmpStart : tmpStart,
            tmpEnd : tmpEnd,
            loopthis : loopthis
        };
    }

    function loopThroughNoAnimation(a, b, box, c) {
        var tmpStart, tmpEnd, loopthis, a1, c2, index;
        a1 = box.find("div#1 > div.up > div.text > span");
        c2 = box.find("div#3 > div.down > div.text > span");

        index = getIndex(a, b);
        tmpStart = index.tmpStart;
        tmpEnd = index.tmpEnd;
        loopthis = index.loopthis;

        if (strloop[c] !== 0 && strloop[c] !== undefined) {
            clearInterval(strloop[c]);
            strloop[c] = 0;
            loopcount = loopcount - 1;
        }
        loopcount = loopcount + 1;
        strloop[c] = setInterval(function () {
            a1.text(loopthis.charAt(tmpStart));
            c2.text(loopthis.charAt(tmpStart));
            tmpStart = tmpStart + 1;
            if (tmpStart === tmpEnd + 1) {
                clearInterval(strloop[c]);
                strloop[c] = 0;
                loopcount = loopcount - 1;
                if (loopcount === 0 && loop) {
                    playloop = setTimeout(function () {
                        ns.fwdPage();
                    }, psdelay);
                }
            }
            if (tmpStart > loopthis.length - 1) {
                tmpStart = 0;
            }
        }, 500);
    }

    function displayText(text, r, c) {
        var a, b, j, $box, index, tmpStart, tmpEnd, loopthis, len;

        for (j = 0, len = text.length; j < len; j = j + 1) {
            $box = $("#display").children("#r_" + r).children("#c_" + c);
            a = $.trim($box.find('div#1 > div.up > div.text > span').text()).toUpperCase();
            b = text[j].toUpperCase();
            a = (a === '') ? ' ' : a;

            if ($.trim(b) !== '') {
                $box.removeClass("page_" + prv).addClass("page_" + curr);
                if (a !== b) {
                    if (!Modernizr.csstransforms || !Modernizr.csstransitions) {
                        loopThroughNoAnimation(a, b, $box, r * cols + c);
                    } else {
                        $box.addClass('loop');
                    }
                }
            }
            index = getIndex(a, b);
            tmpStart = index.tmpStart;
            tmpEnd = index.tmpEnd;
            loopthis = index.loopthis;
            $box.data('data', { 'start': tmpStart, 'end': tmpEnd, 'loop': loopthis });
            c = c + 1;
        }
    }

    function clearPage(flag) {
        var $box, a, tmpStart, tmpEnd, index, loopthis, s, d,
            bool = $('div#da, div#db').hasClass('sa'),
            support = !Modernizr.csstransforms || !Modernizr.csstransitions;

        $("div.page_" + flag).each(function () {
            $box = $(this);
            a = $.trim($box.find('div#1 > div.up > div.text > span').text()).toUpperCase();
            $box.removeClass("page_" + flag);
            if (support) {
                d = $box.attr('id').split('_')[1];
                s = $box.parent().attr('id').split('_')[1];
                loopThroughNoAnimation(a, ' ', $box, parseInt(s, 10) * cols + parseInt(d, 10));
            } else {
                $box.addClass('loop');
                index = getIndex(a, ' ');
                tmpStart = index.tmpStart;
                tmpEnd = index.tmpEnd;
                loopthis = index.loopthis;
                $box.data('data', { 'start': tmpStart, 'end': tmpEnd, 'loop': loopthis });
            }
        });

        $('div.loop').each(function (a, b) {
            var $that = $(this),
                loopthis = $.data(b, 'data').loop,
                ctr = $.data(b, 'data').start;
            if ($.trim($that.find("div#1 > div.up > div.text > span").text())) {
                ctr = ctr + 1;
                if (ctr > loopthis.length) {
                    ctr = 0;
                }
            }
            $that.find('div#3 > div.up > div.text > span').text(loopthis.charAt(ctr));
            $.data(b, 'data').start = ctr;
        });
        $('div.loop.skip').removeClass('skip');
        $('div.loop:not(.animate)').addClass('skip');
        if (!bool) {
            $('div#da').addClass('sa');
        }
    }

    function clipText(text) {
        var strl = text.length;
        if (strl % 2) {
            return text.substr(Math.ceil(strl / 2) - Math.ceil(cols / 2), cols);
        } else {
            return text.substr(strl / 2 - Math.floor(cols / 2), cols);
        }
    }

    function resetAll() {
        $("#pageof").hide();
        $("#input").text('');
        clearPage(curr);
        ns.client.setDirty(false);
        clearInterval(playloop);
        page = 0;
        $("#stop").hide(1, function () {
            $("#play").show();
        });
    }

    function displayPage(text) {
        curr = (curr) ? 0 : 1;
        prv = (prv) ? 0 : 1;
        if (!text) {
            resetAll();
            return;
        }
        var i, textArr = [], r = 0, ll, c, ctext;
        $("#offset").text(page);
        $("#pageof").show();

        textArr = text.split("\n");

        r = textArr.length;
        r = Math.floor(((rows - r) / 2) + 1) - 1;
        for (i = 0; i < textArr.length; i = i + 1) {
            ctext = $.trim(textArr[i]);
            ctext = (ctext.length > cols) ? clipText(ctext) : ctext;
            ll = ctext.length;
            c = Math.floor((cols - ll) / 2);
            displayText(ctext, r, c);
            r = r + 1;
        }

        clearPage(prv);
    }

    function fwdPage() {
        var text = $("#input").val(),
            arr = text.split(newpage).clean();
        if (!$.trim(text)) {
            resetAll();
            return;
        }
        clearInterval(playloop);
        page = page + 1;
        page = (page > arr.length) ? 1 : page;
        displayPage(arr[page - 1]);
        $("#limit").text(arr.length);
    }

    function play() {
        $('#stop').show();
        $('#play').hide();
        if (page === 0) {
            fwdPage();
        }
        loop = true;
        if ($('div.loop').length === 0 && loopcount === 0 && loop) {
            playloop = setTimeout(function () {
                fwdPage();
            }, psdelay);
        }
    }

    function stop() {
        $('#stop').hide();
        $('#play').show();
        clearInterval(playloop);
        loop = false;
    }

    function fwd() {
        if (loop) {
            stop();
        }
        fwdPage();
    }

    function rev() {
        var text = $("#input").val(),
            arr = text.split(newpage).clean();
        if (!$.trim(text)) {
            ns.resetAll();
            return;
        }
        ns.stop();
        page = (page) ? page - 1 : 1;
        page = (page < 1) ? arr.length : page;
        displayPage(arr[page - 1]);
        $("#limit").text(arr.length);
    }

    function setDoc(json) {
        if (json.blob.text) {
            $('#input').val(json.blob.text);
            ns.play();
        }
    }

    function getDoc() {
        return {
            "title": "Split Flap Display",
            "readers" : ["public"],
            "blob": {
                version: 1,
                text: $('#input').val()
            }
        };
    }

    function linkToDisplay() {
        window.open('display.html' + window.location.hash);
        return false;
    }

    ns.extend({
        'onReady': onReady,
        'getDoc': getDoc,
        'setDoc': setDoc,
        'play' : play,
        'stop' : stop,
        'rev' : rev,
        'fwd' : fwd,
        'fwdPage' : fwdPage,
        'linkToDisplay' : linkToDisplay
    });

});