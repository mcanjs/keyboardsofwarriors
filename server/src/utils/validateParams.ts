import { ICustomRoomParameters } from '@/interfaces/custom.interface';

const checkIsValidWithArr = (time: number, expecteds: number[]): boolean => {
  if (expecteds.indexOf(time) > -1) return true;
  return false;
};

export const ValidateCustomRoomParams = (params: ICustomRoomParameters): boolean => {
  if (typeof params.isTime !== 'boolean') {
    return false;
  } else if (params.language !== 'en' && params.language !== 'tr') {
    return false;
  } else if (typeof params.time !== 'number' || !checkIsValidWithArr(params.time, [60, 120, 180, 240, 300])) {
    return false;
  } else if (typeof params.words !== 'number' || !checkIsValidWithArr(params.words, [50, 100, 150, 200, 250, 300, 350, 400, 450, 500])) {
    return false;
  }
  return true;
};
