$(function(){
    $('#home .button').click(function(){
        var q = $('#home input').val();
        if (q != '') {
            Artist_Search.find(q);
            goToView('home','artist-search');
        }
    });
	checkUpdate();
	vkLogin();
	
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
				Artist_Search.findTag(q.val());
			} else if (q.attr('rel') == 'artist') {
				Artist_Search.find(q.val());
				goToView('artist-overview','artist-search');
				$('.artist-similar, .artist-tracks, .tracks-sources, .tracks-bitrate').empty();
			} else {
                $('.artist-tracks, .tracks-sources, .tracks-bitrate').empty();
                Artist_Search.findTrack(q.val());
            }
        }
		
	});
	
	$('#home input').keydown(function(event){
		if (event.keyCode == '13') {
				var q = $('#home input').val();
	        if (q != '') {
	            Artist_Search.find(q);
	            goToView('home','artist-search');
	        }
		}
	});
    
    // init small search box
    
	$('.toolbar .search').keydown(function(event){
		if (event.keyCode == '13') {
            $('.toolbar button').click();
		}
	});
    
    var menu = new air.NativeMenu();
	menu.addItem(new air.NativeMenuItem("Search artists")).addEventListener(air.Event.SELECT, function(e){
	    $('.toolbar .search').attr('rel','artist').attr('placeholder','search artist here');	
    });
    menu.addItem(new air.NativeMenuItem("Search Tracks")).addEventListener(air.Event.SELECT, function(e){
	    $('.toolbar .search').attr('rel','tracks');	
    });
    menu.addItem(new air.NativeMenuItem("Search genres")).addEventListener(air.Event.SELECT, function(e){
	    $('.toolbar .search').attr('rel','genre').attr('placeholder','search genre here');;	
    });
    menu.addItem(new air.NativeMenuItem("Search tags")).addEventListener(air.Event.SELECT, function(e){
	    $('.toolbar .search').attr('rel','tags');	
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
		    Artist_Overview.init($(this).attr('data-mbid'), $(this).attr('data-artist'));
		    goToView('artist-search','artist-overview');
		});
	},
	
	find: function(q) {
	    LastFm.getArtists(q);
	},
	
	findTag: function(q) {
		LastFm.getTag(q);
	},
    
    findTrack: function(q) {
        VK.getTracks(q);
    }
	
	
}


