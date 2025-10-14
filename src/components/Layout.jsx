// src/components/Layout.jsx
import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";
import styles from "./Layout.module.css";
import logo from "../assets/spvb_logo_transparent.png"; // Logo in header
import LoadingOverlay from "./LoadingOverlay"; // NEW import

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false); // NEW state

  // Show loading overlay briefly on route changes
  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 600); // fade duration
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  // Check claims when user state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const tokenResult = await user.getIdTokenResult(true);
        setIsAdmin(!!tokenResult.claims.admin);

        // Access guard: if user is not admin but visiting /admin (but NOT /admin/login), kick them to login
        if (
          location.pathname.startsWith("/admin") &&
          location.pathname !== "/admin/login" &&
          !tokenResult.claims.admin
        ) {
          navigate("/admin/login");
        }
      } else {
        setIsAdmin(false);

        // If logged out but on /admin (but NOT /admin/login), redirect to login
        if (
          location.pathname.startsWith("/admin") &&
          location.pathname !== "/admin/login"
        ) {
          navigate("/admin/login");
        }
      }
    });

    return () => unsubscribe();
  }, [location, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsAdmin(false);
      navigate("/"); // redirect to home after logout
    } catch (err) {
      console.error("❌ Error signing out:", err);
    }
  };

  return (
    <div className={styles.container}>
      {/* Loading overlay */}
      <LoadingOverlay loading={loading} />

      {/* Header / Navbar */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <img src={logo} alt="SPVB Logo" className={styles.logoImg} />
          <h1 className={styles.logo}>
            <Link to="/">ST. PETE VOLLEYBALL</Link>
          </h1>
        </div>
        <nav>
          <ul className={styles.navLinks}>
            <li>
              <Link to="/">Home</Link>
            </li>
            {isAdmin && (
              <li>
                <Link to="/admin">Admin Dashboard</Link>
              </li>
            )}
          </ul>
        </nav>
      </header>

      {/* Main content */}
      <main className={styles.main}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>&copy; {new Date().getFullYear()} St. Pete Volleyball</p>
          <div className={styles.legalLinks}>
            <Link to="/privacy">Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms">Terms of Service</Link>
            <span>•</span>
            <Link to="/waiver">Waiver</Link>
          </div>
          {auth.currentUser && (
            <button onClick={handleSignOut} className={styles.signOutBtn}>
              Sign Out
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}