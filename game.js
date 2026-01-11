// ==========================================
// FIREBASE CONFIGURATION
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyDAI46UYQMVMCnNqQD9MqR3yhiHUzghYuA",
  authDomain: "timebomb-game.firebaseapp.com",
  databaseURL: "https://timebomb-game-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "timebomb-game",
  storageBucket: "timebomb-game.firebasestorage.app",
  messagingSenderId: "752842528482",
  appId: "1:752842528482:web:f97dd6bead7bb6bca4f0bb"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
window.database = firebase.database();

// ==========================================
// GAME CONFIGURATION
// ==========================================
window.GAME_CONFIG = {
  4: { sherlock: 3, moriarty: 2, wires: 15, defusing: 4, bomb: 1 },
  5: { sherlock: 3, moriarty: 2, wires: 19, defusing: 5, bomb: 1 },
  6: { sherlock: 4, moriarty: 2, wires: 23, defusing: 6, bomb: 1 },
  7: { sherlock: 5, moriarty: 3, wires: 27, defusing: 7, bomb: 1 },
  8: { sherlock: 5, moriarty: 3, wires: 31, defusing: 8, bomb: 1 }
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
window.generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// ==========================================
// MAIN APP COMPONENT
// ==========================================
const { useState, useEffect } = React;

function TimeBombGame() {
  const [screen, setScreen] = useState('home');
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [playerId, setPlayerId] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [gameState, setGameState] = useState(null);
  const [myRole, setMyRole] = useState(null);
  const [selectedWire, setSelectedWire] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [gameLog, setGameLog] = useState([]);
  const [showLog, setShowLog] = useState(false);

  // Listen to Firebase room updates
  useEffect(() => {
    if (!roomCode) return;

    const roomRef = window.database.ref(`rooms/${roomCode}`);
    
    const handleUpdate = (snapshot) => {
      const state = snapshot.val();
      if (state) {
        setGameState(state);
        
        if (state.log) {
          setGameLog(state.log);
        }
        
        if (state.status === 'lobby' && screen !== 'lobby') {
          setScreen('lobby');
        } else if (state.status === 'playing' && screen !== 'game') {
          setScreen('game');
          if (!myRole && playerId !== null) {
            const player = state.players.find(p => p.id === playerId);
            if (player) setMyRole(player.role);
          }
        } else if (state.status === 'ended' && screen !== 'end') {
          setScreen('end');
        }
      }
    };

    roomRef.on('value', handleUpdate);
    return () => roomRef.off('value', handleUpdate);
  }, [roomCode, playerId, myRole, screen]);

  // Action handlers
  const createRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');
    
    const code = window.generateRoomCode();
    const newPlayerId = 0;
    
    const initialState = {
      code,
      status: 'lobby',
      hostId: newPlayerId,
      playerCount: 5,
      players: [{
        id: newPlayerId,
        name: playerName.trim(),
        ready: false
      }],
      createdAt: Date.now()
    };

    try {
      await window.database.ref(`rooms/${code}`).set(initialState);
      setRoomCode(code);
      setPlayerId(newPlayerId);
      setGameState(initialState);
      setScreen('lobby');
    } catch (err) {
      console.error('Create room error:', err);
      setError('Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!inputCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    setLoading(true);
    setError('');
    
    const code = inputCode.trim().toUpperCase();

    try {
      const snapshot = await window.database.ref(`rooms/${code}`).once('value');
      
      if (!snapshot.exists()) {
        setError('Room not found');
        setLoading(false);
        return;
      }

      const state = snapshot.val();
      
      if (state.status !== 'lobby') {
        setError('Game already started');
        setLoading(false);
        return;
      }

      if (state.players.length >= state.playerCount) {
        setError('Room is full');
        setLoading(false);
        return;
      }

      const newPlayerId = Math.max(...state.players.map(p => p.id)) + 1;
      
      state.players.push({
        id: newPlayerId,
        name: playerName.trim(),
        ready: false
      });

      await window.database.ref(`rooms/${code}`).set(state);
      
      setRoomCode(code);
      setPlayerId(newPlayerId);
      setGameState(state);
      setScreen('lobby');
    } catch (err) {
      console.error('Join room error:', err);
      setError('Failed to join room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updatePlayerCount = async (count) => {
    if (playerId !== gameState.hostId) return;
    try {
      await window.database.ref(`rooms/${roomCode}/playerCount`).set(count);
    } catch (err) {
      console.error('Failed to update player count');
    }
  };

  const toggleReady = async () => {
    const playerIndex = gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;
    try {
      await window.database.ref(`rooms/${roomCode}/players/${playerIndex}/ready`).set(!gameState.players[playerIndex].ready);
    } catch (err) {
      console.error('Failed to toggle ready');
    }
  };

  const startGame = async () => {
    if (playerId !== gameState.hostId) return;
    if (gameState.players.length < 4) {
      setError('Need at least 4 players to start');
      return;
    }
    if (gameState.players.length !== gameState.playerCount) {
      setError(`Waiting for ${gameState.playerCount} players`);
      return;
    }

    const config = window.GAME_CONFIG[gameState.playerCount];
    
    const roles = [
      ...Array(config.sherlock).fill('sherlock'),
      ...Array(config.moriarty).fill('moriarty')
    ].sort(() => Math.random() - 0.5);

    const wireDeck = [
      ...Array(config.defusing).fill('defusing'),
      ...Array(config.bomb).fill('bomb'),
      ...Array(config.wires - config.defusing - config.bomb).fill('safe')
    ].sort(() => Math.random() - 0.5);

    const playersWithRoles = gameState.players.map((player, idx) => ({
      ...player,
      role: roles[idx],
      wires: wireDeck.slice(idx * 5, (idx + 1) * 5).map((type, wireIdx) => ({
        id: `${player.id}-0-${wireIdx}`,
        type,
        revealed: false
      }))
    }));

    const newState = {
      ...gameState,
      status: 'playing',
      players: playersWithRoles,
      currentPlayer: 0,
      round: 1,
      revealedInRound: 0,
      defusingFound: 0,
      config,
      log: [{ message: '🎮 Game started!', timestamp: Date.now() }]
    };

    try {
      await window.database.ref(`rooms/${roomCode}`).set(newState);
      const me = playersWithRoles.find(p => p.id === playerId);
      if (me) setMyRole(me.role);
      setScreen('game');
    } catch (err) {
      console.error('Start game error:', err);
      setError('Failed to start game');
    }
  };

  const cutWire = async (targetPlayerId, wireId) => {
    if (gameState.players[gameState.currentPlayer].id !== playerId) return;
    if (targetPlayerId === playerId) return;

    const newState = JSON.parse(JSON.stringify(gameState));
    const targetPlayer = newState.players.find(p => p.id === targetPlayerId);
    const currentPlayer = newState.players.find(p => p.id === playerId);
    const wire = targetPlayer.wires.find(w => w.id === wireId);
    
    if (wire.revealed) return;
    
    wire.revealed = true;
    
    const log = newState.log || [];
    let logMessage = `${currentPlayer.name} cut ${targetPlayer.name}'s wire: `;
    
    if (wire.type === 'bomb') {
      logMessage += '💣 BOMB!';
      newState.status = 'ended';
      newState.winner = 'moriarty';
      log.push({ message: logMessage, timestamp: Date.now() });
      log.push({ message: '💥 Big Ben destroyed! Moriarty wins!', timestamp: Date.now() });
    } else if (wire.type === 'defusing') {
      newState.defusingFound += 1;
      logMessage += `✂️ Defusing (${newState.defusingFound}/${newState.config.defusing})`;
      log.push({ message: logMessage, timestamp: Date.now() });
      
      if (newState.defusingFound === newState.config.defusing) {
        newState.status = 'ended';
        newState.winner = 'sherlock';
        log.push({ message: '🎉 All defusing wires found! Sherlock wins!', timestamp: Date.now() });
      }
    } else {
      logMessage += '✓ Safe wire';
      log.push({ message: logMessage, timestamp: Date.now() });
    }
    
    newState.log = log;
    
    if (newState.status !== 'ended') {
      newState.revealedInRound += 1;
      
      if (newState.revealedInRound === newState.playerCount) {
        if (newState.round === 4) {
          newState.status = 'ended';
          newState.winner = 'moriarty';
          log.push({ message: '⏰ 4 rounds completed. Moriarty wins!', timestamp: Date.now() });
        } else {
          const unrevealedWires = newState.players.flatMap(p => 
            p.wires.filter(w => !w.revealed).map(w => w.type)
          ).sort(() => Math.random() - 0.5);
          
          const wiresPerPlayer = Math.floor(unrevealedWires.length / newState.playerCount);
          
          newState.players = newState.players.map((player, idx) => ({
            ...player,
            wires: unrevealedWires.slice(idx * wiresPerPlayer, (idx + 1) * wiresPerPlayer)
              .map((type, wireIdx) => ({
                id: `${player.id}-${newState.round}-${wireIdx}`,
                type,
                revealed: false
              }))
          }));
          
          newState.round += 1;
          newState.revealedInRound = 0;
          log.push({ message: `🔄 Round ${newState.round} started!`, timestamp: Date.now() });
        }
      } else {
        const currentPlayerIndex = newState.players.findIndex(p => p.id === targetPlayerId);
        newState.currentPlayer = currentPlayerIndex;
      }
    }

    try {
      await window.database.ref(`rooms/${roomCode}`).set(newState);
      setSelectedWire(null);
    } catch (err) {
      console.error('Cut wire error:', err);
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const leaveRoom = () => {
    setScreen('home');
    setRoomCode('');
    setPlayerId(null);
    setGameState(null);
    setMyRole(null);
    setInputCode('');
    setError('');
    setGameLog([]);
  };

  const playAgain = async () => {
    if (playerId !== gameState.hostId) return;
    const newState = {
      ...gameState,
      status: 'lobby',
      players: gameState.players.map(p => ({ ...p, ready: false, role: undefined, wires: undefined })),
      currentPlayer: undefined,
      round: undefined,
      revealedInRound: undefined,
      defusingFound: undefined,
      config: undefined,
      winner: undefined,
      log: []
    };
    try {
      await window.database.ref(`rooms/${roomCode}`).set(newState);
      setMyRole(null);
      setScreen('lobby');
    } catch (err) {
      console.error('Play again error:', err);
    }
  };

  // Routing logic
  if (screen === 'home') {
    return React.createElement(window.HomeScreen, {
      playerName,
      setPlayerName,
      inputCode,
      setInputCode,
      error,
      loading,
      createRoom,
      joinRoom
    });
  }

  if (screen === 'lobby') {
    return React.createElement(window.LobbyScreen, {
      roomCode,
      playerId,
      gameState,
      copied,
      error,
      copyRoomCode,
      updatePlayerCount,
      toggleReady,
      startGame,
      leaveRoom
    });
  }

  if (screen === 'end') {
    return React.createElement(window.EndScreen, {
      gameState,
      myRole,
      playerId,
      playAgain,
      leaveRoom
    });
  }

  if (screen === 'game') {
    return React.createElement(window.GameScreen, {
      gameState,
      playerId,
      myRole,
      selectedWire,
      setSelectedWire,
      gameLog,
      showLog,
      setShowLog,
      cutWire
    });
  }

  return null;
}

// Initialize Lucide icons
lucide.createIcons();

// Render app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(TimeBombGame));