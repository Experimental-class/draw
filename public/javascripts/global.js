function Global(){
  this.members = [];
  this.gameState = 0;
  this.gameID;
  this.countDownInit = 15;
  this.countDown = 15;
  this.turns = 2;
}


function Member(){
  this.id;
  this.name;
  this.status; 
  this.ready;
  this.score = 0;
  this.restOfTurn = 0;
}


module.exports = Global
