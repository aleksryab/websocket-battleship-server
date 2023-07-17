import { regPlayer } from './regPlayer';
import { updateWinners } from './updateWinners';
import { handleDisconnectedPlayer } from './handleDisconnectedPlayer';
import { ClientsMap } from '../../types';

export const registeredClients: ClientsMap = new Map();
export { regPlayer, updateWinners, handleDisconnectedPlayer };
