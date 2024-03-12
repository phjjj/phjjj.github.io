import styled from "styled-components";

export const ContentList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 6px;
  font-family: "Noto Sans KR", sans-serif;
  font-optical-sizing: auto;
  font-weight: 200;
  font-style: normal;
`;
export const Item = styled.div`
  display: flex;
  color: white;
  overflow: hidden;
  height: 300px;
  gap: 10px;
  padding: 1px;
  background-color: #424c4c;
  border: #b74dd2 solid 2px;
  border-radius: 20px;
  transition: background-color 0.8s ease;

  &:hover {
    background-color: #b74dd2;
    transform: scale(1.02);
  }
`;

export const Img = styled.img`
  height: 100%;
  min-width: 200px;
  max-width: 200px;
`;
export const ProjectNameSpan = styled.span`
  font-weight: 400;
  margin-top: 14px;
  font-size: 30px;
`;

export const Paragraph = styled.p`
  font-size: 17px;
`;
export const ProjectInfoBox = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: space-between;
`;

export const HashTagBox = styled.div`
  display: flex;
  font-size: 17px;
  gap: 10px;
`;

export const LinkBox = styled.div`
  color: white;
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 5px;
  svg {
    width: 20px;
    height: 20px;
  }
`;
export const GithubBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  height: 30px;
  width: 80%;
  background-color: #273239;
  border-radius: 5px;
  &:hover {
    transform: scale(1.1);
  }
`;

export const WebsiteBox = styled(GithubBox)`
  background-color: #e74c3c;
`;
export const VelogBox = styled(GithubBox)`
  background-color: #22c997;
`;
