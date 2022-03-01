const CryptoUtil = require('../lib/CryptoUtil')
const HomeAssistant = require('../lib/HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-gps', function (config) {
        RED.nodes.createNode(this, config);
        const node = this
        const { hassUrl, hassToken, hassUser, topic, uid } = config
        const server = RED.nodes.getNode(config.server);
        if (server && topic && uid) {
            server.register(this)
            // 初始HA连接
            let ha = null
            if (hassUrl && hassToken && hassUser){
                ha = new HomeAssistant({ hassUrl, hassToken })
            }            
            // 监听GPS上报信息
            server.subscribe(topic, { qos: 0 }, async function (mtopic, mpayload, mpacket) {
                const payload = mpayload.toString()
                // console.log(payload)
                try {
                    const message = JSON.parse(CryptoUtil.DecryptGPSText(payload, uid))
                    node.send({ payload: message })
                    node.status({ fill: "green", shape: "ring", text: `经度：${message.lng}  纬度：${message.lng}` });
                    if(ha){
                        try{
                            const updateUserApi = `states/${hassUser}`
                            let { state, attributes } = await ha.getApi(updateUserApi)
                            await ha.postApi(updateUserApi, { state, attributes })
                            node.status({ fill: "green", shape: "ring", text: `${attributes.friendly_name}位置更新成功，当前状态：${state}` });
                        }catch(ex){
                            node.status({ fill: "red", shape: "ring", text: JSON.stringify(ex) });
                        }
                    }
                } catch (ex) {
                    console.log(ex)
                }
            })
        } else {
            this.status({ fill: "red", shape: "ring", text: "未配置相关信息" });
        }
    })
}