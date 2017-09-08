var Global =  {
  DEBUG_MODE : 1,
  members : [],
  countDownInit: 12,
  countDown : 12,
  gameState : 0, //0 for off, 1 for process
  gameID : '',
  turns : 1,
}


function Member(){
  this.id;
  this.name;
  this.role = 0; // 1 for draw, 0 for guess
  this.ready = false;
  this.score = 0;
  this.restOfTurn = 1;
}


Global.randomIDCreator = function (l) {
  var ar = "0123456789ABCDEF";
  var result = "";
  for (var i = 0; i < l; i++) {
    result += ar[Math.floor(Math.random()*ar.length)];
  }
  return result
}

Global.sessionRepeat = function(session, sessions) {
  var isRepeated = false
  sessions.forEach(function (n) {
    session == n && (isRepeated = true)
  })
  return isRepeated
}

Global.countDowner = function (fun) {
  setTimeout(function(){
    Global.countDown -= 0.1
    if(Global.countDown>0){
        setTimeout(arguments.callee, 100);
    } else {
      fun && fun()
    }
  },100);
}

module.exports = Global;
