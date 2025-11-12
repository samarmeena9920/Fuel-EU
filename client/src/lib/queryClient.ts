import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);

  // Try to parse JSON; some endpoints may return empty body.
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    // If response isn't JSON, return raw text
    return text;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Build the request URL from the queryKey. Many components pass the
    // base API path as the first element and additional parameters as the
    // following elements (e.g. ["/api/compliance/cb", year]). To keep
    // the client simple we translate common patterns into query strings
    // that the server expects.
    let url = String(queryKey[0]);

    // If there are additional elements, map them to query params for known
    // endpoints. This avoids components having to build query strings.
    if ((queryKey as any).length > 1) {
      const parts = Array.from(queryKey).slice(1).map(String);
      if (url.startsWith("/api/compliance/cb") || url.startsWith("/api/compliance/adjusted-cb")) {
        url = `${url}?year=${encodeURIComponent(parts[0] ?? "")}`;
      } else if (url.startsWith("/api/banking/records")) {
        const shipId = parts[0] ?? "";
        const year = parts[1] ?? "";
        url = `${url}?shipId=${encodeURIComponent(shipId)}&year=${encodeURIComponent(year)}`;
      } else {
        // Fallback: append remaining parts as path segments
        url = parts.reduce((acc, p) => `${acc}/${encodeURIComponent(p)}`, url);
      }
    }

    const res = await fetch(url as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
