import cx from 'classnames';

interface IProps {
  className?: string;
}

export const Loader = (props: IProps) => {
  return (
    <svg className={cx(`loader ${props.className}`)} viewBox="-24 -24 48 48">
      <circle cx="0" cy="0" r="20" fill="none" strokeWidth="3"></circle>
    </svg>
  );
};
