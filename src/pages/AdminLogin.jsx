// src/pages/AdminLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import styles from "./AdminLogin.module.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Firebase auth login
      const userCred = await signInWithEmailAndPassword(auth, email, password);

      // Refresh token to pull custom claims
      const tokenResult = await userCred.user.getIdTokenResult(true);

      if (tokenResult.claims.admin) {
        // ✅ User is admin, go to dashboard
        navigate("/admin");
      } else {
        // ❌ Not an admin → log back out
        await signOut(auth);
        setError("Access denied. You are not an admin.");
      }
    } catch (err) {
      setError("Login failed. Please check your email and password.");
      console.error("Admin login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Login</h1>
      <form className={styles.form} onSubmit={handleLogin}>
        <label className={styles.label}>Email</label>
        <input
          type="email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className={styles.label}>Password</label>
        <input
          type="password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className={styles.error}>{error}</p>}

        <button
          type="submit"
          className={styles.button}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}