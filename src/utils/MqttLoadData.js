import React, { useEffect, useState } from 'react';
import { connectMqtt, loadData } from '../utils/mqtt';

const MqttLoadData = ({ path, username, password }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const client = connectMqtt(username, password);

    client.on('connect', () => {
      console.log('Connected to MQTT broker');
      loadData(client, path, setData);
    });

    client.on('error', (err) => {
      console.error('Connection error:', err);
    });

    return () => {
      if (client) {
        client.end();
      }
    };
  }, [path, username, password]);

  return (
    <div>
      <h2>Loaded Data from {path}</h2>
      <pre>{data ? JSON.stringify(data, null, 2) : 'Loading...'}</pre>
    </div>
  );
};

export default MqttLoadData;
