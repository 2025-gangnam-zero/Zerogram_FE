import { create } from "zustand";
import { Meet, MeetFormData, Location } from "../types/meet";
import { WorkoutType } from "../types/workout";
import {
  getMeetListApi,
  getMeetApi,
  createMeetApi,
  updateMeetApi,
  deleteMeetApi,
  createCommentApi,
  updateCommentApi,
  deleteCommentApi,
  toggleCrewApi,
} from "../api/meet";
import { useUserStore } from "./userStore";

interface MeetStoreState {
  // 데이터
  meets: Meet[];
  currentMeet: Meet | null;

  // 로딩 및 에러 상태
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // 페이지네이션
  hasMore: boolean;
  currentPage: number;
  totalCount: number;

  // 필터링
  filters: {
    location: Location | "all";
    workout_type: WorkoutType | "all";
    searchTerm: string;
  };

  // UI 상태
  selectedMeetId: string | null;
  isDetailModalOpen: boolean;
  isFormModalOpen: boolean;
}

interface MeetStoreActions {
  // 데이터 조회
  fetchMeets: (reset?: boolean) => Promise<void>;
  fetchMeetById: (meetId: string) => Promise<void>;
  refreshMeets: () => Promise<void>;

  // CRUD 작업
  createMeet: (formData: MeetFormData) => Promise<void>;
  updateMeet: (meetId: string, formData: MeetFormData) => Promise<void>;
  deleteMeet: (meetId: string) => Promise<void>;

  // 댓글 관리
  addComment: (meetId: string, content: string) => Promise<void>;
  updateComment: (
    meetId: string,
    commentId: string,
    content: string
  ) => Promise<void>;
  deleteComment: (meetId: string, commentId: string) => Promise<void>;

  // 참여자 관리
  toggleCrew: (meetId: string) => Promise<void>;

  // 필터링
  setFilters: (filters: Partial<MeetStoreState["filters"]>) => void;
  clearFilters: () => void;
  applyFilters: () => Promise<void>;

  // UI 상태 관리
  setSelectedMeet: (meet: Meet | null) => void;
  setSelectedMeetId: (meetId: string | null) => void;
  openDetailModal: (meetId: string) => void;
  closeDetailModal: () => void;
  openFormModal: () => void;
  closeFormModal: () => void;

  // 상태 초기화
  clearError: () => void;
  reset: () => void;
}

const ITEMS_PER_PAGE = 16;

