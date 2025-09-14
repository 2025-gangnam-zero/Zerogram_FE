import { useEffect, useState } from "react";
import styles from "./LinkPreview.module.css";

type Props = {
  url: string;
};

type Preview = {
  title?: string;
  description?: string;
  thumbnail_url?: string;
  provider_name?: string;
};

export const LinkPreview = ({ url }: Props) => {
  const [data, setData] = useState<Preview | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `https://noembed.com/embed?url=${encodeURIComponent(url)}`
        );
        if (!res.ok) throw new Error(`noembed ${res.status}`);
        const json = (await res.json()) as any;
        if (!cancelled) {
          setData({
            title: json.title,
            description: json.author_name || json.provider_name,
            thumbnail_url: json.thumbnail_url,
            provider_name: json.provider_name,
          });
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "preview-failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  const u = new URL(url);
  const domain = u.hostname.replace(/^www\./, "");

  return (
    <a className={styles.card} href={url} target="_blank" rel="noreferrer">
      {data?.thumbnail_url ? (
        <img
          className={styles.thumb}
          src={data.thumbnail_url}
          alt=""
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : null}

      <div className={styles.info}>
        <div className={styles.title}>{data?.title || url}</div>
        <div className={styles.desc}>
          {data?.description || data?.provider_name || domain}
        </div>
        <div className={styles.domain}>{domain}</div>
      </div>
    </a>
  );
};
