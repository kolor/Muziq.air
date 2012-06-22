$(function(){
    $('#home .button').click(function(){
        var q = $('#home .artist input').val();
        if (q != '') {
            Artist_Search.find(q);
            goToView('home','artist-search');
        }
    });
});
