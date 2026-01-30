
'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth/AuthProvider"

function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char])
}

export default function ContactPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email)
    }
  }, [user?.email, email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      toast({
        variant: "destructive",
        title: "Missing info",
        description: "Please fill out all fields before sending.",
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from("contact_messages")
        .insert({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          user_id: user?.id ?? null,
        })

      if (error) {
        throw error
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (supabaseUrl && supabaseAnonKey) {
        const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseAnonKey}`,
            apikey: supabaseAnonKey,
          },
          body: JSON.stringify({
            to: "jjolajitan2006@gmail.com",
            subject: `Contact: ${subject.trim()}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>New Contact Message</h2>
                <p><strong>Name:</strong> ${escapeHtml(name.trim())}</p>
                <p><strong>Email:</strong> ${escapeHtml(email.trim())}</p>
                <p><strong>Subject:</strong> ${escapeHtml(subject.trim())}</p>
                <p><strong>Message:</strong></p>
                <p>${escapeHtml(message.trim()).replace(/\n/g, "<br />")}</p>
              </div>
            `,
          }),
        })

        if (!response.ok) {
          console.error("Contact email failed:", await response.text())
          toast({
            variant: "destructive",
            title: "Email failed",
            description: "Message saved, but notification email failed.",
          })
        }
      }

      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you shortly.",
      })
      setName('')
      setSubject('')
      setMessage('')
    } catch (error) {
      console.error("Contact submission error:", error)
      toast({
        variant: "destructive",
        title: "Send failed",
        description: "Could not send your message. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">Get in Touch</h1>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
          Have a question or feedback? We'd love to hear from you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>Fill out the form and we'll be in touch.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Jane Doe"
                    required
                    disabled={loading}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jane.doe@example.com"
                    required
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Question about a listing"
                    required
                    disabled={loading}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    placeholder="Your message here..."
                    required
                    disabled={loading}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* FAQs */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How does renting work?</AccordionTrigger>
              <AccordionContent>
                Simply browse for an item you need, select your dates, and request a booking. Once the owner accepts and you complete the payment, you can arrange for pickup. After you're done, return the item.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Is it safe to rent on Rentilia?</AccordionTrigger>
              <AccordionContent>
                Safety is our top priority. We use a secure payment system with Stripe and a robust review system to ensure community trust. Our platform fee includes insurance coverage for eligible claims. All payments and communications happen through the platform to protect your information.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How do I get paid as an owner?</AccordionTrigger>
              <AccordionContent>
                Your earnings are processed securely through Stripe. After a rental is successfully completed, your payment will be transferred directly to your connected bank account, typically within 5-7 business days.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>What happens if an item is damaged?</AccordionTrigger>
              <AccordionContent>
                Owners can submit a claim with evidence to cover repair or replacement costs. We encourage renters and owners to communicate directly first. If a resolution can't be reached, our support team can help mediate.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  )
}
