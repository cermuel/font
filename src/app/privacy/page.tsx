import type { Metadata } from "next";
import { LegalPage } from "@/features/legal/legal-page";
import { legalConfig } from "@/features/legal/legal-config";

export const metadata: Metadata = { title: "Privacy Policy · Make My Font" };

const sections = [
  {
    title: "Information we handle",
    paragraphs: [
      "We process your name, email address, optional profile image, authentication records, and necessary session information when you sign in with Google or an emailed code.",
      "We store font names, glyph strokes, editor settings, writing content, project versions, and timestamps when you save a font. Anonymous drafts and recovery copies may remain in your browser's local storage until saved or cleared.",
    ],
  },
  {
    title: "How we use information",
    paragraphs: [
      "We use this information to authenticate you, save and synchronize fonts, produce requested exports, recover edits, prevent abuse, secure the service, respond to support requests, and meet legal obligations.",
      "We do not sell personal information or use advertising trackers. Necessary cookies maintain secure sessions and OAuth state.",
    ],
  },
  {
    title: "Service providers",
    paragraphs: [
      "Google processes information when you choose Google sign-in. Neon hosts the application database. Resend delivers sign-in codes. Our hosting provider processes requests and operational logs needed to run the application.",
      "These providers process information under their own terms and privacy commitments. Information may be processed in countries outside your own, subject to applicable safeguards.",
    ],
  },
  {
    title: "Retention and deletion",
    paragraphs: [
      "Saved fonts remain until you delete them or your account. Deleting a font removes the active database record, although limited encrypted backups may remain temporarily under provider retention schedules.",
      `To request access, correction, export, or account deletion, contact ${legalConfig.privacyEmail}. We may retain limited records where required for security, fraud prevention, disputes, or law.`,
    ],
  },
  {
    title: "Security and children",
    paragraphs: [
      "We use access controls, encrypted connections, hashed one-time codes, and provider security features to protect information. No online service can guarantee absolute security.",
      "The service is not directed to children under the minimum age required to consent to online services in their country. Contact us if you believe a child provided information without appropriate permission.",
    ],
  },
  {
    title: "Changes and contact",
    paragraphs: [
      `We may update this policy as the product changes and will revise the effective date for material updates. The data operator is ${legalConfig.operatorName} at ${legalConfig.operatorAddress}. Privacy questions can be sent to ${legalConfig.privacyEmail}.`,
    ],
  },
] as const;

const PrivacyPage = () => (
  <LegalPage
    title="Privacy Policy"
    introduction="This policy describes the information Make My Font uses to provide accounts, cloud saving, and font creation."
    sections={sections}
  />
);

export default PrivacyPage;
