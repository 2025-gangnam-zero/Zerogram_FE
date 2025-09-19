import { WorkoutType } from "./workout";

export type Location = "강남구" | "서초구";

export interface Meet {
  _id: string;
  userId: string;
  nickname: string;
  profile_image?: string;
  title: string;
  description: string;
  images?: string[];
  workout_type: WorkoutType;
  location: Location;
  crews: Crew[];
  comments: Comment[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Comment {
  _id: string;
  userId: string;
  nickname: string;
  profile_image?: string;
  content: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Crew {
  userId: string;
  nickname: string;
  profile_image?: string;
}

export interface MeetFormData {
  title: string;
  description: string;
  workout_type: WorkoutType;
  location: Location;
  images?: string[]; // Existing image URLs for display
  newImages?: File[]; // New files to upload
  existingImages?: string[]; // URLs of images to keep (for update)
}
