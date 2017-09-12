const socket = io();

const $=(id)=> document.getElementById(id);


// --- button function ---

const login = ()=>{
  if (!username.value) return
  socket.username = username.value;
  socket.emit('add user', username.value);

  $('readyInfo').innerHTML = [socket.id, socket.username].join(' - ');
  $('loginDiv').hidden = true;
  $('readyDiv').hidden = false;
}

const ready = ()=> {
  socket.emit('user ready', socket.id);
  $('readyBtn').disabled = 'disabled';
}




// ---- socket.id part ---

socket.on('game status', status=>{
  if (status) {
    // game is processing
  } else {
    // game ended
  }
})

socket.on('time', time=>{
  $('countDown').innerHTML = 'COUNTDOWN: ' + time.countDown
})

socket.on('word', wordObj=>{
  $('word').innerHTML = 'WORD: ' + wordObj.word + ' TIP: ' + wordObj.tip
})

socket.on('user count', count=>{
  $('online1').innerHTML = 'CONNECTED: ' + count;
});


socket.on('members', members=>{
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
