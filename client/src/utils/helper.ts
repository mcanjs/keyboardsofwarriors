import { IGameLanguages } from "../interfaces/socket/game.interface";

export const checkGameActiveLanguageIsVerify = (
  language: IGameLanguages
): boolean => {
  if (language !== "en" && language !== "tr") return false;
  return true;
};
