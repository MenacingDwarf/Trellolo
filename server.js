require('dotenv').config();
const express = require('express');
const session = require('express-session');
var path = require('path');
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');

// Подключение базы данных PostreSQL
const { Pool } = require('pg')
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
})

var urlencodedParser = bodyParser.urlencoded({ extended: false });
server = express();
server.use(express.static(path.join(__dirname, 'public')));
server.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {  }
}));
server.use(cookieParser());
server.set('view engine', 'ejs');

// Если пользователь авторизирован загружаем страницу с его досками
// Иначе страницу с окном авторизации
server.get('/',function(req,res){
	if (req.session.user_id) res.redirect('/kanbans');
	else res.render('start-page', {message: req.session.message});
	req.session.message = undefined;
	req.session.save();
});

// Авторизация с серверной валидацией
server.post('/login/', urlencodedParser, function (req, res) {
	const bcrypt = require('bcrypt');
	if (req.body.user_name && req.body.password) {
		if (req.body.user_name.length >= 6 && req.body.password.length >= 6) {
			pool.query("SELECT user_id,user_name,password from \"user\" WHERE user_name = $1",[req.body.user_name],(err,res1) => {
				if (res1.rows.length == 0) {
					req.session.message = 'Пользователь не зарегистрирован!';
					req.session.save();
					res.redirect('/');
				}
				else {
					bcrypt.compare(req.body.password,res1.rows[0].password,function(err,ans){
						if (ans == false) {
							req.session.message = 'Неправильный пароль!';
							req.session.save();
							res.redirect('/');
						}
						else {
							req.session.user_id = res1.rows[0].user_id;
							req.session.message = undefined;
							req.session.save();
							res.redirect('/kanbans')
						}
					});
				}
			});
		} else res.redirect('/');
	} else res.redirect('/');
});

// Регистрация с серверной валидацией и хэшированием пароля
server.post('/register/', urlencodedParser, function (req, res) {
	const bcrypt = require('bcrypt');
	if (req.body.user_name && req.body.password) {
		if (req.body.user_name.length >= 6 && req.body.password.length >= 6) {
			pool.query("SELECT user_name from \"user\" WHERE user_name = $1",[req.body.user_name],(err,res1) => {
				if (res1.rows.length != 0) {
					req.session.message = 'Введите другое имя пользователя!';
					req.session.save();
					res.redirect('/');
				}
				else {
					bcrypt.hash(req.body.password,Math.floor(Math.random() * 10),(err,hash)=>{
						var regUser = async()=> {
							await pool.query('INSERT INTO \"user\" VALUES(DEFAULT,$1,$2)',[req.body.user_name,hash]);
							await pool.query("SELECT user_id from \"user\" WHERE user_name = $1",[req.body.user_name],(err,res2) => {
								req.session.user_id = res2.rows[0].user_id;
								req.session.save();
								res.redirect('/kanbans');
							});
							
						}
						regUser();
					})
				}
			})
		} else res.redirect('/');
	} else res.redirect('/');
});

server.get('/logout', function (req, res) {
	req.session.user_id = undefined;
	req.session.save();
	res.redirect('/');
});

// Если пользователь авторизирован загружаем страницу с досками
// Иначе отправляем его на страницу с формой авторизации
server.get('/kanbans',function(req,res){
	if (req.session.user_id) {
		pool.query("SELECT kanban_id,title FROM kanban WHERE owner = $1", [req.session.user_id],(err,res1) => {
			res.render('kanbans',{kanbans: JSON.stringify(res1.rows)});
		})
	}
	else res.redirect('/');
});


