export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions<TBody> {
  method?: HttpMethod;
  headers?: HeadersInit;
  body?: TBody;
  authToken?: string;
}

export async function apiRequest<TResponse, TBody = unknown>(
  url: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> {
  const {method = "GET", headers = {}, body, authToken} = options;

  const finalHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers
  };

  if (authToken) {
    // finalHeaders["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Fetch failed with ${response.status}: ${errorText}`);
  }

  if (response.status === 204) {
    return {} as TResponse;
  }

  return response.json();
}
