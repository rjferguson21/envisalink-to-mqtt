import { config as dotEnvConfig } from 'dotenv';
dotEnvConfig();

import { logger } from '../logger';

let config = {
  password: process.env.envisalink_password,
  serverpassword: process.env.envisalink_serverpassword,
  host: process.env.envisalink_host,
  port: process.env.envisalink_port,
  mqtt: process.env.envisalink_mqtt,
  mqttPrefix: 'envisalink'
};

logger.debug(config);

export default config;
