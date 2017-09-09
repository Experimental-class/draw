const socket = io();

let $=(id)=> document.getElementById(id);


let login = ()=>{
  if (!username.value) return
  socket.username = username.value;
  socket.emit('add user', username.value);

  $('readyInfo').innerHTML = [socket.id, socket.username].join(' - ');
  $('loginDiv').hidden = true;
  $('readyDiv').hidden = false;
}

let ready = ()=> {
  socket.emit('user ready', socket.id);
  $('readyBtn').disabled = 'disabled';
}

socket.on('user count', count=>{
  $('online1').innerHTML = 'CONNECTED: ' + count;
});


socket.on('members', members=>{
  for(let i = $('status').rows.length - 1 ; i > 0 ; i--) {
    $('status').deleteRow(i);
  }
  for(m in members){
      if(members[m].id === socket.id) continue;
      let newTR = $('status').insertRow();
      newTR.insertCell(0).innerHTML = members[m].id
      newTR.insertCell(1).innerHTML = members[m].name
      // newTR.insertCell(2).innerHTML = members[m].ready
      let input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = members[m].ready;
      input.disabled = 'disabled';
      newTR.insertCell(2).appendChild(input);
  }
  // if (members.length){
  //   for(m in members){
  //       let newTR = status.insertRow();
  //       newTR.insertCell(0).innerHTML = members[m].id
  //       newTR.insertCell(1).innerHTML = members[m].name
  //       // newTR.insertCell(2).innerHTML = members[m].ready
  //       let input = document.createElement('input');
  //       input.type = 'checkbox';
  //       input.checked = members[m].ready;
  //       newTR.insertCell(2).appendChild(input);
  //   }
  // } else {
  if ($('status').rows.length < 2) {
    let emptyTR = $('status').insertRow();
    emptyTR.insertCell(0).innerHTML ='------------'
    emptyTR.insertCell(1).innerHTML ='-'
    emptyTR.insertCell(2).innerHTML ='-'
  }

});
