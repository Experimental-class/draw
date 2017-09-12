let Global =  {
  DEBUG_MODE : 1,            // 1 for dev mode , 0 for GUI mode
  members : [],
  countDownInit: 3,          // for ready
  countDownDrawing: 45,      // for drawing
  countDown : 3,
  gameState : 0,             // 0 for off, 1 for process
  gameID : '',
  turns : 1,
}


function Member(){
  this.id;
  this.name;
  this.role = 0;          // 1 for draw, 0 for guess
  this.ready = false;     // be ready to start
  this.score = 0;
  this.restOfTurn = 2;    // not 0, gameState not changed
  this.online;            // leave for next version
}

Global.userReady = (id) => {
  member = Global.members.filter((m)=>m.id===id)
  member[0].ready = !member[0].ready
};

Global.countDowner = (fun)=> {
  setTimeout(()=>{
    Global.countDown -= 0.1
    if(Global.countDown>0){
        setTimeout(()=> Global.countDowner(fun), 100);
        // console.log(Global.countDown, arguments.callee)
    } else {
      fun && fun()
    }
  },100);
}

Global.nextDrawer = ()=>{
  Global.members = Global.members.map((m)=>{m.role = 0; return m})
  ar = Global.members.filter((m)=>m.restOfTurn>0);
  if (ar.length){
    mr = ar[Math.floor(Math.random()*ar.length)]
    mr.role = 1;
    mr.restOfTurn --;
    return mr.id;
  }
  return null;
}

Global.randomWord = ()=>{
  const WORDS = require('./words.json');
  return WORDS[Math.floor(Math.random()*WORDS.length)];
}

module.exports = Global;
