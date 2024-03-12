import styled from "styled-components";

export const Row = styled.nav`
  display: flex;
  background-color: #151515;
  height: 35px;
  color: rgb(153, 153, 153);
  font-size: 13px;
  font-family: Inter, Roboto, sans-serif;
`;
export const TabBtn = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  border-right: 1px solid rgb(52, 52, 52);
  background-color: rgb(21, 21, 21);
  width: 125px;
  padding-left: 10px;
  height: 100%;
  border-bottom: ${(props) => (props.active ? "1px solid #6cc7f6" : "1px solid rgb(52, 52, 52)")};
  color: ${(props) => (props.active ? "white" : null)};
  &:hover {
    color: rgb(230, 230, 230);
  }
  svg {
    width: 16px;
    height: 16px;
  }
`;
