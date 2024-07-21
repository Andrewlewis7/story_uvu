import mqtt from 'mqtt';

export const connectMqtt = (username, password) => {
  const options = { username, password };
  return mqtt.connect('mqtt://mqtt.uvucs.org', options);
};

export const saveData = (client, path, data) => {
  client.publish(`save/${path}`, JSON.stringify(data));
};

export const loadData = (client, path, callback) => {
  client.subscribe(`data/${path}`);
  client.publish(`load/${path}`, '');

  client.on('message', (topic, message) => {
    if (topic === `data/${path}`) {
      callback(JSON.parse(message.toString()));
    }
  });
};
