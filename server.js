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

server.get('/kanban',function(req,res){
	if (req.session.user_id) res.render('page');
	else res.redirect('/');
});

server.get('/kanbans',function(req,res){
	if (req.session.user_id) res.render('kanbans');
	else res.redirect('/');
});

server.post('/save', urlencodedParser, function (req, res) {
	console.log("some changes!")
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

server.listen(process.env.PORT,
    () => console.log('Server UP!'));