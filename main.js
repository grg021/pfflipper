/*global $, clearInterval, setTimeout, setInterval, namespace, jQuery, window, document */
namespace.lookup('com.pageforest.flipper').defineOnce(function (ns) {
    var clientLib = namespace.lookup('com.pageforest.client'),
        playloop,
        cols = 21,
        rows = 5,
        page = 0,
        strloop = [],
        letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        chars = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
        numbers = "0123456789",
        duration = 80, // letter to letter transition duration
        psdelay = 5000, // page switch delay
        boxW = 32,
        boxH = boxW * 1.25,
        curr = 0,
        prv = 1,
        wwidth,
        loopcount = 0,
        loop = false,
        newpage = /\n-{3,}\n/m;

    function buildBox(c, r) {
        var i, j,
            $cboxa = $("<span id='1' class='spn top'></span>"),
            $cboxb = $("<span id='2' class='spn bottom'></span>"),
            $cboxc = $("<span id='3' class='spn'></span>"),
            $box = $("<div/>", { "class": "box" })
                .height(boxH)
                .width(boxW)
                .append($cboxa.clone(), $cboxb.clone(), $cboxc.clone()),
            $rdiv = $("<div/>", { "class": "rdiv" });
        for (j = 0; j < c; j = j + 1) {
            $rdiv.append($box.clone().attr('id', "c_" + j));
        }
        for (i = 0; i < r; i = i + 1) {
            $("#display").append($rdiv.clone().attr('id', "r_" + i));
        }
    }

    function onReady() {
        jQuery.support.animation = false;
        jQuery.each(['-webkit-animation', '-moz-animation', '-o-animation', 'animation'],
                    function () {
                        if (document.body.style[this] !== undefined) {
                            jQuery.support.animation = true;
                        }
                        return (!jQuery.support.animation);
                    });
        $.fn.textfill = function (options) {
            var fontSize = options.maxFontPixels,
                ourText = $('span', this),
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

        wwidth = $('#main').width();
        wwidth = (wwidth) ? wwidth : $(window).width();
        if (!$.support.animation) {
            $("#warning").show();
        }
        boxW = Math.floor((wwidth - 20) / cols - 4);
        boxH = boxW * 1.25;
        $('#input').focus();
        ns.client = new clientLib.Client(ns);
        if (document.getElementById('title')) {
            ns.client.addAppBar();
        }
        buildBox(cols, rows);

        var $cboxa = $("<div class='dv up'><div class='text'><span></span></div></div>" +
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
        $("div.box > span").text('W');
        $("div.box").textfill({ maxFontPixels: 72 });
        $("div.box > span").html($cboxb.clone());
        $("div.box > span:not(#3)").html($cboxa.clone());

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
    }

    function getIndex(a, b) {
        var index = [];
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
                stype = etype = ' ' + etype;
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
            'loopthis': loopthis,
            'tmpStart': tmpStart,
            'tmpEnd': tmpEnd
        };
    }
    
    function loopThrough(r, c, b) {
        var tmpStart, tmpEnd, stype, etype, loopthis, a1, a2, b1, b2, c2, box;
        box = $("#display").find("#r_" + r).find("#c_" + c);
        a = $.trim(box.find('span.top div.up div.text > span').text()).toUpperCase();

        if ($.trim(b)) {
            box.removeClass("page_" + prv).addClass("page_" + curr);
        }
        if (a === '') {
            a = ' ';
        }
        console.log(a + " " + b);
        if ($.trim(a) !== $.trim(b)) {
            a1 = box.find("span.top div.up div.text");
            a2 = box.find("span.top div.down div.text");
            b1 = box.find("span.bottom div.up div.text");
            b2 = box.find("span.bottom div.down div.text");
            c2 = box.find("span#3 div.down div.text");
            index = getIndex(a, b);
            loopthis = index.loopthis;
            tmpStart = index.tmpStart;
            tmpEnd = index.tmpEnd;
            tmpStart++;
            if (tmpStart > loopthis.length - 1) {
                tmpStart = 0;
            }
            a1.children("span").text(loopthis.charAt(tmpStart));
            b1.children("span").text(loopthis.charAt(tmpStart));
            //a2.children("span").text(loopthis.charAt(tmpStart + 1));
            //b2.children("span").text(loopthis.charAt(tmpStart + 1));
            c2.children("span").text(loopthis.charAt(tmpStart));
            
        }
    }
    
    function displayText(text, r, c) {
        var a, b, j, box, x, xt;
        tbox = $("div.box:first");
        a1 = tbox.find("span.top div.up div.text");
        a2 = tbox.find("span.top div.down div.text");
        b1 = tbox.find("span.bottom div.up div.text");
        b2 = tbox.find("span.bottom div.down div.text");
        c2 = tbox.find("span#3 div.down div.text");
        b1.parent().bind("webkitTransitionEnd transitionend", function() {
            a1.parent().parent().css('z-index', '30');
            b1.parent().parent().css('z-index', '15');
            
            b1.parent().removeClass('scalea');
            a2.parent().addClass('scaleb');
            b2.parent().removeClass('scaleb');
            a1.parent().addClass('scalea');
            x = c;
            xt = text;
            for (j = 0; j < xt.length; j = j + 1) {
                b = xt[j].toUpperCase();
                loopThrough(r, x, b);
                x = x + 1;
            }

        });
        a1.parent().bind("webkitTransitionEnd transitionend", function() {
            b1.parent().parent().css('z-index', '30');
            a1.parent().parent().css('z-index', '15');
            
            a1.parent().removeClass('scalea');
            b2.parent().addClass('scaleb');
            a2.parent().removeClass('scaleb');
            b1.parent().addClass('scalea');
            x = c;
            xt = text;
            for (j = 0; j < xt.length; j = j + 1) {
                b = xt[j].toUpperCase();
                loopThrough(r, x, b);
                x = x + 1;
            }
        });
        x = c;
        xt = text;
        for (j = 0; j < xt.length; j = j + 1) {
            b = xt[j].toUpperCase();
            loopThrough(r, x, b);
            a1.parent().addClass('scalea');
            x = x + 1;
        }
    }

    function clearPage(page) {
        var boxid, box, d, s;
        $("div.page_" + page).each(function (a, b) {
            box = $(this);
            if ($.trim(box.find('div.text:first > span').text()) !== '') {
                d = box.attr('id').split('_')[1];
                s = box.parent().attr('id').split('_')[1];
                boxid = parseInt(s, 10) * cols + parseInt(d, 10);
                box.removeClass("page_" + page);
                loopThrough(box.find('div.text:first > span').text(), ' ', box, boxid);
            }
        });
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

    function fwd() {
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
        $("#play").hide(1, function () {
            $("#stop").show();
        });
        if (page === 0) {
            fwd();
        }
        loop = true;
        if (loopcount === 0 && loop) {
            playloop = setTimeout(function () {
                fwd();
            }, psdelay);
        }
    }

    function stop() {
        $("#stop").hide(1, function () {
            $("#play").show();
        });
        clearInterval(playloop);
        loop = false;
    }

    function rev() {
        var text = $("#input").val(),
            arr = text.split(newpage).clean();
        if (!$.trim(text)) {
            ns.resetAll();
            return;
        }
        clearInterval(playloop);
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
        'linkToDisplay' : linkToDisplay
    });

});