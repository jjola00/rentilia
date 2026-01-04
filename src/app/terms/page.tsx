
export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="prose dark:prose-invert prose-lg max-w-none">
        <h1 className="text-4xl font-bold font-headline mb-8">Terms of Service</h1>
        <p className="text-muted-foreground">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <h2>1. Introduction</h2>
        <p>
          Welcome to Rentilia. These Terms of Service govern your use of our website and any related services provided by us. By accessing or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, do not use the Service.
        </p>

        <h2>2. The Service</h2>
        <p>
          Rentilia is a peer-to-peer marketplace that allows users to list, discover, and rent items from one another. We are not a party to any rental agreement between users. We do not own, control, or manage any of the items listed on the Service. Our role is to facilitate the availability of the platform and to provide related services.
        </p>

        <h2>3. User Accounts</h2>
        <p>
          To use certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for any activities or actions under your account.
        </p>

        <h2>4. User Conduct</h2>
        <p>
          You agree not to use the Service to:
        </p>
        <ul>
          <li>Violate any local, state, national, or international law.</li>
          <li>List any items that are illegal, dangerous, or that you do not have the right to rent.</li>
          <li>Engage in any fraudulent activity, including but not limited to, providing false information or misrepresenting items.</li>
          <li>Harass, abuse, or harm another person.</li>
        </ul>

        <h2>5. Fees and Payments</h2>
        <h3>For Renters:</h3>
        <p>
          You agree to pay the rental fee and any applicable taxes for bookings you make. The platform fee includes insurance coverage for eligible claims.
        </p>
        <h3>For Owners:</h3>
        <p>
          We will deduct a service fee from the rental price before remitting the payout to you. Payouts are processed through our third-party payment provider, Stripe, and are subject to their terms.
        </p>

        <h2>6. Damage and Disputes</h2>
        <p>
          Renters are responsible for returning items in the condition they were received. If an item is damaged, lost, or stolen, the owner may submit a claim with evidence. The platform fee includes insurance coverage for eligible claims. Rentilia may assist in mediating disputes but is not obligated to do so and is not liable for any damages or losses.
        </p>

        <h2>7. Termination</h2>
        <p>
          We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
        </p>

        <h2>8. Disclaimers and Limitation of Liability</h2>
        <p>
          The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, express or implied, regarding the operation or availability of the Service or the information, content, or materials included therein.
        </p>
        <p>
          In no event shall Rentilia, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
        </p>

        <h2>9. Governing Law</h2>
        <p>
          These Terms shall be governed and construed in accordance with the laws of Ireland, without regard to its conflict of law provisions.
        </p>

        <h2>10. Changes to Terms</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice prior to any new terms taking effect. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
        </p>

        <h2>11. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us through our contact page.
        </p>
      </div>
    </div>
  )
}
