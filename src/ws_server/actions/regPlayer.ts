import { Command, PlayerRequestData, PlayerResponseData } from '../types';
import { dataBase } from '../dataBase';
import { ErrorMessages, PLAYER_NAME_LENGTH } from '../constants';
import { getResponseTemplate } from './utils';

const isNameValid = (name: unknown) => {
  return typeof name === 'string' && name.length >= PLAYER_NAME_LENGTH;
};

const authPlayer = (name: string, password: string) => {
  const player = dataBase.players.find((it) => it.name === name);

  if (player) {
    if (player.password === password) {
      return { index: player.index, error: false };
    } else {
      return {
        index: player.index,
        error: true,
        errorText: ErrorMessages.AuthError,
      };
    }
  }

  const index = dataBase.players.length + 1;
  const newPlayer = { index, name, password: password.toString() };
  dataBase.players.push(newPlayer);
  return { index };
};

export const regPlayer = ({ type, data }: Command) => {
  const { name, password } = JSON.parse(data) as PlayerRequestData;
  const responseData: PlayerResponseData = {
    name,
    index: 0,
    error: false,
    errorText: '',
  };

  if (!isNameValid(name)) {
    responseData.error = true;
    responseData.errorText = ErrorMessages.InvalidName;
  } else {
    const authData = authPlayer(name, password);
    Object.assign(responseData, authData);
  }

  const response = getResponseTemplate(type);
  response.data = JSON.stringify(responseData);

  return JSON.stringify(response);
};
