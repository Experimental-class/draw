const socket = io();

const $=(id)=> document.getElementById(id);

let gameState = 0;

// --- button function ---

const login = ()=>{
  if (!$('nameInput').value) return
  socket.username = $('nameInput').value;
  socket.emit('add user', $('nameInput').value);

  $('readyInfo').innerHTML = [socket.id, socket.username].join(' - ');
  $('loginDiv').hidden = true;
  $('readyDiv').hidden = false;

  // chatting: login required
  $('guessInput').disabled = '';
  $('guessBtn').disabled = '';

  document.onkeydown = e => {
    if (e.key == 'r' ){ ready(); document.onkeydown = null;}
  }
  $('nameInput').onkeydown = null;
}

const ready = ()=> {
  socket.emit('user ready', socket.id);
  $('readyBtn').disabled = 'disabled';
  $('readyBtn').textContent = '√';
}

let cooldown = 0;

const guess = () => {
  if (cooldown > 0) return
  if ($('guessInput').value == '') return
  let newTR = $('chatTable').insertRow();
  let text = document.createElement('font');
  text.color = 'red';
  text.textContent = socket.username || 'unknown user';
  newTR.insertCell(0).appendChild(text);
  newTR.insertCell(1).innerHTML = $('guessInput').value

  // chatting
  socket.emit('chat', {
    username: socket.username || 'unknown user',
    word: $('guessInput').value,
  });

  // guessing  (note: drawer chatting forbidden)
  gameState && socket.emit('guess word', $('guessInput').value);

  $('guessInput').value = '';

  // chatting cooldown
  cooldown = 2;
  $('guessBtn').disabled = 'disabled';
  $('guessBtn').textContent = cooldown;
  let cooldowner = setInterval(()=>{
    $('guessBtn').textContent = --cooldown;
    if (cooldown <= 0){
      clearInterval(cooldowner);
      $('guessBtn').disabled = '';
      $('guessBtn').textContent = 'send';
    }
  }, 1e3); // 1s for interval


}
// ---- key event ---

$('nameInput').onkeydown = e => {
  e.keyCode == 13 && login();
};

$('guessInput').onkeydown = e => {
  e.keyCode == 13 && guess();
}



// ---- socket.io ---

socket.on('game status', sta => {
  gameState = sta.status;

  let isTourist = !socket.username;
  let gameInProgress = sta.status === 1;

  // for chatting forbidden
  $('guessInput').disabled = '';
  $('guessBtn').disabled = '';
  $('guessBtn').textContent = 'send';

  if (isTourist) {
    $('word').innerHTML = 'WORD: ' + sta.word + ' TIP: ' + sta.tip;
    // tourist forbidden
    $('guessInput').disabled = 'disabled';
    $('guessBtn').disabled = 'disabled';

  } else if (gameInProgress) {
    let isDrawer = sta.nextDrawer.id === socket.id;
    if (isDrawer) {
      $('word').innerHTML = 'WORD: ' + sta.word + ' TIP: ' + sta.tip + ' (Drawing)';
      // drawer forbidden
      $('guessInput').disabled = 'disabled';
      $('guessBtn').disabled = 'disabled';
      $('guessBtn').textContent = 'drawing...';
    } else { // guessing people
      $('word').innerHTML = sta.nextDrawer.name + ' is drawing... TIP: ' + sta.tip;
    }
  } else { // game status = 0
    $('word').innerHTML = 'game over, ready to start';
    $('readyBtn').disabled = '';
    $('readyBtn').textContent = 'ready';
  }
})


socket.on('chat', chat=>{
  let newTR = $('chatTable').insertRow();
  newTR.insertCell(0).innerHTML = chat.username;
  newTR.insertCell(1).innerHTML = chat.word;


})

socket.on('time', time=>{
  $('countDown').innerHTML = 'COUNTDOWN: ' + (time.countDown > 0 ? time.countDown : '0.00');
})


// socket.on('word', wordObj=>{
//   $('word').innerHTML = 'WORD: ' + wordObj.word + ' TIP: ' + wordObj.tip
// })


socket.on('user count', count=>{
  $('online1').innerHTML = 'CONNECTED: ' + count;
});



socket.on('members', members=>{
  // reset old table
  for(let i = $('status').rows.length - 1 ; i > 0 ; i--) $('status').deleteRow(i);
  for(m in members){
      // no need for myself
      if(members[m].id === socket.id) continue;
      // new row
      let newTR = $('status').insertRow();
      newTR.insertCell(0).innerHTML = members[m].id
      newTR.insertCell(1).innerHTML = members[m].name
      let input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = members[m].ready;
      input.disabled = 'disabled';
      newTR.insertCell(2).appendChild(input);
      newTR.insertCell(3).innerHTML = members[m].score
  }

  if ($('status').rows.length < 2) {
    let emptyTR = $('status').insertRow();
    emptyTR.insertCell(0).innerHTML ='------------'
    emptyTR.insertCell(1).innerHTML ='-'
    emptyTR.insertCell(2).innerHTML ='-'
    emptyTR.insertCell(3).innerHTML ='-'
  }

});
