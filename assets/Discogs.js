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
        $('.artist-releases').addClass('load6');
		var loader = new air.URLLoader();
		loader.addEventListener(air.Event.COMPLETE, Discogs.onFindArtist);
	    loader.load(new air.URLRequest('http://muziq.apps.dj/dc.php?q='+q));	
    },

    onFindArtist: function(e) {
        var id = null;
        var html = e.target.data;
        $(html).find('div.card').each(function(k,v){
           var img = $(v).find('.card_image img').attr('src');
           var txt = $(v).find('.card_body h4 a').text();
           if (img !== "http://s.pixogs.com/images/default-artist.png") {
                if (txt.lc().indexOf(Discogs.artist.lc()) > -1) {
                    id = $(v).data('object-id');
                    return false;
                }
           }
        })
        
        if (defined(id)) {
            var loader = new air.URLLoader();
            loader.addEventListener(air.Event.COMPLETE, Discogs.onGetReleases);
            loader.load(new air.URLRequest(Discogs.api+'artists/'+id+'/releases?per_page=100')); 
        } else {
            $('.dc-albums').removeClass('load4');
        }


        var data = $.parseJSON(e.target.data);
        $(data.results).each(function(){
            if ((lc(this.title).indexOf(lc(Discogs.artist))>-1 || lc(lc(Discogs.artist)).indexOf(this.title)>-1) && this.thumb !== "") {
                Discogs.artistUrl = this.resource_url;
                return false;
            }
        });
        if (Discogs.artistUrl === null) {
            Discogs.artistUrl = data.results[0].resource_url;
        }
        
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
                results += "<div class='release' data-title='"+this.title+"' data-url='"+this.resource_url+"' data-id='"+this.id+"' data-year='"+this.year+"'>"+this.title+" ("+this.year+")</div>";                
            }            
        });
        
        $('#artist-overview .artist-releases').append($(results).sort(Discogs.sortYear)).removeClass('load6');
        $('#artist-overview .artist-releases .release').click(function(){
            $('.artist-releases .release.selected').removeClass('selected');
            $(this).addClass('selected');
            $('.col2 .head').eq(1).text($(this).data('title'));
            $('.artist-tracks').html('');
            var url = $(this).data('url');
            Discogs.getTracks(url);
        });
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
            results += '<div class="track" data-artist="'+ Discogs.artist +'" data-title="'+ cap(this.title) +'">'+ cap(this.title)+"<i>"+ this.duration +"</i></div>";
        });
        $('.artist-tracks').append(results);
        Artist_Overview.initTracks();
    },
    
    sortAlpha: function(a,b) {  
        return $(a).data('year') > $(b).data('year') ? 1 : -1;  
    }  
   
}