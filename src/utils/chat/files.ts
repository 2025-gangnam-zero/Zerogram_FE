import { IncomingAttachment, PreviewItem } from "../../types";

export const previewsToAttachments = async (
  items: PreviewItem[]
): Promise<IncomingAttachment[]> =>
  Promise.all(
    items.map(async (p) => ({
      fileName: p.name,
      contentType: p.file.type || undefined,
      size: p.file.size,
      // width/height는 필요시 클라에서 미리 측정해 넣을 수 있음(없어도 무관)
      data: await p.file.arrayBuffer(),
    }))
  );
