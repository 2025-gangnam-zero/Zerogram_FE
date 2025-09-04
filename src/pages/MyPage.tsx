import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useUserStore } from "../store/userStore";
import { useAuthStore } from "../store/authStore";
import { updateUserInfoApi } from "../api/auth";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { showErrorAlert, showSuccessAlert, getInitials } from "../utils";

const MyPageContainer = styled.div`
  padding: 40px 20px;
  max-width: 800px;
  margin: 0 auto;
  min-height: 80vh;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: 700;
  text-align: center;
`;

const ProfileSection = styled.div`
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #ecf0f1;
`;

const ProfileImage = styled.div<{ $imageUrl?: string }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${(props) =>
    props.$imageUrl
      ? `url(${props.$imageUrl}) center/cover`
      : "linear-gradient(135deg, #3498db, #9b59b6)"};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 32px;
  font-weight: bold;
  margin-right: 20px;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h2`
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0 0 8px 0;
`;

const ProfileEmail = styled.p`
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0;
`;

const InfoSection = styled.div`
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: 600;
`;

const InfoGrid = styled.div`
  display: grid;
  gap: 20px;
  margin-bottom: 30px;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
`;

const InfoValue = styled.span`
  color: #34495e;
  font-size: 1rem;
`;

const EditForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const LoadingText = styled.p`
  font-size: 1.2rem;
  color: #3498db;
  text-align: center;
`;

const ErrorText = styled.p`
  font-size: 1.2rem;
  color: #e74c3c;
  text-align: center;
`;

const MyPage: React.FC = () => {
  const {
    id,
    nickname,
    email,
    password,
    profile_image,
    isLoading,
    error,
    login_type,
    fetchUserInfo,
    setUser,
  } = useUserStore();
  const { isLoggedIn, checkAuthStatus } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{
    nickname: string;
    email: string;
    password: string;
    profile_image: string;
    login_type: string;
  }>({
    nickname: nickname || "",
    email: email || "",
    password: password || "",
    profile_image: profile_image || "",
    login_type: login_type || "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const actualIsLoggedIn = checkAuthStatus();

    if (actualIsLoggedIn && !nickname && !isLoading && !error) {
      fetchUserInfo().catch((error: unknown) => {
        console.error("사용자 정보 조회 실패:", error);
      });
    }
  }, [isLoggedIn, nickname, isLoading, error, fetchUserInfo, checkAuthStatus]);

  // 편집 모드 시작 시 현재 정보로 폼 초기화
  useEffect(() => {
    if (isEditing && nickname && email && password) {
      setEditForm({
        nickname: nickname,
        email: email,
        password: password,
        profile_image: profile_image || "",
        login_type: login_type || "",
      });
    }
  }, [isEditing, nickname, email, password, profile_image, login_type]);

  const actualIsLoggedIn = checkAuthStatus();

  if (!actualIsLoggedIn) {
    return (
      <MyPageContainer>
        <ErrorText>로그인이 필요합니다.</ErrorText>
      </MyPageContainer>
    );
  }

  if (isLoading) {
    return (
      <MyPageContainer>
        <LoadingText>사용자 정보를 불러오는 중...</LoadingText>
      </MyPageContainer>
    );
  }

  if (error) {
    return (
      <MyPageContainer>
        <ErrorText>오류: {error}</ErrorText>
      </MyPageContainer>
    );
  }

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      nickname: nickname || "",
      email: email || "",
      password: password || "",
      profile_image: profile_image || "",
      login_type: login_type || "",
    });
  };

  const handleInputChange =
    (field: "nickname" | "email" | "password" | "profile_image") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSaveClick = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSaving(true);

    try {
      // 업데이트할 데이터 준비 - 공백이 아닌 필드만 포함
      const updateData: {
        nickname?: string;
        password?: string;
        profile_image?: string;
      } = {};

      // 닉네임이 입력되었을 때만 포함
      if (editForm.nickname.trim()) {
        updateData.nickname = editForm.nickname.trim();
      }

      // 비밀번호가 입력되었을 때만 포함
      if (editForm.password.trim()) {
        updateData.password = editForm.password.trim();
      }

      if (editForm.profile_image.trim()) {
        updateData.profile_image = editForm.profile_image.trim();
      }

      // 업데이트할 필드가 하나도 없으면 경고
      if (Object.keys(updateData).length === 0) {
        showErrorAlert("수정할 정보를 입력해주세요.");
        return;
      }

      // 서버에 업데이트 요청
      const response = await updateUserInfoApi(updateData);
      console.log("response", response);

      // 성공 시 로컬 상태 업데이트 - 변경된 필드만 업데이트
      setUser({
        id: id || "",
        nickname: updateData.nickname || nickname || "", // 새로운 값 또는 기존 값 유지
        password: updateData.password || password || "", // 새로운 값 또는 기존 값 유지
        profile_image: updateData.profile_image || profile_image || "",
        sessionId: useUserStore.getState().sessionId || "",
        login_type: "normal",
      });

      setIsEditing(false);
      showSuccessAlert("정보가 수정되었습니다.");
    } catch (error) {
      console.error("정보 수정 실패:", error);
      showErrorAlert(
        `정보 수정에 실패했습니다: ${
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다."
        }`
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MyPageContainer>
      <Title>마이페이지</Title>

      <ProfileSection>
        <ProfileHeader>
          <ProfileImage $imageUrl={profile_image || undefined}>
            {!profile_image && getInitials(nickname || "사용자")}
          </ProfileImage>
          <ProfileInfo>
            <ProfileName>{nickname || "사용자"}</ProfileName>
            <ProfileEmail>{email || "이메일 없음"}</ProfileEmail>
          </ProfileInfo>
        </ProfileHeader>
      </ProfileSection>

      <InfoSection>
        <SectionTitle>내 정보</SectionTitle>

        {!isEditing ? (
          <>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>사용자 ID</InfoLabel>
                <InfoValue>{id || "정보 없음"}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>닉네임</InfoLabel>
                <InfoValue>{nickname || "정보 없음"}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>이메일</InfoLabel>
                <InfoValue>{email || "정보 없음"}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>비밀번호</InfoLabel>
                <InfoValue>{password || "정보 없음"}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>로그인 방식</InfoLabel>
                <InfoValue>{login_type || "정보 없음"}</InfoValue>
              </InfoItem>
            </InfoGrid>

            <ButtonContainer>
              <Button
                type="button"
                variant="primary"
                size="medium"
                onClick={handleEditClick}
              >
                정보 수정
              </Button>
            </ButtonContainer>
          </>
        ) : (
          <EditForm onSubmit={handleSaveClick}>
            <Input
              label="프로필_이미지"
              type="file"
              placeholder="프로필 이미지를 선택하세요"
              value={editForm.profile_image}
              onChange={handleInputChange("profile_image")}
            />
            <Input
              label="닉네임"
              type="text"
              placeholder="닉네임을 입력하세요"
              value={editForm.nickname}
              onChange={handleInputChange("nickname")}
            />
            <Input
              label="이메일"
              type="email"
              placeholder="이메일을 입력하세요"
              value={editForm.email}
              onChange={handleInputChange("email")}
              disabled
            />
            <Input
              label="비밀번호"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={editForm.password}
              onChange={handleInputChange("password")}
            />

            <ButtonContainer>
              <Button
                type="button"
                variant="secondary"
                size="medium"
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="medium"
                disabled={isSaving}
              >
                {isSaving ? "저장 중..." : "저장"}
              </Button>
            </ButtonContainer>
          </EditForm>
        )}
      </InfoSection>
    </MyPageContainer>
  );
};

export default MyPage;
