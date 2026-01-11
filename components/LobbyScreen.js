window.LobbyScreen = function({ 
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
}) {
  const { Users, Shield, Zap, Copy, Check } = lucide;
  const isHost = playerId === gameState.hostId;
  const allReady = gameState.players.every(p => p.ready) && gameState.players.length === gameState.playerCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-2xl w-full border border-slate-700">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-4">Game Lobby</h2>
          
          <div className="bg-slate-900 rounded-lg p-4 mb-4">
            <div className="text-slate-400 text-sm mb-1">Room Code</div>
            <div className="flex items-center justify-center gap-2">
              <div className="text-4xl font-bold text-white tracking-wider">{roomCode}</div>
              <button
                onClick={copyRoomCode}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all"
                title="Copy code"
              >
                {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-slate-400" />}
              </button>
            </div>
            <div className="text-slate-400 text-sm mt-2">Share this code with your friends!</div>
          </div>
        </div>

        {isHost && (
          <div className="mb-6">
            <label className="block text-white mb-3 font-semibold">
              <Users className="inline w-5 h-5 mr-2" />
              Number of Players
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[4, 5, 6, 7, 8].map(num => (
                <button
                  key={num}
                  onClick={() => updatePlayerCount(num)}
                  className={`py-3 rounded-lg font-bold transition-all ${
                    gameState.playerCount === num
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            
            <div className="bg-slate-900 rounded-lg p-3 mt-3 text-sm text-slate-300">
              <div className="flex justify-between">
                <span className="flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-blue-400" />
                  Sherlock:
                </span>
                <span className="font-bold text-blue-400">{window.GAME_CONFIG[gameState.playerCount].sherlock}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-red-400" />
                  Moriarty:
                </span>
                <span className="font-bold text-red-400">{window.GAME_CONFIG[gameState.playerCount].moriarty}</span>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white font-bold">
              Players ({gameState.players.length}/{gameState.playerCount})
            </h3>
          </div>
          
          <div className="space-y-2">
            {gameState.players.map(player => (
              <div
                key={player.id}
                className="bg-slate-700 rounded-lg p-3 flex justify-between items-center"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${player.ready ? 'bg-green-400' : 'bg-slate-500'}`}></div>
                  <span className="text-white font-medium">{player.name}</span>
                  {player.id === gameState.hostId && (
                    <span className="text-xs bg-yellow-500 text-slate-900 px-2 py-1 rounded font-bold">HOST</span>
                  )}
                  {player.id === playerId && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded font-bold">YOU</span>
                  )}
                </div>
                <div className="text-sm text-slate-400">
                  {player.ready ? '✓ Ready' : 'Not ready'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={toggleReady}
            className={`flex-1 py-3 rounded-lg font-bold transition-all ${
              gameState.players.find(p => p.id === playerId)?.ready
                ? 'bg-slate-600 hover:bg-slate-500 text-white'
                : 'bg-green-600 hover:bg-green-500 text-white'
            }`}
          >
            {gameState.players.find(p => p.id === playerId)?.ready ? 'Not Ready' : 'Ready'}
          </button>
          
          {isHost && (
            <button
              onClick={startGame}
              disabled={!allReady}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Game
            </button>
          )}
          
          <button
            onClick={leaveRoom}
            className="px-6 bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg font-bold transition-all"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
};