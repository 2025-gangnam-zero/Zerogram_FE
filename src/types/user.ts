export type GenderType = "m" | "f";
export type RoleType = "USER" | "ADMIN";

export interface User {
  _id: string;
  email: string;
  password?: string;
  profile_img?: string;
  nickname: string;
  gender: GenderType;
  role: RoleType;
  createdAt: string;
  updatedAt: string;
}
