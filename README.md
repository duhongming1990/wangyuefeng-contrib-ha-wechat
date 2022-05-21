# wangyuefeng-contrib-ha-wechat
使用微信控制Home Assistant里的智能设备


## 使用说明
公共MQTT服务：https://www.emqx.com/zh/mqtt/public-mqtt5-broker
```yaml
MQTT服务：broker-cn.emqx.io
MQTT端口：1883
```

## 更新日志
### 1.1.0
- 修改为微信中每个成员都可以控制家里面的设备

### 1.0.5
- 修复微信推送解码问题
- 增加HomeAssistant配置文件
### 1.0.4
- 新增微信推送节点

### 1.0.3
- 支持进入区域后自动修改状态

### 1.0.2
- 增加GPS持续定位功能

### 1.0.1
- 修复主题订阅失败问题
- camera支持图文消息返回

### 1.0.0
- 支持微信消息桥接

--- 

## HomeAssistant配置

wechat.yaml
```yaml
input_text:
  wechat_push:
    name: 微信推送
    initial: ''

automation:
- id: '1646381319694'
  alias: 微信推送
  description: ''
  trigger:
  - platform: state
    entity_id: input_text.wechat_push
  condition: []
  action:
  - service: mqtt.publish
    data:
      topic: wechat_push
      payload: '{{trigger.to_state.state}}'
  mode: single
```
```yaml
service: input_text.set_value
data:
  entity_id: input_text.wechat_push
  value: >-
    【{{now().strftime('%H:%M:%S')}}】这里是要推送的消息
```