import styles from "./RoomListItem.module.css";
import { ServerRoom } from "../../../types";

type Props = {
  room: ServerRoom;
  onDelete: (id: string) => void;
};

export const RoomListItem = ({ room: r, onDelete }: Props) => (
  <li className={styles.cardItem}>
    <div className={styles.thumbWrap}>
      {r.roomImageUrl ? (
        <img src={r.roomImageUrl} alt={r.roomName} className={styles.thumb} />
      ) : (
        <div className={styles.thumbEmpty}>이미지 없음</div>
      )}
    </div>
    <div className={styles.cardBody}>
      <div className={styles.cardRow}>
        <h3 className={styles.cardTitle} title={r.roomName}>
          {r.roomName}
        </h3>
        <button onClick={() => onDelete(r.id)} className={styles.deleteBtn}>
          삭제
        </button>
      </div>
      <p className={styles.meta}>
        {r.workoutType ? `타입: ${r.workoutType} · ` : ""}
        {typeof r.memberCapacity === "number"
          ? `정원: ${r.memberCapacity} · `
          : ""}
        {r.createdAt
          ? new Date(r.createdAt).toLocaleString()
          : "생성일 정보 없음"}
      </p>
    </div>
  </li>
);
