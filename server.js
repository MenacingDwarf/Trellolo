const express = require('express');
var path = require('path');
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });

server = express();
server.use(express.static(path.join(__dirname, 'public')));
server.set('view engine', 'ejs');

server.get('/',function(req,res){
	res.render('page');
});

server.listen(process.env.PORT,
    () => console.log('Server UP!'));