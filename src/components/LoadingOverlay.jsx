import React from "react";
import styles from "./LoadingOverlay.module.css";
import logo from "../assets/spvb_logo_transparent.png"; // adjust if filename differs

export default function LoadingOverlay({ loading }) {
  if (!loading) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.logoWrapper}>
        <img src={logo} alt="Loading..." className={styles.logo} />
        <div className={styles.spinner}></div>
      </div>
    </div>
  );
}