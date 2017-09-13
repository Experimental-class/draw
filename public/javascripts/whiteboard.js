const socket = io();

const $=(id)=> document.getElementById(id);


// --- button function ---

const login = ()=>{
  if (!$('nameInput').value) return
  socket.username = $('nameInput').value;
  socket.emit('add user', $('nameInput').value);

  $('readyInfo').innerHTML = [socket.id, socket.username].join(' - ');
  $('loginDiv').hidden = true;
  $('readyDiv').hidden = false;

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

const guess = () => {
  if($('guessInput').value == '') return
  let newTR = $('chatTable').insertRow();
  let text = document.createElement('font');
  text.color = 'red';
  text.textContent = socket.username || 'unknown user';
  newTR.insertCell(0).appendChild(text);
  newTR.insertCell(1).innerHTML = $('guessInput').value

  socket.emit('chat', {
    username: socket.username || 'unknown user',
    word: $('guessInput').value,
  });

  $('guessInput').value = '';
}
// ---- key event and locking ---



$('nameInput').onkeydown = e => {
  e.key == 'Enter' && login();
};

$('guessInput').onkeydown = e => {
  e.key == 'Enter' && guess();
}



// ---- socket.io ---

socket.on('game status', sta => {
  console.log(Members)
  let gameInProgress = sta.status === 1;
  if (gameInProgress) {
    let isTourist = false; // todo:
    let isDrawer = sta.nextDrawer.id === socket.id;
    if (isTourist) {
      $('word').innerHTML = 'WORD: ' + sta.word + ' TIP: ' + sta.tip;
    } else if (isDrawer) {
      $('word').innerHTML = 'WORD: ' + sta.word + ' TIP: ' + sta.tip + ' (Drawing)';
    } else {
      $('word').innerHTML = sta.nextDrawer.name + ' is drawing... TIP: ' + sta.tip;
      $('guessBtn').disabled = '';
      $('guessInput').disabled = '';
    }
  } else {

  }
})


socket.on('chat', chat=>{
  let newTR = $('chatTable').insertRow();
  newTR.insertCell(0).innerHTML = chat.username;
  newTR.insertCell(1).innerHTML = chat.word;
})

socket.on('time', time=>{
  $('countDown').innerHTML = 'COUNTDOWN: ' + time.countDown
})

// socket.on('word', wordObj=>{
//   $('word').innerHTML = 'WORD: ' + wordObj.word + ' TIP: ' + wordObj.tip
// })

socket.on('user count', count=>{
  $('online1').innerHTML = 'CONNECTED: ' + count;
});

var Members = []

socket.on('members', members=>{
  Members = members
  // reset old table
  for(let i = $('status').rows.length - 1 ; i > 0 ; i--)
    $('status').deleteRow(i);
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
  }

  if ($('status').rows.length < 2) {
    let emptyTR = $('status').insertRow();
    emptyTR.insertCell(0).innerHTML ='------------'
    emptyTR.insertCell(1).innerHTML ='-'
    emptyTR.insertCell(2).innerHTML ='-'
  }

});
