yargs = require('yargs').string('envisalink-password').argv
mqtt = require 'mqtt'
nap = require './lib/nodealarmproxy.js'
config = require('./conf/config')
plugin_name = 'envisalink'

# if yargs["envisalink-host"]?
#   config.envisalink.host = yargs["envisalink-host"]
# else
#   throw Error("Need to specify envisalink host.")
#
# if yargs["envisalink-password"]?
#   config.envisalink.password = yargs["envisalink-password"]
# else
#   throw Error("Need to specify envisalink password.")
#
# if yargs["mqtt-host"]?
#   config.mqtt.host = yargs["mqtt-host"]
# else
#   throw Error("Need to specify mqtt host.")
#
# if yargs["mqtt-port"]?
#   config.mqtt.port = yargs["mqtt-port"]

client = require('./mqtt').get()

initialize = ->
  # Envisalink MQTT Proxy
  alarm = nap.initConfig
    password: config.envisalink.password
    actualhost: config.envisalink.host
    zone: 8
    partition: 1
    proxyenable: false
    atomicEvents: true

  alarm.removeAllListeners(['data', 'zoneupdate', 'disconnected']);

  alarm.on 'data', (data) ->
    for key, zone of data.zone
      publish_mqtt(key, zone)

  alarm.on 'zoneupdate', (data) ->
    publish_mqtt(data[0], data[1])

  alarm.on 'pong', (data) ->
    client.publish("#{plugin_name}/status/1", 'pong')

publish_mqtt = (id, zone) ->
  if zone.send is 'open'
    message = '1'
  else
    message = '0'

  client.publish("MyMQTT/#{id}/1/1/0/16", message)

initialize()
nap.getCurrent()

# # check to see if connection is still alive
setInterval ->
	 nap.manualCommand '000'
, 10000
