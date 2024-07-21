import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Player from './components/Player';
import Orchestrator from './components/Orchestrator';
import './App.css';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/player" element={<Player />} />
          <Route path="/orchestrator" element={<Orchestrator />} />
          <Route path="/" element={
            <div>
              <h2>Welcome to the MQTT XState Player-Orchestrator App</h2>
              <p>Select either the Player or Orchestrator page.</p>
              <nav>
                <ul>
                  <li><Link to="/player">Player</Link></li>
                  <li><Link to="/orchestrator">Orchestrator</Link></li>
                </ul>
              </nav>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
