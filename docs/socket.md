# v1.0（废弃

## http部分

./login 登陆 post: { 'name':用户名 } return: { 'code':'1' // 成功为1，用户名重复为0，游戏已开始为-1 'id':用户ID // 失败无返回 }


## socket.io部分

### 'message'

game control: { type: 'game control' status: 'begin' // 'end' }

### 'members'

{ members: [members] }

### 'time'

{ gameID: GameID(string), countDown: time(number) }

### 'draw line'

see ex

# v2.0 socket.io

发现单向io没有办法说明清楚，使用表说明

Event|Server|Client|statement
------------ | ------------- | ------------ | -------------
'game status'|emit|on|客户端监听游戏状态
'add user'|on|emit|发送自定义username即可
'user ready'|on|emit|发送socket.id即可
'members'|emit|on|客户端监控所有用户的信息变化(array)
'time'|emit|on|客户端监听各种需要的时间计时
'draw line'|on&emit|emit&on|发送接收画图元信息，服务端进行广播
'message'|on|emit|发送各种事件（考虑取消）
''
