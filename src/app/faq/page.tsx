const FAQS = [
  {
    question: 'How does Rentilia work?',
    answer:
      'Rentilia lets people list items for rent and book them from nearby owners. Choose dates, pay securely at checkout, and pick up or arrange delivery based on the listing.',
  },
  {
    question: 'Is there a security deposit?',
    answer:
      'No. We do not charge a security deposit. Our platform fee includes insurance coverage for eligible claims.',
  },
  {
    question: 'How are replacement values used?',
    answer:
      'Replacement value helps determine insurance and coverage tiers. It is not a charge, but it guides protection and risk limits for the listing.',
  },
  {
    question: 'What happens if an item is damaged?',
    answer:
      'If an item is damaged, the owner can submit a claim with evidence. Our platform fee includes insurance coverage for eligible claims, and we may assist with disputes if needed.',
  },
  {
    question: 'Can I cancel a booking?',
    answer:
      'Cancellations depend on the listing’s policy and timing. If allowed, you can cancel from your dashboard before the rental begins.',
  },
  {
    question: 'How do I contact an owner or renter?',
    answer:
      'Use the Messages feature on the listing or in your dashboard to chat directly with the other party.',
  },
] as const;

export default function FAQPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <div className="space-y-10">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Support
          </p>
          <h1 className="text-4xl font-bold font-headline">Frequently Asked Questions</h1>
          <p className="text-muted-foreground">
            Quick answers to common questions about renting, payments, and policies.
          </p>
        </div>

        <div className="divide-y divide-border rounded-2xl border bg-card">
          {FAQS.map((faq) => (
            <div key={faq.question} className="p-6 md:p-8">
              <h2 className="text-lg font-semibold">{faq.question}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-dashed bg-background px-6 py-8 text-center">
          <h2 className="text-lg font-semibold">Still need help?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Reach out to our team and we’ll get back to you quickly.
          </p>
          <div className="mt-4">
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Contact support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
