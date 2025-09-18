import { WorkoutType } from "./workout";

export type Location = "강남구" | "서초구";

export interface Meet {
  _id: string;
  userId: string;
  nickname: string;
  title: string;
  description: string;
  workout_type: WorkoutType;
  location: Location;
  crews: Crew[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  _id: string;
  userId: string;
  nickname: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Crew {
  userId: string;
  nickname: string;
}
