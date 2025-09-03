// 문자열 유틸리티 함수들

// 이니셜 생성 (프로필 이미지용)
export const getInitials = (name: string): string => {
  if (!name) return "U";
  return name.charAt(0).toUpperCase();
};

// 문자열 자르기
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + "...";
};

// 카멜케이스로 변환
export const toCamelCase = (str: string): string => {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

// 파스칼케이스로 변환
export const toPascalCase = (str: string): string => {
  return str.replace(/(^|-)([a-z])/g, (g) => g[1].toUpperCase());
};

// 케밥케이스로 변환
export const toKebabCase = (str: string): string => {
  return str.replace(/([A-Z])/g, "-$1").toLowerCase();
};
