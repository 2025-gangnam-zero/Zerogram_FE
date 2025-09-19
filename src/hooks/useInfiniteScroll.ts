import { useState, useEffect, useCallback } from "react";

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
}

interface UseInfiniteScrollReturn {
  loadMore: () => void;
  isIntersecting: boolean;
}

export const useInfiniteScroll = ({
  hasMore,
  isLoading,
  threshold = 100,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // 스크롤이 하단 근처에 도달했는지 확인
      const isNearBottom =
        scrollTop + windowHeight >= documentHeight - threshold;

      if (isNearBottom && hasMore && !isLoading) {
        setIsIntersecting(true);
      } else {
        setIsIntersecting(false);
      }
    };

    // 스크롤 이벤트 리스너 추가
    window.addEventListener("scroll", handleScroll, { passive: true });

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasMore, isLoading, threshold]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      // 실제 구현에서는 여기서 API 호출을 트리거
      console.log("Loading more data...");
    }
  }, [hasMore, isLoading]);

  return {
    loadMore,
    isIntersecting,
  };
};
