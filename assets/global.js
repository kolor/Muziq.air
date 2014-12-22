$(function(){
	vkLogin(false);

	
	player = new CirclePlayer("#jquery_jplayer_1", {
		mp3: "http://airy.me/test.mp3",
	}, {
		cssSelectorAncestor: "#cp_container_1",
		supplied: "mp3"
	});
	
	$('.toolbar button').click(function(){
		var q = $('.toolbar .search');
		if (q.val() != '') {
			if (q.attr('rel') == 'genre') {
				$('#artist-overview .artist-similar').empty().addClass('load4');
				Artist_Overview.findTag(q.val());
			} else if (q.attr('rel') == 'artist') {
				Artist_Overview.init(q.val());
				$('.artist-similar, .artist-albums, .artist-tracks, .tracks-sources, .tracks-bitrate').empty();
			} else if (q.attr('rel') == 'albums') {
				Discogs.getReleases(q.val());
			} else {
				$('.artist-tracks, .tracks-sources, .tracks-bitrate').empty();
				Artist_Overview.findTrack(q.val());
			}
		}
		
	});
	
	$('#home input').keydown(function(event){
		if (event.keyCode == '13') {
				var q = $('#home input').val();
			if (q != '') {
				Artist_Overview.init(q);
				goToView('home','artist-overview');
			}
		}
	});
	
			// track click handler
		$('.artist-tracks .track').live('click', function(){
			$('.artist-tracks .track.selected').removeClass('selected');
			mode = 1;
			$(this).addClass('selected');
			VK.getFiles($(this));
		});
	
	// init small search box
	
	$('.toolbar .search').keydown(function(event){
		if (event.keyCode == '13') {
			$('.toolbar button').click();
		}
	});
	
	var menu = new air.NativeMenu();
	menu.addItem(new air.NativeMenuItem("Search Artists")).addEventListener(air.Event.SELECT, function(e){
		$('.toolbar .search').attr('rel','artist').attr('placeholder','search artist here');	
	});
	menu.addItem(new air.NativeMenuItem("Search Tracks")).addEventListener(air.Event.SELECT, function(e){
		$('.toolbar .search').attr('rel','tracks');	
	});
	menu.addItem(new air.NativeMenuItem("Search Tags")).addEventListener(air.Event.SELECT, function(e){
		$('.toolbar .search').attr('rel','genre').attr('placeholder','search genre here');;	
	});
	menu.addItem(new air.NativeMenuItem("Search Albums")).addEventListener(air.Event.SELECT, function(e){
		$('.toolbar .search').attr('rel','albums');	
	});
		
	function showMenu(e) {
		menu.display(window.nativeWindow.stage, e.clientX, e.clientY); 
		e.preventDefault();
		return false;
	}
	$('.toolbar .search').bind('contextmenu', showMenu);
	

});


var Artist_Search = {
	init: function(){
		$('#artist-search .artist').hover(function(){
			$(this).find('.info').animate({bottom:0});
		}, function(){
			$(this).find('.info').animate({bottom:-100});
		});	
		
		$('#artist-search .artist').click(function(){
			Artist_Overview.similar.img = $(this).css('background-image');

		});
	},
	
	find: function(q) {
		LastFm.getArtists(q);
	},
	

	
	
	
	
}

var mode = 1; // 1 = play tracks, 0 = just load info

