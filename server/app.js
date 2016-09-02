


var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

// var passport = require('passport');
//var session = require('express-session');
//var LocalStrategy = require('passport-local').Strategy;

var app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'public/index.html'));
  console.log("in app.get");
});

//OAuth business------somewhere----somehow :)
//https://proofapi.herokuapp.com/sessions   -d '{"email":"traceyzavadil@gmail.com", "password":"patesiate,igneous,Eryops"}'
// app.post("https://proofapi.herokuapp.com/sessions");
//   {
//     "email": "traceyzavadil@gmail.com"
//     "password": "patesiate,igneous,Eryops"
// }
// };

app.use('/api', function(req, res, next){
  if (req.isAuthenticated()) {
  next();
  } else {
    res.sendStatus(403);
  }
});

app.get('/*', function(req, res){
  res.sendFile(path.join(__dirname, 'public/index.html'));
  console.log("in app.get*");
});

var port = process.env.PORT || 8000;
var server =app.listen(port, function () {
  console.log('The server is spinning on ' + server.address().port + ', darling...');
});
