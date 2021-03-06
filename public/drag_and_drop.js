// Перенос карточек
var DragManager = new function() {

  /*
    составной объект для хранения информации о переносе:
    {
      elem - элемент, на котором была зажата мышь
      avatar - перемещаемый аватар
      downX/downY - координаты, на которых был mousedown
      droppable - последний подходящий для вставки элемент
      empty - добавленный пустой элемент, на место которого надо переместить объект
      height - высота переносимого объекта
      shiftX/shiftY - относительный сдвиг курсора от угла элемента
      background - цвет фона, для возврата к нему после покраснения
    }
  */
  var dragObject = {};

  function onMouseDown(e) {
    
    // ничего не делаем при нажатии правой кнопки мыши
    if (e.which != 1) return;
    if (document.querySelectorAll('textarea').length != 0) return;

    // определяем что именно мы перемещаем: карточку или колонку 
    var cardElem = e.target.closest('div.card');
    var columnElem = e.target.closest('div.column-title');
    var elem;
    if (cardElem) {
      elem = cardElem;
    }
    else if (columnElem) {
      elem = columnElem.parentNode;
    }
    else return;
    dragObject.elem = elem;

    // сохраним ширину и высоту объекта
    dragObject.background = getComputedStyle(elem).background;
    dragObject.height = getComputedStyle(elem).height;

    // запомним, что элемент нажат на текущих координатах pageX/pageY
    dragObject.downX = e.pageX;
    dragObject.downY = e.pageY;

    return false;
  }

  function onMouseMove(e) {
    if (!dragObject.elem) return; // элемент не зажат

    if (!dragObject.avatar) { // если перенос не начат...
      var moveX = e.pageX - dragObject.downX;
      var moveY = e.pageY - dragObject.downY;

      // если мышь передвинулась в нажатом состоянии недостаточно далеко
      if (Math.abs(moveX) < 3 && Math.abs(moveY) < 3) {
        return;
      }

      // начинаем перенос
      dragObject.avatar = createAvatar(); // создать аватар
      if (!dragObject.avatar) { // отмена переноса, нельзя "захватить" за эту часть элемента
        dragObject = {};
        return;
      }

      // аватар создан успешно
      // создать вспомогательные свойства shiftX/shiftY
      var coords = getCoords(dragObject.avatar);
      dragObject.shiftX = dragObject.downX - coords.left;
      dragObject.shiftY = dragObject.downY - coords.top;

      startDrag(e); // отобразить начало переноса
    }

    // отобразить перенос объекта при каждом движении мыши
    dragObject.avatar.style.left = e.pageX - dragObject.shiftX + 'px';
    dragObject.avatar.style.top = e.pageY - dragObject.shiftY + 'px';

    // взаимодействие с некоторыми объектами
    var drop = findDroppable(e);
    if (drop) changeDroppable(drop);

    return false;
  }

  function onMouseUp(e) {

    if (dragObject.avatar) { // если перенос идет
      finishDrag(e);
    }

    // перенос либо не начинался, либо завершился
    // в любом случае очистим "состояние переноса" dragObject
    dragObject = {};
  }

  function createAvatar() {
    // запомнить старые свойства, чтобы вернуться к ним при отмене переноса
    var avatar = dragObject.elem;
    var old = {
      parent: avatar.parentNode,
      nextSibling: avatar.nextSibling,
      position: avatar.position || '',
      left: avatar.left || '',
      top: avatar.top || '',
      zIndex: avatar.zIndex || '',
      transform : "rotate(0deg)",
      background: avatar.style.background,
      width: '98%'
    };
    avatar.style.width = getComputedStyle(dragObject.elem).width;
    avatar.style.transform = "rotate(5deg)";

    // функция для отмены переноса
    avatar.rollback = function() {
      old.parent.insertBefore(avatar, old.nextSibling);
      avatar.style.position = old.position;
      avatar.style.left = old.left;
      avatar.style.top = old.top;
      avatar.style.zIndex = old.zIndex;
      avatar.style.transform = old.transform;
      avatar.style.background =  old.background;
      avatar.style.width = old.width;
    };

    return avatar;
  }

  function startDrag(e) {
    var avatar = dragObject.avatar;

    // инициировать начало переноса
    document.body.appendChild(avatar);
    avatar.style.zIndex = 9999;
    avatar.style.position = 'absolute';
  }

  // ищем элементы, с которыми можно взаимодействовать
  function findDroppable(event) {
    // спрячем переносимый элемент
    dragObject.avatar.hidden = true;

    // получить самый вложенный элемент под курсором мыши
    var elem = document.elementFromPoint(event.clientX, event.clientY);

    // показать переносимый элемент обратно
    dragObject.avatar.hidden = false;

    if (elem == null) {
      // такое возможно, если курсор мыши "вылетел" за границу окна
      return null;
    }

    // возвращаем необходимые в процессе обработки объекты
    return {empty_column: elem.closest('.empty-column'), 
            column: elem.closest('.column'), 
            card: elem.closest('.card'), 
            cards: elem.closest('.cards'),
            trashhold: elem.closest('.trashhold')};
  }

  // окончание переноса
  // если сохранён пустой элемент вставляем переносимый объект на его место
  // если сохранён элемент корзины удаляем элемент
  // делаем соответствующие запросы
  // иначе совершаем откат
  function finishDrag(e) {
    if (dragObject.empty) {
      dragObject.empty.parentNode.replaceChild(dragObject.elem, dragObject.empty);
      createAvatar();
      dragObject.avatar.rollback();
      if (dragObject.avatar.className == "column") {
        sendReplaceColumn(dragObject.avatar);
      }
      else {
        sendReplaceCard(dragObject.avatar);
      }
    }
    else if (dragObject.droppable) {
      if (dragObject.droppable.className != "trashhold") {
        dragObject.avatar.rollback();
      }
      else {
        dragObject.droppable.style.background = dragObject.trashholdBackground;
        if (confirm("Удалить элемент?")) {
          if (dragObject.elem.className == "column") sendDeleteColumn(dragObject.avatar);
          else sendDeleteCard(dragObject.avatar);
          dragObject.elem.hidden = true;
        }
        else {
          dragObject.avatar.rollback();
        }
      }
    }
    else dragObject.avatar.rollback();
  }

  // взаимодействие с некоторыми объектами
  function changeDroppable(dropElem) {
    // создаём пустой элемент
  	var empty = document.createElement('div');
    empty.className = "empty-card";
    empty.style.height = dragObject.height;

    // удаление со страницы пустого элемента
    function clearEmpty() {
      dragObject.empty.parentNode.removeChild(dragObject.empty);
      dragObject.empty = undefined;
    }

    // если мышь навередна на корзину
    if (dropElem.trashhold) {
      // сохраняем информацию о наведении на корзину и добавляем покраснение перемещаемому объекту и корзине
      if (!dragObject.droppable) {
        dragObject.droppable = dropElem.trashhold;
        dragObject.trashholdBackground = getComputedStyle(dropElem.trashhold).background;
      }
      dropElem.trashhold.style.background = 'rgba(255,0,0,0.6)';
      dragObject.avatar.style.background = 'rgba(255,0,0,0.6)';
      if (dragObject.empty) clearEmpty();
    }
    else {
      if (dragObject.droppable) {
        // если раньше были наведены на корзину, убираем покраснение
        if (dragObject.droppable.className == "trashhold") {
          dragObject.avatar.style.background = dragObject.background;
          dragObject.droppable.style.background = dragObject.trashholdBackground;
          dragObject.droppable = undefined;
        }
      }
      // если идёт перемещение колонки
      if (dragObject.avatar.className == 'column') {
        empty.className = "empty-column";
        if (dropElem.column) { // очищаем пустой элемент если мышь наведена на колонку
          if (dragObject.empty) clearEmpty();
          
          // запоминаем наведённую колонку и добавляем пустой элемент
          dragObject.droppable = dropElem.column;
          dragObject.empty = dropElem.column.parentNode.insertBefore(empty,dragObject.droppable);
        }
        //очищаем пустой элемент если мышь наведена не на пустой элемент
        else if (!dropElem.empty_column && dragObject.empty) { 
          clearEmpty();
          dragObject.droppable = undefined;
        }
      }
      else if (dropElem.card) { // если идёт перемещение карточки и мышь наведена на карточку
    		if (dragObject.empty) clearEmpty();
    		
    		dragObject.droppable = dropElem.card;
      	dragObject.empty = dropElem.card.parentNode.insertBefore(empty,dragObject.droppable);
    	}
    	else if (!dropElem.cards) {
        // если идёт перемещение карточки и мышь наведена на колонку, но не список карточек
    		if (dropElem.column) {  
          // если мышь наведена на колонку, не являющуюся не созданной и либо на странице нет пустого элемента 
          // либо он есть и либо у нас сохранён элемент подходящий для вставки 
          // либо наведённая колонка не равна колонке, содержащей пустой элемент
  	    	if (dropElem.column.children[1] && 
  	    		 (!dragObject.empty ||           //     
  	    		 dragObject.empty &&             // 
  	    		 (dragObject.droppable || dragObject.empty.parentNode.parentNode != dropElem.column))) {

  	    		if (dragObject.empty) clearEmpty();
  	    		dragObject.empty = dropElem.column.children[1].appendChild(empty);
  	    	}
  	    }
  	    else if (dragObject.empty) clearEmpty();
  		  dragObject.droppable = undefined;
    	} 
    }
	
  }

  //присваиваем функции событиям
  document.onmousemove = onMouseMove;
  document.onmouseup = onMouseUp;
  document.onmousedown = onMouseDown;
};

