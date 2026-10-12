import type { Metadata } from "next";
import { LegalPage } from "@/features/legal/legal-page";
import { legalConfig } from "@/features/legal/legal-config";

export const metadata: Metadata = { title: "Terms of Service · Make My Font" };

const sections = [
  {
    title: "Who provides the service",
    paragraphs: [
      `${legalConfig.productName} is provided by ${legalConfig.operatorName}, located at ${legalConfig.operatorAddress}. These details must be completed before public launch.`,
    ],
  },
  {
    title: "Using Make My Font",
    paragraphs: [
      "You may use the service to draw glyphs, generate font files, write with your fonts, and export your work. You are responsible for your account and for activity performed through it.",
      "Do not use the service to break the law, infringe intellectual property, distribute harmful material, interfere with the service, or attempt unauthorized access to other accounts or systems.",
    ],
  },
  {
    title: "Your content",
    paragraphs: [
      "You keep ownership of the glyphs, font projects, writing, and exports you create. You give us a limited license to host, process, reproduce, and transmit that content only as needed to operate, secure, and improve the service.",
      "You confirm that you have the rights needed to upload and use your content. Generated exports may depend on browser and font technology and should be checked before professional or commercial production.",
    ],
  },
  {
    title: "Availability and account termination",
    paragraphs: [
      "We may change, suspend, or discontinue features and may restrict access when needed for security, legal compliance, or service integrity. We will try to provide reasonable notice when practical.",
      `You can request account deletion by contacting ${legalConfig.privacyEmail}. We may terminate accounts that materially or repeatedly violate these terms.`,
    ],
  },
  {
    title: "Disclaimers and liability",
    paragraphs: [
      "The service is provided as available without guarantees that it will always be uninterrupted or error-free. Nothing in these terms excludes rights or liabilities that cannot legally be excluded.",
      "To the extent permitted by law, we are not responsible for indirect, incidental, special, or consequential loss resulting from use of the service or exported files.",
    ],
  },
  {
    title: "Changes, law, and contact",
    paragraphs: [
      `These terms are governed by ${legalConfig.governingLaw}. We may update them and will revise the effective date when changes are material. Questions can be sent to ${legalConfig.privacyEmail}.`,
    ],
  },
] as const;

const TermsPage = () => (
  <LegalPage
    title="Terms of Service"
    introduction="These terms explain the rules for using Make My Font and the rights that apply to the work you create."
    sections={sections}
  />
);

export default TermsPage;
