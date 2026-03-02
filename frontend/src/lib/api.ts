import Cookies from "js-cookie";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;

    const token = Cookies.get("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Add credentials flag to include cookies in cross-origin requests
    const config: RequestInit = {
      ...options,
      credentials: "include",
      headers,
    };

    const response = await fetch(url, config);

    // Handle 204 No Content
    if (response.status === 204) {
      return { data: null, error: null, status: response.status };
    }

    const responseData = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMsg = "An error occurred while fetching data";
      if (
        responseData &&
        typeof responseData === "object" &&
        "error" in responseData
      ) {
        errorMsg = responseData.error as string;
      } else if (responseData && typeof responseData === "string") {
        errorMsg = responseData;
      }
      return { data: null, error: errorMsg, status: response.status };
    }

    return { data: responseData as T, error: null, status: response.status };
  } catch (err: unknown) {
    let errorMsg = "Network error or unable to connect to the server";
    if (err instanceof Error) {
      errorMsg = err.message;
    }
    return { data: null, error: errorMsg, status: 0 };
  }
}
