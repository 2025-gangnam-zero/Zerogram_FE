import styles from "./ChatHeader.module.css";

type ChatHeaderProps = {
  roomName: string;
  roomDescription?: string;
  memberCount: number;
  memberCapacity?: number;
  roomImageUrl: string;
};

export const ChatHeader = ({
  roomName,
  roomDescription,
  memberCount,
  memberCapacity,
  roomImageUrl,
}: ChatHeaderProps) => {
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
