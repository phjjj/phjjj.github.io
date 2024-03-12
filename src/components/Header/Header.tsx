import { Nav, Col, Item, Span, Box, Items } from "./Header.style";
import { HiOutlineMenuAlt2, HiOutlineDotsVertical } from "react-icons/hi";
import { AiOutlineBell, AiFillHeart } from "react-icons/ai";
import { IoIosShareAlt } from "react-icons/io";
import { BiGitRepoForked } from "react-icons/bi";
import { Outlet } from "react-router-dom";
const Headers = () => {
  return (
    <Nav>
      <Col>
        <HiOutlineMenuAlt2 size={18}></HiOutlineMenuAlt2>
        <Item>phjjj</Item>
      </Col>
      <Col>
        <Item>🌎</Item>
        <Box>
          <Span>Template</Span>
        </Box>
      </Col>
      <Col>
        <Col>
          <AiFillHeart size={18}></AiFillHeart>
          <Span>9999</Span>
        </Col>
        <Items>
          <Box>
            <IoIosShareAlt />
            Share
          </Box>
          <Box>
            <BiGitRepoForked />
            Fork
          </Box>
          <Box>Create</Box>
          <Box>
            <AiOutlineBell />
          </Box>
          <Box>
            <HiOutlineDotsVertical />
          </Box>
        </Items>
      </Col>
      <Outlet />
    </Nav>
  );
};

export default Headers;