var Artist_Overview = {
	artist: null,
	similar: {
		artist: null,
		img: null,
	},

	findTrack: function(q) {
		mode = 0;
		VK.getTracks(q);
	},

	findTag: function(q) {
		LastFm.getTag(q);
	},

	findAlbums: function(q) {
		Discogs.findArtist(q);
	},
	
	init: function(artist){
		this.artist = this.similar.artist =  artist;
		$('.artist-similar').addClass('load4');
		$('.artist-tracks').addClass('load6');
		LastFm.getTracks(artist);
		LastFm.getSimilar(artist);     
		Discogs.findArtist(artist);
		indexExistingFiles(artist);
	},
	
	initSimilar: function(){
		$('#artist-overview .artist-similar').prepend('<div class="similar" data-artist="'+ this.similar.artist + '" style="background-image: '+ this.similar.img +'"><div class="name">'+ this.similar.artist +'</div></div>');
		$('#artist-overview .artist-similar .similar').hover(function(){
			$(this).find('div').animate({top:0});
		}, function(){
			$(this).find('div').animate({top:-60});
		});
		$('.artist-similar .similar').click(function(){
			$('.artist-tracks').addClass('load6').empty();
			$('.artist-albums').addClass('load6').empty();
			$('.col2 .head').eq(1).text('Albums');
			$('.col2 .head').eq(2).text('Top Tracks');
			Artist_Overview.artist = $(this).attr('data-artist');
			LastFm.getTracks(Artist_Overview.artist);
			Discogs.findArtist(Artist_Overview.artist);
		});
		
		$('.artist-similar').removeClass('load4');
		
		var menu = new air.NativeMenu();
		var mbid = null;
		var name = null;
		var img = null;
		
		menu.addItem(new air.NativeMenuItem("Get Similar")).addEventListener(air.Event.SELECT, function(e){
			Artist_Overview.similar.artist = name;
			Artist_Overview.similar.mbid = mbid;
			Artist_Overview.similar.img = img;
			$('.artist-similar').addClass('load4').empty();
			LastFm.getSimilar(name);	
		});
		
		menu.addItem(new air.NativeMenuItem("Play Radio")).addEventListener(air.Event.SELECT, function(e){
			var artists = [];
			$.each($('.artist-similar .similar'), function(k,v){
				artists.push($(v).attr('data-artist'));
			});
			$('.artist-tracks').empty();
			LastFm.playRadio(artists);
		});
		
		function showMenu(e) {
			mbid = $(e.currentTarget).attr('data-mbid');
			name = $(e.currentTarget).attr('data-artist');
			img = $(e.currentTarget).css('background-image');
			menu.display(window.nativeWindow.stage, e.clientX, e.clientY); 
		}
		$('.artist-similar .similar').bind('contextmenu', showMenu);
		
	},

	initTags: function(){
		$('.artist-similar .similar').click(function(){
			$('.artist-tracks').addClass('load6').empty();
			Artist_Overview.mbid = $(this).attr('data-mbid'); 
			Artist_Overview.artist = $(this).attr('data-artist');
			LastFm.getTracks(Artist_Overview.artist);
		});
		$('#artist-overview .artist-similar .similar').hover(function(){
			$(this).find('div').animate({top:0});
		}, function(){
			$(this).find('div').animate({top:-60});
		});
		$('.artist-similar .similar').removeClass('load4');
	
	
	},
	
	initTracks: function(){
		$('.artist-tracks').removeClass('load6');		
		markExistingFiles();

		makeMenu('.artist-tracks .track', [
			{title:"Sort A-Z", fn: function(){
				var sel = $('.artist-tracks .track');
				sel.sort(function(a,b){
					return $(a).text() > $(b).text() ? 1 : -1
				});
				$('.artist-tracks').html(sel);
				Artist_Overview.initTracks();
			}},
			{title:"Sort Votes", fn:function(){
				var sel = $('.artist-tracks .track');
				sel.sort(function(a,b){
					return parseInt($(a).find('i').text()) < parseInt($(b).find('i').text()) ? 1 : -1
				});
				$('.artist-tracks').html(sel);
				Artist_Overview.initTracks();
			}},
			{title:"Get More", fn:function(){
				LastFm.getMoreTracks(Artist_Overview.artist);
			}},
			{title:"Mark", fn:function(){
				$(menuTarget).addClass('bold');
			}},
			{title:"Remove", fn:function(){
				$(menuTarget).remove();
			}}
		]);
	},
	
	initTrackSources: function() {
		$('.tracks-sources').removeClass('load3');
		$('.tracks-sources .source').click(function(){
			$('.tracks-sources .source.selected').removeClass('selected');
			$(this).addClass('selected');
			VK.getBitrate($(this).attr('data-duration'));
		});
		$('.tracks-sources .source').eq(0).click();
	},
	
	initTrackBitrate: function() {
		$('.tracks-bitrate .bitrate').live('click', function(){
			$('.tracks-bitrate .bitrate.selected').removeClass('selected');
			$(this).addClass('selected');
			//VK.getBitrate($(this).attr('data-duration'));
			player.setMedia({'mp3':$(this).attr('data-url')});
			player.play();
		});

		var it = $('.tracks-bitrate .bitrate').length;

		$('.tracks-bitrate .bitrate').each(function(){
			setTimeout(function(el){
				//el.click();
				VK.getBitrateInfo(el);
			}($(this)), 50);
		});
		setTimeout(function(){
			var sel = $('.tracks-bitrate .bitrate');
			sel.sort(function(a,b){
				return parseInt($(a).attr('data-bitrate')) > parseInt($(b).attr('data-bitrate')) ? -1 : 1;
			});
			$('.tracks-bitrate').html(sel);
			Artist_Overview.initTrackDownload();
			$('.tracks-bitrate .bitrate').eq(0).click();
		}, 2000);
	},
	
	initTrackDownload: function(){
		makeMenu('.tracks-bitrate .bitrate', [
			{title:"Download", fn: function(){
				var url = $(menuTarget).attr('data-url');
				if (VK.type == 'track') {
					var filename = $('.artist-tracks .track.selected').attr('data-artist')+ " - "+ $('.artist-tracks .track.selected').attr('data-title');
					filename += $('.tracks-sources .source.selected .title').attr('data-remix');
				} else {
					var filename = $('.tracks-sources .source.selected').attr('data-artist')+ " - "+$('.tracks-sources .source.selected').attr('data-title');
				}
				download(url, filename);	
			}},
			{title: "Play", fn: function(){
				$(menuTarget).click();
			}}
		]);
	}
	
	
}


