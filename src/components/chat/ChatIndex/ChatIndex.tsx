import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ChatIndex.module.css";
export type Room = {
  id: string; // 서버 응답 id (백엔드에서 _id -> id 로 매핑했다고 가정)
  roomName: string;
  roomImageUrl?: string;
  createdAt?: string;
};

export type RoomManualCreatorProps = {
  apiBase?: string; // "/api" 또는 호스트 (끝에 슬래시 X)
  authToken?: string;
  useMock?: boolean;
};

class RoomsApi {
  constructor(private base: string = "", private token?: string) {}

  private headers() {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (this.token) h["Authorization"] = `Bearer ${this.token}`;
    return h;
  }

  async list(): Promise<Room[]> {
    const res = await fetch(`${this.base}/rooms?limit=50`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`List rooms failed: ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data)) return data as Room[];
    return [];
  }

  async create(payload: {
    roomName: string;
    roomImageUrl?: string;
  }): Promise<Room> {
    const res = await fetch(`${this.base}/rooms`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Create room failed: ${res.status}`);
    return res.json();
  }

  async remove(roomId: string): Promise<void> {
    const res = await fetch(`${this.base}/rooms/${roomId}`, {
      method: "DELETE",
      headers: this.headers(),
    });
    if (!res.ok && res.status !== 204)
      throw new Error(`Delete room failed: ${res.status}`);
  }
}

class MockRoomsApi {
  private store: Room[] = [];
  async list(): Promise<Room[]> {
    await delay(200);
    return [...this.store].sort((a, b) =>
      (b.createdAt || "").localeCompare(a.createdAt || "")
    );
  }
  async create(payload: {
    roomName: string;
    roomImageUrl?: string;
  }): Promise<Room> {
    await delay(250);
    const now = new Date().toISOString();
    const room: Room = {
      id: `mock_${Math.random().toString(36).slice(2, 10)}`,
      roomName: payload.roomName,
      roomImageUrl: payload.roomImageUrl,
      createdAt: now,
    };
    this.store.unshift(room);
    return room;
  }
  async remove(roomId: string): Promise<void> {
    await delay(150);
    this.store = this.store.filter((r) => r.id !== roomId);
  }
}

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const show = (m: string) => {
    setMsg(m);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMsg(null), 2600);
  };
  const Toast = () => (msg ? <div className={styles.toast}>{msg}</div> : null);
  return { show, Toast } as const;
}

export const ChatIndex = ({
  apiBase = "",
  authToken,
  useMock = false,
}: RoomManualCreatorProps) => {
  const api = useMemo(
    () => (useMock ? new MockRoomsApi() : new RoomsApi(apiBase, authToken)),
    [apiBase, authToken, useMock]
  );
  const { show, Toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [form, setForm] = useState({ roomName: "", roomImageUrl: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const list = await api.list();
        if (mounted) setRooms(list);
      } catch (e: any) {
        show(e?.message || "방 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [api]);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!form.roomName.trim()) {
      show("방 이름을 입력하세요.");
      return;
    }
    setSubmitting(true);
    try {
      const created = await api.create({
        roomName: form.roomName.trim(),
        roomImageUrl: form.roomImageUrl.trim() || undefined,
      });
      setRooms((prev) => [created, ...prev]);
      setForm({ roomName: "", roomImageUrl: "" });
      show("채팅방이 생성되었습니다.");
    } catch (e: any) {
      show(e?.message || "채팅방 생성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (roomId: string) => {
    const ok = window.confirm(
      "정말 이 채팅방을 삭제할까요? 이 작업은 되돌릴 수 없습니다."
    );
    if (!ok) return;
    const prev = rooms;
    setRooms((list) => list.filter((r) => r.id !== roomId)); // 낙관적 업데이트
    try {
      await api.remove(roomId);
      show("삭제되었습니다.");
    } catch (e: any) {
      setRooms(prev); // 롤백
      show(e?.message || "삭제에 실패했습니다.");
    }
  };

  return (
    <div className={styles.container}>
      <Toast />

      {/* 헤더 */}
      <div className={styles.headerRow}>
        <h1 className={styles.title}>수동 채팅방 생성 · 삭제</h1>
        <span className={styles.modeBadge}>
          모드: {useMock ? "Mock" : "API"}
        </span>
      </div>

      {/* 카드: 방 생성 폼 */}
      <div className={styles.card}>
        <form onSubmit={onSubmit} className={styles.formGrid}>
          <div className={styles.formColWide}>
            <label className={styles.label}>방 이름 *</label>
            <input
              type="text"
              value={form.roomName}
              onChange={(e) =>
                setForm((f) => ({ ...f, roomName: e.target.value }))
              }
              placeholder="예) FE 스터디"
              className={styles.input}
            />
          </div>
          <div className={styles.formColWide}>
            <label className={styles.label}>방 이미지 URL</label>
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
              onClick={() => setForm({ roomName: "", roomImageUrl: "" })}
              className={styles.resetBtn}
            >
              초기화
            </button>
          </div>
        </form>
      </div>

      {/* 리스트 */}
      <div className={styles.card}>
        <div className={styles.listHeader}>
          <h2 className={styles.subtitle}>내가 만든 채팅방</h2>
          <button
            onClick={async () => {
              try {
                setLoading(true);
                const list = await api.list();
                setRooms(list);
              } catch (e: any) {
                show(e?.message || "목록 갱신 실패");
              } finally {
                setLoading(false);
              }
            }}
            className={styles.refreshBtn}
          >
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
              <li key={r.id} className={styles.cardItem}>
                <div className={styles.thumbWrap}>
                  {r.roomImageUrl ? (
                    <img
                      src={r.roomImageUrl}
                      alt={r.roomName}
                      className={styles.thumb}
                    />
                  ) : (
                    <div className={styles.thumbEmpty}>이미지 없음</div>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardRow}>
                    <h3 className={styles.cardTitle} title={r.roomName}>
                      {r.roomName}
                    </h3>
                    <button
                      onClick={() => onDelete(r.id)}
                      className={styles.deleteBtn}
                    >
                      삭제
                    </button>
                  </div>
                  <p className={styles.meta}>
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleString()
                      : "생성일 정보 없음"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className={styles.footerNote}>
        * 실서비스 전환 시, 관리자 라우트에 배치하고 API 모드로 사용하세요. 권한
        체크를 잊지 마세요.
      </p>
    </div>
  );
};
