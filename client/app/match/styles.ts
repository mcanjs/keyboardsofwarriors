import styled from 'styled-components';

export const PageCapsule = styled.div`
  min-height: 100vh;
  margin-top: 89px;
  background: linear-gradient(180deg, #ffffff 0%, #efefef 100%);
  box-shadow: inset 0px -28px 76px rgba(0, 0, 0, 0.04);
`;

export const CompetitionArea = styled.div`
  padding: 273px 0 150px 0;
  border-radius: 22px;
  background-image: url('/competition-bg.png');
  background-position: 100%;
  background-size: cover;
  background-repeat: no-repeat;
  background-color: white;
`;

export const CompetitionTextWrapper = styled.div`
  max-width: 75%;
  max-height: 102px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 0 auto 30px auto;
  overflow: hidden;
  user-select: none;
`;

export const CompetitionTextList = styled.span`
  font-size: 17px;
  padding: 3px;
  &.current {
    background-color: gray;
  }
`;

export const CompetitionInput = styled.input`
  min-width: 320px;
  padding: 15px;
  border-radius: 99px;
  border: 0;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.16), inset 0px 4px 4px rgba(0, 0, 0, 0.25);
  background: #ffffff;
  outline: none;
`;

export const CompetitionTimer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 17px;
  padding: 15px;
  border-radius: 99px;
  background-color: #4c40f5;
`;

export const CompetitionLeftTime = styled.span`
  color: white;
`;
