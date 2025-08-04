export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  traceId?: string;
  [key: string]: any;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public title: string,
    public problemDetails: ProblemDetails
  ) {
    super(problemDetails.detail || title);
    this.name = "ApiError";
  }
}

// Types for API requests and responses
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType?: string;
  expiresIn?: number;
}

export interface User {
  id: string;
  fullName: string;
  pictureUrl?: string;
  hasAccount: boolean;
  email: string;
}

export interface OrganizationConfig {
  panelUrl: string;
  serviceBaseUrl: string;
  direction: string;
  language: string;
  hubUrl: string;
  name: string;
  botName: string;
}

export interface AppConfig {
  user: {
    id: string;
    fullName: string;
    pictureUrl?: string;
    hasAccount: boolean;
  };
  service: {
    jwtToken: string;
    panelUrl: string;
    baseUrl: string;
    direction: string;
    language: string;
    hubUrl: string;
    companyName: string;
    botName: string;
  };
}
