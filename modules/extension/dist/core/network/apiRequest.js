export async function apiRequest(url, options = {}) {
    const { method = "GET", headers = {}, body, authToken } = options;
    const finalHeaders = {
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
        return {};
    }
    return response.json();
}
