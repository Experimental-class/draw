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
'game status'*|emit|on|客户端监听游戏状态
'add user'|on|emit|发送自定义username即可
'user ready'|on|emit|发送socket.id即可
'members'|emit|on|客户端监控所有用户的信息变化(array)
'time'|emit|on|客户端监听各种需要的时间计时
'chat'|broadcast|emit&on|发送接收聊天信息，服务端仅广播
'guess word'|on|emit|用户猜词尝试
'draw line'|broadcast|emit&on|发送接收画图元信息，服务端仅广播
'clean line'*|broadcast|emit&on|发送清除画布内容信息，服务端仅广播



注 'game status' msg详解
```
{
  'status' : 0   // 游戏已停止
}
```

```
{
  'status' : 1,       // 游戏进行中
  'nextDrawer' : <str>,  // <object member> .id .name
  'word' : <str>,     // 猜词
  'tip' : <str>       // 提示
}
```


注'clean line' 用法

可以为`drawer`添加一个清屏按钮（或其他方法
