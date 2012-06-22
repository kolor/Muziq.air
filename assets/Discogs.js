var Discogs = {
    api: "http://api.discogs.com/",
    found: [],
    
    getArtistReleases: function(q) {
        this.found = [];
        q = encodeURIComponent(q);
		var loader = new air.URLLoader();
		loader.addEventListener(air.Event.COMPLETE, Discogs.onGetArtistReleases);
	    loader.load(new air.URLRequest(this.api+'database/search?per_page=100&type=release&artist='+ q));	
    },
    
    onGetArtistReleases: function(e) {
        var results = '';
		var data = $.parseJSON(e.target.data);
        $(data.results).each(function(){
            if (!in_array(this.catno, Discogs.found)) {
                results += '<div class="release">'+ this.catno.toUpperCase() + '</div>';
                Discogs.found.push(this.catno);    
            }
            
        });
        
        $('#artist-overview .artist-releases').append($(results).sort(Discogs.sortAlpha));
    },
    
    sortAlpha: function(a,b) {  
        return $(a).text() > $(b).text() ? 1 : -1;  
    }  
   
}