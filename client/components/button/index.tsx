import { rgba } from 'polished';
import styled from 'styled-components';

interface IButtonProps {
  bgColor?: string;
  fontSize?: string;
  color?: string;
  radius?: string;
  marginTop?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  hoverBg?: string;
  border?: string;
  fontWeight?: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  boxShadow?: string;
}

export const Button = styled.button<IButtonProps>`
  margin-top: ${(props) => props.marginTop || '0px'};
  padding-top: ${(props) => props.paddingTop || '20px'};
  padding-right: ${(props) => props.paddingRight || '16px'};
  padding-bottom: ${(props) => props.paddingBottom || '20px'};
  padding-left: ${(props) => props.paddingLeft || '16px'};
  border: ${(props) => props.border || '0'};
  border-radius: ${(props) => props.radius || '8px'};
  transition: all 0.325s ease-out;
  background-color: ${(props) => (props.bgColor ? rgba(props.bgColor, 1) : rgba('#4C40F5', 1))};
  color: ${(props) => props.color || '#FFFFFF'};
  font-size: ${(props) => props.fontSize || '14px'};
  font-weight: ${(props) => props.fontWeight || '400'};
  cursor: pointer;
  box-shadow: ${(props) => props.boxShadow || 'none'};

  &:hover {
    transition: all 0.125s ease-in;
    background-color: ${(props) => (props.bgColor ? rgba(props.bgColor, 0.8) : rgba('#4C40F5', 0.8))};
  }

  &:active {
    opacity: 0.76;
  }
  &:disabled {
    cursor: progress;
    opacity: 0.5;
  }
`;
