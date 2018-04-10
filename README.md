## What is this for?
This project is to publish MQTT events for an envisalink module via their TPI interface. 

## Requirements 
* Accessible MQTT broker (https://mosquitto.org/)
* Envisalink TPI exposed. (http://www.eyezon.com/AccessingEnvisalinkApplicationNoteEZ.pdf)

## Setup
* Uses https://github.com/motdotla/dotenv for local configuration.
* Create `.env` file containing at the root of the project, or ensure these environment variable are set

```
envisalink_password=password
envisalink_serverpassword=password
envisalink_host=host
envisalink_port=port
envisalink_mqtt=mqtt
log_level=info
```

Run npm install

`npm install`

### Run locally

Run in dev

`npm run dev`

### Run in docker
```
docker build -t envisalink-to-mqtt .
docker run --env-file=.env envisalink-to-mqtt 
```


