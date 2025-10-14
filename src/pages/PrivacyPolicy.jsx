import React from "react";
import styles from "./LegalPage.module.css";
import logo from "../assets/spvb_logo_transparent.png";

export default function PrivacyPolicy() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <img src={logo} alt="St. Pete Volleyball Logo" className={styles.logo} />
        <h1 className={styles.title}>St. Pete Volleyball</h1>
        <h2 className={styles.subtitle}>Privacy Policy</h2>
      </div>

      <div className={styles.content}>
        <p>
          At St. Pete Volleyball, we respect your privacy and are committed to protecting
          your personal information. This Privacy Policy explains what information we collect,
          how we use it, and your rights regarding your data.
        </p>

        <h3>1. Information We Collect</h3>
        <p>When you register for a tournament or use our website, we may collect:</p>
        <ul>
          <li><strong>Personal Information:</strong> Full names of all team members, team captain's phone number, team name</li>
          <li><strong>Account Information:</strong> Email address and password (for admin accounts only)</li>
          <li><strong>Tournament Data:</strong> Division selection, match scores, tournament results, and placement history</li>
          <li><strong>Technical Information:</strong> IP address, browser type, device information, and usage data collected automatically through Firebase Analytics</li>
        </ul>

        <h3>2. How We Use Your Information</h3>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Process tournament registrations and manage event logistics</li>
          <li>Display team rosters, schedules, brackets, and standings publicly on our website</li>
          <li>Communicate important tournament updates and information to team captains</li>
          <li>Maintain historical records of tournament results and player participation</li>
          <li>Create player profiles showing participation history across tournaments</li>
          <li>Improve our website functionality and user experience</li>
          <li>Ensure the security and integrity of our platform</li>
        </ul>

        <h3>3. Public Display of Information</h3>
        <p>
          <strong>Please note:</strong> The following information will be displayed publicly on our website
          and may appear on social media:
        </p>
        <ul>
          <li>Full names of all registered players</li>
          <li>Team names and division assignments</li>
          <li>Tournament standings, brackets, and match results</li>
          <li>Final placements and tournament history</li>
          <li>Player profiles showing participation across multiple tournaments</li>
        </ul>
        <p>
          <strong>We will never publicly display:</strong> Phone numbers, email addresses, or any other
          contact information. These details are kept private and used only for tournament administration.
        </p>

        <h3>4. Data Storage and Security</h3>
        <p>
          Your information is stored securely using Google Firebase, a trusted cloud platform with
          industry-standard security measures including:
        </p>
        <ul>
          <li>Encrypted data transmission (HTTPS/SSL)</li>
          <li>Secure authentication and access controls</li>
          <li>Regular security updates and monitoring</li>
          <li>Firestore security rules limiting data access</li>
        </ul>
        <p>
          While we implement reasonable security measures, no method of transmission over the internet
          is 100% secure. We cannot guarantee absolute security of your data.
        </p>

        <h3>5. Data Sharing and Third Parties</h3>
        <p>We do not sell, rent, or trade your personal information to third parties. We may share data with:</p>
        <ul>
          <li><strong>Google Firebase:</strong> Our hosting and database provider (see <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">Firebase Privacy Policy</a>)</li>
          <li><strong>Vercel:</strong> Our website hosting platform (see <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Vercel Privacy Policy</a>)</li>
          <li><strong>Legal Requirements:</strong> If required by law, court order, or government regulation</li>
        </ul>

        <h3>6. Data Retention</h3>
        <p>
          We retain tournament data indefinitely to maintain historical records and player profiles.
          This allows us to celebrate our community's history and track participation over time.
          If you wish to have your data removed, please see "Your Rights" below.
        </p>

        <h3>7. Your Rights</h3>
        <p>You have the right to:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
          <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
          <li><strong>Deletion:</strong> Request deletion of your personal information (subject to our legitimate interest in maintaining historical records)</li>
          <li><strong>Opt-Out:</strong> Decline to have your information displayed publicly (though this may prevent tournament participation)</li>
        </ul>
        <p>
          To exercise any of these rights, please contact us at the email address below.
        </p>

        <h3>8. Children's Privacy</h3>
        <p>
          Our website is not directed to children under 13. If a participant is under 18,
          a parent or guardian must review and consent to this Privacy Policy and our
          Participant Agreement & Release on their behalf. If we become aware that we have
          collected personal information from a child under 13 without parental consent,
          we will take steps to delete that information.
        </p>

        <h3>9. Cookies and Tracking</h3>
        <p>
          We use Firebase Analytics and authentication cookies to improve website functionality
          and user experience. These cookies help us understand how visitors use our site and
          maintain user sessions. You can disable cookies in your browser settings, but this
          may affect website functionality.
        </p>

        <h3>10. Changes to This Privacy Policy</h3>
        <p>
          We may update this Privacy Policy from time to time. Any changes will be posted on
          this page with an updated effective date. Continued use of our website after changes
          constitutes acceptance of the updated policy.
        </p>

        <h3>11. California Privacy Rights (CCPA)</h3>
        <p>
          If you are a California resident, you have additional rights under the California
          Consumer Privacy Act (CCPA), including the right to know what personal information
          we collect, the right to delete your information, and the right to opt-out of the
          sale of your information (note: we do not sell personal information).
        </p>

        <h3>12. Contact Us</h3>
        <p>
          If you have questions about this Privacy Policy or wish to exercise your privacy rights,
          please contact us at:
        </p>
        <p className={styles.contactInfo}>
          <strong>St. Pete Volleyball</strong><br />
          Email: <a href="mailto:stpetevolleyball@gmail.com">stpetevolleyball@gmail.com</a><br />
          Website: <a href="https://stpetevb.com">stpetevb.com</a>
        </p>
      </div>

      <div className={styles.footer}>
        <p className={styles.effectiveDate}>
          Effective Date: {new Date().toLocaleDateString()}
        </p>
        <p>
          St. Pete Volleyball © {new Date().getFullYear()} — All Rights Reserved.
        </p>
      </div>
    </div>
  );
}