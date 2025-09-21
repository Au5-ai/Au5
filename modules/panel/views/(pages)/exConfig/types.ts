export interface ExtensionConfig {
  panelUrl: string;
  serviceBaseUrl: string;
  direction: string;
  language: string;
  hubUrl: string;
  organizationName: string;
  botName: string;
}

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
