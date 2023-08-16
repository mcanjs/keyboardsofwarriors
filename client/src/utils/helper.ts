import { IGameLanguages } from '../interfaces/socket/game.interface';

export const checkGameActiveLanguageIsVerify = (language: IGameLanguages): boolean => {
  if (language !== 'en' && language !== 'tr') return false;
  return true;
};

export const setCookie = (name: string, value: any, minute?: number): void => {
  let expires = '';
  if (minute) {
    const date = new Date();
    date.setTime(date.getTime() + minute * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = name + '=' + (value || '') + expires + '; path=/';
};
export const getCookie = (name: string): null | string => {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const eraseCookie = (name: string): void => {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

export const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
