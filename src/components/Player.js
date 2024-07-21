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

  useEffect(() => {
    const actor = createActor(playerMachine).start();

    actor.subscribe((state) => {
      console.log('Transition to state:', state.value);
      console.log('State context:', state.context);
      setState(state);
      setContext(state.context);
    });

    const client = mqtt.connect('ws://mqtt.uvucs.org', {
      username: '9',
      password: 'dialectsfrickemptily'
    });

    client.on('connect', () => {
      console.log('Connected to broker');
      client.subscribe('orchestrator/commands', (err) => {
        if (err) {
          console.error('Subscription error:', err);
        }
      });
    });

    client.on('message', (topic, message) => {
      const command = message.toString();
      console.log('Received command:', command);
      actor.send({ type: command });
    });

    client.on('error', (err) => {
      console.error('Connection error:', err);
    });

    client.on('close', () => {
      console.log('Connection closed');
    });

    return () => {
      actor.stop();
      if (client) {
        client.end();
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

  return (
    <div className="player-container">
      <h2>Player</h2>
      <p>Status: {state.value || 'unknown'}</p>
      <p>Current Track: {context.currentTrack !== undefined ? context.currentTrack : 'unknown'}</p>
    </div>
  );
};

export default Player;
