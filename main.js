namespace.lookup('com.pageforest.scratch').defineOnce(function (ns) {
    var clientLib = namespace.lookup('com.pageforest.client'),
        play, k = 0, cols = 21, rows = 5, page = 0, flag = false;
	var ctr, strloop = [], prev = [];
	var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ";
	var chars = "!\"#$%&'()*+,-./:;<=>?@[\]^_`{|}~";
	var numbers = "0123456789";
	
	(function($) {
		$.fn.textfill = function(options) {
			var fontSize = options.maxFontPixels;
			var ourText = $('span:visible:first', this);
			var maxHeight = $(this).height();
			var maxWidth = $(this).width();
			var textHeight;
			var textWidth;
			do {
					ourText.css('font-size', fontSize);
					textHeight = ourText.height();
					textWidth = ourText.width();
					fontSize = fontSize - 1;
			} while (textHeight > maxHeight || textWidth > maxWidth && fontSize > 3);
			return this;
		}
	})(jQuery);

    function onReady() {
        $('#input').focus();
        ns.client = new clientLib.Client(ns);
        ns.client.saveInterval = 0;  // Turn off auto-save.
        ns.client.addAppBar();
		buildBox(cols, rows);
		// resize font based on bounding box size
		$("div.box > span").text('W');
		$("div.box").textfill({ maxFontPixels: 72 });
		$("span.charbox").text('');
    }
		
	function loopThrough(a, b, box, c) {
		var tmpStart, tmpEnd, stype, etype, loopthis;
		
		stype = letters;
		tmpStart = stype.indexOf(a);
		if (tmpStart < 0) { stype = numbers; tmpStart = numbers.indexOf(a); }
		if (tmpStart < 0) { stype = chars; tmpStart = chars.indexOf(a); }
		
		etype = letters;
		tmpEnd = etype.indexOf(b);
		if (tmpEnd < 0) { etype = numbers; tmpEnd = numbers.indexOf(b); }
		if (tmpEnd < 0) { etype = chars; tmpEnd = chars.indexOf(b); }
		
		if (stype !== etype) { loopthis = stype + etype; tmpEnd = tmpEnd + stype.length; } else { loopthis = stype; }

		clearInterval(strloop[c]);
		strloop[c] = setInterval(function() { 
			box.text(loopthis.charAt(tmpStart));
			tmpStart++;
			if (tmpStart === tmpEnd + 1) { clearInterval(strloop[c]); }
			if (tmpStart > loopthis.length - 1) { tmpStart = 0; }
			}, 80);
	}

    function displayText(text, r, c)
    {
      var a, b, j, box;
      for (j = 0; j < text.length; j++) {
		box = $("#display").find("#r_" + r).find("#c_" + c).children("span");
		a = $.trim(box.text()).toUpperCase();
		b = text[j].toUpperCase();
        if ($.trim(b)) { box.removeClass().addClass("page_" + page); prev.push(r * cols + c); }
        if (a === '') { 
			$("#display").find("#r_" + r).find("#c_" + c).children("span").text(b);
        } else {
			loopThrough(a, b, box, r * cols + c);
		}
        c++;
        }
    }

	function autowrap(text) {
		var words = [], newtext = "", cc = cols;
		words = text.replace(/\n/g, " ").split(" ");
		for (var w in words) {
			if (newtext.length + words[w].length > cc) {
				newtext = newtext.concat("\n", words[w]);
				cc += cols;
			} else {
				newtext = newtext.concat(" ", words[w]);
			}
		}
		return $.trim(newtext);
	}

    function displayPage(text)
    {
	  if (!text) { resetAll(); return ; }
      var i, textArr = [], l = text.length, r = 0, ll, c, words = [], newtext = "";
      $("#offset").text(page + 1);
      $("#pageof").show();

	  textArr = autowrap(text).split("\n");

      r = textArr.length - 1;
      r = Math.floor((rows - r) / 2);
      
      for (var p in prev) { clearInterval(strloop[prev[p]]); }
      prev = [];
      
      for (i = 0; i < textArr.length; i++) {
        ll = textArr[i].length;
        c = Math.floor((cols - ll) / 2);
        displayText($.trim(textArr[i]), r, c);
        r++;
      }
      //var pp = page - 1, ppp = page + 1;
      //$("span.page_"+pp).text('').removeClass("page_"+pp);
      //$("span.page_"+ppp).text('').removeClass("page_"+ppp);
      $("div.box > span:not(.page_"+page+")").text('').removeClass("not:(.page_"+page+")");
    }
      
    function initPage() {
        var text = $.trim($("#input").val()),
            arr = text.split(/\n-{1,}\n/);
        flag = true;
		page = 0;
		$("div.box > span").text('').removeClass().addClass('charbox');
		if (text) { $("#limit").text(arr.length); displayPage($.trim(arr[0])); }
    }

    function play() {
      $("#play").hide(1, function() { $("#stop").show(); });
      initPage();
      play = setInterval(function() { fwd(true) }, 5000);
    }
                           
    function stop() {
      $("#stop").hide(1, function() { $("#play").show(); });
      clearInterval(play);
      initPage();
    }
                           
    function rev() {
      var text = $.trim($("#input").val()),
         arr = text.split(/\n-{1,}\n/);
      if (arr.length === 1) { initPage(); return ; }
      page--;
      page = (page < 0) ? 0 : page;
      displayPage($.trim(arr[page]));
      $("#limit").text(arr.length);
    }
 
    function fwd(loop) {
		  var text = $.trim($("#input").val()),
			arr = text.split(/\n-{1,}\n/),
			end;
		  if (arr.length === 1) { initPage(); return ; }
		  page++;
		  loop = (loop === undefined) ? false : true;
		  end = (loop) ? 0 : arr.length - 1;
		  if (loop && page > arr.length - 1) $("span.charbox").text('');
		  page = (page > arr.length - 1) ? end : page;
		  displayPage($.trim(arr[page]));
		  $("#limit").text(arr.length);
    }  

    function resetAll() {
      $("#pageof").hide();
      $("#input").text('');
      stop();
      flag = false;
      ns.client.setDirty(false);
    }
    
    function setDoc(json) {
        $('#input').val(json.blob.text);
    }

    function getDoc() {
        return {
          "blob": {
            version: 1,
            text: $('#input').val()
          }
        };
    }

    function onStateChange(newState, oldState) {
		if (newState === 'clean') {
			var url = ns.client.getDocURL(),
				link = $('#form');
			if (url) {
				link.hide();
				ns.play();
			}
			else {
				link.show();
			}
		}
    }
    
    function buildBox(c, r)
    {
      var i, j,
		$charbox = $("<span/>", { "class": "charbox" }),
        $box = $("<div/>", { "class": "box" }).append($charbox.clone()),
        $rdiv = $("<div/>", { "class": "rdiv" });
      for (j = 0; j < c; j++) {
        $rdiv.append($box.clone().attr('id', "c_" + j));
      }
      for (i = 0; i < r; i++) {
        $("#display").append($rdiv.clone().attr('id', "r_" + i));
      }
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
        'onStateChange': onStateChange
    });

});
