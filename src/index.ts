import * as nap from 'nodealarmproxy';
import { ZoneUpdate } from './zoneupdate';
import config from './config';
import { connect, Client } from 'mqtt';
import * as _ from 'lodash';

const client: Client = connect(config.mqtt);
let publishOptions = { retain: true };

client.on('connect', () => {
  client.subscribe('envisalink/#');
	client.publish('envisalink', 'hello envisalink');
		
	const alarm = nap.initConfig({ 
		password: config.password, //replace config.* with appropriate items
		serverpassword: config.serverpassword,
		actualhost: config.host,
		actualport: config.port,
		serverhost: '0.0.0.0',
		serverport: config.port,
		zone: 7,
		partition: 1,
		proxyenable: true,
		atomicEvents: true,
		logging: false
	});

	alarm.on('data', (data) => {
		_.each(data.zone, (value, key) => {
			let payload = value.send === 'restore' ? '0' : '1';
			client.publish(`envisalink/${key}`, payload, publishOptions);
		});
	});

	alarm.on('zoneupdate', (data: ZoneUpdate) => {
		if (data.code === '609') {
			client.publish(`envisalink/${data.zone}`, '1', publishOptions);
			console.log(`Zone ${data.zone} is open!`);
		}
		else if (data.code === '610') {
			client.publish(`envisalink/${data.zone}`, '0');
			console.log(`Zone ${data.zone} is closed!`);
		}
		else {
			console.log(data.code, data.zone);
		}
	});
});


client.on('message', function (topic, message) {
  // message is Buffer 
  console.log(topic, message.toString());
})

nap.getCurrent();
