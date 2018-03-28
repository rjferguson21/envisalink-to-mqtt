import config from './config/config';
import * as nap from 'nodealarmproxy';
import { IZoneUpdate } from './models/zone-update';
import { connect, Client } from 'mqtt';
import { each } from 'lodash';
import { logger } from './logger';
import { client } from './connection';
import { ZoneHandler } from './handler';

const publishOptions = { retain: true };

client.on('connect', () => {
  logger.info('connected to mqtt');
  client.subscribe(`${config.mqttPrefix}/#`);

  const alarm = nap.initConfig({
    password: config.password,
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

  alarm.on('data', (data: any) => {
    logger.debug(data);
    each(data.zone, (value, key) => {
      ZoneHandler.update(key, value.send === 'restore' ? '0' : '1');
    });
  });

  alarm.on('zoneupdate', (data: IZoneUpdate) => {
    logger.debug(data);
    if (data.code === '609') {
      ZoneHandler.update(data.zone, '1');
    } else if (data.code === '610') {
      ZoneHandler.update(data.zone, '0');
    }
  });

  // get initial values
  nap.getCurrent();
});

client.on('error', (err: Error) => {
  logger.warn(err);
});

client.on('reconnect', (err: Error) => {
  logger.info('Trying to reconnect');
});

// The socket seems to close if we don't periodically send a message
setInterval(() => {
  logger.debug('ping');
  nap.manualCommand('000', (err: Error) => {
    if (err) {
      logger.warn('Error pinging NAP proxy', err);
    }
  });
}, 30000);
