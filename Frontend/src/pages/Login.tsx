import React, { useState } from "react";

interface LoginProps {
  onLogin: (username: string, password: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      if (
        (username === "admin" && password === "admin123") ||
        (username === "user" && password === "user123")
      ) {
        onLogin(username, password);
      } else {
        setError("Tên đăng nhập hoặc mật khẩu không đúng");
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-emerald-200 to-lime-100 p-6">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-md p-10 border border-green-100">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-lobster text-emerald-700 drop-shadow-md mb-2">
            FreshShop'UTH
          </h1>
          <p className="text-gray-900 font-sans tracking-wide text-lg">
            Hệ thống quản lý cửa hàng rau củ quả
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Tên đăng nhập
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              disabled={isLoading}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 text-gray-800 placeholder-gray-400 transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              disabled={isLoading}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 text-gray-800 placeholder-gray-400 transition-all"
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 font-semibold text-white rounded-lg shadow-md transition-all ${isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-emerald-500 hover:bg-emerald-600 hover:shadow-lg hover:-translate-y-[2px]"
              }`}
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
