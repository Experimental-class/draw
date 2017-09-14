'use strict';

var socket = io();
var gameStatus = 0;
var draw = false;

function $(id) {
    return document.getElementById(id);
}


//  登录
var userName = $('user-name');
var loginContainer = $('login-container');
var loginButton = $('login-button');
var readyButton = $('ready-button');
function toLogin() {
    loginContainer.style.display = 'block';
}
userName.onkeydown = function (e) {
    if (e.key == 'Enter'){
        socket.emit('add user',userName.value);  //  用户名
        loginContainer.style.display = 'none';
        loginButton.style.display = 'none';
        readyButton.style.display = 'block';
        socket.username = userName.value;
    }
};


//  准备
function ready() {
    socket.emit('user ready',socket.id);  //  用户名

    var userMessage = $('user-message');
    userMessage.innerHTML += '<b style="color: green;float: right;margin-right: 55px;margin-top: -20px;">√</b></li>';
    readyButton.disabled = 'disabled';
}


//  房间人数
socket.on('user count', function(count) {
    var userNum = $('user-count');
    userNum.textContent = '当前房间总人数： ' + count;
});

//  用户基本信息
socket.on('members',function (data) {
    console.log(data);

    var userMessage = $('user-message');
    userMessage.innerHTML = '';

    for (var i = 0; i < data.length; i++){
        if (data[i].ready === true){
            userMessage.innerHTML += '<li style="margin-top: 5px;"><a style="color: red">用户：</a>'+data[i].name+'<b style="color: green;float: right;margin-right: 55px;">√</b></li>';
        } else {
            userMessage.innerHTML += '<li style="margin-top: 5px;"><a style="color: red">用户：</a>'+data[i].name+'</li>';
        }
    }

    // if (data.length >= 2){
    //     for (var j = 1; j < data.length; j++){
    //         if (data[0].ready === true && data[j].ready === data[j-1].ready){
    //             var startContainer = $('start-container');
    //             var startTime = $('count-time');
    //
    //             startContainer.style.display = 'block';
    //
    //             var s=5;
    //             var intetvalFirst = setInterval(function () {
    //                 startTime.textContent = s--;
    //                 if (s <= 0){
    //                     clearInterval(intetvalFirst);
    //                     startContainer.style.display = 'none';
    //                 }
    //             },1000)
    //         }
    //     }
    // }
});

//  游戏状态
var countTime = $("time");
socket.on('game status',function (data) {
    var word = $('word');
    var nowWord = $('nowWord');

    console.log(data);

    // var startTime = $('count-time');
    // var startContainer = $('start-container');
    // startContainer.style.display = 'block';
    // startTime.innerHTML = "ready go !";
    // var s=1;
    // var intetvalFirst = setInterval(function () {
    //     s--
    //     if (s <= 0){
    //         clearInterval(intetvalFirst);
    //         startContainer.style.display = 'none';
    //     }
    // },1000);

    if (data.status === 1){
        gameStatus = 1;
            if (data.nextDrawer.id === socket.id){
                nowWord.innerHTML = "提示：";
                word.innerHTML = data.tip;
            } else {
                nowWord.innerHTML = "当前词汇：";
                word.innerHTML = data.word;
                draw = true;
            }
    } else {
        word.innerHTML = '';
        countTime.textContent = '';
    }
});

//  游戏计时
socket.on('time', function (data){
    if (gameStatus === 1){
        countTime.innerHTML = (data.countDown > 0 ? data.countDown : '0.00');
    } else {
        countTime.textContent = '';
    }
});



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
var colorPickerInput = $('color-picker');
var linewidthPicker = $('linewidth-picker');
colorPickerInput.onchange = function() {
    colorString = colorPickerInput.value;
};
linewidthPicker.onchange = function() {
    lineWidth = linewidthPicker.value;
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


//  回答兼聊天
var postChatData = $('postChat');
var chatData = $('chat');
var tipsContainer = $('tips');
postChatData.onclick = function () {
    socket.emit('chat', {
        username: socket.username || 'unknown user',
        word: chatData.value,
    });
    chatData.value = '';
};
chatData.onkeydown = function (e) {
    if (e.key == 'Enter'){
        socket.emit('chat',{
            username: socket.username || 'unknown user',
            word: chatData.value,
        });
        chatData.value = '';
    }
};
socket.on('chat',function (data) {
    console.log(data);
    tipsContainer.innerHTML += "<li><b style='color: red'>"+data.username + "：</b>" + data.word+"</li>";
});
