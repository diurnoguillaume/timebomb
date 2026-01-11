window.HomeScreen = function({ 
  playerName, 
  setPlayerName, 
  inputCode, 
  setInputCode, 
  error, 
  loading, 
  createRoom, 
  joinRoom 
}) {
  const { Timer } = lucide;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-slate-700">
        <div className="text-center mb-8">
          <Timer className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h1 className="text-4xl font-bold text-white mb-2">Time Bomb</h1>
          <p className="text-slate-400">London, 1890. Defuse or detonate?</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-white mb-2 font-semibold">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
              className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <button
            onClick={createRoom}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Room'}
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">OR</span>
            </div>
          </div>
          
          <div>
            <label className="block text-white mb-2 font-semibold">Room Code</label>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="Enter 5-character code"
              maxLength={5}
              className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none uppercase"
            />
          </div>
          
          <button
            onClick={joinRoom}
            disabled={loading}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-lg font-bold text-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Joining...' : 'Join Room'}
          </button>
        </div>
      </div>
    </div>
  );
};