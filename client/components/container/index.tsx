import styled from 'styled-components';

interface IProps {
  mt?: string;
}

export const Container = styled.div<IProps>`
  max-width: 1492px;
  margin: 0 auto;
  margin-top: ${(props) => props.mt}px;

  @media only screen and (max-width: 1536px) {
    max-width: 1140px;
  }

  @media only screen and (max-width: 1280px) {
    max-width: 968px;
  }

  @media only screen and (max-width: 1024px) {
    max-width: 800px;
  }

  @media only screen and (max-width: 768px) {
    max-width: 700px;
  }

  @media only screen and (max-width: 640px) {
    padding-right: 16px;
    padding-left: 16px;
  }
`;
