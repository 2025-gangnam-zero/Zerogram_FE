import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Button from "../components/common/Button";
import { UI_CONSTANTS } from "../constants";

// 스타일 컴포넌트
const LandingContainer = styled.div`
  min-height: calc(100vh - 140px);
  background: linear-gradient(135deg, #667eea 0%, rgb(27, 219, 49) 100%);
`;

const HeroSection = styled.section`
  padding: 80px 20px;
  text-align: center;
  color: white;
`;

const HeroTitle = styled.h1`
  font-size: 4rem;
  margin-bottom: 20px;
  font-weight: 800;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.5rem;
  margin-bottom: 40px;
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 30px;
  }
`;

const CTAButtonContainer = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 40px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
`;

const CTAButton = styled(Button)`
  padding: 16px 32px;
  font-size: 18px;
  font-weight: 700;
  border-radius: 12px;
  min-width: 150px;

  @media (max-width: 768px) {
    min-width: 200px;
  }
`;

const FeaturesSection = styled.section`
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 60px;
  color: white;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  margin-bottom: 60px;
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 40px 30px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all ${UI_CONSTANTS.TRANSITIONS.NORMAL};
  border: 1px solid rgba(255, 255, 255, 0.2);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    background: rgba(255, 255, 255, 1);
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 20px;
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  font-weight: 600;
`;

const FeatureDescription = styled.p`
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  line-height: 1.6;
  font-size: 1rem;
`;

const ServiceShowcase = styled.section`
  padding: 80px 20px;
`;

const ShowcaseGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
`;

const ServiceCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${UI_CONSTANTS.COLORS.PRIMARY};
  transition: all ${UI_CONSTANTS.TRANSITIONS.NORMAL};

  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }
`;

const ServiceTitle = styled.h4`
  font-size: 1.3rem;
  margin-bottom: 15px;
  color: ${UI_CONSTANTS.COLORS.PRIMARY};
  font-weight: 600;
`;

const ServiceDescription = styled.p`
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  line-height: 1.5;
  margin-bottom: 15px;
`;

const ServiceFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ServiceFeature = styled.li`
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  margin-bottom: 8px;
  padding-left: 20px;
  position: relative;
  font-size: 0.9rem;

  &:before {
    content: "✓";
    position: absolute;
    left: 0;
    color: ${UI_CONSTANTS.COLORS.SUCCESS};
    font-weight: bold;
  }
`;

const CallToActionSection = styled.section`
  padding: 80px 20px;
  text-align: center;
  color: white;
`;

const CTATitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 20px;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const CTADescription = styled.p`
  font-size: 1.2rem;
  margin-bottom: 40px;
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

