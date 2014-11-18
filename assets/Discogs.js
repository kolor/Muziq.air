//air.Introspector.Console.log(q);

var Discogs = {
	api: "http://api.discogs.com/",
	found: [],
	artist: null,
	artistUrl: null,

	findArtist: function(q) {
		this.found = [];
		this.artist = q;
		this.artistUrl = null;
		q = encodeURIComponent(q);
		$('.artist-albums').addClass('load6');
		var loader = new air.URLLoader();
		loader.addEventListener(air.Event.COMPLETE, Discogs.onFindArtist);
		//loader.load(new air.URLRequest('http://muziq.apps.dj/dc.php?q='+q));  
		loader.load(new air.URLRequest('http://www.discogs.com/search/?type=artist&layout=med&q='+q));	

	},

	onFindArtist: function(e) {
		var html = e.target.data;
		var cards = $(html).find('div.card');
		if (empty(cards)) {
			$('.dc-albums').removeClass('load4');
			return;
		}
		var id = null;
		var next = null;
		var first = $(html).find('div.card').eq(0).data('object-id');
		cards.each(function(k,v){
			var img = $(v).find('.card_image img').attr('src');
			var txt = $(v).find('.card_body h4 a').text();
			if (txt.lc().indexOf(Discogs.artist.lc()) > -1) {
				if (img !== "http://s.pixogs.com/images/default-artist.png") {
					id = $(v).data('object-id');
					return false;     
				} else {
					next = $(v).data('object-id');
				}
			}
		});
		
		if (!defined(id)) {
			var id = defined(next) ? next : first;    
		}
		var loader = new air.URLLoader();
		loader.addEventListener(air.Event.COMPLETE, Discogs.onGetReleases);
		loader.load(new air.URLRequest(Discogs.api+'artists/'+id+'/releases?per_page=100')); 
	},
	
	onGetReleases: function(e) {
		var s = Discogs;
		s.found = [];
		var results = '';
		var data = $.parseJSON(e.target.data);
		data.releases.reverse();
		$(data.releases).each(function(){
			if (this.role === "Main") {
				if (s.found.indexOf(this.title) > -1) {
					return true;
				}
				s.found.push(this.title);
				if (typeof this.year === undefined) {
					this.year = "";
				}
				results += "<div class='album "+this.type+"' data-title='"+this.title+"' data-url='"+this.resource_url+"' data-id='"+this.id+"' data-year='"+this.year+"'>"+this.title+" ("+this.year+")</div>";                
			}            
		});
		
		$('#artist-overview .artist-albums').append($(results).sort(Discogs.sortYear)).removeClass('load6');
		Discogs.initReleases();
	},

	initReleases: function() {
		$('#artist-overview .artist-albums .album').click(function(){
			$('.artist-albums .album.selected').removeClass('selected');
			$(this).addClass('selected');
			$('.col2 .head').eq(1).text($(this).data('title'));
			$('.artist-tracks').html('');
			var url = $(this).data('url');
			Discogs.getTracks(url);
		});

		makeMenu('.artist-albums .album', [
			{title:"Albums only", fn: function(){
        	    $('.artist-albums .album.release').hide();
			}},
			{title:"All releases", fn: function(){
				$('.artist-albums .album.release').show();
			}}
		]);
	},

	getTracks: function(url){
		var loader = new air.URLLoader();
		loader.addEventListener(air.Event.COMPLETE, Discogs.onGetTracks);
		loader.load(new air.URLRequest(url)); 
	},

	onGetTracks: function(e) {
		var results = '';
		var data = $.parseJSON(e.target.data);
		$(data.tracklist).each(function(){
			var title = Discogs.cleanTrackName(this.title);
			var artist = Discogs.artist;
			if (defined(this.artists)) {
				$.each(this.artists, function(k,v){
					if (v.join === "") {
						artist = v.name;
					}
				});	
			}
			if (artist !== Discogs.artist) {
				var albumArtist = "<br/><em>"+artist+"</em>";
			} else { var albumArtist = ""; }
			results += '<div class="track" data-artist="'+ artist +'" data-title="'+ title +'">'
					+ cap(this.title) + albumArtist +"<i>"+ this.duration +"</i></div>";
		});

		$('.artist-tracks').append(results);
		Artist_Overview.initTracks();
	},
	
	sortAlpha: function(a,b) {  
		return $(a).data('year') > $(b).data('year') ? 1 : -1;  
	},

	cleanTrackName: function(str) {
        str = str.replace(/( feat| ft\.| vocals by| vip).*/gi,''); // remove (this) and everything after
        str = str.replace(/(album|version|remix|rerub| mix|rmx|edit|radio)/gi,''); //remove (this)
        str = str.replace(/(mp3|flac|ogg)/gi,'');
        
        str = str.replace(/(\- | \-|\(|\)|\[|\]|\{|\})+/g,''); // remove bracket leftovers
        str = str.replace(/(@|_|,|\.)+/g,' '); // replace with space
        str = str.replace(/(!|#|%|\^|\*|\\|\/|\?|<|>)+/g,''); // remove
        str = str.replace(/"|`/g,"'");
        str = str.replace(/( )+/g,' ');
        return str;
	}
   
}