const CryptoUtil = require('../lib/CryptoUtil')

module.exports = function (RED) {
    RED.nodes.registerType('wechat-push', function (config) {
        RED.nodes.createNode(this, config);
        const node = this
        const { uid } = config
        const server = RED.nodes.getNode(config.server);
        if (server && uid) {
            server.register(this)
            node.on('input', function (msg) {
                let { payload } = msg
                if (typeof payload !== 'string') {
                    payload = JSON.stringify(payload)
                }
                const topic_key = uid.substring(8, 24)
                now = parseInt(Date.now() / 1000)
                const result = JSON.stringify({
                    msg_id: `${topic_key}${now}`,
                    ctime: now,
                    data: {
                        type: 'text',
                        text: payload
                    }
                })
                const key = uid + new Date().toISOString().substring(0, 10)
                server.client.publish(`shaonianzhentan/ha_push/${topic_key}`, CryptoUtil.pyEncrypt(result, key), qos = 0)
                node.status({ fill: "green", shape: "ring", text: `${new Date().toLocaleString()} 消息发送成功` });
            })
        } else {
            this.status({ fill: "red", shape: "ring", text: "未配置相关信息" });
        }
    })
}