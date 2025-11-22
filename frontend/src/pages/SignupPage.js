// src/pages/SignupPage.jsx
import React, { useState } from "react";
import axios from "axios";
import { setAuthToken } from "../services/auth";

function SignupPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Email and password required");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8080/api/auth/signup", {
        email,
        password,
        displayName, // matches backend field name
      });

      const { token, user } = res.data;
      if (!token) {
        alert("Signup succeeded but server did not return token.");
        setLoading(false);
        return;
      }

      // store token and user
      setAuthToken(token);
      localStorage.setItem("user", JSON.stringify(user));

      alert("Signup successful! You are now logged in.");
      // redirect to homepage or wherever
      window.location.href = "/";
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Signup failed";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "38px 0" }}>
      <div className="container">
        <div className="join-card" style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ marginTop: 0 }}>Sign Up</h2>
          <form onSubmit={handleSignup}>
            <div style={{ marginBottom: 12 }}>
              <label className="form-label">Display name</label>
              <input
                className="input"
                placeholder="Display name (optional)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

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
                {loading ? "Signing up..." : "Sign up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
