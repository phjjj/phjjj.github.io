import { Link, To } from "react-router-dom";
import {
  ContentList,
  GithubBox,
  HashTagBox,
  Img,
  Item,
  LinkBox,
  Paragraph,
  ProjectInfoBox,
  ProjectNameSpan,
  VelogBox,
  WebsiteBox,
} from "./Project.style";
import quickoskImg from "../../Img/quickosk.png";
import weatherImg from "../../Img/weather.png";
import hospitalImg from "../../Img/hospital.png";
import marketImg from "../../Img/market.png";

interface IprojectArr {
  img: any;
  name: String;
  paragraph: String;
  hashtag: String[];
  webLink: To;
  githubLink: To;
  velogLink: To;
}

const Project = () => {
  const projectInfo: IprojectArr[] = [
    {
      img: quickoskImg,
      name: "Quickosk",
      paragraph: " 사람의 얼굴을 인식하고 나이를 추정 후, 추천 음식을 제공 해주는 사이트입니다.",
      hashtag: ["#js", "#css", "html", "#face-api"],
      webLink: "https://phjjj.github.io/kiosk/screen/orderscreen/orderscreen.html",
      githubLink: "https://github.com/phjjj/kiosk",
      velogLink: "https://velog.io/@phjjj/교내-프로젝트-나이대-별-추천-음식-키오스크",
    },
    {
      img: weatherImg,
      name: "Jweather",
      paragraph: "현재 기온과, 계절에 맞게 핀터레스트 사이트를 크롤링하여 사용자에게 코디를 알려주는 사이트입니다",
      hashtag: ["#react", "#puppeteer", "nodejs"],
      webLink: "",
      githubLink: "https://github.com/phjjj/weather-app",
      velogLink: "https://velog.io/@phjjj/날씨",
    },
    {
      img: hospitalImg,
      name: "병원맛집",
      paragraph:
        "챗지피티를 이용하여 사용자의 증상과 위치를 중심으로 병원을 찾은 후 점수를 매겨 사용자에게 알려주는 사이트입니다.",
      hashtag: ["#react", "#typescript"],
      webLink: "",
      githubLink: "https://github.com/YesHyeon/2023-sw-hackathon/tree/develop",
      velogLink: "https://velog.io/@phjjj/2023-SW중심대학-공동해커톤-내-주변-질병-맞춤형-병원-추천-서비스",
    },
    {
      img: marketImg,
      name: "경운마켓",
      paragraph: "학교 내 학생들끼리 중고 물품이나 전공 서적 등을 사고 팔수 있는 서비스 입니다",
      hashtag: ["#react", "#typescript", "#recoil", "#react-query", "#node", "#aws"],
      webLink: "https://2023-sw-hackathon-qbd430f5c-shgus1224.vercel.app/",
      githubLink: "https://github.com/SonMinSeock/ikw-market",
      velogLink: "https://velog.io/@phjjj/학교전용-중고거래-웹-사이트",
    },
  ];

  return (
    <ContentList>
      {projectInfo.map((project, index) => (
        <Item key={index}>
          <Img src={project.img} />
          <ProjectInfoBox>
            <ProjectNameSpan>{project.name}</ProjectNameSpan>
            <Paragraph>{project.paragraph}</Paragraph>
            <HashTagBox>
              {project.hashtag.map((tag, tagIndex) => (
                <span key={tagIndex}>{tag}</span>
              ))}
            </HashTagBox>
            <LinkBox>
              <Link to={project.webLink}>
                <WebsiteBox>WebSite</WebsiteBox>
              </Link>
              <Link to={project.githubLink}>
                <GithubBox>
                  <svg aria-hidden="true" viewBox="0 0 16 16" version="1.1" data-view-component="true" fill="white">
                    <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                  </svg>
                  <span>Github</span>
                </GithubBox>
              </Link>
              <Link to={project.velogLink}>
                <VelogBox>
                  <svg viewBox="0 0 192 192" fill="white">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M24 0H168C181.255 0 192 10.7451 192 24V168C192 181.255 181.255 192 168 192H24C10.7451 192 0 181.255 0 168V24C0 10.7451 10.7451 0 24 0ZM49 57.9199V65.48H67L80.6799 142.52L98.5 141.26C116.02 119.06 127.84 102.44 133.96 91.3999C140.2 80.24 143.32 70.9399 143.32 63.5C143.32 59.0601 142 55.7 139.36 53.4199C136.84 51.1399 133.66 50 129.82 50C122.62 50 116.62 53.0601 111.82 59.1799C116.5 62.3 119.68 64.8799 121.36 66.9199C123.16 68.8401 124.06 71.4199 124.06 74.6599C124.06 80.0601 122.44 86.1799 119.2 93.02C116.08 99.8601 112.66 105.92 108.94 111.2C106.54 114.56 103.48 118.7 99.76 123.62L88.0601 57.2C87.1001 52.3999 84.1001 50 79.0601 50C76.78 50 72.3999 50.96 65.9199 52.8799C59.4399 54.6799 53.8 56.3601 49 57.9199Z"></path>
                  </svg>
                  <span>Velog</span>
                </VelogBox>
              </Link>
            </LinkBox>
          </ProjectInfoBox>
        </Item>
      ))}

      {/* <Item>
        <Img src={quickoskImg} />
        <ProjectInfoBox>
          <ProjectNameSpan>Quickosk</ProjectNameSpan>
          <Paragraph>
            교내프로젝트 처음 프론트엔드 생태계에 접하고 js,html,css을 이용해 만든 프로젝트로, 사람의 얼굴을 인식하고
            face-api를 이용해 나이를 추정 후, 추천 음식을 제공 해주는 사이트입니다.
          </Paragraph>
          <HashTagBox>
            <span>#js</span>
            <span>#html</span>
            <span>#css</span>
            <span>#face-api</span>
          </HashTagBox>
          <LinkBox>
            <Link to={`https://phjjj.github.io/kiosk/screen/orderscreen/orderscreen.html`}>
              <WebsiteBox>WebSite</WebsiteBox>
            </Link>
            <Link to={`https://github.com/phjjj/kiosk`}>
              <GithubBox>
                <svg aria-hidden="true" viewBox="0 0 16 16" version="1.1" data-view-component="true" fill="white">
                  <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                </svg>
                <span>Github</span>
              </GithubBox>
            </Link>
            <Link to={`https://velog.io/@phjjj/교내-프로젝트-나이대-별-추천-음식-키오스크`}>
              <VelogBox>
                <svg viewBox="0 0 192 192" fill="">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M24 0H168C181.255 0 192 10.7451 192 24V168C192 181.255 181.255 192 168 192H24C10.7451 192 0 181.255 0 168V24C0 10.7451 10.7451 0 24 0ZM49 57.9199V65.48H67L80.6799 142.52L98.5 141.26C116.02 119.06 127.84 102.44 133.96 91.3999C140.2 80.24 143.32 70.9399 143.32 63.5C143.32 59.0601 142 55.7 139.36 53.4199C136.84 51.1399 133.66 50 129.82 50C122.62 50 116.62 53.0601 111.82 59.1799C116.5 62.3 119.68 64.8799 121.36 66.9199C123.16 68.8401 124.06 71.4199 124.06 74.6599C124.06 80.0601 122.44 86.1799 119.2 93.02C116.08 99.8601 112.66 105.92 108.94 111.2C106.54 114.56 103.48 118.7 99.76 123.62L88.0601 57.2C87.1001 52.3999 84.1001 50 79.0601 50C76.78 50 72.3999 50.96 65.9199 52.8799C59.4399 54.6799 53.8 56.3601 49 57.9199Z"></path>
                </svg>
                <span>Velog</span>
              </VelogBox>
            </Link>
          </LinkBox>
        </ProjectInfoBox>
      </Item>
      <Item>item</Item>
      <Item>item</Item>
      <Item>item</Item>
      <Item>item</Item> */}
    </ContentList>
  );
};

export default Project;
