# ken-ws-sdk

import wssdk from 'ken-ws-sdk'

参数(必传):

1. userId | number | default:0
2. socketURL | string
3. appKey | string

参数(可选):

1. heartbeat_allow | boolean | default:true
2. heartbeat_interval_time | number | default:3000
3. reconnect_allow | boolean | default:true
4. reconnect_limit | number | default:3
5. reconnect_interval_timer | number | default:3000

方法:

1. init({ success, failed }) // 初始化: success, failed均可选
2. reconnect(success) // 重连接: success可选
3. close() // 断开连接
4. receiveCallback(json) // 接收消息的回调
5. send({ type, from, to, content, ...rest }) // 发送消息 type:('backend' | 'user' | 'PING' | 'client') | from: (user_id | 0(backend)) | to: userId | content: content