export interface ExtensionConfig {
  service: {
    panelUrl: string;
    serviceBaseUrl: string;
    direction: string;
    language: string;
    hubUrl: string;
    organizationName: string;
  };
  user: {
    id: string;
    fullName: string;
    pictureUrl: string;
  };
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
  email: string;
}
