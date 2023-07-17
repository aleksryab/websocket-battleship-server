import { gamesStorage } from '../..';
import { GameBot } from '../../models/GameBot';
import { PlayerIndex } from '../../types';
import { finishGameBroadcast } from './broadcasters';

export const techDefeat = (playerIndex: PlayerIndex) => {
  const gamesWithPlayer = [...gamesStorage.values()].filter(
    (gameInfo) => !!gameInfo.players.get(playerIndex),
  );
  console.log(gamesWithPlayer);

  gamesWithPlayer.forEach((gameInfo) => {
    const winner = [...gameInfo.players.values()].find((player) => {
      if (player instanceof GameBot) return false;
      return player.index !== playerIndex;
    });

    console.log('Winner: ', winner);

    if (winner === undefined || winner instanceof GameBot) return;

    finishGameBroadcast(winner.ws, winner.index);
    gamesStorage.delete(gameInfo.game.gameId);
  });
};
