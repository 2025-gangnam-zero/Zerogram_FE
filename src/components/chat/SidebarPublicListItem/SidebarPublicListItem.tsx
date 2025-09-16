// src/components/chat/SidebarPublicListItem.tsx
import React, { useState } from "react";
import styles from "./SidebarPublicListItem.module.css";
import type { PublicRoomListItemDto } from "../../../types";
import { FaRunning, FaDumbbell } from "react-icons/fa";

type Props = {
  item: PublicRoomListItemDto;
  isJoined: boolean;
  onJoin?: (roomId: string) => Promise<void> | void;
  onLeave?: (roomId: string) => Promise<void> | void;
};

const RunningIcon = FaRunning as React.ComponentType<{ className?: string }>;
const FitnessIcon = FaDumbbell as React.ComponentType<{ className?: string }>;

const fmtTime = (iso?: string | null) => {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const d = new Date(t);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const isAM = h < 12;
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${isAM ? "오전" : "오후"} ${hh}:${m}`;
};

export const SidebarPublicListItem: React.FC<Props> = ({
  item,
  isJoined,
  onJoin,
  onLeave,
}) => {
  const {
    id,
    roomName,
    roomImageUrl,
    memberCount,
    memberCapacity,
    lastMessage,
    lastMessageAt,
    workoutType,
  } = item;

  const LeadingIcon =
    workoutType === "running"
      ? RunningIcon
      : workoutType === "fitness"
      ? FitnessIcon
      : null;

  const full =
    typeof memberCapacity === "number" &&
    typeof memberCount === "number" &&
    memberCount >= memberCapacity;

  const avatarFallback = "https://placehold.co/40x40?text=R";
  const timeText = fmtTime(lastMessageAt);

  const [waiting, setWaiting] = useState(false);

  const handleJoin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!onJoin || waiting) return;
    try {
      setWaiting(true);
      await onJoin(id);
    } finally {
      setWaiting(false);
    }
  };

  const handleLeave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!onLeave || waiting) return;
    try {
      setWaiting(true);
      await onLeave(id);
    } finally {
      setWaiting(false);
    }
  };

  return (
    <div
      className={styles.item}
      role="listitem"
      aria-label={`${roomName} 공개 채팅방`}
    >
      {/* 왼쪽 아바타 */}
      <div className={styles.avatarWrap}>
        <img
          className={styles.avatar}
          src={roomImageUrl ?? avatarFallback}
          alt=""
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = avatarFallback;
          }}
          loading="lazy"
        />
      </div>

      {/* 본문 */}
      <div className={styles.body}>
        {/* 상단: 제목/카운트/아이콘 - 시간 */}
        <div className={styles.topRow}>
          <div className={styles.titleRow}>
            {LeadingIcon && (
              <span className={styles.leadingIcon} aria-hidden="true">
                <LeadingIcon />
              </span>
            )}
            <span className={styles.roomName}>{roomName}</span>
            <span className={styles.memberCount}>
              {memberCount ?? 0}
              {typeof memberCapacity === "number" ? `/${memberCapacity}` : ""}
            </span>
          </div>
          <div className={styles.time}>{timeText}</div>
        </div>

        {/* 하단: 마지막 메시지 + 가입 버튼 */}
        <div className={styles.bottomRow}>
          <div className={styles.lastMsg} title={lastMessage ?? ""}>
            {lastMessage ?? ""}
          </div>
          {isJoined ? (
            <button
              className={styles.leaveBtn}
              onClick={handleLeave}
              disabled={waiting || !onLeave}
              aria-label="채팅방 탈퇴"
              title="채팅방 탈퇴"
            >
              {waiting ? "탈퇴 중…" : "탈퇴"}
            </button>
          ) : (
            <button
              className={styles.joinBtn}
              onClick={handleJoin}
              disabled={waiting || !onJoin || full}
              aria-label="채팅방 가입"
              title="채팅방 가입"
            >
              {full ? "가득 참" : waiting ? "가입 중…" : "가입"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
