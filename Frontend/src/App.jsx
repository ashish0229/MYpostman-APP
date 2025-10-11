import React, { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
// --- SVG Icons ---
import Sidebar from "./components/shared/sidebar";
// --- Views ---
import {
  AnalyticsView,
  AuthView,
  CalendarView,
  DashboardView,
  GeneratorView,
  HistoryView,
  ModerationLogView,
  SettingsView,
  UsersView,
} from "./components/shared/views";
// --- API Client  ---
import { apiClient } from "./lib/api";

// --- Main App Component ---
export default function App() {
  // --- AUTH STATE ---
  const [authData, setAuthData] = useState({
    token: null,
    user: null,
    isLoading: true,
  });

  // --- LIVE DATA STATE ---
  const [liveStats, setLiveStats] = useState({
    postsToday: 0,
    newUsers: 0,
    policyViolations: 0,
  });
  const [liveLogs, setLiveLogs] = useState([]);
  const [liveUsers, setLiveUsers] = useState([]);
  const [livePosts, setLivePosts] = useState([]);

  // --- APP STATE (for Generator) ---
  const [activeTab, setActiveTab] = useState("dashboard");
  const [topic, setTopic] = useState("A new sustainable coffee brand.");
  const [tone, setTone] = useState("Excited");
  const [platform, setPlatform] = useState("Instagram");
  const [generatedPost, setGeneratedPost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- WebSocket and Data Fetching Effects ---
  const fetchAllInitialData = useCallback(async (user) => {
    try {
      const [stats, logs, posts] = await Promise.all([
        apiClient.request("/dashboard/stats"),
        apiClient.request("/moderation-logs"),
        apiClient.request("/posts"),
      ]);
      setLiveStats(stats);
      setLiveLogs(logs);
      setLivePosts(posts);

      if (user?.role === "admin") {
        const users = await apiClient.request("/users");
        setLiveUsers(users);
      }
    } catch (err) {
      console.error("Failed to fetch initial data", err);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("currentUser");
    if (token && user) {
      const parsedUser = JSON.parse(user);
      setAuthData({ token, user: parsedUser, isLoading: false });
      fetchAllInitialData(parsedUser);
    } else {
      setAuthData({ token: null, user: null, isLoading: false });
    }
  }, [fetchAllInitialData]);

  useEffect(() => {
    if (!authData.token) return;

    const socket = io("http://localhost:3001");

    socket.on("connect", () => console.log("✅ WebSocket Connected!"));

    socket.on("stats_update", (newStats) => setLiveStats(newStats));

    socket.on("user_update", async () => {
      if (authData.user?.role === "admin") {
        const users = await apiClient.request("/users");
        setLiveUsers(users);
      }
    });

    socket.on("new_log", (newLog) => setLiveLogs((prev) => [newLog, ...prev]));

    socket.on("new_post", (newPost) =>
      setLivePosts((prev) => [newPost, ...prev])
    );

    socket.on("post_updated", (updatedPost) => {
      setLivePosts((prev) =>
        prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
      );
      setLiveLogs((prev) =>
        prev.map((l) =>
          l.post_id === updatedPost.id
            ? { ...l, post_status: updatedPost.status }
            : l
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [authData.token, authData.user?.role]);

  // --- AUTH HANDLERS ---
  const handleLogin = useCallback(async (username, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.request("/auth/login", "POST", {
        username,
        password,
      });
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      setAuthData({ token: data.token, user: data.user, isLoading: false });
      setActiveTab("dashboard");
    } catch (err) {
      setError({ message: err.message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRegister = useCallback(
    async (username, password, role, displayName) => {
      setIsLoading(true);
      setError(null);
      try {
        await apiClient.request("/auth/register", "POST", {
          username,
          password,
          role,
          display_name: displayName,
        });
        await handleLogin(username, password);
      } catch (err) {
        setError({ message: err.message });
        setIsLoading(false);
      }
    },
    [handleLogin]
  );

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    setAuthData({ token: null, user: null, isLoading: false });
  };

  // --- API HANDLERS for Generator & Moderation ---
  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedPost(null);
    try {
      const data = await apiClient.request("/posts", "POST", {
        topic,
        tone,
        platform,
      });
      setGeneratedPost(data);
    } catch (err) {
      setError({ message: err.message, status: "API Error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostNow = async () => {
    if (!generatedPost || !generatedPost.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const updatedPost = await apiClient.request(
        `/posts/${generatedPost.id}/publish`,
        "PUT"
      );
      setGeneratedPost(updatedPost);
    } catch (err) {
      setError({
        message: err.message || "Failed to publish post.",
        status: "API Error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualModeration = async (postId, newStatus, reason) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.request(`/posts/${postId}/status`, "PUT", {
        status: newStatus,
        reason,
      });
      // WebSocket will trigger UI updates
    } catch (err) {
      setError({
        message: err.message || "Failed to update post status.",
        status: "API Error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER LOGIC ---
  if (authData.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!authData.token) {
    return (
      <AuthView
        onLogin={handleLogin}
        onRegister={handleRegister}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "generator":
        return (
          <GeneratorView
            topic={topic}
            setTopic={setTopic}
            tone={tone}
            setTone={setTone}
            platform={platform}
            setPlatform={setPlatform}
            handleGenerate={handleGenerate}
            isLoading={isLoading}
            error={error}
            generatedPost={generatedPost}
            handlePostNow={handlePostNow}
          />
        );
      case "history":
        return <HistoryView posts={livePosts} />;
      case "moderation":
        return (
          <ModerationLogView
            user={authData.user}
            onManualModeration={handleManualModeration}
          />
        );
      case "dashboard":
        return <DashboardView stats={liveStats} />;
      case "users":
        return <UsersView userRole={authData.user?.role} users={liveUsers} />;
      case "analytics":
        return <AnalyticsView />;
      case "calendar":
        return <CalendarView />;
      case "settings":
        return <SettingsView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900 font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={authData.user}
        onLogout={handleLogout}
      />
      <main className="flex-1 p-8 overflow-y-auto">{renderContent()}</main>
    </div>
  );
}
