// src/pages/LoginPage.jsx
import React, { useState } from "react";
import axios from "axios";
import { setAuthToken } from "../services/auth";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Email and password required");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;
      if (!token) throw new Error("No token returned from server");

      setAuthToken(token);
      localStorage.setItem("user", JSON.stringify(user));

      alert("Login successful!");
      window.location.href = "/";
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Login failed";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "38px 0" }}>
      <div className="container">
        <div className="join-card" style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ marginTop: 0 }}>Login</h2>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 12 }}>
              <label className="form-label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label className="form-label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Log in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
