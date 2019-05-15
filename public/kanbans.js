// Процесс добавления доски

// Начать добавления, прикрепляется к кнопке "Новая доска..."
// Преобразует эту кнопку в окно ввода названия новой доски
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

  	var buttons = document.createElement('div');
  	buttons.appendChild(add);
  	buttons.appendChild(close);

  	kanban.appendChild(input);
  	kanban.appendChild(buttons);

  	kanbans.replaceChild(kanban,elem);
  	kanbans.querySelectorAll('textarea')[0].focus();
}

// Добавить доску на экран
// Прикрепляется к кнопке "Добавить доску"
// Заменяет поля ввода названия новой доски на доску с соответствующим названием
var addKanban = async(elem) => {
	var text = elem.parentNode.parentNode.querySelectorAll('textarea')[0].value;
	if (text) {
		var kanban = createKanban(0,elem.parentNode.parentNode.querySelectorAll('textarea')[0].value,elem.parentNode.parentNode);
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

// Создание новой доски с соответствующим именем и идентификатором
function createKanban(id,title,next) {
	var kanban = document.createElement('a');
	kanban.className = "kanban exist-kanban";
	kanban.setAttribute('href','/kanban?id='+id);
	kanban.id = id;
	kanban.innerHTML = title;
	kanban = next.parentNode.insertBefore(kanban,next);
	return kanban;
}

// Добавление на страницу всех досок, полученных от сервера при загрузке страницы
function createKanbans() {
	var info = document.getElementById('info');
	var last = document.querySelectorAll('.add-kanban')[0];
	var kanbans = JSON.parse(info.innerHTML);
	kanbans.forEach((item, i, arr) => {
		createKanban(item.kanban_id,item.title,last);
	})
}

// При загрузке страницы первым делом добавляем на страницу все доски,
// которые нам прислал сервер
createKanbans();