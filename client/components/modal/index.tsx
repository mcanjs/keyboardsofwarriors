import styled from 'styled-components';
import { rgba } from 'polished';

export const ModalWrapper = styled.div<{ withoutBg?: boolean }>`
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.225s ease-in;
  background-color: ${(props) => !props.withoutBg && rgba('#000', 0.5)};
`;

export const ModalContainer = styled.div`
  width: 75%;
  background-color: white;
`;

export const ModalHead = styled.div`
  padding: 10px;
`;

export const ModalBody = styled.div`
  padding: 10px;
`;

export const ModalFooter = styled.div`
  padding: 10px;
`;
