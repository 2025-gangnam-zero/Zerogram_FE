import { VALIDATION_RULES, ERROR_MESSAGES } from "../constants";

// 이메일 유효성 검사
export const validateEmail = (email: string): string => {
  if (!email) {
    return ERROR_MESSAGES.REQUIRED.EMAIL;
  }
  if (!VALIDATION_RULES.EMAIL.REGEX.test(email)) {
    return VALIDATION_RULES.EMAIL.MESSAGE;
  }
  return "";
};

// 비밀번호 유효성 검사
export const validatePassword = (password: string): string => {
  if (!password) {
    return ERROR_MESSAGES.REQUIRED.PASSWORD;
  }
  if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    return VALIDATION_RULES.PASSWORD.MESSAGE;
  }
  return "";
};

// 비밀번호 확인 유효성 검사
export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): string => {
  if (!confirmPassword) {
    return ERROR_MESSAGES.REQUIRED.CONFIRM_PASSWORD;
  }
  if (password !== confirmPassword) {
    return ERROR_MESSAGES.MISMATCH.PASSWORD;
  }
  return "";
};

// 닉네임 유효성 검사
export const validateNickname = (nickname: string): string => {
  if (!nickname) {
    return ERROR_MESSAGES.REQUIRED.NICKNAME;
  }
  if (
    nickname.length < VALIDATION_RULES.NICKNAME.MIN_LENGTH ||
    nickname.length > VALIDATION_RULES.NICKNAME.MAX_LENGTH
  ) {
    return VALIDATION_RULES.NICKNAME.MESSAGE;
  }
  return "";
};

// 이름 유효성 검사
export const validateName = (name: string): string => {
  if (!name) {
    return ERROR_MESSAGES.REQUIRED.NAME;
  }
  return "";
};

// 폼 유효성 검사 타입
export interface FormErrors {
  [key: string]: string;
}

// 로그인 폼 유효성 검사
export const validateLoginForm = (formData: {
  email: string;
  pw: string;
}): FormErrors => {
  const errors: FormErrors = {};

  errors.email = validateEmail(formData.email);
  errors.pw = validatePassword(formData.pw);

  return errors;
};

// 회원가입 폼 유효성 검사
export const validateSignupForm = (formData: {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}): FormErrors => {
  const errors: FormErrors = {};

  errors.email = validateEmail(formData.email);
  errors.password = validatePassword(formData.password);
  errors.confirmPassword = validateConfirmPassword(
    formData.password,
    formData.confirmPassword
  );
  errors.name = validateName(formData.name);

  return errors;
};

// 폼에 에러가 있는지 확인
export const hasFormErrors = (errors: FormErrors): boolean => {
  return Object.values(errors).some((error) => error !== "");
};
