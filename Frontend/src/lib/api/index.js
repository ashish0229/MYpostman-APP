export const apiClient = {
  async request(endpoint, method = "GET", body = null) {
    const headers = { "Content-Type": "application/json" };
    const token = localStorage.getItem("authToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const config = { method, headers };
    if (body) {
      config.body = JSON.stringify(body);
    }
    const response = await fetch(
      `http://localhost:3001/api${endpoint}`,
      config
    );
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "An unknown error occurred" }));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json();
    }
  },
};