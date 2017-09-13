let Global =  {
  DEBUG_MODE : 1,            // 1 for dev mode , 0 for GUI mode
  members : [],
<<<<<<< HEAD
  countDownInit: 3,          // for ready
  countDownDrawing: 45,      // for drawing
=======
  word : {},                 // current guessing wordObj
  countDownInit: 3,          // for ready
  countDownDrawing: 25,      // for drawing
  countDownTurn: 25,         // one turn time
>>>>>>> bdda80ab42c8fa1d60432667b666325e88bf6474
  countDown : 3,
  gameState : 0,             // 0 for off, 1 for process
  gameID : '',
  turns : 1,
}


function Member(){
  this.id;
  this.name;
<<<<<<< HEAD
  this.role = 0;          // 1 for draw, 0 for guess
  this.ready = false;     // be ready to start
  this.score = 0;
  this.restOfTurn = 2;    // not 0, gameState not changed
  this.online;            // leave for next version
=======
  // this.role = 0;          // 1 for draw, 0 for guess
  this.ready = false;     // be ready to start
  this.score = 0;
  this.restOfTurn = 2;    // not 0, gameState not changed
  // this.online;            // leave for next version
>>>>>>> bdda80ab42c8fa1d60432667b666325e88bf6474
}

Global.userReady = id => {
  let members = Global.members.filter((m)=>m.id===id);
  if (members.length === 0) return 0
  members[0].ready = !members[0].ready; return 1
};



Global.countDowner = fun => {
  setTimeout(()=>{
    Global.countDown -= 0.1
    if(Global.countDown>0){
        setTimeout(()=> Global.countDowner(fun), 100);
        // console.log(Global.countDown, arguments.callee)
    } else {
      fun && fun();
    }
  },100);
}

<<<<<<< HEAD
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
=======

Global.nextDrawer = ()=>{
  // Global.DEBUG_MODE && console.log('47------',  Global.members)
  let ar = Global.members.filter((m)=>m.restOfTurn>0);
  // Global.DEBUG_MODE && console.log('49-------', ar);
  return ar.length ? ar[Math.floor(Math.random()*ar.length)] : null;
>>>>>>> bdda80ab42c8fa1d60432667b666325e88bf6474
}

Global.randomWord = ()=>{
  const WORDS = require('./words.json');
  return WORDS[Math.floor(Math.random()*WORDS.length)];
}

module.exports = Global;
