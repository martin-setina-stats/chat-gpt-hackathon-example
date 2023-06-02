const playerMapper = (player: any): string =>
  `{id=${player.id}, x=${player.court.x.toFixed(0)}, y=${player.court.y.toFixed(0)}}`;

const eventMapper = (event: any): string =>
  `court: w=${event.game.courtSize.width}, h=${event.game.courtSize.height}; ball: x=${event.ball.court.x.toFixed(
    0
  )}, y=${event.ball.court.y.toFixed(0)}; players: [${event.players.map((player) =>
    playerMapper(player)
  )}]; [${event.untracked.map((player) => playerMapper(player))}], videoTimeMs: ${Math.round(
    event.frame.videoTimeMs
  )}, source: ${Math.round(event.frame.videoTimeMs)}`;

export {eventMapper};
