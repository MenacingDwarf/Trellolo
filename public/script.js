// Добавление колонок и карточек

var add_card = function(elem) {
	var textarea = elem.parentNode.parentNode.children[1].querySelectorAll('textarea.card')[0];
	var card = document.createElement('div');
	card.className = "card";
	card.innerHTML = textarea.value;
  card.setAttribute("ondblclick", "startChangingCard(this)");
	
	replace_buttons(elem,"start_adding_card(this)","Добавить ещё одну карточку");
	textarea.parentNode.replaceChild(card,textarea);
}

var stop_adding_card = function(elem) {
	cards = elem.parentNode.parentNode.children[1];
	cards.removeChild(cards.lastChild);
	replace_buttons(elem,"start_adding_card(this)","Добавить ещё одну карточку");
}

var start_adding_card = function(elem) {
	var input = document.createElement('textarea');
	input.className = "card";
	input.setAttribute("placeholder","Введите название карточки");
  input.onkeydown = pressEnter;
	elem.parentNode.children[1].appendChild(input).focus();

	elem.parentNode.replaceChild(make_buttons("Добавить карточку", "add_card(this)", "stop_adding_card(this)"),elem);
	
	input.scrollIntoView(false);
}

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

var start_adding_column = function(elem) {
	var input = document.createElement('textarea');
	input.className = "card";
	input.setAttribute("placeholder","Введите название колонки");
  input.onkeydown = pressEnter;
	elem.parentNode.insertBefore(input,elem).focus();

	elem.parentNode.replaceChild(make_buttons("Добавить колонку", "add_column(this)", "stop_adding_column(this)"),elem);
}


// Вспомогательные функции

var replace_buttons = function(elem,start_adding_function,text) {
  var add = document.createElement('div');
  add.className = "add-card";
  add.setAttribute("onclick",start_adding_function);
  add.innerHTML = "<div class=\"plus\"></div>"+text;

  elem.parentNode.parentNode.replaceChild(add,elem.parentNode);
}

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

function pressEnter(e) {
  if (e.keyCode == 13) {
    e.target.parentNode.parentNode.querySelectorAll('.add-card-button')[0].click();
  } 
}

// Изменение названия колонки и карточки
var oldTitle = undefined;
var oldCard = undefined;

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

var changeTitle = function(elem) {
  var input = elem.parentNode.parentNode.children[0];

  var title = document.createElement('div');
  title.className = "column-title";
  title.innerHTML = input.value;
  title.setAttribute("ondblclick","startChangingTitle(this)");

  replace_buttons(elem,"start_adding_card(this)","Добавить ещё одну карточку");
  input.parentNode.replaceChild(title,input);
}

var changeCard = function(elem) {
  var textarea = elem.parentNode.parentNode.children[1].querySelectorAll('textarea.card')[0];
  var card = document.createElement('div');
  card.className = "card";
  card.innerHTML = textarea.value;
  card.setAttribute("ondblclick", "startChangingCard(this)");
  
  replace_buttons(elem,"start_adding_card(this)","Добавить ещё одну карточку");
  textarea.parentNode.replaceChild(card,textarea);
}

var stopChangingTitle = function(elem) {
  var input = elem.parentNode.parentNode.children[0];

  var title = document.createElement('div');
  title.className = "column-title";
  title.innerHTML = oldTitle;
  title.setAttribute("ondblclick","startChangingTitle(this)");

  replace_buttons(elem,"start_adding_card(this)","Добавить ещё одну карточку");
  input.parentNode.replaceChild(title,input);
}

var stopChangingCard = function(elem) {
  var textarea = elem.parentNode.parentNode.children[1].querySelectorAll('textarea.card')[0];
  var card = document.createElement('div');
  card.className = "card";
  card.innerHTML = oldCard;
  card.setAttribute("ondblclick", "startChangingCard(this)");
  
  replace_buttons(elem,"start_adding_card(this)","Добавить ещё одну карточку");
  textarea.parentNode.replaceChild(card,textarea);
}


