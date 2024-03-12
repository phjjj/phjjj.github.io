import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Headers from "./components/Header/Header";
import styled from "styled-components";
import Project from "./pages/Project/Project";
import Sidebar from "./components/Sidebar/Sidebar";
import Home from "./pages/Home/Home";
import TabList from "./components/TabList/TabList";

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
  left: 0px;
  right: 0px;
  top: 0px;
  bottom: 0px;
`;
export const Main = styled.div`
  display: flex;
  height: 100%;
`;
export const ContentBox = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: rgb(21, 21, 21);
`;
const App = () => {
  return (
    <Router>
      <Container>
        <Headers />
        <Main>
          <Sidebar />
          <ContentBox>
            <TabList />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/project" element={<Project />} />
            </Routes>
          </ContentBox>
        </Main>
      </Container>
    </Router>
  );
};

export default App;
