import { createRoom } from './createRoom';
import { addUserToRoom } from './addUserToRoom';
import { updateRoom } from './updateRoom';
import { deleteRoomWithUser } from './deleteRoomWithUser';
import { RoomsMap } from '../../types';

export const roomsStorage: RoomsMap = new Map();

export { createRoom, addUserToRoom, updateRoom, deleteRoomWithUser };
