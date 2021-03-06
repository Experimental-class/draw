let socketio = {}

socketio.getServer = (server) => {
  const gb = require('./public/javascripts/global');
  const io = require('socket.io')(server);

  let userCount = 0;
  io.on('connection', socket => {
    userCount ++;
    gb.DEBUG_MODE && console.log('User connected: ' + userCount + ' -- joining id: ' + socket.id);
    io.emit('user count', userCount);
    io.emit('members', gb.members);
    io.emit('game status', { status : gb.gameState });

    socket.on('disconnect', () => {
      userCount --;
      gb.DEBUG_MODE && console.log('User connected: ' + userCount + ' -- leaving id: ' + socket.id);
      io.emit('user count', userCount);
      gb.members = gb.members.filter((i)=>{return i.id != socket.id});
      socket.broadcast.emit('members', gb.members);

      let usersCountInvalid = gb.members.length < 2;
      if ( usersCountInvalid ) {
        clearInterval(gb.gameID);
        io.emit('game status', {status: gb.gameState = 0});
      };
    });

    socket.on('chat', chat => {
      socket.broadcast.emit('chat', chat);
    })

    socket.on('draw line', line=>{
      socket.broadcast.emit('draw line', line);
    });

    socket.on('clean line', msg=>{
      socket.broadcast.emit('clean line', msg);
    });



    socket.on('guess word', word => {
      gb.DEBUG_MODE && console.log('\nUser', socket.username , 'guess word: ', word, gb.word.word, 'result:' , word == gb.word.word)
      if (word == gb.word.word) {
        user = gb.members.filter((i)=>{return i.id == socket.id})[0];
        user.bingo = true;
      }
    })

    // when the client emits 'add user', this listens and executes
    socket.on('add user', username => {
      // we store the username in the socket session for this client
      socket.username = username;
      //  note: socket.id is already generated.

      gb.members.push({
        name: socket.username,
        id: socket.id,
        score: 0,
        bingo: false,
        ready: false,
        restOfTurn: gb.turnsInit
      })
      io.emit('members', gb.members)
    });


    /***************** game flow ***************/
    socket.on('user ready', userid=>{
      gb.DEBUG_MODE && console.log('\nUser ' + socket.username + ' is ready');
      gb.userReady(userid) && socket.broadcast.emit('members', gb.members);

      let usersCountValid = gb.members.length > 1;
      let usersAllReady = gb.members.filter((m)=>!m.ready).length === 0;

      /* game begins */
      if ( usersCountValid && usersAllReady ) {
        gb.DEBUG_MODE && console.log('\nGame begins!\n');

        gb.members.forEach( m =>{ m.ready = false;  m.bingo = false; m.restOfTurn=gb.turnsInit; })


        // ready countDown for start
        gb.countDown = gb.countDownInit;
        gb.countDowner(()=>{
          // game begins:

          /***********************************************************************************************************
              Use turn mode: for network problem and js-fucked engine.

              inverval_time:    *************************** event_time ************************************
              draw_time(html):  ******************* draw&guess **********************  *** show_results ***

              Next info will be given when turn begins(event_time begins), but not draw&guess ends.
          ************************************************************************************************************/

          gb.gameState = 1;
          let turnCount = 1;
          let nextDrawer;   // leave undefined

          gb.gameID = gb.setInterval(()=>{
          // gb.setTimeoutLinkIme(()=>{

            nextDrawer = gb.nextDrawer(); // give the next drawer


            /* when the turn begins checked game if ends */

            /* bad solution: doule checked, for js problem */
            // gb.countScore(); // checked results (not only guessing ends
            // io.emit('members', gb.members)

            if(nextDrawer === null) {
              // game over
              gb.gameState = 0;
              gb.countDown = gb.countDownInit;
              gb.members.forEach((m)=>{m.ready=false; m.bingo=false})
              io.emit('game status',  { status: 0 } );
              io.emit('members', gb.members)
              clearInterval(gb.gameID);
              // clearTimeout(gb.gameID);
              return;
            }

            /********** countDowner( draw&guess time ) **********/
            gb.countDown = gb.countDownDrawing;
            gb.countDowner(()=>{
              gb.DEBUG_MODE && console.log('\n<Turn', turnCount, 'ends> Time up, guessing Result:\n (Empty for nobody gaining score.)\n');
              gb.countScore(); // checked results when guessing ends
              io.emit('members', gb.members)
              ++turnCount;
            });

            nextDrawer.restOfTurn --; // reduce his restOfTurn

            /* give info */
            gb.word = gb.randomWord(); // give the wordObj
            io.emit('game status', {
              status : 1,
              word :  gb.word.word,
              tip : gb.word.tip || '--',
              nextDrawer : nextDrawer,
            });
            io.emit('members', gb.members)

            gb.DEBUG_MODE && console.log('\n <New Turn begins> the word is giving: ', gb.word.word, '\n')
            gb.DEBUG_MODE && console.log('\nMembers status:')
            for ( n in gb.members) {
              let m = gb.members[n];
              gb.DEBUG_MODE && console.log(
                'name: ', m.name,
                'score: ', m.score,
                'status: ', nextDrawer.id === m.id ? 'drawing ' : 'guessing',
                'restOfTurn: ', m.restOfTurn
              )
            }
            console.log()



          }, gb.countDownTurn * 1000
            //, ()=>{return nextDrawer === null}
          ); // setTimeoutLinkIme end
        });
      } // endif
    });



    gb.setTimeoutLink(()=>{
    // TimeCounter(()=>{
      socket.emit('time', {
        // gameID: gb.gameID,
        countDown: gb.countDown.toFixed()
      })
    }, 500);


  })
}

module.exports = socketio
