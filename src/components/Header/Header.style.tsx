import styled from "styled-components";

export const Nav = styled.nav`
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  background-color: #151515;
  color: white;
  height: 50px;
  padding: 0px 10px 0px 10px;
  font-size: 13px;
  font-weight: 500;
  border-bottom: 1px solid rgb(52, 52, 52);

  svg {
    margin-bottom: 2px;
  }
`;
export const Col = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;
export const Items = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-flow: row;
`;
export const Item = styled.div``;
export const Span = styled.div``;
export const Box = styled.div`
  background-color: #343434;
  gap: 10px;
  width: auto;
  height: 30px;
  padding: 0px 13px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
`;
