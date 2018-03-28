import config from './config/config';
import { client } from './connection';
import { IClientPublishOptions } from 'mqtt';
import { logger } from './logger';

export class ZoneHandler {
  public static update(zoneId: string, payload: string, options: IClientPublishOptions = { qos: 1, retain: true }) {
    logger.info(`Publishing update to zone ${zoneId} with ${payload}`);
    client.publish(`${config.mqttPrefix}/${zoneId}`, payload, options);
  }
}
