import cx from 'classnames';

interface IProps {
  className?: string;
}

export const Loader = (props: IProps) => {
  return <span className={cx('loading loading-spinner', props.className)}></span>;
};
