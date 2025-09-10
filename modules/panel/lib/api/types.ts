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
