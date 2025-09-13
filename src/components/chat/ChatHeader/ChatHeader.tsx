import { Room } from "../../../types";
import styles from "./ChatHeader.module.css";

type Props = {
  room?: Room;
  subtitle?: string;
};

export const ChatHeader = ({ room, subtitle }: Props) => {
  return (
    <header className={styles.header}>
      <div className={styles.titleWrap}>
        <img
          className={styles.avatar}
          src={room?.roomImageUrl}
          alt={room?.roomName ?? "대화방"}
        />
        <div>
          <div className={styles.title}>{room?.roomName ?? "대화방"}</div>
          <div className={styles.subtitle}>
            {subtitle ? subtitle : room ? `${room.memberCount}명 참여 중` : ""}
          </div>
        </div>
      </div>
    </header>
  );
};