var Artist_Overview = {
    artist: null,
    mbid: null,
	similar: {
		artist: null,
		img: null,
		mbid: null
	},
    
    init: function(mbid, artist){
		
		$('.artist-tracks .track').live('click', function(){
			$('.artist-tracks .track.selected').removeClass('selected');
			$(this).addClass('selected');
			VK.getFiles($(this));
		});
		
        this.artist = this.similar.artist =  artist;
        this.mbid = this.similar.mbid = mbid;
        $('.artist-similar').addClass('load4');
        $('.artist-tracks').addClass('load6');
        if (mbid == "") {
            LastFm.getTracks(null, artist);
            LastFm.getSimilar(null, artist);
        } else {
            LastFm.getTracks(mbid);
            LastFm.getSimilar(mbid);    
        }        
    },
    
    initSimilar: function(){
        $('#artist-overview .artist-similar').prepend('<div class="similar" data-mbid="'+ this.similar.mbid +'" data-artist="'+ this.similar.artist + '" style="background-image: '+ this.similar.img +'"><div class="name">'+ this.similar.artist +'</div></div>');
        $('#artist-overview .artist-similar .similar').hover(function(){
            $(this).find('div').animate({top:0});
        }, function(){
            $(this).find('div').animate({top:-60});
        });
        $('.artist-similar .similar').click(function(){
            $('.artist-tracks').addClass('load6').empty();
            Artist_Overview.mbid = $(this).attr('data-mbid'); 
            Artist_Overview.artist = $(this).attr('data-artist');
            if (mbid == "") {
                LastFm.getTracks(null, Artist_Overview.artist);
            } else {
                LastFm.getTracks(Artist_Overview.mbid);
            }
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
			if (mbid == null || mbid == "") {
				LastFm.getSimilar(null, name);
			} else {
				LastFm.getSimilar(mbid);
			}
			
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
            if (Artist_Overview.mbid == "") {
                LastFm.getTracks(null, Artist_Overview.artist);
            } else {
                LastFm.getTracks(Artist_Overview.mbid);
            }
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
		var menu = new air.NativeMenu();
        var target = null;
		
		menu.addItem(new air.NativeMenuItem("Sort A-Z")).addEventListener(air.Event.SELECT, function(){
			var sel = $('.artist-tracks .track');
			sel.sort(function(a,b){
				return $(a).text() > $(b).text() ? 1 : -1
			});
			$('.artist-tracks').html(sel);
            Artist_Overview.initTracks();
		});
        
       menu.addItem(new air.NativeMenuItem("Sort Votes")).addEventListener(air.Event.SELECT, function(){
			var sel = $('.artist-tracks .track');
			sel.sort(function(a,b){
				return parseInt($(a).find('i').text()) < parseInt($(b).find('i').text()) ? 1 : -1
			});
			$('.artist-tracks').html(sel);
            Artist_Overview.initTracks();
		});
		
		menu.addItem(new air.NativeMenuItem("Get More")).addEventListener(air.Event.SELECT, function(){
			LastFm.getMoreTracks(Artist_Overview.mbid, Artist_Overview.artist);
		});
        
        menu.addItem(new air.NativeMenuItem("Mark")).addEventListener(air.Event.SELECT, function(){
			target.addClass('bold');
		});

		menu.addItem(new air.NativeMenuItem("Remove")).addEventListener(air.Event.SELECT, function(){
			target.remove();
		});
		
		function showMenu(e) {
            target = $(e.currentTarget);
			menu.display(window.nativeWindow.stage, e.clientX, e.clientY); 
		}
		
		$('.artist-tracks .track').bind('contextmenu', showMenu);
    },
	
	initTrackSources: function() {
		$('.tracks-sources').removeClass('load3');
		$('.tracks-sources .source').click(function(){
			player.setMedia({'mp3':$(this).attr('data-url')});
			player.play();
			$('.tracks-sources .source.selected').removeClass('selected');
			$(this).addClass('selected');
			VK.getBitrate($(this).attr('data-duration'));
		});
		$('.tracks-sources .source').eq(0).click();
	},
	
	initTrackBitrate: function() {
		$('.tracks-bitrate .bitrate').click(function(){
			VK.getBitrateInfo($(this));
		});
		$('.tracks-bitrate .bitrate').each(function(){
			setTimeout(function(el){
				el.click();
			}($(this)), 50);
		});
		setTimeout(function(){
			var sel = $('.tracks-bitrate .bitrate');
			sel.sort(function(a,b){
				return parseInt($(a).attr('data-bitrate')) > parseInt($(b).attr('data-bitrate')) ? -1 : 1;
			});
			$('.tracks-bitrate').html(sel);
			Artist_Overview.initTrackDownload();
		}, 2000);
	},
	
	initTrackDownload: function(){
		var menu = new air.NativeMenu();
		var target = null;
		var url = null;
		
		menu.addItem(new air.NativeMenuItem("Download")).addEventListener(air.Event.SELECT, function(){
			if (VK.type == 'track') {
                var filename = $('.artist-tracks .track.selected').attr('data-artist')+ " - "+ $('.artist-tracks .track.selected').attr('data-title');
                filename += $('.tracks-sources .source.selected .title').attr('data-remix');
            } else {
                var filename = $('.tracks-sources .source.selected').attr('data-artist')+ " - "+$('.tracks-sources .source.selected').attr('data-title');
            }
            download(url, filename);
		});
		
		menu.addItem(new air.NativeMenuItem("Play")).addEventListener(air.Event.SELECT, function(){
			player.setMedia({'mp3':url});
			player.play();
		});
		
		function showMenu(e) {
			downloading = target = $(e.currentTarget);
			url = $(target).attr('data-url');
			menu.display(window.nativeWindow.stage, e.clientX, e.clientY); 
		}
		
		$('.tracks-bitrate .bitrate').bind('contextmenu', showMenu);
	}
    
    
}


