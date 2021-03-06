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
            if (hassUrl && hassToken && hassUser) {
                ha = new HomeAssistant({ hassUrl, hassToken })
            }
            // 监听GPS上报信息
            server.subscribe(topic, { qos: 0 }, async function (mtopic, mpayload, mpacket) {
                const payload = mpayload.toString()
                // console.log(payload)
                try {
                    const message = JSON.parse(CryptoUtil.DecryptGPSText(payload, uid))
                    node.status({ fill: "green", shape: "ring", text: `经纬度：${message.Lat}，${message.Lnt}` });
                    if (ha) {
                        try {
                            const updateUserApi = `states/${hassUser}`
                            let { state, attributes } = await ha.getApi(updateUserApi)
                            // 默认使用小写
                            let latField = 'Latitude' in attributes ? 'Latitude' : 'latitude'
                            let lntField = 'Longitude' in attributes ? 'Longitude' : 'longitude'
                             // 相同则不更新
                             if (attributes[latField] != message.Lat || attributes[lntField] != message.Lnt) {
                                attributes[latField] = message.Lat
                                attributes[lntField] = message.Lnt
                                // 更新状态
                                let stateResult = await ha.postApi('template', { template: `{% set person = '${hassUser}' %}
                                {% set lately = closest(person, states.zone) %}
                                {%- if lately is not none and distance(person, lately.entity_id) * 1000 < state_attr(lately.entity_id, 'radius') -%}
                                    {%- if lately.entity_id == 'zone.home' -%}
                                        home
                                    {%- else -%}
                                        {{ lately.name }}
                                    {%- endif -%}
                                {%- else -%}
                                    not_home
                                {%- endif -%}` })
                                if(stateResult.trim()){
                                    state = stateResult.trim()
                                }
                                await ha.postApi(updateUserApi, { state, attributes })
                            }
                            // 读取历史记录
                            const today = new Date()
                            const endTime = today.toISOString()
                            today.setHours(today.getHours() - 1)
                            const startTime = today.toISOString()
                            let history = await ha.getApi(`history/period/${startTime}?end_time=${endTime}&filter_entity_id=${hassUser}`)
                            if (history.length > 0) {
                                history = history[0].map(ele => {
                                    return {
                                        friendly_name: ele.attributes.friendly_name,
                                        state: ele.state,
                                        latitude: ele.attributes[latField],
                                        longitude: ele.attributes[lntField]
                                    }
                                })
                            }
                            node.send({
                                payload: message,
                                history: {
                                    start: startTime,
                                    end: endTime,
                                    list: history
                                }
                            })
                            return
                        } catch (ex) {
                            node.status({ fill: "red", shape: "ring", text: JSON.stringify(ex) });
                        }
                    }
                    node.send({ payload: message })
                } catch (ex) {
                    // console.log(ex)
                }
            })
        } else {
            this.status({ fill: "red", shape: "ring", text: "未配置相关信息" });
        }
    })
}