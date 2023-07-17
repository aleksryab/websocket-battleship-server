import { GameBot } from '../../models/GameBot';
import { PlayerIndex } from '../../types';
import { finishGameBroadcast } from './broadcasters';
import { gamesStorage } from '.';

export const techDefeat = (playerIndex: PlayerIndex) => {
  const gamesWithPlayer = [...gamesStorage.values()].filter(
    (gameInfo) => !!gameInfo.players.get(playerIndex),
  );

  gamesWithPlayer.forEach((gameInfo) => {
    const winner = [...gameInfo.players.values()].find((player) => {
      if (player instanceof GameBot) return false;
      return player.index !== playerIndex;
    });

    if (winner === undefined || winner instanceof GameBot) return;

    finishGameBroadcast(winner.ws, winner.index);
    gamesStorage.delete(gameInfo.game.gameId);
  });
};
