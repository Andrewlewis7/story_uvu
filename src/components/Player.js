import React, { useEffect, useState } from 'react';
import { createMachine, createActor, assign } from 'xstate';
import mqtt from 'mqtt';
import './Player.css';

// Define the state machine for the player
const playerMachine = createMachine({
  id: 'player',
  initial: 'stopped',
  context: {
    currentTrack: 1,
    totalTracks: 10
  },
  states: {
    stopped: {
      on: {
        PLAY: 'playing'
      }
    },
    playing: {
      on: {
        PAUSE: 'paused',
        STOP: 'stopped',
        NEXT_TRACK: {
          actions: assign({
            currentTrack: (context) => context.currentTrack === context.totalTracks ? 1 : context.currentTrack + 1
          })
        },
        PREV_TRACK: {
          actions: assign({
            currentTrack: (context) => context.currentTrack === 1 ? context.totalTracks : context.currentTrack - 1
          })
        }
      }
    },
    paused: {
      on: {
        PLAY: 'playing',
        STOP: 'stopped'
      }
    }
  }
});

const Player = () => {
  const [state, setState] = useState(playerMachine.initialState);
  const [context, setContext] = useState(playerMachine.context);
  const [client, setClient] = useState(null);

  useEffect(() => {
    const actor = createActor(playerMachine).start();

    actor.subscribe((state) => {
      console.log('Transition to state:', state.value);
      console.log('State context:', state.context);
      setState(state);
      setContext(state.context);
    });

    const mqttClient = mqtt.connect('ws://mqtt.uvucs.org:9001', {
      username: '9',
      password: 'dialectsfrickemptily'
    });

    mqttClient.on('connect', () => {
      console.log('Connected to broker');
      mqttClient.subscribe('orchestrator/commands', (err) => {
        if (err) {
          console.error('Subscription error:', err);
        }
      });
    });

    mqttClient.on('message', (topic, message) => {
      const command = message.toString();
      console.log('Received command:', command);
      actor.send({ type: command });
    });

    mqttClient.on('error', (err) => {
      console.error('Connection error:', err);
    });

    mqttClient.on('close', () => {
      console.log('Connection closed');
    });

    setClient(mqttClient);

    return () => {
      actor.stop();
      if (mqttClient) {
        mqttClient.end();
      }
    };
  }, []);

  if (!state || !context) {
    return (
      <div className="player-container">
        <h2>Player</h2>
        <p>Loading...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (state.value) {
      case 'stopped':
        return <p>The player is stopped. Click play to start the track.</p>;
      case 'playing':
        return (
          <div>
            <p>Playing track {context.currentTrack} of {context.totalTracks}.</p>
            {/* Example content elements */}
            <audio controls autoPlay>
              <source src={`path/to/audio/track${context.currentTrack}.mp3`} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
          </div>
        );
      case 'paused':
        return <p>The player is paused. Click play to resume.</p>;
      default:
        return null;
    }
  };

  return (
    <div className="player-container">
      <h2>Player</h2>
      <p>Status: {state.value || 'unknown'}</p>
      <p>Current Track: {context.currentTrack !== undefined ? context.currentTrack : 'unknown'}</p>
      <div>
        {renderContent()}
      </div>
      <div>
        {/* Add control buttons for testing */}
        <button onClick={() => client.publish('orchestrator/commands', 'PLAY')}>Play</button>
        <button onClick={() => client.publish('orchestrator/commands', 'PAUSE')}>Pause</button>
        <button onClick={() => client.publish('orchestrator/commands', 'STOP')}>Stop</button>
        <button onClick={() => client.publish('orchestrator/commands', 'NEXT_TRACK')}>Next Track</button>
        <button onClick={() => client.publish('orchestrator/commands', 'PREV_TRACK')}>Previous Track</button>
      </div>
    </div>
  );
};

export default Player;
