// Добавление новой карточки или колонки
// Во всех функциях входной параметр elem - кнопка, к которой прикреплена эта функция

// Начать добавление карточки
// Создаёт поле ввода текта новой карточки и кнопки добавления и отмены
// Функция прикрепляется к кнопке внизу колонки
var start_adding_card = function(elem) {
  var input = document.createElement('textarea');
  input.className = "card";
  input.setAttribute("placeholder","Введите название карточки");
  input.onkeydown = pressEnter;
  elem.parentNode.children[1].appendChild(input).focus();

  elem.parentNode.replaceChild(make_buttons("Добавить карточку", "add_card(this)", "stop_adding_card(this)"),elem);
  
  input.scrollIntoView(false);
}

// Добавить карту
// Добавляет в конец текущей колонки новую карточку
// Функция прикрепляется к кнопке "Добавить карточку"
var add_card = function(elem) {
	var textarea = elem.parentNode.parentNode.children[1].querySelectorAll('textarea.card')[0];
	var card = document.createElement('div');
	card.className = "card";
	card.innerHTML = textarea.value;
  card.setAttribute("ondblclick", "startChangingCard(this)");
	
	replace_buttons(elem,"start_adding_card(this)","Добавить ещё одну карточку");
	textarea.parentNode.replaceChild(card,textarea);
}

// Отмена добавления
// Отменяет добавление новой карточки
// Функция прикрепляется к крестику
var stop_adding_card = function(elem) {
	cards = elem.parentNode.parentNode.children[1];
	cards.removeChild(cards.lastChild);
	replace_buttons(elem,"start_adding_card(this)","Добавить ещё одну карточку");
}

// Начать добавление колонки
// Создаёт поле ввода заголовка новой колонки и кнопки добавления и отмены
// Функция прикрепляется к кнопке добавления новой колонки
var start_adding_column = function(elem) {
  var input = document.createElement('textarea');
  input.className = "card";
  input.setAttribute("placeholder","Введите название колонки");
  input.onkeydown = pressEnter;
  elem.parentNode.insertBefore(input,elem).focus();

  elem.parentNode.replaceChild(make_buttons("Добавить колонку", "add_column(this)", "stop_adding_column(this)"),elem);
}

// Добавить карту
// Добавляет в конец списка колонок новую колонку
// Функция прикрепляется к кнопке "Добавить колонку"
var add_column = function(elem) {
	var column = elem.parentNode.parentNode;
	var textarea = column.children[0];

	var title = document.createElement('div');
	title.className = "column-title";
	title.innerHTML = textarea.value;
  title.setAttribute("ondblclick","startChangingTitle(this)");

	var add = document.createElement('div');
	add.className = "add-card";
	add.setAttribute("onclick", "start_adding_card(this)");
	add.innerHTML = "<div class=\"plus\"></div>Добавить ещё одну карточку</div>";

	var cards = document.createElement('div');
	cards.className = "cards";

	var new_column = document.createElement('div');
	new_column.className = "column";
	new_column.appendChild(title);
	new_column.appendChild(cards);
	new_column.appendChild(add);
	column.parentNode.insertBefore(new_column,column);

	stop_adding_column(elem);
}

var stop_adding_column = function(elem) {
	var column = elem.parentNode.parentNode;
	column.removeChild(column.children[0]);
	replace_buttons(elem,"start_adding_column(this)", "Добавить ещё одну колонку");
}

// Изменение названия колонки и карточки
// Изменение происходит путём двойного нажатия на карточку или заголовок колонки
// Во всех функциях входной параметр elem - кнопка, к которой прикреплена эта функция
var oldTitle = undefined;
var oldCard = undefined;

// Начать изменение карточки
// Заменяет карточку на поле ввода текста и добавляет кнопки изменения и отмены
var startChangingCard = function(elem) {
  if (elem.parentNode.querySelectorAll('textarea.card').length == 0
      && elem.parentNode.parentNode.querySelectorAll('textarea.card').length == 0) {
    var input = document.createElement('textarea');
    input.className = "card";
    input.value = elem.innerHTML;
    input.onkeydown = pressEnter;
    oldCard = elem.innerHTML;
    
    elem.parentNode.parentNode.replaceChild(make_buttons("Изменить карточку", "changeCard(this)", "stopChangingCard(this)"),
                                 elem.parentNode.parentNode.lastChild);
    elem.parentNode.replaceChild(input,elem);
    input.focus();
  }
}

