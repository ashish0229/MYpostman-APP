import { useState } from "react";

const AuthView = ({ onLogin, onRegister, isLoading, error }) => {
  const [isRegistering, setIsRegistering] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("user");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegistering) {
      onRegister(username, password, role, displayName);
    } else {
      onLogin(username, password);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
        <img
          src="/logo.png"
          alt="MYpostmate Logo"
          className="mx-auto h-16 w-auto"
        />
        <h1 className="text-3xl font-bold text-center text-gray-800">
          {isRegistering ? "Create Account" : "Welcome to MYpostmate"}
        </h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {isRegistering && (
            <div>
              <label
                htmlFor="displayName"
                className="text-sm font-bold text-gray-600 block"
              >
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-3 mt-2 text-gray-700 bg-gray-50 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>
          )}
          <div>
            <label
              htmlFor="username"
              className="text-sm font-bold text-gray-600 block"
            >
              Username (for login)
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 mt-2 text-gray-700 bg-gray-50 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-bold text-gray-600 block"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mt-2 text-gray-700 bg-gray-50 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>
          {isRegistering && (
            <div>
              <label
                htmlFor="role"
                className="text-sm font-bold text-gray-600 block"
              >
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-3 mt-2 text-gray-700 bg-gray-50 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}
          {error && (
            <p className="text-sm text-red-500 text-center">{error.message}</p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 rounded-lg shadow-sm font-medium text-gray-900 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-400"
          >
            {isLoading
              ? "Processing..."
              : isRegistering
              ? "Register"
              : "Sign In"}
          </button>
        </form>
        <div className="text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
            }}
            className="text-sm text-yellow-600 hover:underline"
          >
            {isRegistering
              ? "Already have an account? Sign In"
              : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
