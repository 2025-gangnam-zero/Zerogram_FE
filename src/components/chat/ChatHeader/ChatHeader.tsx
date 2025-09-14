import styles from "./ChatHeader.module.css";
import { useParams } from "react-router-dom";
import { useRoomsStore } from "../../../store";

export const ChatHeader = () => {
  const roomId = useParams().roomId!;
  const room = useRoomsStore((s) => s.byId[roomId]);

  if (!room) return null;

  const {
    roomName,
    roomImageUrl,
    memberCapacity,
    memberCount,
    roomDescription,
  } = room;
  return (
    <div className={styles.header}>
      <div className={styles.avatarWrap}>
        <img
          className={styles.avatar}
          src={roomImageUrl}
          alt={`${roomName} 이미지`}
        />
      </div>

      <div className={styles.info}>
        <div className={styles.titleRow}>
          <h2 className={styles.roomName}>{roomName}</h2>
          <span className={styles.memberCount}>
            {memberCapacity
              ? `${memberCount}/${memberCapacity}`
              : `${memberCount}명`}
          </span>
        </div>
        {roomDescription && (
          <p className={styles.description}>{roomDescription}</p>
        )}
      </div>
    </div>
  );
};
