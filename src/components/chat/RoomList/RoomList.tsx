import { ServerRoom } from "../../../types";
import { RoomListItem } from "../RoomListItem";
import styles from "./RoomList.module.css";

type Props = {
  loading: boolean;
  rooms: ServerRoom[];
  onRefresh: () => void;
  onDelete: (id: string) => void;
};

export const RoomList = ({ loading, rooms, onRefresh, onDelete }: Props) => (
  <div className={styles.card}>
    <div className={styles.listHeader}>
      <h2 className={styles.subtitle}>내가 만든 채팅방</h2>
      <button onClick={onRefresh} className={styles.refreshBtn}>
        새로고침
      </button>
    </div>

    {loading ? (
      <div className={styles.empty}>불러오는 중…</div>
    ) : rooms.length === 0 ? (
      <div className={styles.empty}>아직 생성된 채팅방이 없습니다.</div>
    ) : (
      <ul className={styles.grid}>
        {rooms.map((r) => (
          <RoomListItem key={r.id} room={r} onDelete={onDelete} />
        ))}
      </ul>
    )}
  </div>
);
