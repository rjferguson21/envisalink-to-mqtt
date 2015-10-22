config = require("./conf/config.coffee")
mqtt = require 'mqtt'

client = null

# MQTT
conn =
  init: ->
    client = mqtt.createClient config.mqtt.port, config.mqtt.host
    return client
  get: ->
    return client if client?
    return conn.init()

module.exports = conn
