'use strict';

var socket = io();
var gameStatus = 0;
var draw = false;
var gameCount = 0

function $(id) {
    return document.getElementById(id);
}

//  画布
var container = $('canvas-container');
var context = container.querySelector('canvas.canvas');

context.height = container.clientHeight;
context.width = container.clientWidth;

var colorString = '#000000';
var lineWidth = 1;
var ctx = context.getContext('2d');

ctx.strokeStyle = colorString;
ctx.lineWidth = lineWidth;
ctx.lineCap = 'round';

var prevX, prevY, isDrawing = false;

//  画图
container.onmousedown = function(e){
    e.preventDefault();
    isDrawing = true;
    var pos = getMouseEventContainerPos(e);
    prevX = pos.x;
    prevY = pos.y;
};
container.ontouchstart = function (e) {
    e.preventDefault();
    isDrawing = true;
    var pos = getMouseEventContainerPos(e);
    prevX = pos.x;
    prevY = pos.y;
};

container.onmousemove = function(e){
    if (!isDrawing) return;
    var pos = getMouseEventContainerPos(e);
    var newLine = {
        startX: prevX,
        startY: prevY,
        endX: pos.x,
        endY: pos.y,
        colorString: colorString,
        lineWidth: lineWidth
    };
    if (draw){
        drawLine(newLine);
        socket.emit('draw line', newLine);
    }
    prevX = pos.x;
    prevY = pos.y;
};
container.ontouchmove = function (e) {
    if (!isDrawing) return;
    var pos = getMouseEventContainerPos(e);
    var newLine = {
        startX: prevX,
        startY: prevY,
        endX: pos.x,
        endY: pos.y,
        colorString: colorString,
        lineWidth: lineWidth
    };
    if (draw){
        drawLine(newLine);
        socket.emit('draw line', newLine);
    }
    prevX = pos.x;
    prevY = pos.y;
};

document.onmouseup = function(){
    isDrawing = false;
};
document.ontouchend = function () {
    isDrawing = false;
};

container.onmouseenter = function(e) {
    if (!isDrawing) return;
    container.onmousedown(e);
};


function getMouseEventContainerPos(e) {
    return {
        x: e.offsetX + e.target.getBoundingClientRect().left - container.getBoundingClientRect().left,
        y: e.offsetY + e.target.getBoundingClientRect().top - container.getBoundingClientRect().top
    };
}

// 颜色选择
$('color-picker').onchange = function() {
    colorString = $('color-picker').value;
};
$('linewidth-picker').onchange = function() {
    lineWidth = $('linewidth-picker').value;
};

//  画布同步
socket.on('draw line', drawLine);
function drawLine(line) {
    ctx.strokeStyle = line.colorString;
    ctx.lineWidth = line.lineWidth;
    ctx.beginPath();
    ctx.moveTo(line.startX, line.startY);
    ctx.lineTo(line.endX, line.endY);
    ctx.stroke();
}



//  登录
function toLogin() {
    $('login-container').style.display = 'block';
}
$('user-name').onkeydown = function (e) {
    if (e.key == 'Enter'){
        socket.username = $('user-name').value;
        socket.emit('add user',$('user-name').value);  //  用户名

        $('login-container').style.display = 'none';
        $('login-button').style.display = 'none';
        $('ready-button').style.display = 'block';
    }
};

//  准备
function ready() {
    socket.emit('user ready',socket.id);  //  用户名

    // $('user-message').innerHTML += '<b style="color: green;float: right;margin-right: 55px;margin-top: -20px;">√</b>';
    $('ready-button').disabled = 'disabled';
    $('ready-button').textContent = "准备好了";
}


//  房间人数
socket.on('user count', function(count) {
    $('user-count').textContent = '当前房间总人数： ' + count;
    gameCount = count;
});


//  用户基本信息
socket.on('members',function (data) {
    $('user-message').innerHTML = '';

    $("score").innerHTML = "总积分：";

    for (var i = 0; i < data.length; i++){
        if (data[i].id === socket.id){
            $("score").innerHTML = "<b style='color: red;'>"+ data[i].name + "</b>&nbsp;&nbsp;的总积分：" + data[i].score + "&nbsp;&nbsp;我的剩余画图回合：" + data[i].restOfTurn;
        } else {
            // if (data[i].ready){
                // $('user-message').innerHTML += '<li style="margin-top: 5px;"><a style="color: red">用户：</a>'+data[i].name+'<b style="color: green;float: right;margin-right: 55px;">√</b></li>';
            // } else {
                $('user-message').innerHTML += '<li style="margin-top: 5px;"><a style="color: red">用户：</a>'+data[i].name+'<br>总积分：' + data[i].score + "&nbsp;&nbsp;剩余回合：" + data[i].restOfTurn+'</li>';
            // }
        }
    }
});

//  游戏状态
socket.on('game status',function (data) {
    if (data.status === 1){
        gameStatus = 1;
        if (data.nextDrawer.id === socket.id){
            $('nowWord').innerHTML = "猜词 提示：";
            $('word').innerHTML = data.tip;
        } else {
            $('nowWord').innerHTML = "画图 当前词汇：";
            $('word').innerHTML = data.word;
            draw = true;
        }
    } else {
        gameStatus = 0;
        $('nowWord').innerHTML = "";
        $('word').innerHTML = '';
        $("time").innerHTML = '';
    }
});


//  游戏计时
socket.on('time', function (data){

    if (gameStatus === 1){
        $("time").innerHTML = (data.countDown > 0 ? data.countDown : 0);

        if (!(data.countDown > 0)){
            context.height = container.clientHeight;
            context.width = container.clientWidth;
        }
    } else {
        $("time").innerHTML = '';
    }
});


//  回答兼聊天
var cooldown = 0;

$('postChat').onclick = chat;
$('chat').onkeydown = function (e) {
    if (e.key == 'Enter'){
        chat();
    }
};

function chat() {
  if (cooldown > 0 || $('chat').value === '') return;
  socket.emit('chat', {
      username: socket.username || 'unknown',
      word: $('chat').value,
  });

  socket.emit('guess word', $('chat').value);

  if (socket.username){
      $('tips').innerHTML += "<li><b style='color: red'>"+socket.username + "：</b>" + $('chat').value+"</li>";
  } else {
      $('tips').innerHTML += "<li><b style='color: red'>unknown</b>" + $('chat').value+"</li>";
  }

  $('chat').value = '';

  cooldown = 2;
  $('postChat').disabled = 'disabled';
  $('postChat').value = cooldown;
  let cooldowner = setInterval(()=>{
    $('postChat').value = --cooldown;
    if (cooldown <= 0){
      clearInterval(cooldowner);
      $('postChat').disabled = '';
      $('postChat').value = '发送';
    }
  }, 1e3); // 1s for interval
}



socket.on('chat',function (data) {
    $('tips').innerHTML += "<li><b>"+data.username + "：</b>" + data.word+"</li>";
});
