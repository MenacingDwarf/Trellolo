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

function addKanban(elem) {
	var kanban = document.createElement('a');
	kanban.className = "kanban exist-kanban";
	kanban.setAttribute('href','/kanban');
	kanban.innerHTML = elem.parentNode.querySelectorAll('textarea')[0].value;
	elem.parentNode.parentNode.insertBefore(kanban,elem.parentNode);
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