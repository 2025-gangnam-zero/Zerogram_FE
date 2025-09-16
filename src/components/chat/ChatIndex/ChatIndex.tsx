import styles from "./ChatIndex.module.css";
import { useToast } from "../../../hooks/useToast";
import { Toast } from "../Toast";
import { RoomForm, RoomList } from "../../../components/chat";
import { useRoomsPage } from "../../../hooks/useRoomsPage";

export const ChatIndex = () => {
  const { msg, show } = useToast();
  const { loading, rooms, submitting, refresh, create, remove } =
    useRoomsPage(show);

  return (
    <div className={styles.container}>
      <Toast message={msg} />

      <div className={styles.headerRow}>
        <h1 className={styles.title}>수동 채팅방 생성 · 삭제</h1>
        <span className={styles.modeBadge}>모드: API</span>
      </div>

      <div className={styles.card}>
        <RoomForm submitting={submitting} onSubmit={create} />
      </div>

      <RoomList
        loading={loading}
        rooms={rooms}
        onRefresh={refresh}
        onDelete={remove}
      />

      <p className={styles.footerNote}>
        * 실서비스 전환 시, 관리자 라우트에 배치하고 API 모드로 사용하세요. 권한
        체크를 잊지 마세요.
      </p>
    </div>
  );
};
