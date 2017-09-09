let socketio = {}

const gb = require('./public/javascripts/global');

socketio.getServer = (server) => {
  const io = require('socket.io')(server);

  let userCount = 0;
  io.on('connection', socket => {
    userCount ++;
    console.log('User connected: ' + userCount);
    io.emit('user count', userCount);
    socket.emit('members', gb.members)
    socket.emit('game status', gb.gameState)

    socket.on('disconnect', () => {
      userCount --;
      console.log('User connected: ' + userCount);
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
        restOfTurn: 1,
      })
      socket.broadcast.emit('members', gb.members)
      socket.emit('members', gb.members)
    });

    // setInterval(() => {
    //   socket.emit('members', gb.members);
    // }, 3000)

    socket.on('user ready', userid=>{
        gb.userReady(userid);
        socket.broadcast.emit('members', gb.members);
        socket.emit('members', gb.members);

        let usersCountValid = gb.members.length > 1;
        let usersAllReady = gb.members.filter((m)=>!m.ready).length === 0;
        if(usersCountValid && usersAllReady){
          gb.countDowner(()=>{
            gb.countDown = gb.countDownInit
          });
        }
    })



    socket.on('message', msg => {
      if (msg.type == 'game control'){
        if (msg.status == 1) {
          gb.countDowner(1)
        }
      }
    });



  })
}

module.exports = socketio
