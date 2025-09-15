// src/components/chat/SidebarListItem.tsx
import styles from "./SidebarListItem.module.css";
import type { ChatroomListItem } from "../../../types";
import { RiPushpin2Fill } from "react-icons/ri";
import { FaRunning, FaDumbbell } from "react-icons/fa";
import React from "react";
import { Link } from "react-router-dom";
import { useRoomsStore } from "../../../store";

type Props = {
  item: ChatroomListItem;
  selected?: boolean;
};

const RunningIcon = FaRunning as React.ComponentType<{ className?: string }>;
const FitnessIcon = FaDumbbell as React.ComponentType<{ className?: string }>;
const PinIcon = RiPushpin2Fill as React.ComponentType<{ className?: string }>;

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

export const SidebarListItem = ({ item, selected = false }: Props) => {
  const {
    id,
    roomName,
    roomImageUrl,
    memberCount,
    memberCapacity, // optional
    lastMessage,
    lastMessageAt, // ISO or null/undefined
    unreadCount,
    isPinned,
    workoutType, // optional
  } = item;

  const LeadingIcon =
    workoutType === "running"
      ? RunningIcon
      : workoutType === "fitness"
      ? FitnessIcon
      : null;

  const selectRoom = useRoomsStore((s) => s.selectRoom);

  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
      return;
    selectRoom(id);
  };

  const avatarFallback = "https://placehold.co/40x40?text=R";
  const timeText = fmtTime(lastMessageAt);

  return (
    <Link
      to={`/chat/${id}`}
      className={`${styles.item} ${selected ? styles.selected : ""}`}
      role="listitem"
      aria-label={`${roomName} 채팅방`}
      aria-current={selected ? "page" : undefined}
      onClick={handleClick}
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

      {/* 오른쪽 본문 */}
      <div className={styles.body}>
        {/* 상단 */}
        <div className={styles.topRow}>
          <div className={styles.titleRow}>
            {LeadingIcon && (
              <span className={styles.leadingIcon} aria-hidden="true">
                <LeadingIcon />
              </span>
            )}
            <span className={styles.roomName}>{roomName}</span>
            <span className={styles.memberCount}>
              {memberCount}
              {typeof memberCapacity === "number" ? `/${memberCapacity}` : ""}
            </span>
            {isPinned && (
              <span className={styles.pin} title="고정됨" aria-label="고정됨">
                <PinIcon />
              </span>
            )}
          </div>
          <div className={styles.time}>{timeText}</div>
        </div>

        {/* 하단 */}
        <div className={styles.bottomRow}>
          <div className={styles.lastMsg} title={lastMessage ?? ""}>
            {lastMessage ?? ""}
          </div>
          {unreadCount > 0 && (
            <div
              className={styles.badge}
              aria-label={`읽지 않음 ${unreadCount}개`}
            >
              {unreadCount}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
