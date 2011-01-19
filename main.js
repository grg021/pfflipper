namespace.lookup('com.pageforest.scratch').defineOnce(function (ns) {
    var clientLib = namespace.lookup('com.pageforest.client'),
        play, k = 0, cols = 21, rows = 5, page = 0, flag = false;
	var ctr, strloop = [];
	var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ";
	var chars = "!\"#$%&'()*+,-./:;<=>?@[\]^_`{|}~";
	var numbers = "0123456789";
        
    function onReady() {
        $('#input').focus();
        ns.client = new clientLib.Client(ns);
        ns.client.addAppBar();
		buildBox(cols, rows);
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
		if(newState === 'clean') {
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
		
	function loopThrough(a, b, box, c) {
		var tmpStart, tmpEnd, stype, etype, loopthis;
		
		stype = letters;
		tmpStart = stype.indexOf(a);
		if(tmpStart < 0) { stype = numbers; tmpStart = numbers.indexOf(a); }
		if(tmpStart < 0) { stype = chars; tmpStart = chars.indexOf(a); }
		
		etype = letters;
		tmpEnd = etype.indexOf(b);
		if(tmpEnd < 0) { etype = numbers; tmpEnd = numbers.indexOf(b);}
		if(tmpEnd < 0) { etype = chars; tmpEnd = chars.indexOf(b);}
		
		if(stype !== etype) { loopthis = stype + etype; tmpEnd = tmpEnd + stype.length } 
			else { loopthis = stype; }
		
		clearInterval(strloop[c]);
		strloop[c] = setInterval(function() { 
			box.text(loopthis.charAt(tmpStart));
			tmpStart++;
			if(tmpStart == tmpEnd+1) clearInterval(strloop[c]);
			if(tmpStart > loopthis.length -1) tmpStart = 0;
			}, 80);
		}
		
    function buildBox(c, r)
    {
      var i, j,
        $box = $("<div/>", { "class": "box" }),
        $rdiv = $("<div/>", { "class": "rdiv" });
      for (j = 0; j < c; j++) {
        $rdiv.append($box.clone().attr('id', "c_" + j));
      }
      for (i = 0; i < r; i++) {
        $("#display").append($rdiv.clone().attr('id', "r_" + i));
      }
    }

    function displayText(text, r, c)
    {
      var a, b, j, pp = page-1, ppp = page + 1, box;
      for (j = 0; j < text.length; j++) {
		box = $("#display").find("#r_" + r).find("#c_" + c);
		a = $.trim(box.text()).toUpperCase();
		b = text[j].toUpperCase();
        if($.trim(b)) box.removeClass("page_"+pp).removeClass("page_"+ppp).addClass("page_"+page);
        if(a === '') { 
			$("#display").find("#r_" + r).find("#c_" + c).text(b);
        } else {
			loopThrough(a, b, box, r*cols+c);
		}
        c++;
        }
    }


    function displayPage(text)
    {
      flag = true;
      var i, textArr = [], l = text.length, r = 0, ll, c;
      $("#offset").text(page + 1);
      
      $("#pageof").show();
      textArr = text.split("\n");
      r = textArr.length - 1;
      r = Math.floor((rows - r) / 2);
      for (i = 0; i < textArr.length; i++) {
        ll = textArr[i].length;
        c = Math.floor((cols - ll) / 2);
        displayText($.trim(textArr[i]), r, c);
        r++;
      }
      var pp = page - 1, ppp = page + 1;
      $("div.page_"+pp).text('').removeClass("page_"+pp);
      $("div.page_"+ppp).text('').removeClass("page_"+ppp);
    }
      
    function initPage() {
        var text = $.trim($("#input").val()),
            arr = text.split(/\n-{1,}\n/);
      $("#limit").text(arr.length);
      displayPage($.trim(arr[0]));
    }

    function play() {
      $("#play").hide(1, function() { $("#stop").show(); });
      page = 0;
      initPage();
      play = setInterval(function() { fwd(true) }, 5000);
    }
                           
    function stop() {
      $("#stop").hide(1, function() { $("#play").show(); });
      clearInterval(play);
      page = 0;
      initPage();
    }
                           
    function rev() {
     var text = $.trim($("#input").val()),
        arr = text.split(/\n-{1,}\n/);
      page--;
      page = (page < 0) ? 0 : page;
      displayPage($.trim(arr[page]));
      $("#limit").text(arr.length);
    }
 
    function fwd(loop) {
      var text = $.trim($("#input").val()),
        arr = text.split(/\n-{1,}\n/),
        end;
      page++;
      loop = (loop === undefined) ? false : true;
      end = (loop) ? 0 : arr.length - 1;
      if(loop && page > arr.length - 1) $("div.box").text('');
      page = (page > arr.length - 1) ? end : page;
      displayPage($.trim(arr[page]));
      $("#limit").text(arr.length);
    }  

    function resetAll() {
      stop();
      $("#pageof").hide();
      $("#input").text(''); 
      $("#display").find('.box').text('');
      flag = false;
      ns.client.setDirty(false);
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
