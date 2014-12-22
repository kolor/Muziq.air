VK = {
	api: "https://api.vkontakte.ru/method/audio.search?",
	artist: null,
	title: null,
	sources: [],
	durs: [],
    type: 'track',
	
	getFiles: function(t) {
        this.type = 'track';
		this.artist = t.attr('data-artist');
		this.title = t.attr('data-title'); 
		var q = this.cleanArgs(this.artist+' '+this.title);
    //air.Introspector.Console.log(q);
		var loader = new air.URLLoader();
		loader.addEventListener(air.Event.COMPLETE, VK.onGetFiles);
        if (token == null) return;
		loader.load(new air.URLRequest(this.api+'access_token='+token+'&count=200&sort=2&q='+q));	
	},

	onGetFiles: function(e) {
			//air.Introspector.Console.log(e.target.data);
		var data = $.parseJSON(e.target.data);
		if (defined(data.error)) {
			vkLogin(true);
			setTimeout(function(){
				$('.track.selected').click();
			}, 2000);
			return;
		}

		if (!defined(data) || data.response[0] == 0 || empty(data.response)) {
			$('.track.selected').next().click();
			return;
		}
		var total = data.response[0];
		var sort = new Array();
		VK.sources = [];
		for (key in data.response) {
			var d = data.response[key];
			if (typeof(d.duration) == 'undefined') continue;
			if (typeof(d.title) == 'undefined') continue
			if (d.duration < 100 || d.duration > 900) continue;
			if (sort[d.duration] == null) {
				sort[d.duration] = 1;
				VK.sources[d.duration] = [];
			} else {
				sort[d.duration]++;
			} 
			VK.sources[d.duration].push({
				artist: d.artist,
				url: d.url,
				title: d.title,
				dur: d.duration
			});
		}
		var keys = arsort(sort, 'SORT_NUMERIC');
		
		if (empty(VK.sources)) {
			$('.track.selected').next().click();
			return;
		}

		var result = '';
		for(var j=0; j<Math.min(15,keys.length); j++) {
			var d = keys[j];
			var count = sort[d];
		    result += '<div class="source" data-artist="'+VK.sources[d][0].artist+'" data-title="'+VK.sources[d][0].title+'" data-duration="'+VK.sources[d][0].dur+'" data-url="'+VK.sources[d][0].url+'">';
            if (VK.type == 'track') { result += VK.mkTitle(VK.sources[d][0].title); } 
            else {                    result += VK.sources[d][0].artist +'<br>'+VK.sources[d][0].title; }
            result += '<div class="time"> '+mkTime(VK.sources[d][0].dur)+'</div></div>';
		}	
		$('.tracks-sources').html(result); 	
		Artist_Overview.initTrackSources();
		
	},
    
        
    getTracks: function(q) {
        VK.type = 'tracks';
        var q = this.cleanArgs(q);
		var loader = new air.URLLoader();
		loader.addEventListener(air.Event.COMPLETE, VK.onGetFiles);
        if (token == null) return;
		loader.load(new air.URLRequest(this.api+'access_token='+token+'&count=200&sort=2&q='+q));	
    },   	
	
	getBitrate: function(dur){
		var result = '';
		var i = 0;
	    $(this.sources[dur]).each(function(){
			if (++i > 25) return false;
			var duration = mkTime(this.dur);   	
			result += '<div class="bitrate" data-duration="'+this.dur+'" data-url="'+this.url+'">'+mkTime(this.dur)+' @ ?? Mb</div></div>';
	    });
	   
	   $('.tracks-bitrate').html(result);
	   Artist_Overview.initTrackBitrate();
	},
	
	getBitrateInfo: function(el) {
		var loader = new air.URLLoader();
		loader.addEventListener(air.ProgressEvent.PROGRESS, onGetBitrateProgress);
		loader.load(new air.URLRequest($(el).attr('data-url')));
		function onGetBitrateProgress(e) {
			var d = el.attr('data-duration');
			var s = e.bytesTotal;
			var b = 8*(s/1024)/d;
			if (b > 380) {
				el.remove();
			}
			el.attr('data-bitrate',b).html(mkTime(d) +' @ '+ (e.bytesTotal/1048576).toFixed(1) +' Mb = '+ b.toFixed(1) +' kbps');
			loader.close();
		}        
	},
	
	mkTitle: function(q) {
		var r = /\(.*\)/gi;
		var s = q.match(r);
		if (s !== null) {
			return '<div class="title" data-remix=" '+ s[0] +'">'+ s[0].replace(/\(|\)/g,'') +'</div>';
		} else {
			return '<div class="title" data-remix="">'+ q +'</div>';
		}
	},
	
	cleanArgs: function(q) {	
        q = q.replace(/(\- | \-|\(|\)|\[|\]|\{|\})+/g,''); // remove bracket leftovers
		q = encodeURIComponent(q);
		return q;
	}
	
	
}

