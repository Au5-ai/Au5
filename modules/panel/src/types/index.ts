export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken?: string;
  expiresIn?: number;
  refreshToken?: string;
  tokenType?: string;
}

export interface User {
  id: string;
  fullname: string;
  pictureUrl: string;
  hasAccount: boolean;
}

export interface OrgConfig {
  name: string;
  botName: string;
  hubUrl: string;
  direction: string;
  language: string;
  serviceBaseUrl: string;
  panelUrl: string;
}
