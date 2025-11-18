export interface AddUserRequest {
  email: string;
  fullName: string;
  password: string;
  repeatedPassword: string;
  organizationName: string;
}

export interface AddUserResponse {
  isDone: boolean;
}
