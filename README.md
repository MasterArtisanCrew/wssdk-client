# ken-ws-sdk

```
import KenWSCore from 'ken-ws-sdk'

const wssdk = new KenWSCore({
  user_id: 1,
  socket_url: 'ws://xxx',
  app_key: 'xxx',
  reconnect_allow: false
})

wssdk.init({
  success: () => {},
  failed: () => {}
})
```

### 参数:

| 参数 | 数据类型 | 默认值 | 是否必传 | 描述 |
| -- | -- | -- | -- | -- |
| user_id | number/string | 0 | ✅ | 用户id |
| socket_url | string | -- | ✅ | websocket连接地址 |
| app_key | string | -- | ✅ | 应用唯一标识 |
| heartbeat_allow | boolean | true | × | 是否允许发送心跳 |
| heartbeat_interval_time | number | 3000 | × | 发送心跳时间间隔(毫秒) |
| reconnect_allow | boolean | true | × | 是否允许重连 |
| reconnect_limit | number | 3 | × | 重连次数限制 |
| reconnect_interval_timer | number | 3000 | × | 重连时间间隔(毫秒) |

### 方法:

| 函数名称 | 参数 | 描述 |
| -- | -- | -- |
| init | { success: () => {}, failed: () => {} } | 初始化 |
| close | -- | 关闭连接 |
| receiveCallback | json | 数据接收处理函数 |
| send | { type: enum('backend','user','PING','client'), from: number, to: number, content: string, ...rest } | 消息发送 |
