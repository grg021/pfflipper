/*global $, clearInterval, setTimeout, setInterval, namespace, jQuery, window */
namespace.lookup('com.pageforest.flipper').defineOnce(function (ns) {
    var clientLib = namespace.lookup('com.pageforest.client'),
        playloop, 
        cols = 21, 
        rows = 5, 
        page = 0, 
        flag = false,
		strloop = [], 
		prev = [],
		letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
		chars = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
		numbers = "0123456789",
		duration = 80, // letter to letter transition duration
		psdelay = 5000, // page switch delay
		boxW = 32, 
		boxH = 42;
		
    function buildBox(c, r) {
		var i, j,
			$cboxa = $("<span id='1' class='spn top'></span>"),
			$cboxb = $("<span id='2' class='spn down'></span>"),
			$box = $("<div/>", { "class": "box" }).height(boxH).width(boxW).append($cboxa.clone(), $cboxb.clone()),
			$rdiv = $("<div/>", { "class": "rdiv" });
		for (j = 0; j < c; j++) {
			$rdiv.append($box.clone().attr('id', "c_" + j));
		}
		for (i = 0; i < r; i++) {
			$("#display").append($rdiv.clone().attr('id', "r_" + i));
		}
    }
    
	(jQuery)(function ($) {
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
	});
    
    function onReady() {
        $('#input').focus();
        ns.client = new clientLib.Client(ns);
        ns.client.saveInterval = 0;  // Turn off auto-save.
        ns.client.addAppBar();
		buildBox(cols, rows);
		
		// resize font based on bounding box size
		$("div.box > span").text('W');
		$("div.box").textfill({ maxFontPixels: 72 });
		var $cboxa = $("<div class='dv up'><div class='text'><span></span></div></div><div class='dv down'><div class='text'><span></span></div></div>").height(boxH / 2).width(boxW).css("line-height", (boxH - 4) + "px"),
			$cboxb = $("<div class='dv up'><div class='text'><span></span></div></div><div class='dv down'><div class='text'><span></span></div></div>").height(boxH / 2).width(boxW).css("line-height", (boxH - 4) + "px");
		$("div.box > span").html($cboxa.clone(), $cboxb.clone());
		
		// resize textarea and title width
		$("#input").width($("#display").width());
		$("#title").width($("#display").width());
    }
		
	function loopThrough(a, b, box, c) {
		var tmpStart, tmpEnd, stype, etype, loopthis, a1, a2, b1, b2;
		a1 = box.find("span.top div.up div.text");
		a2 = box.find("span.top div.down div.text");
		b1 = box.find("span.down div.up div.text");
		b2 = box.find("span.down div.down div.text");
		a1.parent().removeClass("scale");
		a2.parent().removeClass('scale2');
		if (a === b) { return; }
		if (a !== ' ') {
			stype = letters;
			tmpStart = stype.indexOf(a);
			if (tmpStart < 0) { stype = numbers; tmpStart = numbers.indexOf(a); }
			if (tmpStart < 0) { stype = chars; tmpStart = chars.indexOf(a); }
		}
		if (b !== ' ') {
			etype = letters;
			tmpEnd = etype.indexOf(b);
			if (tmpEnd < 0) { etype = numbers; tmpEnd = numbers.indexOf(b); }
			if (tmpEnd < 0) { etype = chars; tmpEnd = chars.indexOf(b); }
			if(a === ' ') { stype = etype; tmpStart = 1; }
		} else {
			etype = stype += ' ';
			tmpEnd = etype.indexOf(b);
		}
		
		if (stype !== etype) { loopthis = stype + " " + etype; tmpEnd = tmpEnd + stype.length + 1; } else { loopthis = etype; }

		clearInterval(strloop[c]);

		a1.parent().addClass("scale");
		setTimeout(function () { a2.parent().addClass('scale2'); }, duration);
		strloop[c] = setInterval(function () {
			//box.find("div.text > span").text(loopthis.charAt(tmpStart));
			a1.children("span").text(loopthis.charAt(tmpStart));
			a2.children("span").text(loopthis.charAt(tmpStart));
			setTimeout(function () { b1.children("span").text(loopthis.charAt(tmpStart)); }, duration / 2);
			setTimeout(function () { b2.children("span").text(loopthis.charAt(tmpStart - 1)); }, duration / 2);
			tmpStart++;
			if (tmpStart === tmpEnd + 1) {
				clearInterval(strloop[c]);
				a1.parent().removeClass("scale");
				a2.parent().removeClass('scale2');
			}
			if (tmpStart > loopthis.length - 1) { tmpStart = 0; }
		}, duration);
	}

    function displayText(text, r, c) {
		var a, b, j, box;
		for (j = 0; j < text.length; j++) {
			box = $("#display").find("#r_" + r).find("#c_" + c);
			a = $.trim(box.find('div.text:first > span').text()).toUpperCase();
			b = text[j].toUpperCase();
			if ($.trim(b)) { box.find('div.text > span').removeClass().addClass("page_" + page); prev.push(r * cols + c); }
			if (a === '') { 
				loopThrough(' ', b, box, r * cols + c);
			} else {
				loopThrough(a, b, box, r * cols + c);
			}
			c++;
		}
    }

	/*function autowrap(text) {
		var words = [], newtext = "", cc = cols, w;
		words = text.replace(/\n/g, " ").split(" ");
		for (w in words) {
			if (newtext.length + words[w].length > cc) {
				newtext = newtext.concat("\n", words[w]);
				cc += cols;
			} else {
				newtext = newtext.concat(" ", words[w]);
			}
		}
		return $.trim(newtext);
	}*/

    function displayPage(text) {
		if (!text) { ns.resetAll(); return; }
		var i, textArr = [], r = 0, ll, c, box, s, d, p;
		$("#offset").text(page + 1);
		$("#pageof").show();

		//textArr = autowrap(text).split("\n");
		textArr = text.split("\n");
		r = textArr.length - 1;
		r = Math.floor((rows - r) / 2);
	  
		if (prev.length) { 
			for (p in prev) { if (prev[p]) { clearInterval(strloop[prev[p]]); } }
			prev = [];
		}
      
		for (i = 0; i < textArr.length; i++) {
			ll = textArr[i].length;
			c = Math.floor((cols - ll) / 2);
			displayText($.trim(textArr[i]), r, c);
			r++;
		}
		
		$("div.box div.text > span:not(.page_" + page + ")").each(function (a, b) {
			box = $(this).closest('.box');
			if ($.trim(box.find('div.text:first > span').text()) !== '') {
				d = box.attr('id').split('_')[1];
				s = box.parent().attr('id').split('_')[1];
				prev.push(s * cols + d);
				loopThrough(box.find('div.text:first > span').text(), ' ', box, s * cols + d);
			}
		});
    }

    function initPage() {
        var text = $.trim($("#input").val()),
            arr = text.split(/\n-{1,}\n/);
        if (!text) { ns.resetAll(); return; }
        flag = true;
		page = 0;
		//$("div.box div.text > span").text('');
		$("div.box").find(".scale").removeClass("scale");
	    $("div.box").find(".scale2").removeClass("scale2");
		if (text) { $("#limit").text(arr.length); displayPage($.trim(arr[0])); }
    }

    function fwd(loop) {
		var text = $.trim($("#input").val()),
			arr = text.split(/\n-{1,}\n/),
			end;
		if (!text) { ns.resetAll(); return; }
		if (arr.length === 1) { initPage(); return; }
		page++;
		loop = (loop === undefined) ? false : true;
		// end = (loop) ? 0 : arr.length - 1;
		end = arr.length - 1;
		if (loop && page >= arr.length - 1) { 
			// $("div.text > span").text('');
			$("#stop").hide(1, function () { $("#play").show(); });
			clearInterval(playloop);
		}
		page = (page > arr.length - 1) ? end : page;
		displayPage($.trim(arr[page]));
		$("#limit").text(arr.length);
    }  

    function play() {
		$("#play").hide(1, function () { $("#stop").show(); });
		initPage();
		playloop = setInterval(function () { fwd(true); }, psdelay);
    }
                           
    function stop() {
		$("#stop").hide(1, function () { $("#play").show(); });
		clearInterval(playloop);
		initPage();
    }
    
    function resetAll() {
		$("#pageof").hide();
		$("#input").text('');
		//stop();
		$("div.box div.text > span").text('');
		flag = false;
		ns.client.setDirty(false);
    }
                           
    function rev() {
		var text = $.trim($("#input").val()),
			arr = text.split(/\n-{1,}\n/);
		if (!text) { ns.resetAll(); return; }
		if (arr.length === 1) { initPage(); return; }
		page--;
		page = (page < 0) ? 0 : page;
		displayPage($.trim(arr[page]));
		$("#limit").text(arr.length);
    }
    
    function setDoc(json) {
		if (json) {
			$('#input').val(json.blob.text);
			ns.play();
		}
    }

    function getDoc() {
        return {
			"readers" : ["public"],
			"blob": {
				version: 1,
				text: $('#input').val()
			}
        };
    }

    // function onStateChange(newState, oldState) {
		// if (newState === 'clean') {
			// var url = ns.client.getDocURL(),
				// link = $('#form');
			// if (url) {
				// link.hide();
				// ns.play();
			// } else {
				// link.show();
			// }
		// }
    // }
	
	function saveDoc(docid) {
		var data = {
			title: "Flipper",
			readers: ["public"],
			blob: {version: "1", text: $('#input').val()}
		};
		$.ajax({
			type: "PUT",
			url: "/docs/" + docid,
			data: JSON.stringify(data),
			success: function (data) {
				ns.client.setDirty(false);
				window.location.replace("display.html#" + docid);
			}
		});
	}

	function linkToDisplay() {
        var isSignedIn = ns.client.username != undefined;
        if (!isSignedIn) {
            //ns.client.signIn();
			ns.client.save();
			return;
        }
		if (ns.client.docid) {
			saveDoc(ns.client.docid);
		} else {
			$.ajax({
				type: 'GET',
				url: "/docs/?method=list&keysonly=true",
				success: function (message, status, xhr) {
					var prop, propCount = 0;
					for (prop in message.items) {
						if (prop) { propCount++; }
					}
					saveDoc(ns.client.username + "_" + propCount);
				}
			});
		}
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
		'resetAll' : resetAll,
		'linkToDisplay' : linkToDisplay
    });

});
