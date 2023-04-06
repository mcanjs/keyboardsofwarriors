import { ButtonHTMLAttributes } from 'react';
import styled from 'styled-components';

interface IButtonProps {
  bgColor?: string;
  fontSize?: string;
  color?: string;
  radius?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  hoverBg?: string;
  border?: string;
}

export const Button = styled.button<IButtonProps>`
  padding-top: ${(props) => props.paddingTop || '20px'};
  padding-right: ${(props) => props.paddingRight || '75px'};
  padding-bottom: ${(props) => props.paddingBottom || '20px'};
  padding-left: ${(props) => props.paddingLeft || '75px'};
  border: ${(props) => props.border || '0'};
  border-radius: ${(props) => props.radius || '8px'};
  transition: all 0.325s ease-out;
  background-color: ${(props) => props.bgColor || '#0D67FE'};
  color: ${(props) => props.color || '#FFFFFF'};
  font-size: ${(props) => props.fontSize || '14px'};
  cursor: pointer;

  &:hover {
    transition: all 0.325s ease-in;
    background-color: ${(props) => props.hoverBg || '#0655DD'};
  }

  &:active {
    opacity: 0.76;
  }
`;
