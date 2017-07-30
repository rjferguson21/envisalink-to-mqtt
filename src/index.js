"use strict";
exports.__esModule = true;
var nap = require("nodealarmproxy");
var config_1 = require("./config");
var mqtt_1 = require("mqtt");
var client = mqtt_1.connect(config_1.config.mqtt);
client.on('connect', function () {
    console.log('connect');
    client.subscribe('envisalink/#');
    client.publish('envisalink', 'hello envisalink');
    var alarm = nap.initConfig({
        password: config_1.config.password,
        serverpassword: config_1.config.serverpassword,
        actualhost: config_1.config.host,
        actualport: config_1.config.port,
        serverhost: '0.0.0.0',
        serverport: config_1.config.port,
        zone: 7,
        partition: 1,
        proxyenable: true,
        atomicEvents: true,
        logging: false
    });
    alarm.on('zoneupdate', function (data) {
        if (data.code === '609') {
            client.publish("envisalink/" + data.zone, '1');
            console.log("Zone " + data.zone + " is open!");
        }
        else if (data.code === '610') {
            client.publish("envisalink/" + data.zone, '0');
            console.log("Zone " + data.zone + " is closed!");
        }
        else {
            console.log(data.code, data.zone);
        }
    });
});
client.on('message', function (topic, message) {
    // message is Buffer 
    console.log(message.toString());
});
