// Создание новой доски с соответствующим именем и идентификатором
function createKanban(id,title_text,next) {
	var kanban = document.createElement('div');
	kanban.className = "kanban exist-kanban";
	kanban.setAttribute('onclick','return location.href = \'/kanban?id='+id+'\'');
	if (id) kanban.setAttribute('data-id',id);

	var title = document.createElement('div');
	title.className = 'title';
	title.innerHTML = title_text;

	var edit = document.createElement('div');
	edit.className = "edit";
	edit.innerHTML = "ред.";
	edit.setAttribute("onclick",'startChangeKanban(event)');

	var del = document.createElement('div');
	del.className = "delete";
	del.innerHTML = "удалить";
	del.setAttribute("onclick",'deleteKanban(event)');

	kanban.appendChild(title);
	kanban.appendChild(del);
	kanban.appendChild(edit);
	kanban.setAttribute('onmouseover','showButtons(this,\'inline-block\')');
	kanban.setAttribute('onmouseout','showButtons(this,\'none\')');
	kanban = next.parentNode.insertBefore(kanban,next);
	return kanban;
}

function createTextareaKanban(button_text,add_func,cancel_func,text=undefined) {
	var kanban = document.createElement('div');
	kanban.className = "kanban";

	var input = document.createElement('textarea');
	input.className = "card";
	if (text) {
		input.value = text;
	}
	else input.setAttribute("placeholder","Введите название доски");
	input.onkeydown = pressEnter;

	var add = document.createElement('div');
  	add.className = "add-card-button";
  	add.innerHTML = button_text;
  	add.setAttribute("onclick",add_func);

  	var close = document.createElement('div');
  	close.className = "close";
  	close.setAttribute("onclick", cancel_func);
  	var cross = document.createElement('div');
  	cross.className = "cross";
  	close.appendChild(cross);

  	var buttons = document.createElement('div');
  	buttons.appendChild(add);
  	buttons.appendChild(close);

  	kanban.appendChild(input);
  	kanban.appendChild(buttons);
  	return kanban;
}

// Процесс добавления доски

// Начать добавления, прикрепляется к кнопке "Новая доска..."
// Преобразует эту кнопку в окно ввода названия новой доски
function startAddingKanban(elem) {
	var kanbans = elem.parentNode;
	var kanban = createTextareaKanban("Добавить доску",'addKanban(this)','stopAddingKanban(this)');
  	kanbans.replaceChild(kanban,elem);
  	kanbans.querySelectorAll('textarea')[0].focus();
}

// Добавить доску на экран
// Прикрепляется к кнопке "Добавить доску"
// Заменяет поля ввода названия новой доски на доску с соответствующим названием
function addKanban(elem) {
	var text = elem.parentNode.parentNode.querySelectorAll('textarea')[0].value;
	if (text) {
		var kanban = createKanban(undefined,text,elem.parentNode.parentNode);
		sendChanges(kanban);
		replaceKanban(elem.parentNode.parentNode);
	}
}

// Прекратить добавление доски
// Прикрепляется к крестику
// Заменяет поле ввода названия новой доски на кнопку "Новая доска"
function stopAddingKanban(elem) {
	replaceKanban(elem.parentNode.parentNode);
}

// Вспомогательная функция для замены доски 
// или поля ввода названия доски на кнопку "Новая доска"
function replaceKanban(elem) {
	var kanban = document.createElement('div');
	kanban.className = 'kanban add-kanban';
	kanban.innerHTML = 'Новая доска...';
	kanban.setAttribute('onclick','startAddingKanban(this)');
	elem.parentNode.replaceChild(kanban,elem);
}

// Обработчик нажатия клавиши
// При вводе клавиши enter добавляем новую доску
function pressEnter(e) {
  if (e.keyCode == 13) {
    e.target.parentNode.querySelectorAll('.add-card-button')[0].click();
  } 
}

// Функции-запросы для связи с сервером и изменения данных в базе данных

// Отправить данные о новой доске
function sendChanges(kanban) {
	var title = kanban.querySelectorAll('.title')[0].innerHTML;

	var xhr = new XMLHttpRequest();
	var body = '';
	if (kanban.getAttribute('data-id')) body = 'id=' + kanban.getAttribute('data-id') + '&';
	body += 'title=' + encodeURIComponent(title);

	xhr.open("POST", '/change_kanban', true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

	xhr.onreadystatechange = function() {
	  if (this.readyState != 4) return;

	  kanban.setAttribute('data-id', this.responseText);
	}

	xhr.send(body);	
}

function sendDelete(kanban) {
	var xhr = new XMLHttpRequest();
	var body = 'id=' + kanban.getAttribute('data-id');

	xhr.open("POST", '/delete_kanban', true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

	xhr.send(body);	
}

function showButtons(kanban,state) {
	var edit = kanban.querySelectorAll('.edit')[0];
	var del = kanban.querySelectorAll('.delete')[0];
	if (edit) {
		edit.style.display = state;
	}
	if (del) {
		del.style.display = state;
	}
}


function deleteKanban(event) {
	event.stopPropagation();
	if (confirm("Удалить элемент?")) {
		var kanban = event.target.parentNode;
		sendDelete(kanban);
		kanban.parentNode.removeChild(kanban);
	}
}

var oldTitle = undefined;

function startChangeKanban(event) {
	event.stopPropagation();
	var kanban = event.target.parentNode;
	var text = kanban.querySelectorAll('.title')[0].innerHTML;
	oldTitle = text;
	var newKanban = createTextareaKanban('Изменить доску','changeKanban(this)','stopChangeKanban(this)',text);
	newKanban.setAttribute('data-id',kanban.getAttribute('data-id'));
	kanban.parentNode.replaceChild(newKanban,kanban);
	newKanban.parentNode.querySelectorAll('textarea')[0].focus();
}

function changeKanban(elem) {
	var kanban = elem.parentNode.parentNode;
	var text = kanban.querySelectorAll('textarea')[0].value;
	oldTitle = undefined;
	if (text) {
		var new_kanban = createKanban(kanban.getAttribute('data-id'),text,kanban);
		sendChanges(new_kanban);
		kanban.parentNode.removeChild(kanban);
	}
}

function stopChangeKanban(elem) {
	var kanban = elem.parentNode.parentNode;
	var text = oldTitle;
	oldTitle = undefined;
	if (text) {
		var new_kanban = createKanban(kanban.getAttribute('data-id'),text,kanban);
		kanban.parentNode.removeChild(kanban);
	}
}

// Добавление на страницу всех досок, полученных от сервера при загрузке страницы
function createKanbans() {
	var info = document.getElementById('info');
	var last = document.querySelectorAll('.add-kanban')[0];
	var kanbans = JSON.parse(info.innerHTML);
	kanbans.sort((a,b) => (a.kanban_id > b.kanban_id) ? 1 : -1);
	kanbans.forEach((item, i, arr) => {
		createKanban(item.kanban_id,item.title,last);
	})
}

// При загрузке страницы первым делом добавляем на страницу все доски,
// которые нам прислал сервер
createKanbans();