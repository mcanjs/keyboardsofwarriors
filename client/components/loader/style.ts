import styled from 'styled-components';

export const LoaderMain = styled.svg`
  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes dash {
    0% {
      stroke-dasharray: 0, 150;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 100, 150;
      stroke-dashoffset: -24;
    }
    100% {
      stroke-dasharray: 0, 150;
      stroke-dashoffset: -124;
    }
  }

  animation: rotate 2.625s linear infinite;
  height: 3rem;
  width: 3rem;
  transform-origin: center;
  .circle {
  }
`;

export const LoaderCircle = styled.circle`
  animation: dash 1.5s ease-in-out infinite;
  stroke-linecap: round;
  stroke: #4c40f5;
`;
