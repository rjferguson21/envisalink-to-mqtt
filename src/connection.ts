import { Client, connect } from 'mqtt';
import config from './config/config';

export const client: Client = connect(config.mqtt);
