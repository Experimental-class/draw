var express = require('express');
var router = express.Router();
var gb = require('../public/javascripts/global.js')
const path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../public', 'game.html'));
});

router.get('/debug/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// note: method abanded
router.post('/login', function(req, res) {
  // var name = req.body.name;
  // res.json({'code':name})
  gb.DEBUG_MODE && console.log(req.body);
    var name = req.body.name
    var randomID = gb.randomIDCreator(12)
    // var gameID = gb.gameID
    while (gb.sessionRepeat(randomID, gb.members.map(function(i){return i.id}) )) {
      randomID = gb.randomIDCreator(12)
    }
    if (gb.gameState>0) {
      res.json({'code':'-1'})
    } else if (gb.sessionRepeat(name, gb.members.map(function (i) {return i.name}))) {
      res.json({'code':'0'})
    } else {
      res.json({'code':'1','id':randomID})
      gb.members.push({
        name: name,
        id: randomID,
        score: 0,
        role: 0,
        ready: false,
        restOfTurn: 1,
      })
    }
})

//module.exports = function (app) {
  //app.post('/login', function (req, res) {
    //gb.DEBUG_MODE && console.log(req.body);
  //var name = req.body.name
    //var randomID = gb.randomIDCreator(12)
     //var gameID = gb.gameID
    //while (gb.sessionRepeat(randomID, gb.members.map(function(i){return i.id}) )) {
      //randomID = gb.randomIDCreator(12)
    //}
    //if (gb.gameState>0) {
      //res.json({'code':'-1'})
    //} else if (gb.sessionRepeat(name, gb.members.map(function (i) {return i.name}))) {
      //res.json({'code':'0'})
    //} else {
      //res.json({'code':'1','id':randomID})
      //gb.members.push({
        //name:name,
        //id:randomID,
        //power:0,
        //isDead:false,
        //ready:true
      //})
    //}
  //})

//};
module.exports = router;
