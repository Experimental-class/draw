let Global =  {
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
  this.online;
}

Global.userReady = (id) => {
  member = Global.members.filter((m)=>m.id===id)
  member[0].ready = !member[0].ready
};

Global.countDowner = function (fun) {
  setTimeout(()=>{
    Global.countDown -= 0.1
    if(Global.countDown>0){
        setTimeout(arguments.callee, 100);
    } else {
      fun && fun()
    }
  },100);
}

module.exports = Global;
