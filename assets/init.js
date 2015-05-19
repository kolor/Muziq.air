var token = null;
var player;
var downloading;
var appUpdater = new runtime.air.update.ApplicationUpdaterUI();
var popup = null;
var fileCount = 1;
var existingFiles = "";

window.nativeWindow.addEventListener(air.Event.CLOSE, onExit);
window.nativeWindow.addEventListener(air.Event.CLOSING, onExit);

var encToken = air.EncryptedLocalStore.getItem("token"); 
if (encToken !== null) {
	token = encToken.readUTFBytes(encToken.length);
}


//air.Introspector.Console.log(token);

function checkUpdate() {
	appUpdater.updateURL = "http://muziq.airy.me/update.xml";
	appUpdater.addEventListener(runtime.air.update.events.UpdateEvent.INITIALIZED, onUpdate);
	appUpdater.addEventListener(runtime.flash.events.ErrorEvent.ERROR, onUpdateError);
	appUpdater.isCheckForUpdateVisible = false;
    appUpdater.initialize();
}
function onUpdate(event) {
	appUpdater.checkNow();
}

function onUpdateError() {
	
}

function onExit() {
    if (typeof popup.nativeWindow != 'undefined') {
        popup.nativeWindow.close();    
    }
}

var inLogin = false;

function vkLogin(forced) {
	if (forced == false && token !== null && token !== "") 	return;
	if (inLogin === true) return;
	inLogin = true;
	var token_url = 'http://api.vk.com/blank.html';
	var wndOpts = new air.NativeWindowInitOptions();
	wndOpts.type = air.NativeWindowType.UTILITY;
	wndOpts.resizable = false;
	var wnd = air.HTMLLoader.createRootWindow(false, wndOpts, false);
    popup = wnd.window;
	wnd.window.nativeWindow.height = 280;
	wnd.window.nativeWindow.width = 490;
	wnd.addEventListener(air.Event.COMPLETE, onLogin);
	wnd.load(new air.URLRequest('http://api.vk.com/oauth/authorize?client_id=1918220&scope=24&display=popup&response_type=token&redirect_uri='+token_url));
}

function onLogin(e) {
	//air.Introspector.Console.log(e.target.location);
	var url = e.target.location.toString();
	if (url.match(/^http:\/\/api.vk.com\/blank.html/)) {
		e.target.removeEventListener(air.Event.COMPLETE, onLogin);
		token = url.substring(url.indexOf('=')+1,url.indexOf('&'));
		if (token == 'access_denied') {
			e.target.root.nativeWindow.activate();
    	} else {
			e.target.root.nativeWindow.close();
	    	var bytes = new air.ByteArray();
	    	bytes.writeUTFBytes(token);
	    	air.EncryptedLocalStore.setItem("token", bytes);
			inLogin = false;
			//air.Introspector.Console.log(token);
    	}
	} else {
		e.target.root.nativeWindow.activate();
	}
		
}

function download(url, filename) {
	fileName = cleanFile(filename)+'.mp3';
	var urlStream = new air.URLStream();
    var fileStream = new air.FileStream();
    var cancel = false;
    
    var menu = new air.NativeMenu();
    menu.addItem(new air.NativeMenuItem("Cancel")).addEventListener(air.Event.SELECT, function(){
	    cancel = true;
    });
    function showMenu(e) {
		menu.display(window.nativeWindow.stage, e.clientX, e.clientY); 
	}

    function writeFile(e) {
    	var perc =  parseInt(e.bytesLoaded*100 / e.bytesTotal);
        progress.css('background-size', perc +'% 100%');
        if (urlStream.bytesAvailable > 51200) {
          var dataBuffer = new air.ByteArray();
          urlStream.readBytes(dataBuffer, 0, urlStream.bytesAvailable);
          fileStream.writeBytes(dataBuffer, 0, dataBuffer.length);
        }
        if (cancel == true) {
            finishFile();   
        }
    }
	
    function finishFile() {
    	var dataBuffer = new air.ByteArray();
        urlStream.readBytes(dataBuffer, 0, urlStream.bytesAvailable);
        fileStream.writeBytes(dataBuffer, 0, dataBuffer.length);
        fileStream.close();
        urlStream.close();
    	progress.remove();
    
    }
    	
    downpath = new air.File()
	downpath.nativePath = DOWNLOAD_FOLDER;
	downpath.createDirectory();

	if (lc(existingFiles).indexOf(fileName) === -1) {
		existingFiles += lc(fileName) + " ";	
	}	

	var file = downpath.resolvePath(fileName);
      if (file.exists) {
          fileName = fileName +'_'+ fileCount++;
          file = downpath.resolvePath(fileName);
      } 
	  $('.artist-tracks .track.selected').addClass('downloaded');
      $(downloading).addClass('downloaded');  
      var progress = $('<div/>');
      progress.appendTo($('.downloads'));
      progress.text(fileName);
      progress.bind('contextmenu', showMenu);
    
	  urlStream.addEventListener(air.Event.COMPLETE, finishFile);
	  urlStream.addEventListener(air.ProgressEvent.PROGRESS, writeFile);
  	  fileStream.openAsync(file, air.FileMode.WRITE);

  	  urlStream.load(new air.URLRequest(url));
	  
}

function indexExistingFiles(artist)
{
	existingFiles = "";
	var dir = new air.File;
	dir.nativePath = DOWNLOAD_FOLDER;
	dir.createDirectory();
	var contents = dir.getDirectoryListing();  
	$.each(contents, function(i,f){
		if (lc(f.name).indexOf(lc(artist)) > -1) {
			existingFiles += lc(f.name) + " ";	
		}		
	});
}

function markExistingFiles()
{
	$('.artist-tracks .track').each(function(k,v){
		if (existingFiles.indexOf(lc($(v).data('title')))>-1) {
			$(this).addClass('bold');
		}
	});
	

}