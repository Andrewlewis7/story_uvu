import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt';
import axios from 'axios';
import FormData from 'form-data';
import './Orchestrator.css';  // Import CSS file

const Orchestrator = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const client = mqtt.connect('mqtt://mqtt.uvucs.org', {
      username: '9',
      password: 'dialectsfrickemptily'
    });

    client.on('connect', () => {
      console.log('Connected to broker');
    });

    client.on('error', (err) => {
      console.error('Connection error:', err);
    });

    client.on('close', () => {
      console.log('Connection closed');
    });

    return () => {
      if (client) {
        client.end();
      }
    };
  }, []);

  const sendCommand = (command) => {
    const client = mqtt.connect('mqtt://mqtt.uvucs.org', {
      username: '9',
      password: 'dialectsfrickemptily'
    });
    client.publish('orchestrator/commands', command);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:3000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('File uploaded and extracted successfully');
      console.log('Response:', response.data);
    } catch (error) {
      setMessage('Error uploading file');
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="orchestrator-container">
      <h2>Orchestrator</h2>
      <button onClick={() => sendCommand('PLAY')}>Play</button>
      <button onClick={() => sendCommand('PAUSE')}>Pause</button>
      <button onClick={() => sendCommand('STOP')}>Stop</button>
      <button onClick={() => sendCommand('NEXT_TRACK')}>Next Track</button>
      <button onClick={() => sendCommand('PREV_TRACK')}>Previous Track</button>

      <div>
        <h3>Upload Data</h3>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload</button>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default Orchestrator;
