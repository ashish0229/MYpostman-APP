import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { apiClient } from "../../../lib/api";

const ModerationLogView = ({ user, onManualModeration }) => {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    const fetchInitialLogs = async () => {
      try {
        const initialLogs = await apiClient.request("/moderation-logs");
        setLogs(initialLogs);
      } catch (error) {
        console.error("Failed to fetch initial logs:", error);
      }
    };
    fetchInitialLogs();
    const socket = io("http://localhost:3001");
    socket.on("new_log", (newLog) => setLogs((prev) => [newLog, ...prev]));
    return () => socket.disconnect();
  }, []);

  const handleAction = (postId, newStatus) => {
    const reason = prompt(`Reason for this action (${newStatus}):`);
    if (reason) onManualModeration(postId, newStatus, reason);
  };
  const canModerate = user?.role === "admin" || user?.role === "moderator";

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Live Moderation Log</h2>
      <div className="bg-white p-6 rounded-xl shadow-lg border overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Post ID</th>
              <th className="text-left p-2">Action</th>
              <th className="text-left p-2">Reason</th>
              <th className="text-left p-2">Timestamp</th>
              {canModerate && <th className="text-left p-2">Manual Actions</th>}
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{log.post_id}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      log.action === "rejected"
                        ? "bg-red-100 text-red-800"
                        : log.action === "quarantined"
                        ? "bg-orange-100 text-orange-800"
                        : log.action === "published"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {log.action}
                  </span>
                </td>
                <td className="p-2">{log.reason}</td>
                <td className="p-2">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                {canModerate && (
                  <td className="p-2 space-x-2">
                    {(log.action === "quarantined" ||
                      log.action === "pending" ||
                      log.action === "approved") && (
                      <>
                        <button
                          onClick={() => handleAction(log.post_id, "approved")}
                          className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(log.post_id, "rejected")}
                          className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ModerationLogView;
