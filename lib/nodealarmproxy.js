var net = require('net');
var elink = require('./envisalink.js');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var EverSocket = require('eversocket').EverSocket;
var alarmdata = {
	zone:{},
	partition:{},
	user:{}
};

var actual, config;

exports.initConfig = function(initconfig) {

	alarmdata = {
		zone:{},
		partition:{},
		user:{}
	};

	actual = undefined

	config = initconfig;
	if (!config.actualport) {
		config.actualport = 4025;
	}
	if (!config.proxyenable) {
		config.proxyenable = false;
	}

	actual = new EverSocket({
		type: 'tcp4',
		reconnectWait: 7000,      // wait 100ms after close event before reconnecting
		timeout: 6000,            // set the idle timeout to 100ms
		reconnectOnTimeout: false // reconnect if the connection is idle
	});

	actual.on('reconnect', function() {
		console.log('the socket reconnected following a close or timeout event');
	});

	actual.connect(config.actualport, config.actualhost, function() {
		console.log('actual connected');
	});

	actual.on('end' , function() {
		console.log('actual end', arguments);
	});

	actual.on('error' , function(error) {
		console.log('actual error', error);
	});

	actual.on('close', function() {
		console.log('actual close', arguments);
	});

	function loginresponse(data) {
		var loginStatus = data.substring(3, 4);
		if (loginStatus == '0') {
			console.log('Incorrect Password :(');
		} else if (loginStatus == '1') {
			console.log('successfully logged in!  getting current data...');
			sendcommand(actual,'001');
		} else if (loginStatus == '2') {
			console.log('Request for Password Timed Out :(');
		} else if (loginStatus == '3') {
			console.log('login requested... sending response...');
			sendcommand(actual,'005'+config.password);
		}
	}

	function updatezone(tpi,data) {
		var zone = parseInt(data.substring(3,6));
		var initialUpdate = alarmdata.zone[zone] === undefined;
		if (zone <= config.zone) {
			alarmdata.zone[zone] = {'send':tpi.send,'name':tpi.name,'code':data};
			if (config.atomicEvents && !initialUpdate) {
				eventEmitter.emit('zoneupdate', [zone, alarmdata.zone[zone]]);
				// eventEmitter.emit('zoneupdate',{zone:parseInt(data.substring(3,6)),code:data.substring(0,3)});
			} else {
				eventEmitter.emit('data',alarmdata);
			}
		}
	}
	function updatepartition(tpi,data) {
		var partition = parseInt(data.substring(3,4));
		var initialUpdate = alarmdata.partition[partition] === undefined;
		if (partition <= config.partition) {
			alarmdata.partition[partition] = {'send':tpi.send,'name':tpi.name,'code':data};
			if (config.atomicEvents && !initialUpdate) {
				//eventEmitter.emit('partitionupdate', [partition, alarmdata.partition[partition]]);
				if (data.substring(0,3) == "652") {
						eventEmitter.emit('partitionupdate',{partition:parseInt(data.substring(3,4)),code:data.substring(0,3),mode:data.substring(4,5)});
				} else {
					eventEmitter.emit('partitionupdate',{partition:parseInt(data.substring(3,4)),code:data.substring(0,3)});
				}
			} else {
				eventEmitter.emit('data',alarmdata);
			}
		}
	}
	function updatepartitionuser(tpi,data) {
		var partition = parseInt(data.substring(3,4));
		var user = parseInt(data.substring(4,8));
		var initialUpdate = alarmdata.user[user] === undefined;
		if (partition <= config.partition) {
			alarmdata.user[user] = {'send':tpi.send,'name':tpi.name,'code':data};
			if (config.atomicEvents && !initialUpdate) {
				eventEmitter.emit('partitionuserupdate', [user, alarmdata.user[user]]);
			} else {
				eventEmitter.emit('data',alarmdata);
			}
		}
	}
	function updatesystem(tpi,data) {
		var partition = parseInt(data.substring(3,4));
		var initialUpdate = alarmdata.system === undefined;
		if (partition <= config.partition) {
			alarmdata.system = {'send':tpi.send,'name':tpi.name,'code':data};
			if (config.atomicEvents && !initialUpdate) {
				eventEmitter.emit('systemupdate', alarmdata.system);
			} else {
				eventEmitter.emit('data',alarmdata);
			}
		}
	}

	actual.on('data', function(data) {
		var dataslice = data.toString().replace(/[\n\r]/g, ',').split(',');

		for (var i = 0; i<dataslice.length; i++) {
			var datapacket = dataslice[i];
			if (datapacket !== '') {
				var tpi = elink.tpicommands[datapacket.substring(0,3)];
				if (tpi) {
					if (tpi.bytes === '' || tpi.bytes === 0) {
						// console.log(tpi.pre,tpi.post);
					} else {
						// console.log(tpi.pre,datapacket.substring(3,datapacket.length-2),tpi.post);
						if (tpi.action === 'updatezone') {
							updatezone(tpi,datapacket);
						}
						else if (tpi.action === 'updatepartition') {
							updatepartition(tpi,datapacket);
						}
						else if (tpi.action === 'updatepartitionuser') {
							updatepartitionuser(tpi,datapacket);
						}
						else if (tpi.action === 'updatesystem') {
							updatepartitionuser(tpi,datapacket);
						}
						else if (tpi.action === 'loginresponse') {
							loginresponse(datapacket);
						}
						else if (tpi.name === 'Command Acknowledge'){
							eventEmitter.emit('pong', tpi);
						}
						else {
							// console.log(tpi);
						}
					}
					if (config.proxyenable) {
						broadcastresponse(datapacket.substring(0,datapacket.length-2));
					}
				}
			}
		}
		//actual.end();
	});
	return eventEmitter;
};

function sendcommand(addressee,command) {
	var checksum = 0;
	for (var i = 0; i<command.length; i++) {
		checksum += command.charCodeAt(i);
	}
	checksum = checksum.toString(16).slice(-2);
	addressee.write(command+checksum+'\r\n');
}

exports.manualCommand = function(command) {
	if (actual) {
		sendcommand(actual, command);
	} else {
		console.log('not initialized');
	}
};

exports.getCurrent = function() {
	eventEmitter.emit('data',alarmdata);
};
