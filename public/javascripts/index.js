'use strict';

var socket = io();
var gameStatus = 0;
var draw = false;
var score;

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
        socket.username = userName.value;
        socket.emit('add user',userName.value);  //  用户名

        loginContainer.style.display = 'none';
        loginButton.style.display = 'none';
        readyButton.style.display = 'block';
    }
};

//  准备
function ready() {
    socket.emit('user ready',socket.id);  //  用户名

    $('user-message').innerHTML += '<b style="color: green;float: right;margin-right: 55px;margin-top: -20px;">√</b>';

    readyButton.disabled = 'disabled';
    readyButton.textContent = "准备好了";
}


//  房间人数
socket.on('user count', function(count) {
    var userNum = $('user-count');
    userNum.textContent = '当前房间总人数： ' + count;
});


//  用户基本信息
socket.on('members',function (data) {
    var userMessage = $('user-message');
    userMessage.innerHTML = '';

    console.log(data);

    $("score").innerHTML = "总积分：";

    for (var i = 0; i < data.length; i++){
        if (data[i].ready === true){
            userMessage.innerHTML += '<li style="margin-top: 5px;"><a style="color: red">用户：</a>'+data[i].name+'<b style="color: green;float: right;margin-right: 55px;">√</b></li>';
        } else {
            userMessage.innerHTML += '<li style="margin-top: 5px;"><a style="color: red">用户：</a>'+data[i].name+'</li>';
        }

        if (socket.id === data[i].id){
            $("score").innerHTML = "总积分：" + data[i].score;
        }
        //
        // if (data[i].restOfTurn === 0 && data[i+1].restOfTurn === 0){
        //     $('word').innerHTML = "";
        //     $('nowWord').innerHTML = "";
        //     $("time").innerHTML = "";
        //     $("start-container").style.display = "block";
        //     $("count-time").innerHTML = "第一回合结束，请重新准备开始";
        // }
    }
});

//  游戏状态
var countTime = $("time");
socket.on('game status',function (data) {
    var word = $('word');
    var nowWord = $('nowWord');

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

        if (!(data.countDown > 0)){

            context.height = container.clientHeight;
            context.width = container.clientWidth;

            setTimeout(function () {
                $("start-container").style.display = "block";
                $("count-time").innerHTML = "下一轮，准备";
            },2000);

        } else {
            $("start-container").style.display = "none";
        }
    } else {
        countTime.textContent = '';
    }
});


//  回答兼聊天
var postChatData = $('postChat');
var chatData = $('chat');
var tipsContainer = $('tips');
postChatData.onclick = function () {
    socket.emit('chat', {
        username: socket.username || 'unknown user',
        word: chatData.value,
    });

    socket.emit('guess word', chatData.value);

    if (socket.username){
        tipsContainer.innerHTML += "<li><b style='color: red'>"+socket.username + "：</b>" + chatData.value+"</li>";
    } else {
        tipsContainer.innerHTML += "<li><b style='color: red'>unknown user：</b>" + chatData.value+"</li>";
    }

    chatData.value = '';
};
chatData.onkeydown = function (e) {
    if (e.key == 'Enter'){
        socket.emit('chat',{
            username: socket.username || 'unknown user',
            word: chatData.value,
        });

        socket.emit('guess word', chatData.value);

        if (socket.username){
            tipsContainer.innerHTML += "<li><b style='color: red'>"+socket.username + "：</b>" + chatData.value+"</li>";
        } else {
            tipsContainer.innerHTML += "<li><b style='color: red'>unknown user：</b>" + chatData.value+"</li>";
        }

        chatData.value = '';
    }
};
socket.on('chat',function (data) {
    tipsContainer.innerHTML += "<li><b style='color: red'>"+data.username + "：</b>" + data.word+"</li>";
});