import styles from "./RoomForm.module.css";
import { useState } from "react";
import { WORKOUT_TYPE_OPTIONS } from "../../../constants";

type Props = {
  submitting: boolean;
  onSubmit: (form: {
    roomName: string;
    roomDescription?: string;
    roomImageUrl?: string;
    workoutType?: string;
    memberCapacity?: string;
  }) => Promise<boolean | void>;
};

export const RoomForm = ({ submitting, onSubmit }: Props) => {
  const [form, setForm] = useState({
    roomName: "",
    roomDescription: "",
    roomImageUrl: "",
    workoutType: "" as string,
    memberCapacity: "",
  });

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const ok = await onSubmit(form);
    if (ok) {
      setForm({
        roomName: "",
        roomDescription: "",
        roomImageUrl: "",
        workoutType: "",
        memberCapacity: "",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formGrid}>
      <div className={styles.formColWide}>
        <label className={styles.label}>방 이름 *</label>
        <input
          type="text"
          value={form.roomName}
          onChange={(e) => setForm((f) => ({ ...f, roomName: e.target.value }))}
          placeholder="예) FE 스터디"
          className={styles.input}
          required
        />
      </div>

      <div className={styles.formColWide}>
        <label className={styles.label}>설명</label>
        <input
          type="text"
          value={form.roomDescription}
          onChange={(e) =>
            setForm((f) => ({ ...f, roomDescription: e.target.value }))
          }
          placeholder="방에 대한 간단한 소개"
          className={styles.input}
        />
      </div>

      <div className={styles.formColWide}>
        <label className={styles.label}>이미지 URL</label>
        <input
          type="url"
          value={form.roomImageUrl}
          onChange={(e) =>
            setForm((f) => ({ ...f, roomImageUrl: e.target.value }))
          }
          placeholder="https://example.com/room.png"
          className={styles.input}
        />
      </div>

      <div className={styles.formCol}>
        <label className={styles.label}>운동 타입</label>
        <select
          value={form.workoutType}
          onChange={(e) =>
            setForm((f) => ({ ...f, workoutType: e.target.value }))
          }
          className={styles.select}
        >
          {WORKOUT_TYPE_OPTIONS.map((opt) => (
            <option key={opt || "(none)"} value={opt}>
              {opt || "(선택)"}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formCol}>
        <label className={styles.label}>정원</label>
        <input
          type="number"
          min={1}
          inputMode="numeric"
          value={form.memberCapacity}
          onChange={(e) =>
            setForm((f) => ({ ...f, memberCapacity: e.target.value }))
          }
          placeholder="예) 50"
          className={styles.input}
        />
      </div>

      <div className={styles.formActions}>
        <button
          type="submit"
          disabled={submitting}
          className={styles.primaryBtn}
        >
          {submitting ? "생성 중…" : "채팅방 생성"}
        </button>
        <button
          type="button"
          onClick={() =>
            setForm({
              roomName: "",
              roomDescription: "",
              roomImageUrl: "",
              workoutType: "",
              memberCapacity: "",
            })
          }
          className={styles.resetBtn}
        >
          초기화
        </button>
      </div>
    </form>
  );
};
