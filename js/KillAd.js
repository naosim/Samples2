var KillAd = {};
// fc2をスマホで表示したときに出る広告を削除する
KillAd.count = 0;
KillAd.kill = function() {
	var body = document.getElementsByTagName('body')[0];
	var childs = body.childNodes;
	var isFooter = false;
	for(var i = 0; i < childs.length; i++) {
		var child = childs[i];
		if(isFooter && child.className && child.className.indexOf('ad_frame') != -1) {
			body.removeChild(child);
		}
		else if(child.id == 'fc2_footer'){
			isFooter = true;
		}
	}
	
	// 0.1秒間隔で5秒間殺す処理を走らせる
	if(KillAd.count < 50) {
		KillAd.count++;
		window.setTimeout(KillAd.kill, 100);
	}
};

window.addEventListener('load', KillAd.kill);
