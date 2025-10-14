import React from "react";
import { Link } from "react-router-dom";
import styles from "./LegalPage.module.css";
import logo from "../assets/spvb_logo_transparent.png";

export default function TermsOfService() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <img src={logo} alt="St. Pete Volleyball Logo" className={styles.logo} />
        <h1 className={styles.title}>St. Pete Volleyball</h1>
        <h2 className={styles.subtitle}>Terms of Service</h2>
      </div>

      <div className={styles.content}>
        <p>
          Welcome to St. Pete Volleyball! These Terms of Service ("Terms") govern your use
          of our website and services. By accessing or using our website, registering for
          tournaments, or participating in our events, you agree to be bound by these Terms.
          If you do not agree, please do not use our services.
        </p>

        <h3>1. Acceptance of Terms</h3>
        <p>
          By using stpetevb.com (the "Website") or participating in St. Pete Volleyball
          events, you agree to these Terms of Service, our{" "}
          <Link to="/privacy" className={styles.inlineLink}>Privacy Policy</Link>, and our{" "}
          <Link to="/waiver" className={styles.inlineLink}>Participant Agreement & Release</Link>.
          These documents together constitute the entire agreement between you and St. Pete Volleyball.
        </p>

        <h3>2. Eligibility</h3>
        <p>
          You must be at least 18 years old to register for tournaments or use our services.
          If you are under 18, a parent or legal guardian must register on your behalf and
          consent to these Terms and our Participant Agreement & Release.
        </p>

        <h3>3. User Accounts</h3>
        <p>
          Currently, tournament registration does not require creating an account. Admin accounts
          are created by St. Pete Volleyball staff only. If you are granted admin access:
        </p>
        <ul>
          <li>You are responsible for maintaining the confidentiality of your login credentials</li>
          <li>You agree not to share your account with others</li>
          <li>You are responsible for all activities that occur under your account</li>
          <li>You must notify us immediately of any unauthorized access or security breach</li>
        </ul>

        <h3>4. Tournament Registration</h3>
        <p>
          When registering a team for a tournament:
        </p>
        <ul>
          <li>All information provided must be accurate and complete</li>
          <li>You confirm you have permission to register all listed team members</li>
          <li>You agree that all team members have read and accepted our <Link to="/waiver" className={styles.inlineLink}>Participant Agreement & Release</Link></li>
          <li>Registration is subject to availability and may be closed at any time</li>
          <li>We reserve the right to refuse or cancel any registration at our discretion</li>
        </ul>

        <h3>5. Payment and Refunds</h3>
        <p>
          Tournament fees (if applicable) must be paid by the registration deadline. Refund
          policies will be communicated at the time of registration and may vary by event.
          Generally:
        </p>
        <ul>
          <li>Refunds may be available if requested before the registration deadline</li>
          <li>No refunds will be issued after the registration deadline</li>
          <li>We reserve the right to cancel tournaments due to weather, insufficient registration, or other circumstances. In such cases, refunds are at our sole discretion and are not guaranteed</li>
          <li>By registering, you acknowledge that tournament fees may be non-refundable even in the event of cancellation</li>
        </ul>

        <h3>6. Code of Conduct</h3>
        <p>
          All participants, spectators, and website users must:
        </p>
        <ul>
          <li>Treat others with respect, courtesy, and good sportsmanship</li>
          <li>Follow all rules and instructions from tournament organizers and referees</li>
          <li>Refrain from harassment, discrimination, violence, or threatening behavior</li>
          <li>Not engage in cheating, unsportsmanlike conduct, or rule violations</li>
          <li>Respect venue property and follow all venue rules</li>
        </ul>
        <p>
          Violation of this Code of Conduct may result in removal from the event without refund,
          suspension from future events, or permanent ban from St. Pete Volleyball activities.
        </p>

        <h3>7. Intellectual Property</h3>
        <p>
          All content on this Website, including text, graphics, logos, images, and software,
          is the property of St. Pete Volleyball or its licensors and is protected by copyright,
          trademark, and other intellectual property laws. You may not:
        </p>
        <ul>
          <li>Copy, reproduce, or distribute Website content without permission</li>
          <li>Use our name, logo, or branding without written authorization</li>
          <li>Modify, reverse engineer, or create derivative works from our Website</li>
        </ul>

        <h3>8. User-Generated Content</h3>
        <p>
          By submitting scores, team information, or other content through our Website, you grant
          St. Pete Volleyball a non-exclusive, worldwide, royalty-free license to use, display,
          and distribute that content for tournament administration and promotional purposes.
        </p>

        <h3>9. Public Display of Information</h3>
        <p>
          You acknowledge and agree that tournament-related information (team names, player names,
          scores, standings, brackets, and results) will be displayed publicly on our Website and
          may be shared on social media. See our{" "}
          <Link to="/privacy" className={styles.inlineLink}>Privacy Policy</Link> for details.
        </p>

        <h3>10. Website Use and Restrictions</h3>
        <p>
          You agree not to:
        </p>
        <ul>
          <li>Use the Website for any illegal or unauthorized purpose</li>
          <li>Attempt to gain unauthorized access to our systems or data</li>
          <li>Interfere with or disrupt the Website's functionality</li>
          <li>Use automated tools (bots, scrapers) to access the Website</li>
          <li>Submit false, misleading, or fraudulent information</li>
          <li>Harass, abuse, or harm other users</li>
        </ul>

        <h3>11. Disclaimer of Warranties</h3>
        <p>
          THE WEBSITE AND SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES
          OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
        </p>
        <p>
          We do not guarantee that:
        </p>
        <ul>
          <li>The Website will be uninterrupted, secure, or error-free</li>
          <li>Information on the Website will be accurate or complete</li>
          <li>Defects will be corrected</li>
          <li>The Website is free from viruses or harmful components</li>
        </ul>

        <h3>12. Limitation of Liability</h3>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, ST. PETE VOLLEYBALL, ITS ORGANIZERS, STAFF,
          VOLUNTEERS, AND PARTNERS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
          CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS,
          DATA, OR USE, ARISING OUT OF OR RELATED TO YOUR USE OF THE WEBSITE OR PARTICIPATION
          IN EVENTS, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </p>
        <p>
          IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED THE AMOUNT YOU PAID FOR TOURNAMENT
          REGISTRATION (IF ANY) IN THE SIX MONTHS PRECEDING THE CLAIM.
        </p>

        <h3>13. Indemnification</h3>
        <p>
          You agree to indemnify, defend, and hold harmless St. Pete Volleyball, its organizers,
          staff, volunteers, and partners from any claims, damages, losses, liabilities, and
          expenses (including legal fees) arising from:
        </p>
        <ul>
          <li>Your use of the Website or services</li>
          <li>Your violation of these Terms</li>
          <li>Your violation of any rights of another person or entity</li>
          <li>Your participation in St. Pete Volleyball events</li>
        </ul>

        <h3>14. Third-Party Services</h3>
        <p>
          Our Website uses third-party services including Google Firebase (hosting and database)
          and Vercel (hosting). Your use of these services is subject to their respective terms
          and privacy policies. We are not responsible for the practices or content of third-party
          services.
        </p>

        <h3>15. Modifications to Terms</h3>
        <p>
          We reserve the right to modify these Terms at any time. Changes will be posted on this
          page with an updated effective date. Your continued use of the Website after changes
          constitutes acceptance of the modified Terms. We encourage you to review these Terms
          periodically.
        </p>

        <h3>16. Modifications to Services</h3>
        <p>
          We reserve the right to modify, suspend, or discontinue any aspect of the Website or
          services at any time without notice or liability.
        </p>

        <h3>17. Termination</h3>
        <p>
          We may terminate or suspend your access to the Website or services immediately, without
          prior notice or liability, for any reason, including breach of these Terms. Upon
          termination, your right to use the Website ceases immediately.
        </p>

        <h3>18. Governing Law and Dispute Resolution</h3>
        <p>
          These Terms are governed by the laws of the State of Florida, without regard to its
          conflict of law provisions. Any disputes arising from these Terms or your use of our
          services shall be resolved through:
        </p>
        <ul>
          <li><strong>Informal Resolution:</strong> We encourage you to contact us first to resolve disputes informally</li>
          <li><strong>Binding Arbitration:</strong> If informal resolution fails, disputes shall be resolved through binding arbitration in Pinellas County, Florida, under the rules of the American Arbitration Association</li>
          <li><strong>Class Action Waiver:</strong> You agree to resolve disputes on an individual basis and waive the right to participate in class actions or class arbitrations</li>
        </ul>
        <p>
          Notwithstanding the above, either party may seek injunctive relief in court to protect
          intellectual property rights.
        </p>

        <h3>19. Severability</h3>
        <p>
          If any provision of these Terms is found to be unenforceable or invalid, that provision
          shall be limited or eliminated to the minimum extent necessary, and the remaining
          provisions shall remain in full force and effect.
        </p>

        <h3>20. Entire Agreement</h3>
        <p>
          These Terms, together with our Privacy Policy and Participant Agreement & Release,
          constitute the entire agreement between you and St. Pete Volleyball regarding use of
          the Website and services, superseding any prior agreements.
        </p>

        <h3>21. Contact Information</h3>
        <p>
          If you have questions about these Terms of Service, please contact us at:
        </p>
        <p className={styles.contactInfo}>
          <strong>St. Pete Volleyball</strong><br />
          Email: <a href="mailto:stpetevolleyball@gmail.com">stpetevolleyball@gmail.com</a><br />
          Website: <a href="https://stpetevb.com">stpetevb.com</a>
        </p>

        <p className={styles.acknowledgment}>
          <strong>By using our Website or participating in our events, you acknowledge that you
          have read, understood, and agree to be bound by these Terms of Service.</strong>
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