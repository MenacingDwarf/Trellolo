// Запросы на сервер с различными данными

// Запрос на создание новой колонки
function sendNewColumn(column) {
  var place = column.parentNode.children.length-2;
  var title = column.children[0].innerHTML;
  var xhr = new XMLHttpRequest();

  var body = 'kanban='+ kanban_id + '&title=' + encodeURIComponent(title) + '&place=' + place;

  xhr.open("POST", '/change_column', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  // В ответе с сервера приходит id новой колонки, 
  // который записыается в атрибут data-it соответствующей колонки
  xhr.onreadystatechange = function() {
    if (this.readyState != 4) return;
    column.setAttribute('data-id', this.responseText);
  }

  xhr.send(body); 
}

// Запрос на создание новой карточки
function sendNewCard(card) {
  var place = card.parentNode.children.length-1;
  var text = card.innerHTML;
  var column = card.parentNode.parentNode;
  var xhr = new XMLHttpRequest();
  var body = 'column='+ column.getAttribute('data-id') + '&text=' + encodeURIComponent(text) + '&place=' + place;

  xhr.open("POST", '/change_card', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  // В ответе с сервера приходит id новой карточки, 
  // который записыается в атрибут data-it соответствующей карточки
  xhr.onreadystatechange = function() {
    if (this.readyState != 4) return;

    card.setAttribute('data-id', this.responseText);
  }

  xhr.send(body); 
}

// Запрос на изменение существующей колонки
function sendChangeColumn(column) {
  var place = findObject(column);
  var title = column.children[0].innerHTML;
  var xhr = new XMLHttpRequest();

  var body = 'kanban='+ kanban_id + '&id=' + column.getAttribute('data-id') + 
             '&title=' + encodeURIComponent(title) + '&place=' + place;

  xhr.open("POST", '/change_column', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  xhr.send(body); 
}

// Запрос на изменение существующей карточки
function sendChangeCard(card) {
  var place = findObject(card);
  var text = card.innerHTML;
  var column = card.parentNode.parentNode;
  var xhr = new XMLHttpRequest();
  var body = 'column='+ column.getAttribute('data-id') + '&id=' + card.getAttribute('data-id') + 
             '&text=' + encodeURIComponent(text) + '&place=' + place;

  console.log(body);
  xhr.open("POST", '/change_card', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  xhr.send(body); 
}

// Вставка колонки или карточки

// Вставка колонки перед объектом next
// При next=undefined колонка вставляется в конец
function insertColumn(id,title_text,next=undefined) {
  // Формирование заголовка колонки
  var title = document.createElement('div');
  title.className = "column-title";
  title.innerHTML = title_text;
  title.setAttribute("ondblclick","startChangingTitle(this)");

  // Формирование кнопки добавления карточки в список карточек данной колонки
  var add = document.createElement('div');
  add.className = "add-card";
  add.setAttribute("onclick", "start_adding_card(this)");
  add.innerHTML = "<div class=\"plus\"></div>Добавить ещё одну карточку</div>";

  // Объект, хранящий все карточки в данной колонки
  var cards = document.createElement('div');
  cards.className = "cards";

  // Создание колонки и помещение в неё всех сформированных элементов
  var new_column = document.createElement('div');
  new_column.className = "column";
  new_column.setAttribute("data-id", id);
  new_column.appendChild(title);
  new_column.appendChild(cards);
  new_column.appendChild(add);

  // Вставка колонки на страницу
  if (next) {
    return next.parentNode.insertBefore(new_column,next);
  }
  else {
    var columns = document.querySelectorAll('.columns')[0];
    return columns.insertBefore(new_column,columns.children[columns.children.length - 1]);
  }
}

// Вставка карточки перед объектом next
// При next=undefined карточка вставляется в конец
function insertCard(id,text,column,next=undefined) {
  // Создание карточки
  var card = document.createElement('div');
  card.className = "card";
  card.innerHTML = text;
  card.setAttribute("ondblclick", "startChangingCard(this)");
  card.setAttribute("data-id", id);

  // Вставка карточки в список карточек соответствующей колонки
  if (next) {
    return column.children[1].insertBefore(card,next);
  }
  else return column.children[1].appendChild(card);
}

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
  if (textarea.value) {
    var cards = textarea.parentNode;

  	insertCard(undefined,textarea.value,cards.parentNode);
  	
  	replace_buttons(elem,"start_adding_card(this)","Добавить ещё одну карточку");
  	cards.removeChild(textarea);
    sendNewCard(cards.children[cards.children.length - 1]);
  }
}

// Отмена добавления
// Отменяет добавление новой карточки
// Функция прикрепляется к крестику
var stop_adding_card = function(elem) {
	cards = elem.parentNode.parentNode.children[1];
	cards.removeChild(cards.querySelectorAll('textarea.card')[0]);
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
  if (textarea.value) {
    var new_column = insertColumn(undefined,textarea.value,column);
    sendNewColumn(new_column);
  	stop_adding_column(elem);
  }
}
// Отмена добавления
// Отменяет добавление новой колонки
// Функция прикрепляется к крестику
var stop_adding_column = function(elem) {
	var column = elem.parentNode.parentNode;
	column.removeChild(column.children[0]);
	replace_buttons(elem,"start_adding_column(this)", "Добавить ещё одну колонку");
}

// Изменение названия колонки и карточки
// Изменение происходит путём двойного нажатия на карточку или заголовок колонки
// Во всех функциях входной параметр elem - кнопка, к которой прикреплена эта функция

// Храним старые значения заголовка колонки и карточки для отмены изменений
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
    input.setAttribute('data-id',elem.getAttribute('data-id'));
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
  var column = elem.parentNode.parentNode;
  var textarea = column.children[1].querySelectorAll('textarea.card')[0];
  if (textarea.value) {
    var card = insertCard(textarea.getAttribute('data-id'),textarea.value,column,textarea)
    replace_buttons(elem,"start_adding_card(this)","Добавить ещё одну карточку");
    textarea.parentNode.removeChild(textarea);
    sendChangeCard(card);
  }
}

// Отмена изменения
// Отменяет изменение карточки
// Функция прикрепляется к крестику
var stopChangingCard = function(elem) {
  var column = elem.parentNode.parentNode;
  var textarea = column.children[1].querySelectorAll('textarea.card')[0];
  var card = insertCard(textarea.getAttribute('data-id'),oldCard,column,textarea);
  
  replace_buttons(elem,"start_adding_card(this)","Добавить ещё одну карточку");
  textarea.parentNode.removeChild(textarea);
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
  var column = elem.parentNode.parentNode;
  var input = column.children[0];
  if (input.value) {
    var title = document.createElement('div');
    title.className = "column-title";
    title.innerHTML = input.value;
    title.setAttribute("ondblclick","startChangingTitle(this)");

    replace_buttons(elem,"start_adding_card(this)","Добавить ещё одну карточку");
    column.replaceChild(title,input);
    sendChangeColumn(column);
  }
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

// Функция ищет объект среди детей его родителя и возвращает его порядковый номер
function findObject(obj) {
  var parent = obj.parentNode;
  for (var i = 0; i<parent.children.length; i++) {
    if (parent.children[i] == obj) return i;
  }
  return -1;
}

// Обработка нажатия клавиши ентер при вводе текста в текстовое поле
function pressEnter(e) {
  if (e.keyCode == 13) {
    e.target.parentNode.parentNode.querySelectorAll('.add-card-button')[0].click();
  } 
}

// Отображение окна помощи или же его скрытие
function show(state){
  document.getElementById('window').style.display = state;      
  document.getElementById('wrap').style.display = state;      
}

// Заполнение доски колонками и карточками, полученными с сервера
function fillKanban() {
  data.columns.sort((a,b) => (a.place > b.place) ? 1 : -1);
  data.columns.forEach((item) => {
    var column = insertColumn(item.column_id,item.title);
    item.cards.sort((a,b) => (a.place > b.place) ? 1 : -1);
    item.cards.forEach((card) => {
      insertCard(card.card_id,card.text,column);
    })
  });
}

fillKanban();