// Добавление или изменение доски в базе данных
server.post('/change_kanban', urlencodedParser, function (req, res) {
	// если приходит id доску необходимо изменить
	if (req.body.id) {
		pool.query("UPDATE kanban SET title=$1 WHERE kanban_id=$2",
				   [req.body.title,req.body.id]);
	}
	// иначе добавляем новую
	else pool.query("INSERT INTO kanban VALUES(DEFAULT,$1,$2) RETURNING kanban_id",
					[req.body.title, req.session.user_id], (err, res1) => {
		res.send(res1.rows[0].kanban_id.toString());
	})
});

// Удаление существующей доски
server.post('/delete_kanban', urlencodedParser, function (req, res) {
	if (req.body.id) {
		pool.query("DELETE FROM kanban WHERE kanban_id=$1",[req.body.id]);
	}
});

// Загрузка доски со всей необходимой информацией
server.get('/kanban', function(req,res){
	var getInfo = async() => {
		var kanban = await pool.query("SELECT title,owner FROM kanban WHERE kanban.kanban_id = $1 ",[req.query.id]);
		if (kanban.rows.length == 0) {
			res.redirect('/kanbans');
		}
		else if (kanban.rows[0].owner == req.session.user_id) {
			var args = {kanban: {id: req.query.id, title: kanban.rows[0].title}};
			var columns = await pool.query("SELECT * FROM kanban_column " + 
					   				   	   "WHERE kanban_column.kanban_id = $1 ",[req.query.id]);
			args.columns = columns.rows;
			for (var i = 0; i<columns.rows.length; i++) {
				var cards = await pool.query("SELECT * FROM card " + 
					   				   		 "WHERE card.column_id = $1 ", [columns.rows[i].column_id]);
				columns.rows[i].cards = cards.rows;
			}
			res.render('page', {data: JSON.stringify(args)});
		}
		else res.redirect('/kanbans');
	}

	if (req.session.user_id && req.query.id) {
		if (!isNaN(req.query.id)) getInfo();
		else res.redirect('/');
	}
	else res.redirect('/');
});

// Изменения существующей доски или добавление новой
// Если в запросе присутствует id значит необходимо изменить существующую колонку
// Иначе добавить новую и вернуть id этой новой колонки
server.post('/change_column', urlencodedParser, function (req, res) {
	// Добавление новой колонки в базу данных в конец списка колонок
	function InsertColumn() {
		// если на канбане уже были колонки, от клиента приходит id последней из них
		// необходимо присвоить полю prev_column новой колонки id последней колонки
		if (req.body.last_column) {
			pool.query("INSERT INTO kanban_column VALUES(DEFAULT,$1,$2,$3,NULL) RETURNING column_id",
				       [req.body.kanban,req.body.title,req.body.last_column],(err,res1) => {
				pool.query("UPDATE kanban_column SET next_column = $1 WHERE column_id = $2",[res1.rows[0].column_id,req.body.last_column]);
				res.send(res1.rows[0].column_id.toString());
			})
		}
		else {
			pool.query("INSERT INTO kanban_column VALUES(DEFAULT,$1,$2,NULL,NULL) RETURNING column_id",
				       [req.body.kanban,req.body.title],(err,res1) => {
				res.send(res1.rows[0].column_id.toString());
			})
		}
	}

	// Перемещение существующей колонки
	var ReplaceColumn = async() => {
		// получаем информацию о перемещаемой колонке
		var column = await pool.query("SELECT * FROM kanban_column WHERE column_id = $1",[req.body.id]);
		column = column.rows[0];

		// переприсваиваем ссылки следующей и предыдущей колонки, если они есть, чтобы убрать её с этого места
		if (column.next_column) {
			await pool.query("UPDATE kanban_column SET prev_column = $1 WHERE column_id = $2",[column.prev_column,column.next_column]);
		}
		if (column.prev_column) {
			await pool.query("UPDATE kanban_column SET next_column = $1 WHERE column_id = $2",[column.next_column,column.prev_column]);
		}

		// если пришла ссылка на следующую колонку, значит колонка перемещается в начало или в середину
		if (req.body.next) {
			var next = await pool.query("SELECT * FROM kanban_column WHERE column_id = $1",[req.body.next]);
			next = next.rows[0];
			
			// меняем перемещаемую колонку
			await pool.query("UPDATE kanban_column SET prev_column = $1, next_column = $2 WHERE column_id = $3",
							 [next.prev_column,next.column_id,column.column_id]);
			// если вставляем в середину, надо изменить ссылку предыдущей колонки
			if (next.prev_column) {
				await pool.query("UPDATE kanban_column SET next_column = $1 WHERE column_id = $2",[column.column_id,next.prev_column]);
			}
			// меняем следующую колонку
			await pool.query("UPDATE kanban_column SET prev_column = $1 WHERE column_id = $2",[column.column_id,next.column_id]);
		}
		// если пришла ссылка на предыдущую колонку, значит колонка меремещается в конец
		else if (req.body.prev) {
			var prev = await pool.query("SELECT * FROM kanban_column WHERE column_id = $1",[req.body.prev]);
			prev = prev.rows[0];

			await pool.query("UPDATE kanban_column SET prev_column = $1, next_column = NULL WHERE column_id = $2",
							 [prev.column_id,column.column_id]);

			await pool.query("UPDATE kanban_column SET next_column = $1 WHERE column_id = $2",[column.column_id,prev.column_id]);
		}

	}

	// если не пришло id добаляем новую колонку
	if (!req.body.id) {
		InsertColumn();
	}
	// если пришёл заголовок, значит произошлоо изменение заголовка
	else if (req.body.title) {
		pool.query("UPDATE kanban_column SET title = $1 WHERE column_id = $2",[req.body.title,req.body.id]);
	}
	// если пришла ссылка на следующую или предыдущую, произошло перемещение
	else if (req.body.next || req.body.prev) {
		ReplaceColumn();
	}
	
});