export const useMeetStore = create<MeetStoreState & MeetStoreActions>(
  (set, get) => ({
    // 초기 상태
    meets: [],
    currentMeet: null,
    isLoading: false,
    isSubmitting: false,
    error: null,
    hasMore: true,
    currentPage: 1,
    totalCount: 0,
    filters: {
      location: "all",
      workout_type: "all",
      searchTerm: "",
    },
    selectedMeetId: null,
    isDetailModalOpen: false,
    isFormModalOpen: false,

    // 데이터 조회
    fetchMeets: async (reset = false) => {
      const { filters, currentPage, meets } = get();

      if (get().isLoading) return;

      set({ isLoading: true, error: null });

      try {
        const page = reset ? 1 : currentPage;
        const skip = (page - 1) * ITEMS_PER_PAGE;

        const params = {
          skip,
          limit: ITEMS_PER_PAGE,
          ...(filters.location !== "all" && { location: filters.location }),
          ...(filters.workout_type !== "all" && {
            workout_type: filters.workout_type,
          }),
          ...(filters.searchTerm && { q: filters.searchTerm }),
        };

        const response = await getMeetListApi(params);
        const newMeets = response.data.meets;

        set({
          meets: reset ? newMeets : [...meets, ...newMeets],
          hasMore: newMeets.length === ITEMS_PER_PAGE,
          currentPage: page + 1,
          isLoading: false,
          totalCount: response.data.meets.length,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "모집글을 불러올 수 없습니다.";
        set({
          error: errorMessage,
          isLoading: false,
        });
        console.error("모집글 목록 조회 실패:", error);
      }
    },

    fetchMeetById: async (meetId: string) => {
      if (get().isLoading) return;

      set({ isLoading: true, error: null });

      try {
        const response = await getMeetApi(meetId);
        set({
          currentMeet: response.data.meet,
          isLoading: false,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "모집글을 불러올 수 없습니다.";
        set({
          error: errorMessage,
          isLoading: false,
        });
        console.error("모집글 상세 조회 실패:", error);
      }
    },

    refreshMeets: async () => {
      set({ currentPage: 1, hasMore: true });
      await get().fetchMeets(true);
    },

    // CRUD 작업
    createMeet: async (formData: MeetFormData) => {
      if (get().isSubmitting) return;

      set({ isSubmitting: true, error: null });

      try {
        const response = await createMeetApi(formData);
        const rawMeet = response.data.meet as any;

        // Mongoose 문서 객체에서 실제 데이터 추출
        const newMeet = {
          _id: rawMeet._doc?._id || rawMeet._id,
          userId: rawMeet._doc?.userId || rawMeet.userId,
          title: rawMeet._doc?.title || rawMeet.title,
          description: rawMeet._doc?.description || rawMeet.description,
          workout_type: rawMeet._doc?.workout_type || rawMeet.workout_type,
          location: rawMeet._doc?.location || rawMeet.location,
          images: rawMeet._doc?.images || rawMeet.images || [],
          crews: rawMeet._doc?.crews || rawMeet.crews || [],
          comments: rawMeet._doc?.comments || rawMeet.comments || [],
          createdAt: rawMeet._doc?.createdAt || rawMeet.createdAt,
          updatedAt: rawMeet._doc?.updatedAt || rawMeet.updatedAt,
          nickname: rawMeet.nickname,
          profile_image: rawMeet.profile_image,
        };

        set((state) => ({
          meets: [newMeet, ...state.meets],
          isSubmitting: false,
          isFormModalOpen: false,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "모집글 생성에 실패했습니다.";
        set({
          error: errorMessage,
          isSubmitting: false,
        });
        console.error("모집글 생성 실패:", error);
        throw error;
      }
    },

    updateMeet: async (meetId: string, formData: MeetFormData) => {
      if (get().isSubmitting) return;

      set({ isSubmitting: true, error: null });

      try {
        const response = await updateMeetApi(meetId, formData);
        const rawMeet = response.data.meet as any;

        // Mongoose 문서 객체에서 실제 데이터 추출
        const updatedMeet = {
          _id: rawMeet._doc?._id || rawMeet._id,
          userId: rawMeet._doc?.userId || rawMeet.userId,
          title: rawMeet._doc?.title || rawMeet.title,
          description: rawMeet._doc?.description || rawMeet.description,
          workout_type: rawMeet._doc?.workout_type || rawMeet.workout_type,
          location: rawMeet._doc?.location || rawMeet.location,
          images: rawMeet._doc?.images || rawMeet.images || [],
          crews: rawMeet._doc?.crews || rawMeet.crews || [],
          comments: rawMeet._doc?.comments || rawMeet.comments || [],
          createdAt: rawMeet._doc?.createdAt || rawMeet.createdAt,
          updatedAt: rawMeet._doc?.updatedAt || rawMeet.updatedAt,
          nickname: rawMeet.nickname,
          profile_image: rawMeet.profile_image,
        };

        // 게시글 수정 완료

        set((state) => ({
          meets: state.meets.map((meet) =>
            meet._id === meetId ? updatedMeet : meet
          ),
          currentMeet:
            state.currentMeet?._id === meetId ? updatedMeet : state.currentMeet,
          isSubmitting: false,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "모집글 수정에 실패했습니다.";
        set({
          error: errorMessage,
          isSubmitting: false,
        });
        console.error("모집글 수정 실패:", error);
        throw error;
      }
    },

    deleteMeet: async (meetId: string) => {
      if (get().isSubmitting) return;

      set({ isSubmitting: true, error: null });

      try {
        await deleteMeetApi(meetId);

        set((state) => ({
          meets: state.meets.filter((meet) => meet._id !== meetId),
          currentMeet:
            state.currentMeet?._id === meetId ? null : state.currentMeet,
          isSubmitting: false,
          isDetailModalOpen: false,
          selectedMeetId: null,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "모집글 삭제에 실패했습니다.";
        set({
          error: errorMessage,
          isSubmitting: false,
        });
        console.error("모집글 삭제 실패:", error);
        throw error;
      }
    },

    // 댓글 관리
    addComment: async (meetId: string, content: string) => {
      if (get().isSubmitting) return;

      set({ isSubmitting: true, error: null });

      try {
        const response = await createCommentApi(meetId, content);
        const rawComment = response.data.comment as any;

        // Mongoose 문서 객체에서 실제 데이터 추출
        const newComment = {
          _id: rawComment._doc?._id || rawComment._id,
          userId: rawComment._doc?.userId || rawComment.userId,
          content: rawComment._doc?.content || rawComment.content,
          createdAt: rawComment._doc?.createdAt || rawComment.createdAt,
          updatedAt: rawComment._doc?.updatedAt || rawComment.updatedAt,
          nickname: rawComment.nickname,
          profile_image: rawComment.profile_image,
        };

        // 댓글 생성 완료

        set((state) => ({
          meets: state.meets.map((meet) =>
            meet._id === meetId
              ? { ...meet, comments: [...meet.comments, newComment] }
              : meet
          ),
          currentMeet:
            state.currentMeet?._id === meetId
              ? {
                  ...state.currentMeet,
                  comments: [...state.currentMeet.comments, newComment],
                }
              : state.currentMeet,
          isSubmitting: false,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "댓글 작성에 실패했습니다.";
        set({
          error: errorMessage,
          isSubmitting: false,
        });
        console.error("댓글 생성 실패:", error);
        throw error;
      }
    },

    updateComment: async (
      meetId: string,
      commentId: string,
      content: string
    ) => {
      if (get().isSubmitting) return;

      set({ isSubmitting: true, error: null });

      try {
        const response = await updateCommentApi(meetId, commentId, content);
        const rawComment = response.data.comment as any;

        // Mongoose 문서 객체에서 실제 데이터 추출
        const updatedComment = {
          _id: rawComment._doc?._id || rawComment._id,
          userId: rawComment._doc?.userId || rawComment.userId,
          content: rawComment._doc?.content || rawComment.content,
          createdAt: rawComment._doc?.createdAt || rawComment.createdAt,
          updatedAt: rawComment._doc?.updatedAt || rawComment.updatedAt,
          nickname: rawComment.nickname,
          profile_image: rawComment.profile_image,
        };

        // 댓글 수정 완료

        set((state) => {
          const newState = {
            meets: state.meets.map((meet) =>
              meet._id === meetId
                ? {
                    ...meet,
                    comments: meet.comments.map((comment) =>
                      comment._id === commentId ? updatedComment : comment
                    ),
                  }
                : meet
            ),
            currentMeet:
              state.currentMeet?._id === meetId
                ? {
                    ...state.currentMeet,
                    comments: state.currentMeet.comments.map((comment) =>
                      comment._id === commentId ? updatedComment : comment
                    ),
                  }
                : state.currentMeet,
            isSubmitting: false,
          };

          // 댓글 수정 후 상태 업데이트 완료
          return newState;
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "댓글 수정에 실패했습니다.";
        set({
          error: errorMessage,
          isSubmitting: false,
        });
        console.error("댓글 수정 실패:", error);
        throw error;
      }
    },

    deleteComment: async (meetId: string, commentId: string) => {
      if (get().isSubmitting) return;

      set({ isSubmitting: true, error: null });

      try {
        await deleteCommentApi(meetId, commentId);

        set((state) => ({
          meets: state.meets.map((meet) =>
            meet._id === meetId
              ? {
                  ...meet,
                  comments: meet.comments.filter(
                    (comment) => comment._id !== commentId
                  ),
                }
              : meet
          ),
          currentMeet:
            state.currentMeet?._id === meetId
              ? {
                  ...state.currentMeet,
                  comments: state.currentMeet.comments.filter(
                    (comment) => comment._id !== commentId
                  ),
                }
              : state.currentMeet,
          isSubmitting: false,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "댓글 삭제에 실패했습니다.";
        set({
          error: errorMessage,
          isSubmitting: false,
        });
        console.error("댓글 삭제 실패:", error);
        throw error;
      }
    },

    // 참여자 관리
    toggleCrew: async (meetId: string) => {
      if (get().isSubmitting) return;

      set({ isSubmitting: true, error: null });

      try {
        const response = await toggleCrewApi(meetId);
        const crewData = response.data;

        // 현재 사용자 정보 가져오기
        const currentUserId = useUserStore.getState().id;

        if (!currentUserId) {
          set({ isSubmitting: false, error: "사용자 정보를 찾을 수 없습니다" });
          return;
        }

        set((state) => {
          const updateMeetCrews = (meet: Meet) => {
            if (crewData) {
              // 참여자 추가 (서버에서 사용자 정보를 반환함)
              return {
                ...meet,
                crews: [
                  ...meet.crews,
                  {
                    userId: crewData.userId,
                    nickname: crewData.nickname,
                    profile_image: crewData.profile_image,
                  },
                ],
              };
            } else {
              // 참여자 제거 (서버에서 undefined를 반환함)
              return {
                ...meet,
                crews: meet.crews.filter(
                  (crew) => crew.userId !== currentUserId
                ),
              };
            }
          };

          return {
            meets: state.meets.map((meet) =>
              meet._id === meetId ? updateMeetCrews(meet) : meet
            ),
            currentMeet:
              state.currentMeet?._id === meetId
                ? updateMeetCrews(state.currentMeet)
                : state.currentMeet,
            isSubmitting: false,
          };
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "참여 처리에 실패했습니다.";
        set({
          error: errorMessage,
          isSubmitting: false,
        });
        console.error("참여자 토글 실패:", error);
        throw error;
      }
    },

    // 필터링
    setFilters: (newFilters) => {
      set((state) => ({
        filters: { ...state.filters, ...newFilters },
      }));
    },

    clearFilters: () => {
      set({
        filters: {
          location: "all",
          workout_type: "all",
          searchTerm: "",
        },
      });
    },

    applyFilters: async () => {
      set({ currentPage: 1, hasMore: true });
      await get().fetchMeets(true);
    },

    // UI 상태 관리
    setSelectedMeet: (meet) => {
      set({ currentMeet: meet });
    },

    setSelectedMeetId: (meetId) => {
      set({ selectedMeetId: meetId });
    },

    openDetailModal: async (meetId: string) => {
      set({ selectedMeetId: meetId, isDetailModalOpen: true });
      await get().fetchMeetById(meetId);
    },

    closeDetailModal: () => {
      set({
        isDetailModalOpen: false,
        selectedMeetId: null,
        currentMeet: null,
      });
    },

    openFormModal: () => {
      set({ isFormModalOpen: true });
    },

    closeFormModal: () => {
      set({ isFormModalOpen: false });
    },

    // 상태 초기화
    clearError: () => {
      set({ error: null });
    },

    reset: () => {
      set({
        meets: [],
        currentMeet: null,
        isLoading: false,
        isSubmitting: false,
        error: null,
        hasMore: true,
        currentPage: 1,
        totalCount: 0,
        filters: {
          location: "all",
          workout_type: "all",
          searchTerm: "",
        },
        selectedMeetId: null,
        isDetailModalOpen: false,
        isFormModalOpen: false,
      });
    },
  })
);
