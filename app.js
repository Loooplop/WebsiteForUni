// Imports
const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser());
const port = 8008;

var connection = mysql.createConnection({host : '178.128.37.54', user : 'wcp12_test',  password : 'firestar0218', database: "wcp12_week1", dateStrings:false});
connection.connect((err) => {
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
});
// Static Files
app.use(express.static('public'));

// Set View's
app.set('views', './views');
app.set('view engine', 'ejs');


app.get('/welcome', (req, res) => {
    connection.query("SELECT * FROM GameData ORDER BY GameDate DESC LIMIT 13", function (err, result) {
                
                if(err) return res.render('error', {error: "An error has occured on the database, please forward this to the admin: "+err});
                var welcomeData=[];
                for(i = 0; i < 12 ; i++){
                    welcomeData.push(String(result[i].GameDate).substr(0,15)+": "+result[i].TeamAName+" "+result[i].TeamAScore+"-"+result[i].TeamBScore+" "+result[i].TeamBName);
                }
                res.render('welcome', {data: welcomeData});
                });
});
app.get('/@*', (req, res) => {
            var teamToLookUp=decodeURI(req.url.substr(2));
            if(teamToLookUp==="all"){
                connection.query("SELECT * FROM GameData ORDER BY GameDate DESC LIMIT 13", function (err, result) {
                
                if(err) return res.render('error', {error: "An error has occured on the database, please forward this to the admin: "+err});
                var date=[];
                var matchesData=[];
                for(i = 0; i < 13 ; i++){
                    date.push(String(result[i].GameDate).substr(0,15));
                    matchesData.push(result[i].TeamAName+" "+result[i].TeamAScore+"-"+result[i].TeamBScore+" "+result[i].TeamBName);
                }
                res.render('index', {dates: date, matchData: matchesData, clubName: "All Clubs"});
                });
            }else{
            connection.query("SELECT * FROM GameData WHERE TeamAName= ? OR TeamBName= ? ORDER BY GameDate DESC LIMIT 13",[teamToLookUp, teamToLookUp], function (err, result) {
                
                if(err) return res.render('error', {error: "An error has occured on the database, please forward this to the admin: "+err});
                if(result.length === 0) return res.render('error', {error: teamToLookUp+" does not exist within the league!"});
                var date=[];
                var matchesData=[];
                for(i = 0; i < 13 ; i++){
                    date.push(String(result[i].GameDate).substr(0,15));
                    matchesData.push(result[i].TeamAName+" "+result[i].TeamAScore+"-"+result[i].TeamBScore+" "+result[i].TeamBName);
                }
                res.render('index', {dates: date, matchData: matchesData, clubName: teamToLookUp});
                });
            }
});
app.get('/s*', (req, res) =>{
    var teamToLookUp=decodeURI(req.url.substr(2));
    connection.query("SELECT * FROM GameData WHERE TeamAName= ? OR TeamBName= ? ORDER BY GameDate DESC",[teamToLookUp, teamToLookUp], function (err, result) {
                
                if(err) return res.render('error', {error: "An error has occured on the database, please forward this to the admin: "+err});
                if(result===0) return res.render('error', {error: teamToLookUp+" does not exist in the league!"});
                var seasonData=[];
                var dates=[];
                for(i = 0; i < result.length ; i++){
                    seasonData.push(result[i].TeamAName+" "+result[i].TeamAScore+"-"+result[i].TeamBScore+" "+result[i].TeamBName);
                    dates.push(String(result[i].GameDate).substr(0,15));
                }
                res.render('fullSeasonMatch', {data: seasonData, matchDate: dates, clubName: teamToLookUp});
                });
});
app.get('/p*', (req, res) =>{
   var teamToLookUp=decodeURI(req.url.substr(2));
   connection.query("SELECT * FROM playerData WHERE playerTeam= ?", teamToLookUp, function(err, result){
      if(err) return res.render('error', {error: "An error has occured on the database, please forward this to the admin: "+err});
      if(result===0) return res.render('error', {error: teamToLookUp+" does not exist in the league!"});
      var playerNames=[];
      var playerRoles=[];
      var playerOrigin=[];
      for(i = 0; i < result.length ; i++){
          playerNames.push(result[i].playerName);
          playerRoles.push(result[i].playerRole);
          playerOrigin.push(result[i].playerOrigin);
      }
      res.render('fullSquad', {name: playerNames, role: playerRoles, origin: playerOrigin, clubName: teamToLookUp});
   });
});
app.get('/login', (req, res) => {
    res.render('login');
});
app.get('/register', (req, res) => {
    res.render('register');
});
app.get('/profile', (req, res) => {
    res.render('profile');
});
app.post('/register', function(req, res) {
    let sql = `INSERT INTO users(username, password) VALUES(req.body.username, req.body.password)`;
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });
  res.redirect('/welcome');
});
// Listen on Port 5000
app.listen(port, () => console.info(`App listening on port ${port}`));

