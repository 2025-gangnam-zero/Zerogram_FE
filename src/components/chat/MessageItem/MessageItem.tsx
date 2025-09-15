// src/pages/ChatSection/MessageItem.tsx
import { ChatMessage } from "../../../types";
import { isImageUrl } from "../../../utils";
import { LinkPreview } from "../LinkPreview";
import styles from "./MessageItem.module.css";

type Props = {
  message: ChatMessage;
  onImageClick?: (src: string, index: number, all: string[]) => void;
};

// 텍스트 내의 URL을 a 태그로 바꿔주는 유틸
const linkify = (text: string) => {
  const regex = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/gi;
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const raw = match[0];
    const href = raw.startsWith("http") ? raw : `https://${raw}`;
    nodes.push(
      <a
        key={`lnk-${match.index}`}
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={styles.inlineLink}
      >
        {raw}
      </a>
    );
    last = regex.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <span className={styles.linkified}>{nodes}</span>;
};

export const MessageItem = ({ message, onImageClick }: Props) => {
  const mine = !!message.isMine;
  const unread = message.unreadByCount;

  // ✅ attachments에서 image인 것만 URL 뽑기
  const images =
    message.attachments
      ?.filter((a) => a.kind === "image" && !!a.url)
      .map((a) => a.url!) ?? [];
  const hasImages = images.length > 0;

  const raw = message.content ?? "";

  // URL 감지 (raw URL 추출)
  const urlMatch = raw.match(/(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/i);
  const firstUrlRaw = urlMatch?.[0];
  const firstUrl = firstUrlRaw
    ? firstUrlRaw.startsWith("http")
      ? firstUrlRaw
      : `https://${firstUrlRaw}`
    : null;

  // 링크 미리보기: 이미지가 없고, URL이 이미지가 아닐 때만
  const showLinkPreview = !!firstUrl && !isImageUrl(firstUrl) && !hasImages;

  // 텍스트(아래 표시용): URL은 제거
  const textBelow =
    showLinkPreview && firstUrlRaw
      ? raw.replace(firstUrlRaw, "").trim()
      : raw.trim();

  const hasText = raw.trim().length > 0;

  const gridClass =
    images.length === 1
      ? styles.c1
      : images.length === 2
      ? styles.c2
      : images.length === 3
      ? styles.c3
      : images.length === 4
      ? styles.c4
      : styles.cMore;

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.currentTarget as HTMLImageElement).src =
      "https://placehold.co/300x200?text=IMG";
  };

  return (
    <div
      role="listitem"
      className={`${styles.row} ${mine ? styles.mine : styles.theirs}`}
    >
      {!mine && (
        <img
          className={styles.avatar}
          src={message.author.avatarUrl}
          alt={`${message.author.name} 아바타`}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://placehold.co/32x32?text=?";
          }}
        />
      )}

      <div className={styles.stack}>
        {!mine && (
          <div className={styles.authorName}>{message.author.name}</div>
        )}

        {/* 말풍선/미리보기 + 메타를 한 줄에 배치 */}
        <div className={`${styles.bubbleLine} ${mine ? styles.reverse : ""}`}>
          {/* ⬇️ 콘텐츠 컬럼: 링크 미리보기 → (이미지 or 텍스트) 순으로 세로 배치 */}
          <div className={styles.contentCol}>
            {showLinkPreview && <LinkPreview url={firstUrl!} />}

            {hasImages && (
              <div className={`${styles.imageGrid} ${gridClass}`}>
                {images.map((url, idx) => (
                  <img
                    key={idx}
                    className={styles.image}
                    src={url}
                    alt="메시지 이미지"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={handleImgError}
                    onClick={() => onImageClick?.(url, idx, images)}
                  />
                ))}
              </div>
            )}

            {hasText && (
              <div className={styles.bubble}>
                {linkify(raw)} {/* URL을 삭제하지 않고 링크로 치환 */}
              </div>
            )}
          </div>

          {/* 메타: 안읽음(위) → 시간(아래) */}
          <div className={styles.meta}>
            {typeof unread === "number" && (
              <span
                className={`${styles.receipt} ${
                  unread === 0 ? styles.readAll : ""
                }`}
                title={unread === 0 ? "모두 읽음" : `안 읽음 ${unread}명`}
                aria-label={unread === 0 ? "모두 읽음" : `안 읽음 ${unread}명`}
              >
                {unread === 0 ? "모두 읽음" : unread}
              </span>
            )}
            {/* createdAt은 ISO string이므로 그대로 표시하거나 포맷터 적용 */}
            <span className={styles.time}>{message.createdAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
