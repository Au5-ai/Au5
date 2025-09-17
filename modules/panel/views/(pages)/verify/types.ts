export interface AddUserRequest {
  userId: string;
  hashedEmail: string;
  fullName: string;
  password: string;
  repeatedPassword: string;
}

export interface AddUserResponse {
  isDone: boolean;
}
