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
		
	function loopThrough(a, b, box, j) {
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
		strloop[j] = setInterval(function() { 
			box.text(loopthis.charAt(tmpStart));
			tmpStart++;
			if(tmpStart == tmpEnd+1) clearInterval(strloop[j]);
			if(tmpStart > loopthis.length -1) tmpStart = 0;
			}, 50);
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

    function displayText(text, r, c, l)
    {
      var j, pp = page-1;
      for (j = 0; j < l; j++) {
		a = $.trim($("#display").find("#r_" + r).find("#c_" + c).text());
		b = text[j];
        box = $("#display").find("#r_" + r).find("#c_" + c);
        box.addClass("page_"+page).removeClass("page_"+pp);
        if(a === '') $("#display").find("#r_" + r).find("#c_" + c).text(text[j]);
        else { clearInterval(strloop[j]); loopThrough(a.toUpperCase(), b.toUpperCase(), box, j); }
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
        displayText($.trim(textArr[i]), r, c, ll);
        r++;
      }
      var pp = page-1;
      $("div.page_"+pp).text('');
    }
      
    function initPage() {
        var text = $.trim($("#input").val()),
            arr = text.split(/\n-{1,}\n/);
      displayPage($.trim(arr[0]));
      $("#limit").text(arr.length);
    }

    function play() {
      $("#play").hide(1, function() { $("#stop").show(); });
      page = 0;
      initPage();
      play = setInterval(function() { fwd(true) }, 2000);
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
