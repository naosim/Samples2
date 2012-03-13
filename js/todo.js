////// モデル ///////

/**
 * テーブルの内容を管理するオブジェクト
 * それぞれの配列にタスクIDを持つ
 */
var tableData = {
	todos:new Array(),
	doings:new Array(),
	dones:new Array()
};
/**
 * タスク
 * id, name, todoDate, doingDate, doneDate, state
 */
var tasks = new Array();
/**
 * DBからテーブルデータをロードする
 */
var loadData = function() {
	var str = localStorage.tableData;
	if(str) {
		tableData = JSON.parse(str);
	}
};
/**
 * DBへテーブルデータをセーブする
 */
var saveData = function() {
	localStorage.tableData = JSON.stringify(tableData);
};

/**
 * タスクの削除
 */
var removeTask = function(task) {
	var oldData = tableData;
	tableData = {
		todos:new Array(),
		doings:new Array(),
		dones:new Array()
	};
	// 全コピーして、いらないやつだけコピーしない
	for(var key in oldData) {
		var tableId = dataKeyToTableId(key);
		for(var i = 0; i < oldData[key].length; i++) {
			var t = oldData[key][i];
			if(t.id != task.id) {
				tableData[key].push(t);
			}
		}
	}
};

/**
 * タスクを追加する
 * DOMからタスク名を抽出して、新しいタスクを生成する
 * DOMのエディットモードを終了する
 */
var addTaskToTable = function(task, tableId) {
	var elm = createTaskElm(task);
	document.getElementById(tableId).appendChild(elm);
};

/**
 * テーブルIDをデータキーへ変換する
 * @param {String} tableId : テーブルID
 * @return {String} データキー
 */
var tableIdToDataKey = function(tableId) {
	if(tableId == 'todoTable') {
		key = 'todos';
	}
	else if(tableId == 'doingTable') {
		key = 'doings';
	}
	else if(tableId == 'doneTable') {
		key = 'dones';
	}
	return key;
};

/**
 * データキーをテーブルIDに変換する
 * @param {String} key : データキー
 * @return {String} tableId : テーブルID
 */
var dataKeyToTableId = function(key) {
	var tableId;
	if(key == 'todos') {
		tableId = 'todoTable';
	}
	else if(key == 'doings') {
		tableId = 'doingTable';
	}
	else if(key == 'dones') {
		tableId = 'doneTable';
	}
	return tableId;
};

/**
 * タスクのDIV要素を生成する
 * @param {String} task : タスク
 * @return {Element} elm : DIV要素
 */
var createTaskElm = function(task) {	
	var elm = document.createElement('div');
	elm.className = 'task';
	elm.draggable = 'true';
	elm.addEventListener('dragstart', f_dragstart);
	elm.id = task.id;
	elm.task = task;
	
	// 上下のバー
	var bordertop = document.createElement('div');
	bordertop.className = 'taskbordertop';
	var borderbottom = document.createElement('div');
	borderbottom.className = 'taskborderbottom';
	elm.appendChild(bordertop);
	elm.appendChild(borderbottom);
	
	var p = document.createElement('p');
	p.className = "taskName";
	p.innerHTML = task.name;
	elm.appendChild(p);
	
	var deleteButton = document.createElement('div');
	deleteButton.className = 'deleteButton';
	deleteButton.innerHTML = '<img src="img/trash.png" />';
	deleteButton.addEventListener('click', pressedDeleteButton);
	elm.addEventListener('mouseover', onMouse);
	elm.addEventListener('mouseout', outMouse);
	elm.appendChild(deleteButton);
	outMouse.call(elm);

	return elm;
};

/**
 * マウスが要素に乗ってる -> ゴミ箱表示
 */
var onMouse = function() {
	var deleteButton = this.getElementsByClassName("deleteButton")[0];
	deleteButton.style.display = "block";
}

/**
 * マウスが要素に乗ってない -> ゴミ箱非表示
 */
var outMouse = function() {
	var deleteButton = this.getElementsByClassName("deleteButton")[0];
	deleteButton.style.display = "none";
}

/**
 * セットアップ
 */
var init = function() {
	taskTables = document.getElementsByClassName('taskTable');
	for(var i = 0; i < taskTables.length; i++) {
		taskTables[i].addEventListener('dragover', f_dragover);
		taskTables[i].addEventListener('drop', f_drop);
	}
	
	document.getElementById('addTaskBox').addEventListener('keypress', onKey);
	
	loadData();
	
	for(var key in tableData) {
		var tableId = dataKeyToTableId(key);
		for(var i = 0; i < tableData[key].length; i++) {
			var task = tableData[key][i];
			addTaskToTable(task, tableId);
		}
	}
	resetTaskColor();
};

/**
 * 作者情報表示/非表示の切り替え
 */
var info = function() {
	var popup = document.getElementById('popup');
	if(popup.style.display == 'block') {
		popup.style.display = 'none';
	}
	else {
		popup.style.display = 'block';
	}
};

//// イベント ///////
var pressedDeleteButton = function() {
	var elm = this.parentElement;
	removeTask(elm.task);
	saveData();
	elm.parentElement.removeChild(elm);
	resetTaskColor();
};

/**
 * ドラッグ開始時の処理
 */
