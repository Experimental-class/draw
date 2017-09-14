let Global =  {
    DEBUG_MODE : 1,            // 1 for dev mode , 0 for GUI mode
    members : [],
    word : {},                 // current guessing wordObj
    countDownInit: 3,          // for ready
    countDownDrawing: 30,      // for drawing
    countDownTurn: 45,         // one turn time
    countDown : 3,
    gameState : 0,             // 0 for off, 1 for process
    gameID : '',
    turnsInit : 2,             // game turns
}


function Member(){             // model, no actul use
    this.id;
    this.name;
    // this.role = 0;          // 1 for draw, 0 for guess
    this.ready = false;        // be ready to start
    this.score = 0;
    this.restOfTurn = 2;       // not 0, gameState not changed
    this.bingo = false;        // guess right!
    // this.online;            // leave for next version
}

Global.userReady = id => {
    let members = Global.members.filter((m)=>m.id===id);
    if (members.length === 0) return 0
    members[0].ready = !members[0].ready; return 1
};


Global.countScore = () => {
  // Global.DEBUG_MODE && console.log('\n <Turn ends> Time up, Guessing Result: ')
  Global.members.forEach(m=>{
    if (m.bingo) {
      m.bingo = false;
      m.score ++;
      Global.DEBUG_MODE && console.log('\nUser ' + m.name + ' guess right, score:' + m.score)
    }
  })
}

/* count down to fun() once */
Global.countDowner = fun => {
  const Interval = 0.1;
  setTimeout(()=>{
    Global.countDown -= Interval;
    if(Global.countDown>0){
      setTimeout(()=> Global.countDowner(fun), Interval*1000);
      // console.log(Global.countDown, arguments.callee)
    } else {
      fun && fun();
    }
  }, Interval*1000);
}


Global.setInterval = (fun, time) => {
  fun();
  return setInterval(fun, time);
}

Global.setTimeoutLink = (fun, time, cb) => { // cb() return true, link ends
  setTimeout(()=>{
    fun && fun();
    cb && cb() || setTimeout(()=> Global.setTimeoutLink(fun, time, cb));
  }, time);
}

Global.setTimeoutLinkIme = (fun, time, cb) => {
  fun && fun();
  Global.setTimeoutLink(fun, time, cb);
}


Global.nextDrawer = ()=>{
    // Global.DEBUG_MODE && console.log('47------',  Global.members)
    let ar = Global.members.filter((m)=>m.restOfTurn>0);
    // Global.DEBUG_MODE && console.log('49-------', ar);
    return ar.length ? ar[Math.floor(Math.random()*ar.length)] : null;
}

Global.randomWord = ()=>{
    const WORDS = require('./words.json');
    return WORDS[Math.floor(Math.random()*WORDS.length)];
}

module.exports = Global;
