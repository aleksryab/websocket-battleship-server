import { gamesStorage } from '../..';
import { BOT_ID, CommandTypes } from '../../constants';
import { GameId } from '../../types';
import { db } from '../../models/DataBase';
import { GameBot } from '../../models/GameBot';
import { updateWinners } from '../players/updateWinners';
import { getStringResponse } from '../utils';

export const finishGame = (gameId: GameId) => {
  const gameInfo = gamesStorage.get(gameId);
  if (!gameInfo) return;

  const players = gameInfo.players;
  const winPlayer = gameInfo.game.whoseTurn();

  const finishResponse = getStringResponse(CommandTypes.Finish, { winPlayer });

  players.forEach(
    (player) => !(player instanceof GameBot) && player.ws.send(finishResponse),
  );

  if (winPlayer !== undefined && winPlayer !== BOT_ID) {
    db.updateWinner(winPlayer);
    updateWinners();
  }

  gamesStorage.delete(gameId);
};
