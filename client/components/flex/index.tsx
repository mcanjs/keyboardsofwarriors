import styled from 'styled-components';

interface IProps {
  direction?: 'column' | 'column-reverse' | 'unset' | 'row' | 'row-reverse' | 'initial';
  justifyContent?: 'space-between' | 'center' | 'flex-start' | 'flex-end' | 'start' | 'end';
}

export const Flex = styled.div<IProps>`
  display: flex;
  flex-direction: ${(props) => props.direction};
  justify-content: ${(props) => props.justifyContent};
`;
