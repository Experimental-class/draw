'use strict';

var socket = io();

function $(id) {
    return document.getElementById(id);
}


//  登录
var userName = $('user-name');
var loginContainer = $('login-container');
userName.onkeydown = function (e) {
    if (e.key == 'Enter'){
        socket.emit('add user',userName.value);  //  用户名
        loginContainer.style.display = 'none';
    }
};

//  准备
function ready() {
    socket.emit('user ready',socket.id);  //  用户名
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

    if (data.length >= 2){
        for (var j = 1; j < data.length; j++){
            if (data[0].ready === true && data[j].ready === data[j-1].ready){
                var countTime = $("time");
                var s=60;
                var intetvalFirst = setInterval(function () {
                    countTime.textContent = s--;
                    if (s <= 0){
                        clearInterval(intetvalFirst);
                    }
                },1000)
            }
        }
    }
});

//  游戏状态
socket.on('game status',function (data) {
    console.log(data);
});

//  游戏计时
socket.on('time',function (data) {
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
    // drawLine(newLine);
    socket.emit('draw line', newLine);
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
    drawLine(newLine);
    socket.emit('draw line', newLine);
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
// socket.on('draw line', drawLine);
// function drawLine(line) {
//     ctx.strokeStyle = line.colorString;
//     ctx.lineWidth = line.lineWidth;
//     ctx.beginPath();
//     ctx.moveTo(line.startX, line.startY);
//     ctx.lineTo(line.endX, line.endY);
//     ctx.stroke();
// }


//  回答兼聊天
// var user = 'user' + Math.floor(Math.random()*1000);
// var postChatData = document.getElementById('postChat');
// var chatData = document.getElementById('chat');
// var tipsContainer = document.getElementById('tips');
// postChatData.onclick = function () {
//     socket.emit('chat data',{user:user,msg:chatData.value});
//     chatData.value = '';
// };
// chatData.onkeydown = function (e) {
//     if (e.key == 'Enter'){
//         socket.emit('chat data',{user:user,msg:chatData.value});
//         chatData.value = '';
//     }
// };
// socket.on('chat data',function (data) {
//     tipsContainer.innerHTML += "<li><b style='color: red'>"+data.user + "：</b>" + data.msg+"</li>";
// });

