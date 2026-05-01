import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";

import { AppLink } from "@/components/app-link";
import { env } from "@/env";

export const Route = createFileRoute("/privacy-policy/")({
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: "Privacy Policy • Grepedia" },
      {
        content:
          "Read Grepedia's Privacy Policy to understand how your data is collected, used, and protected.",
        name: "description",
      },
    ],
  }),
});

function RouteComponent() {
  const supportEmailHref = `mailto:${env.VITE_SUPPORT_EMAIL}`;

  return (
    <main className="mx-auto prose p-4 prose-neutral sm:p-8 dark:prose-invert">
      <h1 className="text-3xl">Privacy Policy for Grepedia</h1>
      <p>
        <em>Last Updated: April 4, 2026</em>
      </p>

      <h2>Introduction</h2>
      <p>
        Grepedia (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates{" "}
        <AppLink to={env.VITE_BASE_URL}>{env.VITE_BASE_URL}</AppLink> (the
        &quot;Service&quot;). This Privacy Policy explains how we collect, use,
        disclose, and safeguard your information when you visit our Service.
        Please read this privacy policy carefully. If you do not agree with the
        terms of this privacy policy, please do not access the Service.
      </p>
      <p>
        Please also review our{" "}
        <AppLink to="/terms-of-service">Terms of Service</AppLink>.
      </p>

      <h2>Information We Collect</h2>
      <p>We may collect the following types of information:</p>
      <ul>
        <li>Name</li>
        <li>Email address</li>
        <li>Country</li>
        <li>Gender</li>
        <li>IP address</li>
        <li>Cookies and tracking data</li>
        <li>Device information</li>
        <li>Usage data</li>
        <li>Location data</li>
      </ul>
      <p>
        We collect this information when you voluntarily provide it to us, when
        you use our Service, or through automated technologies.
      </p>

      <h2>How We Use Your Information</h2>
      <p>
        We may use the information we collect for various purposes, including
        to:
      </p>
      <ul>
        <li>Provide, operate, and maintain our Service</li>
        <li>Improve, personalize, and expand our Service</li>
        <li>Understand and analyze how you use our Service</li>
        <li>Develop new products, services, features, and functionality</li>
        <li>
          Communicate with you for customer service, updates, and marketing
          purposes
        </li>
        <li>Process transactions and send related information</li>
        <li>Find and prevent fraud</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>Cookies and Tracking Technologies</h2>
      <p>
        We use cookies and similar tracking technologies to track activity on
        our Service and hold certain information. Cookies are files with a small
        amount of data which may include an anonymous unique identifier.
      </p>
      <p>
        You can instruct your browser to refuse all cookies or to indicate when
        a cookie is being sent. However, if you do not accept cookies, you may
        not be able to use some portions of our Service.
      </p>

      <h2>Data Retention</h2>
      <p>
        We will retain your personal information only for as long as is
        necessary for the purposes set out in this Privacy Policy. We will
        retain and use your information to the extent necessary to comply with
        our legal obligations, resolve disputes, and enforce our policies.
      </p>

      <h2>Data Security</h2>
      <p>
        The security of your data is important to us, but remember that no
        method of transmission over the Internet or method of electronic storage
        is 100% secure. While we strive to use commercially acceptable means to
        protect your personal information, we cannot guarantee its absolute
        security.
      </p>

      <h2>Your Rights Under GDPR (European Users)</h2>
      <p>
        If you are a resident of the European Economic Area (EEA), you have
        certain data protection rights under the General Data Protection
        Regulation (GDPR). Grepedia aims to take reasonable steps to allow you
        to correct, amend, delete, or limit the use of your personal data.
      </p>
      <p>You have the following rights:</p>
      <ul>
        <li>
          <strong>Right to Access</strong> — You have the right to request
          copies of your personal data.
        </li>
        <li>
          <strong>Right to Rectification</strong> — You have the right to
          request that we correct any information you believe is inaccurate or
          complete information you believe is incomplete.
        </li>
        <li>
          <strong>Right to Erasure</strong> — You have the right to request that
          we erase your personal data, under certain conditions.
        </li>
        <li>
          <strong>Right to Restrict Processing</strong> — You have the right to
          request that we restrict the processing of your personal data, under
          certain conditions.
        </li>
        <li>
          <strong>Right to Data Portability</strong> — You have the right to
          request that we transfer the data we have collected to another
          organization, or directly to you, under certain conditions.
        </li>
        <li>
          <strong>Right to Object</strong> — You have the right to object to our
          processing of your personal data, under certain conditions.
        </li>
      </ul>
      <p>
        If you wish to exercise any of these rights, please contact us at{" "}
        <Button asChild className="size-fit p-0" variant="link">
          <a href={supportEmailHref}>{env.VITE_SUPPORT_EMAIL}</a>
        </Button>
        . We will respond to your request within 30 days.
      </p>

      <h2>Your Rights Under CCPA (California Residents)</h2>
      <p>
        If you are a California resident, you have specific rights regarding
        your personal information under the California Consumer Privacy Act
        (CCPA).
      </p>
      <p>You have the right to:</p>
      <ul>
        <li>
          <strong>Know</strong> — Request that we disclose what personal
          information we collect, use, and disclose about you.
        </li>
        <li>
          <strong>Delete</strong> — Request that we delete your personal
          information, subject to certain exceptions.
        </li>
        <li>
          <strong>Opt-Out</strong> — Opt out of the sale of your personal
          information. We do not sell personal information.
        </li>
        <li>
          <strong>Non-Discrimination</strong> — Not be discriminated against for
          exercising your CCPA rights.
        </li>
      </ul>
      <p>
        To exercise your rights, contact us at{" "}
        <Button asChild className="size-fit p-0" variant="link">
          <a href={supportEmailHref}>{env.VITE_SUPPORT_EMAIL}</a>
        </Button>
        . We will verify your identity before processing your request and
        respond within 45 days.
      </p>

      <h2>CalOPPA Compliance</h2>
      <p>
        In accordance with the California Online Privacy Protection Act
        (CalOPPA), we agree to the following:
      </p>
      <ul>
        <li>Users can visit our site anonymously.</li>
        <li>
          Our Privacy Policy link includes the word &quot;Privacy&quot; and can
          be easily found on our home page.
        </li>
        <li>
          Users will be notified of any privacy policy changes on this page.
        </li>
        <li>
          Users can change their personal information by contacting us at{" "}
          <Button asChild className="size-fit p-0" variant="link">
            <a href={supportEmailHref}>{env.VITE_SUPPORT_EMAIL}</a>
          </Button>
          .
        </li>
      </ul>
      <p>
        We honor Do Not Track signals and do not track, plant cookies, or use
        advertising when a Do Not Track browser mechanism is in place.
      </p>

      <h2>Changes to This Privacy Policy</h2>
      <p>
        We may update our Privacy Policy from time to time. We will notify you
        of any changes by posting the new Privacy Policy on this page and
        updating the &quot;Last Updated&quot; date.
      </p>
      <p>
        You are advised to review this Privacy Policy periodically for any
        changes. Changes to this Privacy Policy are effective when they are
        posted on this page.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us:
      </p>
      <ul>
        <li>
          By email:{" "}
          <Button asChild className="size-fit p-0" variant="link">
            <a href={supportEmailHref}>{env.VITE_SUPPORT_EMAIL}</a>
          </Button>
        </li>
        <li>
          By visiting:{" "}
          <AppLink to={env.VITE_BASE_URL}>{env.VITE_BASE_URL}</AppLink>
        </li>
      </ul>
    </main>
  );
}
