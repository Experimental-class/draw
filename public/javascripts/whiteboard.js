const socket = io();

let online = document.getElementById('online1');
let status = document.getElementById('status');
let loginButton = document.getElementById('loginBtn');
let usernameInput = document.getElementById('username');

function login() {
  if (!username.value) return
  socket.emit('add user', username.value);
  // usernameInput.disabled = true;
  usernameInput.readOnly = true;
  loginButton.disabled = true;
}


socket.on('user count', count=>{
  online.innerHTML = 'CONNECTED: ' + count;
});

socket.on('members', members=>{
  console.log(members)
  for(let i = status.rows.length - 1 ; i > 0 ; i--) {
    status.deleteRow(i);
  }
  if (members.length){
    for(m in members){
      let newTR = status.insertRow();
      newTR.insertCell(0).innerHTML = members[m].id
      newTR.insertCell(1).innerHTML = members[m].name
      newTR.insertCell(2).innerHTML = members[m].ready
    }
  } else {
    let emptyTR = status.insertRow();
    emptyTR.insertCell(0).innerHTML ='------------'
    emptyTR.insertCell(1).innerHTML ='-'
    emptyTR.insertCell(2).innerHTML ='-'
  }

});
