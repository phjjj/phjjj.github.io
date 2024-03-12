import styled from "styled-components";
// 사이드바
export const SidebarBox = styled.aside`
  width: 222px;
  height: 100%;
  background-color: #151515;
  color: rgb(153, 153, 153);
  font-size: 13px;
  font-family: Inter, Roboto, sans-serif;
  border-right: 1px solid rgb(52, 52, 52);
`;
export const SidebarHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 10px;
  height: 35px;
  border-bottom: 1px solid rgb(52, 52, 52);
`;
export const SidebarList = styled.div``;
export const SidebarItem = styled.div<{ active: boolean }>`
  background-color: ${(props) => (props.active ? "rgb(52,52,52)" : null)};
  color: ${(props) => (props.active ? "rgb(230,230,230)" : null)};
  min-height: 28px;
  display: flex;
  align-items: center;
  padding-left: 30px;
  gap: 10px;
  cursor: pointer;

  &:hover {
    color: rgb(230, 230, 230);
  }
  svg {
    width: 16px;
    height: 16px;
  }
`;