// 페이지 이동
const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signup");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <LandingContainer>
      {/* Hero Section */}
      <HeroSection>
        <HeroTitle>Zerogram</HeroTitle>
        <HeroSubtitle>
          헬스와 러닝 열풍 속에서
          <br />
          운동인과 입문자를 위한 통합 플랫폼 서비스
        </HeroSubtitle>
        <CTAButtonContainer>
          <CTAButton variant="primary" size="large" onClick={handleGetStarted}>
            시작하기
          </CTAButton>
          <CTAButton variant="outline" size="large" onClick={handleLogin}>
            로그인
          </CTAButton>
        </CTAButtonContainer>
      </HeroSection>

      {/* Features Section */}
      <FeaturesSection>
        <SectionTitle>주요 기능</SectionTitle>
        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>📝</FeatureIcon>
            <FeatureTitle>운동 & 식단 일지</FeatureTitle>
            <FeatureDescription>
              체계적인 운동 기록과 칼로리 추적으로 건강한 라이프스타일을
              관리하세요
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>🤝</FeatureIcon>
            <FeatureTitle>운동 메이트 매칭</FeatureTitle>
            <FeatureDescription>
              지역별, 종목별 필터링으로 나와 맞는 운동 파트너를 쉽게 찾아보세요
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>📊</FeatureIcon>
            <FeatureTitle>데이터 분석</FeatureTitle>
            <FeatureDescription>
              Chart.js를 활용한 시각적 데이터로 운동 성과와 식단 패턴을 한눈에
              확인하세요
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>
      </FeaturesSection>

      {/* Service Showcase */}
      <ServiceShowcase>
        <SectionTitle>제공 서비스</SectionTitle>
        <ShowcaseGrid>
          <ServiceCard>
            <ServiceTitle>💪 운동 일지</ServiceTitle>
            <ServiceDescription>
              달력 기반의 직관적인 운동 기록 시스템
            </ServiceDescription>
            <ServiceFeatures>
              <ServiceFeature>달력으로 운동 일정 관리</ServiceFeature>
              <ServiceFeature>상세한 운동 내용 작성</ServiceFeature>
              <ServiceFeature>기록 수정 및 삭제 기능</ServiceFeature>
            </ServiceFeatures>
          </ServiceCard>

          <ServiceCard>
            <ServiceTitle>🍎 식단 일지</ServiceTitle>
            <ServiceDescription>
              체계적인 칼로리 관리와 식단 추적
            </ServiceDescription>
            <ServiceFeatures>
              <ServiceFeature>아침, 점심, 저녁별 식단 기록</ServiceFeature>
              <ServiceFeature>7일 단위 칼로리 그래프</ServiceFeature>
              <ServiceFeature>식단 패턴 분석</ServiceFeature>
            </ServiceFeatures>
          </ServiceCard>

          <ServiceCard>
            <ServiceTitle>🏃‍♂️ 매칭 시스템</ServiceTitle>
            <ServiceDescription>
              운동 파트너 찾기와 그룹 활동 지원
            </ServiceDescription>
            <ServiceFeatures>
              <ServiceFeature>지역별 필터링 (강남구, 서초구 등)</ServiceFeature>
              <ServiceFeature>
                종목별 필터링 (헬스, 러닝, 테니스)
              </ServiceFeature>
              <ServiceFeature>모집글 작성 및 참여</ServiceFeature>
              <ServiceFeature>댓글 및 소통 기능</ServiceFeature>
            </ServiceFeatures>
          </ServiceCard>

          <ServiceCard>
            <ServiceTitle>👤 마이페이지</ServiceTitle>
            <ServiceDescription>
              개인 정보 관리와 활동 내역 확인
            </ServiceDescription>
            <ServiceFeatures>
              <ServiceFeature>사용자 정보 조회 및 수정</ServiceFeature>
              <ServiceFeature>비밀번호 변경</ServiceFeature>
              <ServiceFeature>활동 기록 관리</ServiceFeature>
            </ServiceFeatures>
          </ServiceCard>

          <ServiceCard>
            <ServiceTitle>🔐 간편 로그인</ServiceTitle>
            <ServiceDescription>다양한 로그인 옵션 제공</ServiceDescription>
            <ServiceFeatures>
              <ServiceFeature>이메일/비밀번호 로그인</ServiceFeature>
              <ServiceFeature>Google OAuth</ServiceFeature>
              <ServiceFeature>카카오 OAuth</ServiceFeature>
            </ServiceFeatures>
          </ServiceCard>

          <ServiceCard>
            <ServiceTitle>🛡️ 안전한 환경</ServiceTitle>
            <ServiceDescription>신고 시스템과 관리자 관리</ServiceDescription>
            <ServiceFeatures>
              <ServiceFeature>부적절한 게시물 신고 기능</ServiceFeature>
              <ServiceFeature>관리자 모니터링</ServiceFeature>
              <ServiceFeature>안전한 커뮤니티 운영</ServiceFeature>
            </ServiceFeatures>
          </ServiceCard>
        </ShowcaseGrid>
      </ServiceShowcase>

      {/* Call to Action */}
      <CallToActionSection>
        <CTATitle>지금 시작하세요!</CTATitle>
        <CTADescription>
          Zerogram과 함께 건강한 운동 라이프를 시작하고
          <br />
          새로운 운동 친구들을 만나보세요
        </CTADescription>
        <CTAButton variant="secondary" size="large" onClick={handleGetStarted}>
          무료로 시작하기
        </CTAButton>
      </CallToActionSection>
    </LandingContainer>
  );
};

export default LandingPage;
