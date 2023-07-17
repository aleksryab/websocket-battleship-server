import { roomsStorage } from '../..';
import { PlayerIndex } from '../../types';
import { updateRoom } from './updateRoom';

export const deleteRoomWithUser = (playerIndex: PlayerIndex) => {
  roomsStorage.forEach((room) => {
    if (room.creator === playerIndex) roomsStorage.delete(room.roomId);
  });
};
