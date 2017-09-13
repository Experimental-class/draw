let socketio = {}

const gb = require('./public/javascripts/global');

socketio.getServer = (server) => {
  const io = require('socket.io')(server);

  let userCount = 0;
  io.on('connection', socket => {
    userCount ++;
    gb.DEBUG_MODE && console.log('User connected: ' + userCount);
    io.emit('user count', userCount);
    io.emit('members', gb.members)
    io.emit('game status', {
        status : gb.gameState
    })

    socket.on('disconnect', () => {
      userCount --;
      gb.DEBUG_MODE && console.log('User connected: ' + userCount);
      io.emit('user count', userCount);
      gb.members = gb.members.filter((i)=>{return i.id != socket.id})
      socket.broadcast.emit('members', gb.members)
    });

    setInterval(() => {
      socket.emit('time', {
        // gameID: gb.gameID,
        countDown: gb.countDown.toFixed(2)
      })
    }, 500)

    // when the client emits 'add user', this listens and executes
    socket.on('add user', username => {
      // we store the username in the socket session for this client
      socket.username = username;
      //  note: socket.id is already generated.
      // socket.id = gb.randomIDCreator(12)
      // var gameID = gb.gameID
      // while (gb.sessionRepeat(socket.id, gb.members.map(function(i){return i.id}) )) {
      //   socket.id = gb.randomIDCreator(12)
      // }
      gb.members.push({
        name: socket.username,
        id: socket.id,
        score: 0,
        role: 0,
        ready: false,
        restOfTurn: 2,
      })
      // socket.broadcast.emit('members', gb.members)
      // socket.emit('members', gb.members)
      io.emit('members', gb.members)
    });

    // setInterval(() => {
    //   socket.emit('members', gb.members);
    // }, 3000)

    socket.on('user ready', userid=>{
      gb.DEBUG_MODE && console.log('user '+userid+' is ready');

        gb.userReady(userid) && socket.broadcast.emit('members', gb.members);

        let usersCountValid = gb.members.length > 1;
        let usersAllReady = gb.members.filter((m)=>!m.ready).length === 0;


        if ( usersCountValid && usersAllReady ) {

          gb.DEBUG_MODE && console.log('game begins!');

          // ready for start
          gb.countDowner(()=>{

            gb.gameState = 1;
            gb.word = gb.randomWord();
            gb.countDown = gb.countDownDrawing;
            io.emit('game status', {
              status : 1,
              word :  gb.word.word,
              tip : gb.word.tip || '--' ,
              nextDrawer : gb.nextDrawer(),
            });
            io.emit('members',gb.members)


            gb.gameID = setInterval(function(){

              // Generate nextInfo
              gb.word = gb.randomWord();
              let nextDrawer = gb.nextDrawer();

              // judge game end
              if(nextDrawer === null) {
                gb.gameState = 0;
                gb.countDown = gb.countDownInit;
                gb.members = [];
                clearInterval(gb.gameID);
                io.emit('game status',  { status: 0 } );
                return
              }

              nextDrawer.restOfTurn --;
              gb.DEBUG_MODE && console.log('The nextDrawer restOfTurn: ', nextDrawer.name, nextDrawer.restOfTurn)


              let nextInfo = {
                status : 1,
                word :  gb.word.word,
                tip : gb.word.tip || '--',
                nextDrawer : nextDrawer,
              }

              gb.countDowner(()=>{
                io.emit('game status', nextInfo);
                io.emit('members',gb.members)
                gb.countDown = gb.countDownDrawing;
              });

            }, gb.countDownTurn*1000); // setInterval end

          });

          //




        } // endif


    });



    socket.on('chat', chat => {
      socket.broadcast.emit('chat', chat);
    })

    socket.on('bingo', msg => {
      // socket.broadcast.emit('bingo', msg);
    })



    socket.on('message', msg => {
      if (msg.type == 'game control'){

      }
    });



  })
}

module.exports = socketio
