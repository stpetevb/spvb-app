import React from "react";
import styles from "./LegalPage.module.css";
import logo from "../assets/spvb_logo_transparent.png";

export default function Waiver() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <img src={logo} alt="St. Pete Volleyball Logo" className={styles.logo} />
        <h1 className={styles.title}>St. Pete Volleyball</h1>
        <h2 className={styles.subtitle}>Participant Agreement & Release</h2>
      </div>

      <div className={styles.content}>
        <p>
          At St. Pete Volleyball, our goal is to create a fun, safe, and
          inclusive environment where everyone can play, connect, and compete.
          By registering for any tournament or event, you’re agreeing to the
          following terms so we can all enjoy the game responsibly and
          respectfully.
        </p>

        <h3>1. Playing Safe & Accepting Risk</h3>
        <p>
          Volleyball is a physical sport, and as with any athletic activity,
          injuries can happen. By joining, you understand and accept the normal
          risks that come with playing—such as bumps, sprains, strains, or
          other physical injuries—and agree that St. Pete Volleyball, its
          organizers, staff, volunteers, and partners can’t be held responsible
          for any injury, loss, or damage that may occur while participating,
          watching, or attending our events.
        </p>

        <h3>2. Health & Wellness</h3>
        <p>
          You agree that you’re healthy enough to play and will listen to your
          body while participating. If you’re not feeling well or have symptoms
          of a contagious illness, please stay home to help keep others safe. In
          case of a medical emergency, you authorize event staff to seek medical
          attention for you if necessary and agree to be responsible for any
          related expenses.
        </p>

        <h3>3. Photo, Video & Media Use</h3>
        <p>
          We love capturing the moments that make our tournaments special. By
          registering, you give St. Pete Volleyball permission to take and share
          photos or videos of you during events on our website, social media,
          and promotional materials.
        </p>

        <h3>4. Names, Profiles & Event History</h3>
        <p>
          Cam is a nerd and likes to maintain records of teams, players, and results to celebrate our
          community and build a lasting history of play. You agree that your
          full name, team name, and division information may appear publicly on
          our website and social media—including in leaderboards, standings,
          and player profiles that may display participation history from
          past, present, and future tournaments. We will never share or sell personal
          contact details—only names, stats, and team affiliations may appear
          publicly.
        </p>

        <h3>5. Venue & Property Use</h3>
        <p>
          Many of our tournaments take place at local parks or rented
          facilities. By participating, you agree to respect the property,
          follow the venue’s rules, and be courteous to staff and the
          surrounding community. Because many of our events are held at parks or
          rented facilities, you understand that the property owners and their
          staff are also covered under this same release.
        </p>

        <h3>6. Community Conduct</h3>
        <p>
          We’re all here for great volleyball and good vibes. You agree to treat
          other players, referees, organizers, and spectators with respect and
          sportsmanship. Harassment, discrimination, or unsafe behavior can
          result in removal from the event without refund.
        </p>

        <h3>7. Team Registration</h3>
        <p>
          If you’re registering a team, you confirm that you’re authorized to do
          so on behalf of your teammates. You agree that you’ve informed them of
          this Participant Agreement & Release, and by registering, you’re
          accepting these terms for all listed players. Each teammate
          understands that participation is voluntary and subject to the same
          terms outlined here.
        </p>

        <h3>8. Acknowledgment</h3>
        <p>
          By registering or participating in a St. Pete Volleyball event, you
          confirm that you’ve read and agree to this Participant Agreement &
          Release, and that you understand participation is voluntary and at
          your own risk. This agreement applies to all current and future St.
          Pete Volleyball tournaments, leagues, or events you participate in.
        </p>

        <p className={styles.note}>
          (If a participant is under 18, a parent or guardian must review and
          consent to this agreement on their behalf before participation.)
        </p>
      </div>

      <div className={styles.footer}>
        <p className={styles.effectiveDate}>
          Effective Date: {new Date().toLocaleDateString()}
        </p>
        <p>
          St. Pete Volleyball © {new Date().getFullYear()} — All Rights
          Reserved.
        </p>
      </div>
    </div>
  );
}