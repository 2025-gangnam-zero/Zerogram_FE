import { useRef } from "react";
import type { Socket } from "socket.io-client";
import { getSocket } from "../utils";

export const useSocket = () => {
  const ref = useRef<Socket>(null);
  if (!ref.current) ref.current = getSocket();
  return ref.current;
};
