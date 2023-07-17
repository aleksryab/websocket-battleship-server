import { BOT_ID } from '../../constants';
import { GameId } from '../../types';
import { db } from '../../models/DataBase';
import { GameBot } from '../../models/GameBot';
import { updateWinners } from '../players';
import { finishGameBroadcast } from './broadcasters';
import { gamesStorage } from '.';

export const finishGame = (gameId: GameId) => {
  const gameInfo = gamesStorage.get(gameId);
  if (!gameInfo) return;

  const players = gameInfo.players;
  const winPlayer = gameInfo.game.whoseTurn();

  players.forEach(
    (player) =>
      !(player instanceof GameBot) && finishGameBroadcast(player.ws, winPlayer),
  );

  if (winPlayer !== undefined && winPlayer !== BOT_ID) {
    db.updateWinner(winPlayer);
    updateWinners();
  }

  gamesStorage.delete(gameId);
};
