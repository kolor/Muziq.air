//air.Introspector.Console.log('1');

var player;
var downloading;
var appUpdater = new runtime.air.update.ApplicationUpdaterUI();
var popup = null;
var token = null;
var fileCount = 1;

window.nativeWindow.addEventListener(air.Event.CLOSE, onExit);
window.nativeWindow.addEventListener(air.Event.CLOSING, onExit);

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


function vkLogin() {
	var token_url = 'http://api.vk.com/blank.html';
	var wndOpts = new air.NativeWindowInitOptions();
	wndOpts.type = air.NativeWindowType.UTILITY;
	wndOpts.resizable = false;
	var wnd = air.HTMLLoader.createRootWindow(false, wndOpts, false);
    popup = wnd.window;
	wnd.window.nativeWindow.height = 280;
	wnd.window.nativeWindow.width = 490;
	wnd.addEventListener(air.Event.COMPLETE, onLogin);
	wnd.load(new air.URLRequest('http://api.vk.com/oauth/authorize?client_id=1902594&scope=24&display=popup&response_type=token&redirect_uri='+token_url));
}

function onLogin(e) {
	var url = e.target.location.toString();
	if (url.match(/^http:\/\/api.vk.com\/blank.html/) || url.match(/^http:\/\/api.vkontakte.ru\/blank.html/)) {
		e.target.removeEventListener(air.Event.COMPLETE, onLogin);
		token = url.substring(url.indexOf('=')+1,url.indexOf('&'));
		if (token == 'access_denied') {
            e.target.root.nativeWindow.activate();
        } else {
			e.target.root.nativeWindow.close();
	        //localStorage.setItem('token', token);
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
    
      downpath = air.File.desktopDirectory.resolvePath('Muziq');
	  downpath.createDirectory();
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