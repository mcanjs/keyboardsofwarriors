import { LoaderCircle, LoaderMain } from './style';

export const Loader: React.FC = function () {
  return (
    <LoaderMain viewBox="-24 -24 48 48">
      <LoaderCircle cx="0" cy="0" r="20" fill="none" strokeWidth="4"></LoaderCircle>
    </LoaderMain>
  );
};
