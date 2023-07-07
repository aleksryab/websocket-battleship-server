export const PLAYER_NAME_LENGTH = 5;
export const PASSWORD_LENGTH = 5;

export enum CommandTypes {
  Reg = 'reg',
  CreateRoom = 'create_room',
  AddUserToRoom = 'add_user_to_room',
  CreateGame = 'create_game',
  StartGame = 'start_game',
  AddShips = 'add_ships',
  Attack = 'attack',
  RandomAttack = 'randomAttack',
  Turn = 'turn',
  Finish = 'finish',
  UpdateRoom = 'update_room',
  UpdateWinners = 'update_winners',
}

export enum ErrorMessages {
  InvalidName = 'Player name must be a string of at least 5 characters',
  AuthError = `Player name and password don't match`,
}
