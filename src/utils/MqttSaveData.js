import React, { useEffect } from 'react';
import { connectMqtt, saveData } from '../utils/mqtt';

const MqttSaveData = ({ path, data, username, password }) => {
  useEffect(() => {
    const client = connectMqtt(username, password);

    client.on('connect', () => {
      console.log('Connected to MQTT broker');
      saveData(client, path, data);
    });

    client.on('error', (err) => {
      console.error('Connection error:', err);
    });

    return () => {
      if (client) {
        client.end();
      }
    };
  }, [path, data, username, password]);

  return <div>Saving data to {path}</div>;
};

export default MqttSaveData;
