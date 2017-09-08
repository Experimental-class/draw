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

    socket.on('disconnect', () => {
      userCount --;
      console.log('User connected: ' + userCount);
      io.emit('user count', userCount);
      gb.members = gb.members.filter((i)=>{return i.id != socket.id})
      socket.broadcast.emit('members', gb.members)
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username) {
      // we store the username in the socket session for this client
      socket.username = username;
      socket.id = gb.randomIDCreator(12)
      // var gameID = gb.gameID
      while (gb.sessionRepeat(socket.id, gb.members.map(function(i){return i.id}) )) {
        socket.id = gb.randomIDCreator(12)
      }
      gb.members.push({
        name: username,
        id: socket.id,
        score: 0,
        role: 0,
        ready: false,
        restOfTurn: 1,
      })
      socket.broadcast.emit('members', gb.members)
      // ++numUsers;
      // addedUser = true;
      // socket.emit('login', {
      //   numUsers: numUsers
      // });
      // echo globally (all clients) that a person has connected
      // socket.broadcast.emit('user joined', {
      //   username: socket.username,
      //   numUsers: numUsers
      // });
    });

    // setInterval(() => {
    //   socket.emit('members', gb.members);
    // }, 3000)

    socket.on('message', msg => {
      if (msg.type == 'game control'){
        gb.countDowner(() => {
          socket.emit('members', gb.members)
        })
      }
    });

  })
}

module.exports = socketio
