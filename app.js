// Imports
const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true,
	loggedin: false
}));
const {
  createHash,
} = require('crypto');
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
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
    
    if(req.session.loggedin){
        connection.query("SELECT * FROM GameData WHERE TeamAName= ? OR TeamBName= ? ORDER BY GameDate DESC LIMIT 13",[req.session.team, req.session.team], function (err, result) {
                if(err) return res.render('error', {error: "An error has occured on the database, please forward this to the admin: "+err});
                var welcomeData=[];
                for(i = 0; i < 12 ; i++){
                    welcomeData.push(String(result[i].GameDate).substr(0,15)+": "+result[i].TeamAName+" "+result[i].TeamAScore+"-"+result[i].TeamBScore+" "+result[i].TeamBName);
                }
                res.render('welcome', {data: welcomeData, user: req.session.username, team: req.session.team, log: true});
        });
    }
    else
    {
    connection.query("SELECT * FROM GameData ORDER BY GameDate DESC LIMIT 13", function (err, result) {
                
                if(err) return res.render('error', {error: "An error has occured on the database, please forward this to the admin: "+err});
                var welcomeData=[];
                for(i = 0; i < 12 ; i++){
                    welcomeData.push(String(result[i].GameDate).substr(0,15)+": "+result[i].TeamAName+" "+result[i].TeamAScore+"-"+result[i].TeamBScore+" "+result[i].TeamBName);
                }
                res.render('welcome', {data: welcomeData, user: null, team: null, log: false} );
                });
    }
});
app.get('/@*', (req, res) => {
            var teamToLookUp=decodeURI(req.url.substr(2));
            if(teamToLookUp==="all"){
                connection.query("SELECT * FROM GameData ORDER BY GameDate DESC LIMIT 13", function (err, result) {
                
                if(err) return res.render('error', {error: "An error has occured on the database, please forward this to the admin: "+err});
                var date=[];
                var matchesData=[];
                var TeamAIcon=[];
                var TeamBIcon=[];
                for(i = 0; i < 13 ; i++){
                    date.push(String(result[i].GameDate).substr(0,15));
                    matchesData.push(result[i].TeamAName+" "+result[i].TeamAScore+"-"+result[i].TeamBScore+" "+result[i].TeamBName);
                    TeamAIcon.push(result[i].TeamAName.replace(/\s+/g, '_'));
                    TeamBIcon.push(result[i].TeamBName.replace(/\s+/g, '_'));
                }
                res.render('index', {dates: date, matchData: matchesData, clubName: "All Clubs", TeamA: TeamAIcon, TeamB: TeamBIcon, log: req.session.loggedin, user: req.session.username});
                });
            }else{
            connection.query("SELECT * FROM GameData WHERE TeamAName= ? OR TeamBName= ? ORDER BY GameDate DESC LIMIT 13",[teamToLookUp, teamToLookUp], function (err, result) {
                
                if(err) return res.render('error', {error: "An error has occured on the database, please forward this to the admin: "+err});
                if(result.length === 0) return res.render('error', {error: teamToLookUp+" does not exist within the league!"});
                var date=[];
                var matchesData=[];
                var TeamAIcon=[];
                var TeamBIcon=[];
                for(i = 0; i < 13 ; i++){
                    date.push(String(result[i].GameDate).substr(0,15));
                    matchesData.push(result[i].TeamAName+" "+result[i].TeamAScore+"-"+result[i].TeamBScore+" "+result[i].TeamBName);
                    TeamAIcon.push(result[i].TeamAName.replace(/\s+/g, '_'));
                    TeamBIcon.push(result[i].TeamBName.replace(/\s+/g, '_'));
                }
                res.render('index', {dates: date, matchData: matchesData, clubName: teamToLookUp, TeamA: TeamAIcon, TeamB: TeamBIcon, log: req.session.loggedin, user: req.session.username});
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
                var TeamAIcon=[];
                var TeamBIcon=[];
                for(i = 0; i < result.length ; i++){
                    seasonData.push(result[i].TeamAName+" "+result[i].TeamAScore+"-"+result[i].TeamBScore+" "+result[i].TeamBName);
                    dates.push(String(result[i].GameDate).substr(0,15));
                    TeamAIcon.push(result[i].TeamAName.replace(/\s+/g, '_'));
                    TeamBIcon.push(result[i].TeamBName.replace(/\s+/g, '_'));
                }
                res.render('fullSeasonMatch', {data: seasonData, matchDate: dates, clubName: teamToLookUp,  TeamA: TeamAIcon, TeamB: TeamBIcon, log: req.session.loggedin, user: req.session.username});
                });
});
app.get('/t*', (req, res) =>{
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
      res.render('fullSquad', {name: playerNames, role: playerRoles, origin: playerOrigin, clubName: teamToLookUp, numOfSplits: Math.floor(result.length/6), log: req.session.loggedin, user: req.session.username});
   })
});
app.get('/login', (req, res) => {
    res.render('login');
});
app.get('/register', (req, res) => {
    res.render('register');
});
app.post('/login', async (req, res) => {
   username = req.body.username;
   password = req.body.password;
   connection.query("SELECT * FROM users WHERE username= ?", [username], function(errs, result){
       if(errs) return res.render('error', {error: "An error has occured on the database, please forward this to the admin: "+errs});
       if(result.length != 0){
           if(result[0].password===createHash('sha256').update(password).digest('hex')){
           req.session.loggedin=true;
           req.session.username=username;
           req.session.team=result[0].favouriteTeam;
           res.redirect("/@"+req.session.team);
           }else{
        return res.render('error', {error: Wrong password entered."});
           }
       }
       else
       {
       return res.render('error', {error: "That Account does not exist"});
       }
       })
});
app.post('/register', (req, res) => {
   var username=req.body.username;
   var password=req.body.password;
   var confirm=req.body.passwordresubmit;
   
   if(!(password===confirm)){
      res.render('error', {error: "The passwords do not match, please correctly re-enter your passwords"});
   }
   connection.query("SELECT * FROM users WHERE username= ?", [username], function(err, result){
       if(result.length === 0){
    connection.query("INSERT INTO users (username, password, favouriteTeam, initialNumClubPage) VALUES (?, ?, ?, ?)",[username, createHash('sha256').update(password).digest('hex'), "Brighton", 0], function(err, result){
        if(err) return res.render('error', {error: "An error has occured on the database, please forward this to the admin: "+err});
        return res.redirect("/login");
    })
       }else{
       return res.render('error', {error: "An Account with that username already exists!"});
       }
   })
});
app.post('/logout', (req,res) =>{
    req.session.loggedin=false;
    req.session.username=null;
    res.redirect('/welcome');
});
app.post('/delete', (req, res) =>{
    connection.query("DELETE FROM users WHERE username= ?",[req.session.username], function(err, result){
        if(err) return res.render('error', {error: "An error has occured on the database, please forward this to the admin: "+err});
        req.session.loggedin=false;
        req.session.username=null;
        res.redirect("/welcome");
    })
});
app.get('/profile', (req, res) => {
    if(req.session.loggedin === false){
        res.redirect('/welcome');
    };
    res.render('profile', {user: req.session.username, team: req.session.team});
});
app.post('/updateSettings', (req, res) =>{
    connection.query("UPDATE users SET favouriteTeam = ? WHERE username = ?", [req.body.team, req.session.username], function(err, result){
    if(err) return res.render('error', {error: "An error has occured on the database, please forward this to the admin: "+err});
    req.session.team=req.body.team;
    return res.redirect('/welcome');
    });
});
// Listen on Port 5000
app.listen(port, () => console.info(`App listening on port ${port}`));

