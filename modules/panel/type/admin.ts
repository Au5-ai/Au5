export interface HelloAdminResponse {
  helloFromAdmin: boolean;
}

export interface AddAdminRequest {
  email: string;
  fullName: string;
  password: string;
  repeatedPassword: string;
}

export interface AddAdminResponse {
  isDone: boolean;
}
