import { OAUTH_CONFIG } from "../constants";

/**
 * Google OAuth 로그인 URL 생성
 */
export const generateGoogleOAuthURL = (): string => {
  const { CLIENT_ID, REDIRECT_URI, AUTH_URL, RESPONSE_TYPE, SCOPE, STATE } =
    OAUTH_CONFIG.GOOGLE;

  if (!CLIENT_ID) {
    throw new Error("Google OAuth Client ID가 설정되지 않았습니다.");
  }

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: RESPONSE_TYPE,
    scope: SCOPE,
    state: STATE,
    access_type: "offline",
    prompt: "consent",
  });

  return `${AUTH_URL}?${params.toString()}`;
};

/**
 * OAuth 상태 값 검증
 */
export const validateOAuthState = (
  receivedState: string,
  expectedState: string
): boolean => {
  return receivedState === expectedState;
};

/**
 * Google OAuth 에러 처리
 */
export const handleGoogleOAuthError = (
  error: string,
  errorDescription?: string
) => {
  const errorMessages: Record<string, string> = {
    access_denied: "Google 로그인이 취소되었습니다.",
    unauthorized_client: "승인되지 않은 클라이언트입니다.",
    invalid_request: "잘못된 요청입니다.",
    unsupported_response_type: "지원하지 않는 응답 유형입니다.",
    invalid_scope: "잘못된 권한 범위입니다.",
    server_error: "Google 서버 오류가 발생했습니다.",
    temporarily_unavailable: "Google 서비스가 일시적으로 사용할 수 없습니다.",
  };

  const message = errorMessages[error] || `Google OAuth 오류: ${error}`;
  console.error("Google OAuth Error:", { error, errorDescription, message });

  return {
    error,
    errorDescription,
    message,
  };
};

/**
 * 팝업 창으로 Google OAuth 처리 (선택사항)
 */
export const openGoogleOAuthPopup = (
  url: string
): Promise<{ code?: string; error?: string }> => {
  return new Promise((resolve, reject) => {
    const popup = window.open(
      url,
      "google-oauth",
      "width=500,height=600,scrollbars=yes,resizable=yes"
    );

    if (!popup) {
      reject(new Error("팝업을 열 수 없습니다. 팝업 차단을 해제해주세요."));
      return;
    }

    // 팝업 창 감시
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        reject(new Error("Google 로그인이 취소되었습니다."));
      }
    }, 1000);

    // 메시지 리스너 (팝업에서 부모 창으로 결과 전송)
    const messageListener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "GOOGLE_OAUTH_SUCCESS") {
        clearInterval(checkClosed);
        popup.close();
        window.removeEventListener("message", messageListener);
        resolve({ code: event.data.code });
      } else if (event.data.type === "GOOGLE_OAUTH_ERROR") {
        clearInterval(checkClosed);
        popup.close();
        window.removeEventListener("message", messageListener);
        resolve({ error: event.data.error });
      }
    };

    window.addEventListener("message", messageListener);
  });
};
