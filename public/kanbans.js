function startAddingKanban(elem) {
	var kanbans = elem.parentNode;
	var kanban = document.createElement('div');
	kanban.className = "kanban";
	var input = document.createElement('textarea');
	input.className = "card";
	input.setAttribute("placeholder","Введите название доски");
	input.onkeydown = pressEnter;

	var add = document.createElement('div');
  	add.className = "add-card-button";
  	add.innerHTML = "Добавить доску";
  	add.setAttribute("onclick",'addKanban(this)');

  	var close = document.createElement('div');
  	close.className = "close";
  	close.setAttribute("onclick", 'stopAddingKanban(this)');
  	var cross = document.createElement('div');
  	cross.className = "cross";

  	close.appendChild(cross);
  	kanban.appendChild(input);
  	kanban.appendChild(add);
  	kanban.appendChild(close);

  	kanbans.replaceChild(kanban,elem);
  	kanbans.querySelectorAll('textarea')[0].focus();
}

var addKanban = async(elem) => {
	var kanban = createKanban(0,elem.parentNode.querySelectorAll('textarea')[0].value,elem.parentNode);
	sendChanges(kanban);
	replaceKanban(elem.parentNode);
}

function stopAddingKanban(elem) {
	replaceKanban(elem.parentNode);
}

function replaceKanban(elem) {
	var kanban = document.createElement('div');
	kanban.className = 'kanban add-kanban';
	kanban.innerHTML = 'Новая доска...';
	kanban.setAttribute('onclick','startAddingKanban(this)');
	elem.parentNode.replaceChild(kanban,elem);
}

function pressEnter(e) {
  if (e.keyCode == 13) {
    e.target.parentNode.querySelectorAll('.add-card-button')[0].click();
  } 
}

function sendChanges(kanban) {
	var ans = '';

	var xhr = new XMLHttpRequest();

	var body = 'title=' + encodeURIComponent(kanban.innerHTML);

	xhr.open("POST", '/add_kanban', true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

	xhr.onreadystatechange = function() {
	  if (this.readyState != 4) return;

	  kanban.setAttribute('id', this.responseText);
	}

	xhr.send(body);	
}

function createKanban(id,title,next) {
	var kanban = document.createElement('a');
	kanban.className = "kanban exist-kanban";
	kanban.setAttribute('href','/kanban?id='+id);
	kanban.id = id;
	kanban.innerHTML = title;
	kanban = next.parentNode.insertBefore(kanban,next);
	return kanban;
}

function createKanbans() {
	var info = document.getElementById('info');
	var last = document.querySelectorAll('.add-kanban')[0];
	var kanbans = JSON.parse(info.innerHTML);
	kanbans.forEach((item, i, arr) => {
		createKanban(item.kanban_id,item.title,last);
	})
}

createKanbans();