// Возвращает координаты объекта
function getCoords(elem) { // кроме IE8-
  var box = elem.getBoundingClientRect();

  return {
    top: box.top + pageYOffset,
    left: box.left + pageXOffset
  };
}

// Запросы к серверу об изменениях на доске

// Запрос с сообщением о переносе колонки
function sendReplaceColumn(column) {
  var next = column.nextSibling;
  var xhr = new XMLHttpRequest();

  var body = 'id=' + column.getAttribute('data-id');

  // Если есть следующая колонка передаём её id в переменную next
  if (next.getAttribute('data-id')) {
    body += '&next=' + next.getAttribute('data-id');
  }
  else {
    prev = column.previousSibling;
    // Если нет следующей но есть предыдущая колонка передаём её id в переменную prev
    if (prev.className == "column") body += '&prev=' + prev.getAttribute('data-id');
  }

  xhr.open("POST", '/change_column', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  xhr.send(body); 
}

// Запрос с сообщением о переносе карточки
function sendReplaceCard(card) {
  var next = card.nextSibling;
  var xhr = new XMLHttpRequest();
  var body = 'id=' + card.getAttribute('data-id')

  // Если есть следующая карточка передаём её id в переменную next
  if (next) {
    body += '&next=' + next.getAttribute('data-id');
  }
  else {
    prev = card.previousSibling;
    // Если нет следующей но есть предыдущая карточка передаём её id в переменную prev
    if (prev) body += '&prev=' + prev.getAttribute('data-id');
    // Иначе перемещение идёт в пустую колонку, передаём её id в переменную column
    else {
      var column = card.parentNode.parentNode.getAttribute('data-id');
      body += '&column=' + column;
    }
  }

  xhr.open("POST", '/change_card', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  xhr.send(body);
}

// Запрос с сообщением об удалении колонки
function sendDeleteColumn(column) {
  var xhr = new XMLHttpRequest();
  id = column.getAttribute('data-id')
  var body = 'id=' + id;
  xhr.open("POST", '/delete_column', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  xhr.send(body); 
}

// Запрос с сообщением об удалении карточки
function sendDeleteCard(card) {
  var xhr = new XMLHttpRequest();
  id = card.getAttribute('data-id')
  var body = 'id=' + id;
  xhr.open("POST", '/delete_card', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  xhr.send(body); 
}