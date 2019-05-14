require('dotenv').config();
const express = require('express');
const session = require('express-session');
var path = require('path');
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
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

server.get('/',function(req,res){
	if (req.session.user_id) res.redirect('/kanbans');
	else res.render('start-page');
});

server.get('/kanban', function(req,res){
	var getInfo = async() => {
		var args = {kanban_id: req.query.id};
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

	if (req.session.user_id) {
		getInfo();
	}
	else res.redirect('/');
});

server.get('/kanbans',function(req,res){
	if (req.session.user_id) {
		pool.query("SELECT kanban_id,title FROM kanban WHERE owner = $1", [req.session.user_id],(err,res1) => {
			res.render('kanbans',{kanbans: JSON.stringify(res1.rows)});
		})
	}
	else res.redirect('/');
});

server.post('/login/', urlencodedParser, function (req, res) {
	const bcrypt = require('bcrypt');
	pool.query("SELECT user_id,user_name,password from \"user\" WHERE user_name = $1",[req.body.user_name],(err,res1) => {
		
		if (res1.rows.length == 0) {
			res.redirect('/');
		}
		else {
			bcrypt.compare(req.body.password,res1.rows[0].password,function(err,ans){
				if (ans == false) {
					res.redirect('/');
				}
				else {
					req.session.user_id = res1.rows[0].user_id;
					req.session.save();
					res.redirect('/kanbans')
				}
			});
		}
	});
});

server.post('/register/', urlencodedParser, function (req, res) {
	const bcrypt = require('bcrypt');
	pool.query("SELECT user_name from \"user\" WHERE user_name = $1",[req.body.user_name],(err,res1) => {
		if (res1.rows.length != 0) {
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
});

server.get('/logout', function (req, res) {
	req.session.user_id = undefined;
	req.session.save();
	res.redirect('/');
});

server.post('/add_column', urlencodedParser, function (req, res) {
	if (req.body.kanban && req.body.title && req.body.place) {
		pool.query("INSERT INTO kanbas_column VALUES(DEFAULT,$1,$2,$3) RETURNING column_id",
				   [req.body.kanban,req.body.title,req.body.place], (err,res1) => {
			res.send(res1.rows[0].column_id.toString())
		});
	}
	
});

server.post('/add_card', urlencodedParser, function (req, res) {
	if (req.body.column && req.body.text && req.body.place) {
		pool.query("INSERT INTO card VALUES(DEFAULT,$1,$2,$3) RETURNING card_id",
				   [req.body.column,req.body.text,req.body.place], (err,res1) => {
			res.send(res1.rows[0].card_id.toString())
		});
	}
	
});

server.post('/add_kanban', urlencodedParser, function (req, res) {
	pool.query("INSERT INTO kanban VALUES(DEFAULT,$1,$2) RETURNING kanban_id",[req.body.title, req.session.user_id], (err, res1) => {
		res.send(res1.rows[0].kanban_id.toString());
	})
});

server.listen(process.env.PORT,
    () => console.log('Server UP!'));