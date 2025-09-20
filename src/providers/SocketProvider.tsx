import { ReactNode, useEffect, useMemo } from "react";
import { createSocket, updateSessionId } from "../utils";

type Props = {
  sessionId?: string | null;
  children: ReactNode;
};

export const SocketProvider = ({ sessionId, children }: Props) => {
  // 최초 1회 소켓 생성
  useMemo(() => {
    createSocket({ sessionId });
    // autoConnect=true 이므로 생성 즉시 연결 시도
  }, []);

  // sessionId 변경 시 auth 업데이트 (필요 시 재연결은 socket.io가 처리)
  useEffect(() => {
    updateSessionId(sessionId ?? null);
  }, [sessionId]);

  return <>{children}</>;
};
