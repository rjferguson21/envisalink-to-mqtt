import * as dotenv from 'dotenv';
dotenv.config();

let config = {
  password: process.env.envisalink_password,
  serverpassword: process.env.envisalink_serverpassword,
  host: process.env.envisalink_host,
  port: process.env.envisalink_port,
  mqtt: process.env.envisalink_mqtt
};

console.log(config);

export default config;
