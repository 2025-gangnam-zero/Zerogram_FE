// UI 관련 상수
export const UI_CONSTANTS = {
  COLORS: {
    PRIMARY: "rgb(27, 219, 49)",
    PRIMARY_HOVER: "#2980b9",
    SECONDARY: "#95a5a6",
    SECONDARY_HOVER: "#7f8c8d",
    DANGER: "#e74c3c",
    DANGER_HOVER: "#c0392b",
    SUCCESS: "#27ae60",
    WARNING: "#f39c12",
    INFO: "#3498db",
    LIGHT: "#ecf0f1",
    DARK: "#2c3e50",
    MUTED: "#7f8c8d",
    BORDER: "#e1e8ed",
    BACKGROUND: "#ffffff",
    BACKGROUND_LIGHT: "#f8f9fa", // 추가
    TEXT_PRIMARY: "#2c3e50",
    TEXT_SECONDARY: "#7f8c8d",
    ERROR: "#e74c3c", // 추가
  },
  SPACING: {
    XS: "4px",
    SM: "8px",
    MD: "16px",
    LG: "24px",
    XL: "32px",
    XXL: "40px",
  },
  BORDER_RADIUS: {
    SM: "4px",
    MD: "8px",
    LG: "16px",
    ROUND: "50%",
  },
  SHADOWS: {
    SM: "0 2px 4px rgba(0, 0, 0, 0.1)",
    MD: "0 4px 8px rgba(0, 0, 0, 0.1)",
    LG: "0 10px 30px rgba(0, 0, 0, 0.1)",
    XL: "0 4px 12px rgba(52, 152, 219, 0.3)",
  },
  TRANSITIONS: {
    FAST: "0.15s ease",
    NORMAL: "0.3s ease",
    SLOW: "0.5s ease",
  },
} as const;

export const LAYOUT_CONSTANTS = {
  HEADER_HEIGHT: "70px",
  FOOTER_HEIGHT: "200px",
  MAX_WIDTH: "1200px",
  CONTAINER_PADDING: "20px",
} as const;
