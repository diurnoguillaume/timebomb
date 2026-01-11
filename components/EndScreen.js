window.EndScreen = function({ 
  gameState, 
  playerId, 
  myRole, 
  playAgain,
	leaveRoom 
}) {
	const isWinner = (gameState.winner === 'sherlock' && myRole === 'sherlock') || 
										(gameState.winner === 'moriarty' && myRole === 'moriarty');
	const isHost = playerId === gameState.hostId;
	
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
			<div className="bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-slate-700 text-center">
				<div className="mb-6">
					{gameState.winner === 'sherlock' ? (
						<Shield className="w-20 h-20 mx-auto text-blue-400 mb-4 animate-pulse" />
					) : (
						<Zap className="w-20 h-20 mx-auto text-red-400 mb-4 animate-pulse" />
					)}
				</div>
				
				<h2 className="text-3xl font-bold text-white mb-4">
					{gameState.winner === 'sherlock' ? 'Bomb Defused!' : 'Big Ben Destroyed!'}
				</h2>
				
				<p className="text-xl mb-6 text-slate-300">
					{gameState.winner === 'sherlock' ? (
						<span className="text-blue-400 font-bold">Sherlock's Team Wins!</span>
					) : (
						<span className="text-red-400 font-bold">Moriarty's Team Wins!</span>
					)}
				</p>
				
				<div className="bg-slate-900 rounded-lg p-4 mb-6">
					<p className={`text-lg font-bold ${isWinner ? 'text-green-400' : 'text-orange-400'}`}>
						{isWinner ? '🎉 You Won!' : '😔 You Lost'}
					</p>
					<p className="text-slate-400 mt-2">
						You were on {myRole === 'sherlock' ? "Sherlock's" : "Moriarty's"} team
					</p>
				</div>
				
				<div className="space-y-4">
					<div className="bg-slate-900 rounded-lg p-4 text-left">
						<h3 className="font-bold text-white mb-2">Team Roles:</h3>
						{gameState.players.map(p => (
							<div key={p.id} className="flex justify-between text-sm py-1">
								<span className="text-slate-300">{p.name}:</span>
								<span className={p.role === 'sherlock' ? 'text-blue-400' : 'text-red-400'}>
									{p.role === 'sherlock' ? 'Sherlock' : 'Moriarty'}
								</span>
							</div>
						))}
					</div>
					
					<div className="flex gap-2">
						{isHost && (
							<button
								onClick={playAgain}
								className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white py-4 rounded-lg font-bold hover:from-green-700 hover:to-green-600 transition-all"
							>
								Play Again
							</button>
						)}
						<button
							onClick={leaveRoom}
							className={`${isHost ? 'flex-1' : 'w-full'} bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-lg font-bold hover:from-blue-700 hover:to-blue-600 transition-all`}
						>
							Leave Room
						</button>
					</div>
					{!isHost && (
						<p className="text-slate-400 text-sm">Waiting for host to start a new game...</p>
					)}
				</div>
			</div>
		</div>
	);
}