function f_dragstart(event){
	//ドラッグするデータのid名をDataTransferオブジェクトにセット
	event.dataTransfer.setData("text", event.target.id);
}

/**
 * ドラッグ要素がドロップ要素に重なっている間の処理
 */
function f_dragover(event){
	//ドラッグされたデータのid名をDataTransferオブジェクトから取得
	var id_name = event.dataTransfer.getData("text");
	//id名からドラッグされた要素を取得
	var drag_elm =document.getElementById(id_name);
	
	if(event.toElement.className == 'taskName') {
		document.title = event.toElement.innerText;
	}
	else {
		document.title = 'タスクかんばん';
	}
	
	//dragoverイベントをキャンセルして、ドロップ先の要素がドロップを受け付けるようにする
	event.preventDefault();
}

/**
 * ドロップ時の処理
*/
function f_drop(event){
	//ドラッグされたデータのid名をDataTransferオブジェクトから取得
	var id_name = event.dataTransfer.getData("text");
	//id名からドラッグされた要素を取得
	var drag_elm =document.getElementById(id_name);
	// 追加先テーブル
	var targetTable = event.currentTarget;
	// 同じテーブルだったら、キャンセル
	// if(drag_elm.parentElement == targetTable) {
		// return;
	// }
	
	//ドロップ先にドラッグされた要素を追加
	document.title = event.toElement.className;
	if(event.toElement.className == 'taskName') {
		// 挿入
		targetTable.insertBefore(drag_elm, event.toElement.parentNode);
	}
	else {
		// 最後尾に追加
		targetTable.appendChild(drag_elm);
	}
	// TODO : しかるべき場所に挿入する
	
	// 挿入された位置を探す
	var index;
	for(index = 0; index < targetTable.childNodes.length && targetTable.childNodes[index] != drag_elm; index++) {
		
	}
	index--;
	document.title = index;
    //エラー回避のため、ドロップ処理の最後にdropイベントをキャンセルしておく
	event.preventDefault();
	// 色をリセット
	resetTaskColor();
	
	var task = drag_elm.task;
	removeTask(task);
	
	// データに追加
	var key = tableIdToDataKey(event.currentTarget.id);
	var p = tableData[key][index];
	//tableData[key].push(task);
	tableData[key].splice(index, 0, task);
	saveData();
}

/**
 * タスク要素のが背景色をリセット(再描画)する
 */
var resetTaskColor = function() {
	// TODO要素
	var todos = document.getElementById('todoTable').childNodes;
	for(var i = 1; i < todos.length; i++) {
		var elm = todos[i].style.background = createColor('F', C_P, '0', i, todos.length);
	}
	
	// DOING要素
	var doings = document.getElementById('doingTable').childNodes;
	for(var i = 1; i < doings.length; i++) {
		var elm = doings[i].style.background = createColor(C_INVP, 'F', '0', i, doings.length);
	}
	
	// DONE要素
	var dones = document.getElementById('doneTable').childNodes;
	for(var i = 1; i < dones.length; i++) {
		var elm = dones[i].style.background = createColor('0', C_INVP, C_P, i, dones.length);
		
	}
}

var C_P = 'p';
var C_INVP = 'invP';
var MAX_COLOR = 9;
var intToHex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
/**
 * 色を生成する(グラデーション用)
 * @param {int} i : 現在の番号
 * @param {int} length : グラデの最大値
 * @param {String} r : 赤。グラデ指定の場合は、C_P 又は C_INVP を指定すること。
 * @param {String} g : 緑。グラデ指定の場合は、C_P 又は C_INVP を指定すること。
 * @param {String} b : 青。グラデ指定の場合は、C_P 又は C_INVP を指定すること。
 */
var createColor = function(r, g, b, i, length) {
	var color = [r, g, b];
	
	var p = Math.floor(i * MAX_COLOR / length);
	var invP = MAX_COLOR - p + (16 - MAX_COLOR);
	var result = '#';
	for(var i = 0; i < color.length; i++) {
		if(color[i] == C_P) {
			 result += intToHex[p];
		}
		else if(color[i] == C_INVP) {
			result += intToHex[invP];
		}
		else {
			result += color[i];
		}
	}
	return result;
};

/**
 * キー操作のイベント
 */
var onKey = function(e){
	// エンターが押されたら、要素追加
	if(e.keyCode == 13) {
		pressedAddButton();
	}
};

/**
 * タスク追加ボタンが押された
 * DOMに新しいタスク領域を追加する
 * タスク領域はエディットモードにする
 */
var pressedAddButton = function() {
	
	if(document.getElementById('addTaskBox').value.length == 0) {
		return;
	}
	
	// 追加するタスク生成
	var task = {
		id:new Date().getTime(),
		name:document.getElementById('addTaskBox').value,
		state:0,
		todoDate:new Date().getTime(),
		doingDate:-1,
		doneDate:-1
	};
	// TODOテーブルに追加
	addTaskToTable(task, 'todoTable');
	// TODOデータに追加
	tableData.todos.push(task);
	
	// タスク入力欄をクリア
	document.getElementById('addTaskBox').value = '';
	
	// セーブ
	saveData();
	
	// テーブルの色をリセット
	resetTaskColor();
};

function hoge() {
	return true;
}