// Перенос карточек
var DragManager = new function() {

  /**
   * составной объект для хранения информации о переносе:
   * {
   *   elem - элемент, на котором была зажата мышь
   *   avatar - аватар
   *   downX/downY - координаты, на которых был mousedown
   *   shiftX/shiftY - относительный сдвиг курсора от угла элемента
   * }
   */
  var dragObject = {};

  var self = this;

  function onMouseDown(e) {

    if (e.which != 1) return;

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

    dragObject.elem.style.width = getComputedStyle(elem).width;
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

  function finishDrag(e) {
    if (!dragObject.empty) {
      self.onDragCancel(dragObject);
    } else {
      self.onDragEnd(dragObject);
    }
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
      transform : "rotate(0deg)"
    };
    avatar.style.transform = "rotate(5deg)";
    // функция для отмены переноса
    avatar.rollback = function() {
      old.parent.insertBefore(avatar, old.nextSibling);
      avatar.style.position = old.position;
      avatar.style.left = old.left;
      avatar.style.top = old.top;
      avatar.style.zIndex = old.zIndex;
      avatar.style.transform = old.transform;
    };

    return avatar;
  }

  function changeDroppable(dropElem) {
  	var empty = document.createElement('div');
    empty.className = "empty-card";
    empty.style.height = dragObject.height;
    if (dragObject.avatar.className == 'column') {
      empty.className = "empty-column";
      if (dropElem.column) {
        if (dragObject.empty) {
          dragObject.empty.parentNode.removeChild(dragObject.empty);
          dragObject.empty = undefined;
        }
        
        dragObject.droppable = dropElem.column;
        dragObject.empty = dropElem.column.parentNode.insertBefore(empty,dragObject.droppable);
      }
      else if (!dropElem.empty_column && dragObject.empty) {
        dragObject.empty.parentNode.removeChild(dragObject.empty);
        dragObject.empty = undefined;
      }
    }
    else if (dropElem.card) {
  		if (dragObject.empty) {
  		  dragObject.empty.parentNode.removeChild(dragObject.empty);
			  dragObject.empty = undefined;
  		}
  		
  		dragObject.droppable = dropElem.card;
    	dragObject.empty = dropElem.card.parentNode.insertBefore(empty,dragObject.droppable);
  	}
  	else if (!dropElem.cards) {
  		if (dropElem.column) {
	    	if (dropElem.column.children[1] &&
	    		 (!dragObject.empty || 
	    		 dragObject.empty && 
	    		 (dragObject.droppable || dragObject.empty.parentNode.parentNode != dropElem.column))) {

	    		if (dragObject.empty) {
	    			dragObject.empty.parentNode.removeChild(dragObject.empty);
	    		}
	    		dropElem.column.children[1].appendChild(empty);
	    		dragObject.empty = dropElem.column.children[1].lastChild;
	    	}
	    }
	    else if (dragObject.empty) {
		    dragObject.empty.parentNode.removeChild(dragObject.empty);
		    dragObject.empty = undefined;
		  }
		  dragObject.droppable = undefined;
  	} 
	
  }

  function startDrag(e) {
    var avatar = dragObject.avatar;

    // инициировать начало переноса
    document.body.appendChild(avatar);
    avatar.style.zIndex = 9999;
    avatar.style.position = 'absolute';
  }

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

    return {empty_column: elem.closest('.empty-column'), column: elem.closest('.column'), card: elem.closest('.card'), cards: elem.closest('.cards')};
  }

  document.onmousemove = onMouseMove;
  document.onmouseup = onMouseUp;
  document.onmousedown = onMouseDown;

  this.onDragEnd = function(dragObject) {
  	if (dragObject.empty) {
  		dragObject.empty.parentNode.replaceChild(dragObject.elem, dragObject.empty);
  		createAvatar();
  	}
  	dragObject.avatar.rollback();
  };
  this.onDragCancel = function(dragObject) {
  	dragObject.avatar.rollback();
  };

};


function getCoords(elem) { // кроме IE8-
  var box = elem.getBoundingClientRect();

  return {
    top: box.top + pageYOffset,
    left: box.left + pageXOffset
  };

}