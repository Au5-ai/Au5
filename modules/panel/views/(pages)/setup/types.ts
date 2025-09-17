export interface HelloAdminResponse {
  helloFromAdmin: boolean;
}

export interface AddUserRequest {
  email: string;
  fullName: string;
  password: string;
  repeatedPassword: string;
}

export interface AddUserResponse {
  isDone: boolean;
}
