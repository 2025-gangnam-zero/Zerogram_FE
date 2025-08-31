import React from "react";
import styled from "styled-components";

const FooterContainer = styled.footer`
  background-color: #2c3e50;
  color: #ecf0f1;
  padding: 40px 0 20px;
  margin-top: auto;
`;

const FooterWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const FooterContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 30px;
`;

const FooterSection = styled.div`
  h3 {
    color: #3498db;
    margin-bottom: 16px;
    font-size: 18px;
    font-weight: 600;
  }

  p,
  a {
    color: #bdc3c7;
    line-height: 1.6;
    margin-bottom: 8px;
  }

  a:hover {
    color: #3498db;
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid #34495e;
  padding-top: 20px;
  text-align: center;

  p {
    color: #95a5a6;
    margin: 0;
    font-size: 14px;
  }
`;

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterWrapper>
        <FooterContent>
          <FooterSection>
            <h3>Zerogram</h3>
            <p>운동인과 입문자를 위한 통합 플랫폼</p>
            <p>건강한 운동 라이프를 시작하세요</p>
          </FooterSection>

          <FooterSection>
            <h3>서비스</h3>
            <p>운동 일지</p>
            <p>식단 일지</p>
            <p>운동 매칭</p>
          </FooterSection>

          <FooterSection>
            <h3>고객지원</h3>
            <p>문의하기</p>
            <p>FAQ</p>
            <p>이용약관</p>
          </FooterSection>

          <FooterSection>
            <h3>연락처</h3>
            <p>이메일: support@zerogram.com</p>
            <p>전화: 02-1234-5678</p>
          </FooterSection>
        </FooterContent>

        <FooterBottom>
          <p>&copy; 2024 Zerogram. All rights reserved.</p>
        </FooterBottom>
      </FooterWrapper>
    </FooterContainer>
  );
};

export default Footer;
