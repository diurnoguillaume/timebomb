window.GameScreen = function({ 
  gameState, 
  playerId, 
  myRole, 
  selectedWire, 
  setSelectedWire, 
  gameLog, 
  showLog, 
  setShowLog, 
  cutWire 
}) {
  const { Shield, Zap, Scissors, AlertCircle } = lucide;
  const currentPlayerObj = gameState.players[gameState.currentPlayer];
  const isMyTurn = currentPlayerObj.id === playerId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-slate-800 rounded-xl p-4 mb-4 border border-slate-700">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex items-center gap-4 flex-wrap">
              <div className={`px-4 py-2 rounded-lg font-bold ${myRole === 'sherlock' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'}`}>
                {myRole === 'sherlock' ? (
                  <><Shield className="inline w-4 h-4 mr-2" />Sherlock</>
                ) : (
                  <><Zap className="inline w-4 h-4 mr-2" />Moriarty</>
                )}
              </div>
              <div className="text-white">
                <div className="text-sm text-slate-400">Round</div>
                <div className="text-2xl font-bold">{gameState.round}/4</div>
            	</div>
							<div className="text-white">
								<div className="text-sm text-slate-400">Defusing Wires</div>
								<div className="text-2xl font-bold text-blue-400">
									{gameState.defusingFound}/{gameState.config.defusing}
								</div>
							</div>
        		</div>
						<div className="text-white text-right">
							<div className="text-sm text-slate-400">Current Turn</div>
							<div className="text-xl font-bold">{currentPlayerObj.name}</div>
							{isMyTurn && <div className="text-sm text-yellow-400">Your turn!</div>}
						</div>
      		</div>
					<div className={`mt-4 p-3 rounded-lg ${myRole === 'sherlock' ? 'bg-blue-900/50' : 'bg-red-900/50'}`}>
						<p className="text-white text-sm">
							{myRole === 'sherlock' ? (
								<>🎯 Find all {gameState.config.defusing} Defusing wires to win. Avoid the Bomb!</>
							) : (
								<>💣 Cut the Bomb or survive 4 rounds to win. Mislead others!</>
							)}
						</p>
					</div>
					{/* Game Log Toggle */}
					<button
						onClick={() => setShowLog(!showLog)}
						className="mt-4 w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm transition-all"
					>
						{showLog ? '📜 Hide Game Log' : '📜 Show Game Log'}
					</button>
					
					{showLog && gameLog.length > 0 && (
						<div className="mt-4 bg-slate-900 rounded-lg p-3 max-h-40 overflow-y-auto">
							{gameLog.slice(-10).reverse().map((entry, idx) => (
								<div key={idx} className="text-slate-300 text-xs py-1 border-b border-slate-800 last:border-0">
									{entry.message}
								</div>
							))}
						</div>
					)}
				</div>
				{/* Players Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{gameState.players.map((player) => {
						const isCurrentPlayer = currentPlayerObj.id === player.id;
						const isMe = player.id === playerId;
						
						return (
							<div
								key={player.id}
								className={`bg-slate-800 rounded-xl p-4 border-2 transition-all ${
									isCurrentPlayer
										? 'border-yellow-400 shadow-lg shadow-yellow-400/20'
										: 'border-slate-700'
								} ${isMe ? 'ring-2 ring-blue-500' : ''}`}
							>
								<div className="flex justify-between items-center mb-3">
									<h3 className="text-white font-bold text-lg truncate">
										{player.name}
										{isMe && <span className="text-xs ml-2 text-blue-400">(You)</span>}
										{isCurrentPlayer && (
											<Scissors className="inline w-5 h-5 ml-2 text-yellow-400" />
										)}
									</h3>
									<span className="text-slate-400 text-sm">
										{player.wires.filter(w => !w.revealed).length} wires
									</span>
								</div>

								{/* Wires */}
								<div className="grid grid-cols-5 gap-2">
									{player.wires.map((wire) => {
										const canCut = isMyTurn && !isMe && !wire.revealed;
										const isSelected = selectedWire?.playerId === player.id && selectedWire?.wireId === wire.id;
										
										return (
											<button
												key={wire.id}
												onClick={() => {
													if (canCut) {
														setSelectedWire({ playerId: player.id, wireId: wire.id });
													}
												}}
												disabled={!canCut}
												className={`aspect-square rounded-lg transition-all text-xl ${
													wire.revealed
														? wire.type === 'bomb'
															? 'bg-red-500 text-white'
															: wire.type === 'defusing'
															? 'bg-blue-500 text-white'
															: 'bg-slate-600 text-slate-400'
														: isSelected
														? 'bg-yellow-500 scale-110 shadow-lg cursor-pointer'
														: canCut
														? 'bg-slate-700 hover:bg-slate-600 cursor-pointer hover:scale-105'
														: 'bg-slate-700 cursor-not-allowed opacity-50'
												}`}
											>
												{wire.revealed ? (
													wire.type === 'bomb' ? '💣' :
													wire.type === 'defusing' ? '✂️' : '✓'
												) : (
													'?'
												)}
											</button>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>

				{/* Cut Wire Button */}
				{selectedWire && isMyTurn && (
					<div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
						<button
							onClick={() => cutWire(selectedWire.playerId, selectedWire.wireId)}
							className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 px-8 py-4 rounded-full font-bold text-lg shadow-2xl transition-all hover:scale-105"
						>
							<Scissors className="inline w-6 h-6 mr-2" />
							Cut Wire
						</button>
					</div>
				)}

				{/* Legend */}
				<div className="mt-6 bg-slate-800 rounded-xl p-4 border border-slate-700 mb-20">
					<h4 className="text-white font-bold mb-3 flex items-center">
						<AlertCircle className="w-5 h-5 mr-2" />
						Wire Types
					</h4>
					<div className="grid grid-cols-3 gap-4 text-sm">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 bg-slate-600 rounded flex items-center justify-center text-slate-400">✓</div>
							<span className="text-slate-300">Safe Wire</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">✂️</div>
							<span className="text-slate-300">Defusing Wire</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">💣</div>
							<span className="text-slate-300">Bomb</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}