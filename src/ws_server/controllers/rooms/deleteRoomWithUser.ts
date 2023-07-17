import { PlayerIndex } from '../../types';
import { roomsStorage } from '.';

export const deleteRoomWithUser = (playerIndex: PlayerIndex) => {
  roomsStorage.forEach((room) => {
    if (room.creator === playerIndex) roomsStorage.delete(room.roomId);
  });
};
