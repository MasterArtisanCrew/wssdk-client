class KenWSCore {
  constructor({ user_id = 0, socket_url, app_key, ...config }) {

    // 用户id
    this.id = +user_id;

    // WebSocket连接地址
    this.socket_url = socket_url;

    // 应用key
    this.app_key = app_key;

    // socket连接对象实例
    this.ws = null;

    // 当前socket连接状态
    this.open = false;

    this.heartbeat_allow = typeof config.heartbeat_allow === 'boolean' ? config.heartbeat_allow : true;
    this.heartbeat_interval = null;
    this.heartbeat_interval_time = config.heartbeat_interval_time || 3000;

    // 是否允许重连
    this.reconnect_allow = typeof config.reconnect_allow === 'boolean' ? config.reconnect_allow : true;
    // 重连最大数
    this.reconnect_limit = config.reconnect_limit || 3;
    // 当前重连第几次
    this.reconnect_current = 0;
    this.reconnect_interval = null;
    this.reconnect_interval_timer = config.reconnect_interval_timer || 3000;
  }

  /**
   * 初始化
   */
  init({ ...rest }) {
    if (this.ws) {
      if (rest.success && typeof rest.success === 'function') rest.success();
      return this.ws;
    }

    this.ws = new WebSocket(this.socket_url);

    this.ws.onopen = () => {
      console.log('ws.onopen:%csuccessful', 'color: green');
      this.open = true;
      this.reconnect_allow = true;

      if (rest.success && typeof rest.success === 'function') rest.success();

      if (this.heartbeat_allow) this.heartbeat();
    };

    this.ws.onclose = e => {
      console.log('ws.onclose:%cabout to close', 'color: blue', e);
      this.open = false;

      // 重新连接
      if (this.reconnect_allow) {
        this.reconnect_interval = setInterval(() => {
          // 超过重连次数
          if (this.reconnect_current > this.reconnect_limit) {
            clearInterval(this.reconnect_interval);
            this.reconnect_allow = false;
            return;
          }

          // 记录重连次数
          this.reconnect_current++;
          this.reconnect();
        }, this.reconnect_interval_timer);
      }
    };

    this.ws.onmessage = e => {
      this.receive(e);
    };

    this.ws.onerror = () => {
      console.log('ws.onerror:%cws:error...', 'color: red');
      if (rest.failed && typeof rest.failed === 'function') rest.failed();

      if (this.heartbeat_interval) clearInterval(this.heartbeat_interval);
    };
  }

  /**
   * 重连接
   */
  reconnect(success) {
    console.log(`websocket reconnect to userId:${this.id}`);
    if (this.ws && this.open) {
      this.ws.close();
    }

    this.init({ success });
  }

  /**
   * 断开连接
   */
  close() {
    console.log('websocket closed...');
    if (this.reconnect_interval) clearInterval(this.reconnect_interval);
    if (this.heartbeat_interval) clearInterval(this.heartbeat_interval);
    this.reconnect_allow = false;
    if (this.ws) this.ws.close();
  }

  /**
   * 接收消息
   */
  receive(e) {
    try {
      const json = JSON.parse(e.data);

      if (this.receiveCallback && typeof this.receiveCallback === 'function') {
        this.receiveCallback(json);
      }
    } catch (error) {
      throw new Error('cannot JSON.parse!');
    }
  }

  /**
   * 接收消息的回调
   */
  receiveCallback(json) {}

  /**
   * 发送消息
   * type: 'backend' | 'user' | 'PING' | 'client'
   * from: user_id | 0(backend)
   * to: user_id
   * content: content
   */
  send({ type, from, to, content, ...rest }) {
    if (this.ws.readyState === this.ws.OPEN) {
      this.ws.send(
        JSON.stringify({
          type,
          from,
          to,
          content,
          app_key: this.app_key,
          ...rest,
        })
      );
      if (rest.success && typeof rest.success === 'function') rest.success();
    } else {
      console.log('websocket unready...');
      this.reconnect(() => {
        this.send({ type, from, to, content, ...rest });
      });
    }
  }

  /**
   * 心跳检测
   */
  heartbeat() {
    if (!this.heartbeat_interval) {
      this.heartbeat_interval = setInterval(() => {
        this.send({
          type: 'PING',
          from: this.id,
          to: 0,
          content: 'PING',
        });
      }, this.reconnect_interval_timer);
    }
  }
}

export default KenWSCore;
