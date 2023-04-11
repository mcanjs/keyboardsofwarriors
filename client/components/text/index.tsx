import styled from 'styled-components';

interface IProps {
  fontSize?: string;
  fontWeight?: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  color?: string;
  lineHeight?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export const Text = styled.span<IProps>`
    font-size: ${(props) => props.fontSize || ''}
`;
