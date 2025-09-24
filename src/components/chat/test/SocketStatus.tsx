import { useEffect, useState } from "react";
import { useSocket } from "../../../hooks/useSocket";

export const SocketStatus = () => {
  const socket = useSocket();
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  return <div>Socket: {connected ? "connected" : "disconnected"}</div>;
};
