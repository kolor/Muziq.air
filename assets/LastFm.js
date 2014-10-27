var LastFm = {
	artist: null,
	title: null,
	api: 'http://ws.audioscrobbler.com/2.0/?api_key=7f0ae344d4754c175067118a5975ab15&format=json&',
	leftover: 0,
	found: [],
	radio: {artists:[], songs:[]},
	
	getArtists: function(q){
		var loader = new air.URLLoader();
		loader.addEventListener(air.Event.COMPLETE, LastFm.onGetArtists);
		loader.load(new air.URLRequest(this.api+'method=artist.search&artist='+ q.enc()));	
	},

	
	
	onGetArtists: function(e) {
		var i = 0;
		var result = '';
		var data = $.parseJSON(e.target.data);
		$(data.results.artistmatches.artist).each(function(){
			if (++i > 12) return false;
			var img = this.image[4]['#text'];
			if (img == "") img = 'assets/img/missing200.png';
			var name = decodeURIComponent(this.name);
			var url = this.url;
			result += '<div class="artist" data-mbid="'+this.mbid+'" data-artist="'+name+'" data-img="'+img+'" style="background-image: url('+img+')"><div class="info">'+name+'</div></div>';
		});
			$('#artist-search').html(result);
			Artist_Search.init();
	},
	
	getTracks: function(artist) {  
		LastFm.found = [];
		LastFm.leftover = 0;
		$('.artist-tracks').empty();
		$('.col2 .head').eq(2).text(Artist_Overview.artist);
		var loader = new air.URLLoader();
		loader.addEventListener(air.Event.COMPLETE, LastFm.onGetTracks);
	  	loader.load(new air.URLRequest(this.api+'method=artist.gettoptracks&artist='+ artist.enc() +'&autocorrect=1&limit=100'));	        
    },
    
    onGetTracks: function(e) {
        var result = ''; 
        var data = $.parseJSON(e.target.data);
        if (typeof data.error != 'undefined') {
	    air.Introspector.Console.log(data.error);
            return;
        }
        $(data.toptracks.track).each(function(){
            var title = LastFm.cleanTrackName(this.name);
            if (title == "") return true;
			if (this.playcount < 2) return true;
            if (!inArray(title, LastFm.found)) {
                result += '<div class="track" data-artist="'+ this.artist.name +'" data-title="'+ cap(title) +'">'+ cap(title);
                result += "<i>"+ this.playcount +"</i></div>";       
                LastFm.found.push(title);
            }           
        });
		$('.artist-tracks').append(result);
        Artist_Overview.initTracks();
    },
	
	getMoreTracks: function(artist) {
		var loader = new air.URLLoader();
		loader.addEventListener(air.Event.COMPLETE, LastFm.onGetTracks);
	   	loader.load(new air.URLRequest(this.api+'method=artist.gettoptracks&artist='+ artist.enc() +'&autocorrect=1&limit=100&page=2'));	
	},
    
    
    getSimilar: function(artist) {
		var loader = new air.URLLoader();
		loader.addEventListener(air.Event.COMPLETE, LastFm.onGetSimilar);
	   	loader.load(new air.URLRequest(this.api+'method=artist.getsimilar&artist='+ artist.enc() +'&autocorrect=1&limit=71'));	    
    },
    
    onGetSimilar: function(e) {
        var result = '';
		var data = $.parseJSON(e.target.data);
        $(data.similarartists.artist).each(function(){
			var img = this.image[2]['#text'];
			if (img == "") img = 'assets/img/missing100.png';
            result += '<div class="similar" data-mbid="'+ this.mbid +'" data-artist="'+ this.name +'" style="background-image: url('+ img +')"><div class="name">'+ this.name +'</div></div>';
        });
        $('#artist-overview .artist-similar').append(result);
        Artist_Overview.initSimilar();   
    },
    
    getTag: function(q) {
		var loader = new air.URLLoader();
		loader.addEventListener(air.Event.COMPLETE, LastFm.onGetTag);
		loader.load(new air.URLRequest(this.api+'method=tag.gettopartists&tag='+ q));  
    },
    
    onGetTag: function(e) {
		var data = $.parseJSON(e.target.data);
        var result = '';
        $(data.topartists.artist).each(function(){
			var img = this.image[2]['#text'];
			if (img == "") img = 'assets/img/missing100.png';
            result += '<div class="similar" data-mbid="'+ this.mbid +'" data-artist="'+ this.name +'" style="background-image: url('+ img +')"><div class="name">'+ this.name +'</div></div>';
        });
		$('#artist-overview .artist-similar').append(result);
        Artist_Overview.initTags();   
    },
	
	
	playRadio: function(artists) {
		this.radio.artists = shuffle(artists);
		LastFm.getRadioArtist(LastFm.radio.artists.shift());
		setInterval(function(){
			if (LastFm.radio.artists.length > 0) {
				LastFm.getRadioArtist(LastFm.radio.artists.shift());
			}
		}, 10000);
		
	},
	
	getRadioArtist: function(artist) {
		LastFm.found = [];
        $('.col2 .head').text(Artist_Overview.artist+' Radio');
		var loader = new air.URLLoader();
		loader.addEventListener(air.Event.COMPLETE, LastFm.onGetRadioArtist);
		loader.load(new air.URLRequest(this.api+'method=artist.gettoptracks&artist='+ artist.enc() +'&autocorrect=1&limit=10'));	
	},
	
	onGetRadioArtist: function(e) {
		var result = ''; 
        var data = $.parseJSON(e.target.data);
        if (typeof data.error != 'undefined') {
            return;
        }
        $(data.toptracks.track).each(function(){
            var title = LastFm.cleanTrackName(this.name);
            if (title == "") return true;
			if (this.playcount < 2) return true;
            if (!inArray(title, LastFm.found)) {
                LastFm.found.push(title);
				LastFm.radio.songs.push({artist:this.artist.name, title:cap(title)});
            }           
        });
		LastFm.addRadioTrack();
	},
	
	addRadioTrack: function(){
		this.radio.songs = shuffle(this.radio.songs);
	    var song = this.radio.songs.shift();
		$('<div class="track" data-artist="'+ song.artist +'" data-title="'+ song.title +'">'+ song.artist +' - '+ song.title+ '</div>').click(function(){
			LastFm.getRadioArtist(LastFm.radio.artists.shift());
		}).appendTo('.artist-tracks');
	},
	


	
	cleanArgs: function(q){
		q = encodeURIComponent(q);
		return q;
	},
	
	cleanTrackName: function(str) {
        str = trimBrackets(str);
        str = str.replace(/(remix|rmx|edit).*/gi,''); // remove (this), 1 word before and everything after
        str = str.replace(/( feat| ft\.| vocals by| vip).*/gi,''); // remove (this) and everything after
        str = str.replace(/(full version|remix|remi| mix|rmx| edit)/gi,''); //remove (this)
        str = str.replace(/(mp3|flac|ogg)/gi,'');
        return cleanName(str);
	}
	

}
