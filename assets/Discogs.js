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
		var loader = new air.URLLoader();
		loader.addEventListener(air.Event.COMPLETE, Discogs.onFindArtist);
	    loader.load(new air.URLRequest(this.api+'database/search?type=artist&q='+q));	
    },

    onFindArtist: function(e) {

        var data = $.parseJSON(e.target.data);
        $(data.results).each(function(){
            if (lc(this.title) === lc(Discogs.artist)) {
                Discogs.artistUrl = this.resource_url;
            }
        });
        if (Discogs.artistUrl !== null) {
            var loader = new air.URLLoader();
            loader.addEventListener(air.Event.COMPLETE, Discogs.onGetReleases);
            loader.load(new air.URLRequest(Discogs.artistUrl+'/releases?per_page=100')); 
        }
    },


    
    onGetReleases: function(e) {
        var results = '';
		var data = $.parseJSON(e.target.data);
        $(data.releases).each(function(){
            if (this.role === "Main") {
                if (typeof this.year === undefined) {
                    this.year = "";
                }
                results += "<div class='release' data-title='"+this.title+"' data-url='"+this.resource_url+"' data-id='"+this.id+"' data-year='"+this.year+"'>"+this.title+" ("+this.year+")</div>";                
            }            
        });
        
        $('#artist-overview .artist-releases').append($(results).sort(Discogs.sortYear));
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
    },
    
    sortAlpha: function(a,b) {  
        return $(a).data('year') > $(b).data('year') ? 1 : -1;  
    }  
   
}