// Изменения существующей карточки или добавление новой
// Если в запросе присутствует id значит необходимо изменить существующую карточку
// Иначе добавить новую и вернуть id этой новой карточки
server.post('/change_card', urlencodedParser, function (req, res) {
	// Добавление новой карточки в базу данных в конец списка карточек
	function InsertCard() {
		// если в колонке уже были карточки, от клиента приходит id последней из них
		// необходимо присвоить полю prev_card новой карточки id последней карточки
		if (req.body.last_card) {
			pool.query("INSERT INTO card VALUES(DEFAULT,$1,$2,$3,NULL) RETURNING card_id",
				       [req.body.column,req.body.text,req.body.last_card],(err,res1) => {
				pool.query("UPDATE card SET next_card = $1 WHERE card_id = $2",[res1.rows[0].card_id,req.body.last_card]);
				res.send(res1.rows[0].card_id.toString());
			})
		}
		else {
			pool.query("INSERT INTO card VALUES(DEFAULT,$1,$2,NULL,NULL) RETURNING card_id",
				       [req.body.column,req.body.text],(err,res1) => {
				res.send(res1.rows[0].card_id.toString());
			})
		}
	}

	// Перемещение существующей карточки
	var ReplaceCard = async() => {
		// получаем информацию о перемещаемой карточке
		var card = await pool.query("SELECT * FROM card WHERE card_id = $1",[req.body.id]);
		card = card.rows[0];

		// переприсваиваем ссылки следующей и предыдущей карточки, если они есть, чтобы убрать её с этого места
		if (card.next_card) {
			await pool.query("UPDATE card SET prev_card = $1 WHERE card_id = $2",[card.prev_card,card.next_card]);
		}
		if (card.prev_card) {
			await pool.query("UPDATE card SET next_card = $1 WHERE card_id = $2",[card.next_card,card.prev_card]);
		}

		// если пришла ссылка на следующую карточку, значит карточка перемещается в начало или в середину
		if (req.body.next) {
			var next = await pool.query("SELECT * FROM card WHERE card_id = $1",[req.body.next]);
			next = next.rows[0];
			
			// меняем перемещаемую карточку
			await pool.query("UPDATE card SET column_id = $1, prev_card = $2, next_card = $3 WHERE card_id = $4",
							 [next.column_id,next.prev_card,next.card_id,card.card_id]);
			// если вставляем в середину, надо изменить ссылку предыдущей карточки
			if (next.prev_card) {
				await pool.query("UPDATE card SET next_card = $1 WHERE card_id = $2",[card.card_id,next.prev_card]);
			}
			// меняем следующую карточку
			await pool.query("UPDATE card SET prev_card = $1 WHERE card_id = $2",[card.card_id,next.card_id]);
		}
		// если пришла ссылка на предыдущую колонку, значит колонка меремещается в конец
		else if (req.body.prev) {
			var prev = await pool.query("SELECT * FROM card WHERE card_id = $1",[req.body.prev]);
			prev = prev.rows[0];

			await pool.query("UPDATE card SET column_id = $1, prev_card = $2, next_card = NULL WHERE card_id = $3",
							 [prev.column_id,prev.card_id,card.card_id]);

			await pool.query("UPDATE card SET next_card = $1 WHERE card_id = $2",[card.card_id,prev.card_id]);
		}
		// если пришла колонка, карточка вставляется в пустую колонку
		else {
			await pool.query("UPDATE card SET column_id = $1, prev_card = NULL, next_card = NULL WHERE card_id = $2",
							 [req.body.column, card.card_id]);
		}
		

	}
	// если не пришло id добаляем новую карточку
	if (!req.body.id) {
		InsertCard();
	}
	// если пришёл текс, значит произошло изменение текста карточки
	else if (req.body.text) {
		pool.query("UPDATE card SET text = $1 WHERE card_id = $2",[req.body.text, req.body.id]);
	}
	// если пришла ссылка на следующую или предыдущую или на колонку, произошло перемещение
	else if (req.body.next || req.body.prev || req.body.column) {
		ReplaceCard();
	}
});