// Изменить карточку
// Заменяет текст карточки на тот, который в поле ввода
// Функция прикрепляется к кнопке "Изменить карточку"
var changeCard = function(elem) {
  var textarea = elem.parentNode.parentNode.children[1].querySelectorAll('textarea.card')[0];
  var card = document.createElement('div');
  card.className = "card";
  card.innerHTML = textarea.value;
  card.setAttribute("ondblclick", "startChangingCard(this)");
  
  replace_buttons(elem,"start_adding_card(this)","Добавить ещё одну карточку");
  textarea.parentNode.replaceChild(card,textarea);
}

// Отмена изменения
// Отменяет изменение карточки
// Функция прикрепляется к крестику
var stopChangingCard = function(elem) {
  var textarea = elem.parentNode.parentNode.children[1].querySelectorAll('textarea.card')[0];
  var card = document.createElement('div');
  card.className = "card";
  card.innerHTML = oldCard;
  card.setAttribute("ondblclick", "startChangingCard(this)");
  
  replace_buttons(elem,"start_adding_card(this)","Добавить ещё одну карточку");
  textarea.parentNode.replaceChild(card,textarea);
}

// Начать изменение колонки
// Заменяет заголовок колонки на поле ввода текста и добавляет кнопки изменения и отмены
var startChangingTitle = function(elem) {
  if (elem.parentNode.querySelectorAll('textarea.card').length == 0
      && elem.parentNode.children[1].querySelectorAll('textarea.card').length == 0) {
    var input = document.createElement('textarea');
    input.className = "card";
    input.value = elem.innerHTML;
    input.onkeydown = pressEnter;
    oldTitle = elem.innerHTML;

    elem.parentNode.replaceChild(make_buttons("Изменить колонку", "changeTitle(this)", "stopChangingTitle(this)"),
                                 elem.parentNode.lastChild);
    elem.parentNode.replaceChild(input,elem);
    input.focus();
  }
}

// Изменить название колонки
// Заменяет текст заголовка колонки на тот, который в поле ввода
// Функция прикрепляется к кнопке "Изменить колонку"
var changeTitle = function(elem) {
  var input = elem.parentNode.parentNode.children[0];

  var title = document.createElement('div');
  title.className = "column-title";
  title.innerHTML = input.value;
  title.setAttribute("ondblclick","startChangingTitle(this)");

  replace_buttons(elem,"start_adding_card(this)","Добавить ещё одну карточку");
  input.parentNode.replaceChild(title,input);
}

// Отмена изменения
// Отменяет изменение колонки
// Функция прикрепляется к крестику
var stopChangingTitle = function(elem) {
  var input = elem.parentNode.parentNode.children[0];

  var title = document.createElement('div');
  title.className = "column-title";
  title.innerHTML = oldTitle;
  title.setAttribute("ondblclick","startChangingTitle(this)");

  replace_buttons(elem,"start_adding_card(this)","Добавить ещё одну карточку");
  input.parentNode.replaceChild(title,input);
}

// Вспомогательные функции

// Заменяет кнопки, в состав которых входит elem на кнопку добавление с текстом text и прикреплённой к ней функцией func
var replace_buttons = function(elem,func,text) {
  var add = document.createElement('div');
  add.className = "add-card";
  add.setAttribute("onclick",func);
  add.innerHTML = "<div class=\"plus\"></div>"+text;

  elem.parentNode.parentNode.replaceChild(add,elem.parentNode);
}

// Генерирует объект, включающий в себя две кнопки:
// 1. кнопку добавления с текстом text и функцией клика add_function
// 2. кнопку отмены с функцией клика close_function
var make_buttons = function(text,add_function,close_function) {
  var buttons = document.createElement('div');
  var add = document.createElement('div');
  add.className = "add-card-button";
  add.innerHTML = text;
  add.setAttribute("onclick",add_function);

  var close = document.createElement('div');
  close.className = "close";
  close.setAttribute("onclick", close_function);
  var cross = document.createElement('div');
  cross.className = "cross";

  close.appendChild(cross);
  buttons.appendChild(add);
  buttons.appendChild(close);

  return buttons;
}

// Обработка нажатия клавиши ентер при вводе текста в текстовое поле
function pressEnter(e) {
  if (e.keyCode == 13) {
    e.target.parentNode.parentNode.querySelectorAll('.add-card-button')[0].click();
  } 
}