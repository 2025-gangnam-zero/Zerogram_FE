import axios from "axios";
import { API_CONFIG } from "../constants";
import { Meet, Comment, MeetFormData } from "../types/meet";
import { getApiErrorMessage, logError } from "../utils";

// API 응답 타입 정의
interface ApiResponse<T> {
  success: boolean;
  message: string;
  code: string;
  timestamp: string;
  data: T;
}

interface MeetListResponse {
  meets: Meet[];
}

interface MeetResponse {
  meet: Meet;
}

interface CommentResponse {
  comment: Comment;
}

interface CrewResponse {
  userId: string;
  nickname: string;
  profile_image?: string;
}

// 공통 헤더 생성 함수
const getHeaders = () => {
  const sessionId = localStorage.getItem("sessionId");
  return {
    "Content-Type": "application/json",
    "x-session-id": sessionId || "",
  };
};

// FormData용 헤더 생성 함수
const getFormDataHeaders = () => {
  const sessionId = localStorage.getItem("sessionId");
  return {
    "x-session-id": sessionId || "",
  };
};

// 모집글 목록 조회
export const getMeetListApi = async (params: {
  skip?: number;
  limit?: number;
  location?: string;
  workout_type?: string;
  q?: string;
}): Promise<ApiResponse<MeetListResponse>> => {
  try {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/meets`, {
      params,
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    logError("getMeetsApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 모집글 상세 조회
export const getMeetApi = async (
  meetId: string
): Promise<ApiResponse<MeetResponse>> => {
  try {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/meets/${meetId}`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    logError("getMeetByIdApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 모집글 생성
export const createMeetApi = async (
  formData: MeetFormData
): Promise<ApiResponse<MeetResponse>> => {
  try {
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("workout_type", formData.workout_type);
    data.append("location", formData.location);

    // 새 이미지 파일들 추가
    if (formData.newImages && formData.newImages.length > 0) {
      formData.newImages.forEach((file: File) => {
        data.append("images", file);
      });
    }

    const response = await axios.post(`${API_CONFIG.BASE_URL}/meets`, data, {
      headers: getFormDataHeaders(),
    });
    return response.data;
  } catch (error) {
    logError("createMeetApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 모집글 수정
export const updateMeetApi = async (
  meetId: string,
  formData: MeetFormData
): Promise<ApiResponse<MeetResponse>> => {
  try {
    const data = new FormData();

    // 기본 필드들 추가
    if (formData.title) data.append("title", formData.title);
    if (formData.description) data.append("description", formData.description);
    if (formData.workout_type)
      data.append("workout_type", formData.workout_type);
    if (formData.location) data.append("location", formData.location);

    // 기존 이미지 유지 (서버에서 삭제할 이미지들) - 배열로 전송
    if (formData.existingImages && formData.existingImages.length > 0) {
      data.append("existingImages", JSON.stringify(formData.existingImages));
    }

    // 현재 유지할 이미지들 (서버에서 유지할 이미지들) - 배열로 전송
    if (formData.images && formData.images.length > 0) {
      data.append("images", JSON.stringify(formData.images));
    }

    // 새 이미지 파일들 추가 - 배열로 전송
    if (formData.newImages && formData.newImages.length > 0) {
      formData.newImages.forEach((file: File) => {
        data.append("newImages", file);
      });
    }

    const response = await axios.patch(
      `${API_CONFIG.BASE_URL}/meets/${meetId}`,
      data,
      {
        headers: getFormDataHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    logError("updateMeetApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 모집글 삭제
export const deleteMeetApi = async (
  meetId: string
): Promise<ApiResponse<null>> => {
  try {
    const response = await axios.delete(
      `${API_CONFIG.BASE_URL}/meets/${meetId}`,
      {
        headers: getHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    logError("deleteMeetApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 댓글 생성
export const createCommentApi = async (
  meetId: string,
  content: string
): Promise<ApiResponse<CommentResponse>> => {
  try {
    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/meets/${meetId}/comments`,
      { content },
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error) {
    logError("createCommentApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 댓글 수정
export const updateCommentApi = async (
  meetId: string,
  commentId: string,
  content: string
): Promise<ApiResponse<CommentResponse>> => {
  try {
    const response = await axios.patch(
      `${API_CONFIG.BASE_URL}/meets/${meetId}/comments/${commentId}`,
      { content },
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error) {
    logError("updateCommentApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 댓글 삭제
export const deleteCommentApi = async (
  meetId: string,
  commentId: string
): Promise<ApiResponse<null>> => {
  try {
    const response = await axios.delete(
      `${API_CONFIG.BASE_URL}/meets/${meetId}/comments/${commentId}`,
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error) {
    logError("deleteCommentApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 참여자 추가/삭제 (토글)
export const toggleCrewApi = async (
  meetId: string
): Promise<ApiResponse<CrewResponse | null>> => {
  try {
    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/meets/${meetId}/crews`,
      {},
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error) {
    logError("toggleCrewApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};