// Удаление колонки
server.post('/delete_column', urlencodedParser, function (req, res) {
	var deleteColumn = async() => {
		// получение информации об удаляемой колонке 
		var column = await pool.query("SELECT * FROM kanban_column WHERE column_id = $1", [req.body.id]);
		column = column.rows[0];

		// переприсваиваем ссылки следующей и предыдущей колонки, если они есть, чтобы убрать её с этого места
		if (column.next_column) {
			await pool.query("UPDATE kanban_column SET prev_column = $1 WHERE column_id = $2",[column.prev_column,column.next_column]);
		}
		if (column.prev_column) {
			await pool.query("UPDATE kanban_column SET next_column = $1 WHERE column_id = $2",[column.next_column,column.prev_column]);
		}

		await pool.query("DELETE FROM kanban_column WHERE column_id = $1",[req.body.id]);
	}

	if (req.body.id) {
		deleteColumn();
	}
});

// Удаление карточки
server.post('/delete_card', urlencodedParser, function (req, res) {
	var deleteCard = async() => {
		// получение информации об удаляемой карточке
		var card = await pool.query("SELECT * FROM card WHERE card_id = $1",[req.body.id]);
		card = card.rows[0];

		// переприсваиваем ссылки следующей и предыдущей карточки, если они есть, чтобы убрать её с этого места
		if (card.next_card) {
			await pool.query("UPDATE card SET prev_card = $1 WHERE card_id = $2",[card.prev_card,card.next_card]);
		}
		if (card.prev_card) {
			await pool.query("UPDATE card SET next_card = $1 WHERE card_id = $2",[card.next_card,card.prev_card]);
		}

		await pool.query("DELETE FROM card WHERE card_id = $1",[req.body.id]);
	}
	if (req.body.id) {
		deleteCard();
	}
});

server.listen(process.env.PORT,
    () => console.log('Server UP!'));