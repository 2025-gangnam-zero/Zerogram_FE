// src/components/chat/SidebarListItem.tsx
import styles from "./SidebarListItem.module.css";
import type { ChatroomListItem } from "../../../types";
import { RiPushpin2Fill } from "react-icons/ri";
import { FaRunning, FaDumbbell } from "react-icons/fa";
import React from "react";
import { Link } from "react-router-dom";

type Props = {
  item: ChatroomListItem;
  selected?: boolean;
};

const RunningIcon = FaRunning as React.ComponentType<{ className?: string }>;
const FitnessIcon = FaDumbbell as React.ComponentType<{ className?: string }>;
const PinIcon = RiPushpin2Fill as React.ComponentType<{ className?: string }>;

export const SidebarListItem = ({ item, selected = false }: Props) => {
  const {
    id,
    roomName,
    roomImageUrl,
    memberCount,
    memberCapacity,
    lastMessage,
    lastMessageAt,
    unreadCount,
    isPinned,
    workoutType,
  } = item;

  const LeadingIcon = workoutType === "running" ? RunningIcon : FitnessIcon;

  return (
    <Link
      to={`/chat/${id}`}
      className={`${styles.item} ${selected ? styles.selected : ""}`}
      role="listitem"
      aria-label={`${roomName} 채팅방`}
    >
      {/* 왼쪽 아바타 */}
      <div className={styles.avatarWrap}>
        <img className={styles.avatar} src={roomImageUrl} alt="" />
      </div>

      {/* 오른쪽 본문 */}
      <div className={styles.body}>
        {/* 상단 */}
        <div className={styles.topRow}>
          <div className={styles.titleRow}>
            <span className={styles.leadingIcon} aria-hidden="true">
              <LeadingIcon />
            </span>
            <span className={styles.roomName}>{roomName}</span>
            <span className={styles.memberCount}>
              {memberCount}/{memberCapacity}
            </span>
            {isPinned && (
              <span className={styles.pin} title="고정됨" aria-label="고정됨">
                <PinIcon />
              </span>
            )}
          </div>
          <div className={styles.time}>{lastMessageAt}</div>
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
