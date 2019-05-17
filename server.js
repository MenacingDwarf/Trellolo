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


// Добавление новой доски в базу данных
server.post('/change_kanban', urlencodedParser, function (req, res) {
	if (req.body.id) {
		pool.query("UPDATE kanban SET title=$1 WHERE kanban_id=$2",
				   [req.body.title,req.body.id]);
	}
	else pool.query("INSERT INTO kanban VALUES(DEFAULT,$1,$2) RETURNING kanban_id",
					[req.body.title, req.session.user_id], (err, res1) => {
		res.send(res1.rows[0].kanban_id.toString());
	})
});

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
			var columns = await pool.query("SELECT column_id,title,place FROM kanbas_column " + 
					   				   	   "WHERE kanbas_column.kanban_id = $1 ",[req.query.id]);
			args.columns = columns.rows;
			for (var i = 0; i<columns.rows.length; i++) {
				var cards = await pool.query("SELECT card_id,text,place FROM card " + 
					   				   		 "WHERE card.column_id = $1 ", [columns.rows[i].column_id]);
				columns.rows[i].cards = cards.rows;
			}
			res.render('page', {data: JSON.stringify(args)});
		}
		else res.redirect('/kanbans');
	}

	if (req.session.user_id && req.query.id) {
		getInfo();
	}
	else res.redirect('/');
});

// Изменения существующей доски или добавление новой
// Если в запросе присутствует id значит необходимо изменить существующую колонку
// Иначе добавить новую и вернуть id этой новой колонки
server.post('/change_column', urlencodedParser, function (req, res) {
	if (req.body.kanban && req.body.title && req.body.place) {
		if (req.body.id){
			pool.query("UPDATE kanbas_column SET title=$1, place=$2 WHERE column_id=$3",
					   [req.body.title,req.body.place,req.body.id]);
		}
		else pool.query("INSERT INTO kanbas_column VALUES(DEFAULT,$1,$2,$3) RETURNING column_id",
				   [req.body.kanban,req.body.title,req.body.place], (err,res1) => {
			res.send(res1.rows[0].column_id.toString())
		});
	}
	
});

// Изменения существующей карточки или добавление новой
// Если в запросе присутствует id значит необходимо изменить существующую карточку
// Иначе добавить новую и вернуть id этой новой карточки
server.post('/change_card', urlencodedParser, function (req, res) {
	if (req.body.column && req.body.text && req.body.place) {
		if (req.body.id){
			pool.query("UPDATE card SET column_id=$1, text=$2, place=$3 WHERE card_id=$4",
					   [req.body.column,req.body.text,req.body.place,req.body.id]);
		}
		else pool.query("INSERT INTO card VALUES(DEFAULT,$1,$2,$3) RETURNING card_id",
				   [req.body.column,req.body.text,req.body.place], (err,res1) => {
			res.send(res1.rows[0].card_id.toString())
		});
	}
	
});

server.post('/delete_column', urlencodedParser, function (req, res) {
	if (req.body.id) {
		pool.query("DELETE FROM kanbas_column WHERE column_id=$1",[req.body.id]);
	}
});

server.post('/delete_card', urlencodedParser, function (req, res) {
	if (req.body.id) {
		pool.query("DELETE FROM card WHERE card_id=$1",[req.body.id]);
	}
});

server.listen(process.env.PORT,
    () => console.log('Server UP!'));