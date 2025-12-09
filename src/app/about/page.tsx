
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { Banknote, GraduationCap, Handshake, Target, Triangle, Users } from "lucide-react"

export default function AboutPage() {
  const teamMembers = [
    { 
      name: "Oyinkansola Faith Olorunleke", 
      role: "Founder & CEO", 
      avatarId: "user_oyinkansola",
      achievements: [
        { icon: GraduationCap, text: "Bachelor of Arts, Trinity College Dublin" },
        { icon: Banknote, text: "Banking Advisor, PTSB" },
        { icon: Triangle, text: "Laidlaw Research Scholar" },
      ]
    },
    // Details for the second member can be added here
    // { 
    //   name: "John Smith", 
    //   role: "Lead Developer", 
    //   avatarId: "user_john",
    //   achievements: [
    //     { icon: Code, text: "Lead Developer at Tech Inc." },
    //     { icon: Cpu, text: "M.S. in Computer Science" },
    //   ]
    // },
  ]

  const getAvatarUrl = (id: string) => {
    return PlaceHolderImages.find((img) => img.id === id)?.imageUrl || ''
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="text-center mb-24">
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">Our Mission</h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
            To build a trusted community marketplace where people can safely and easily rent anything, reducing waste and providing economic empowerment for everyone.
          </p>
        </section>

        {/* Our Values Section */}
        <section className="grid md:grid-cols-3 gap-8 mb-24 text-center">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Empowerment</h3>
            <p className="text-muted-foreground">
              We empower item owners to earn extra income and renters to access what they need, when they need it.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
              <Handshake className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Trust & Safety</h3>
            <p className="text-muted-foreground">
              Your safety is our priority. We build tools and policies to foster a secure and reliable community.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Community</h3>
            <p className="text-muted-foreground">
              We believe in the power of sharing and connecting with people in your local neighborhood.
            </p>
          </div>
        </section>
        
        {/* Our Story Section */}
        <section className="max-w-4xl mx-auto mb-24">
            <h2 className="text-3xl font-bold text-center mb-8">Our Story</h2>
            <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p>
                    Rentilia was born from a simple observation: we all own things we barely use. A power drill for a single project, a large tent for an annual camping trip, a set of party speakers for a one-time event. These items sit idle, collecting dust, while someone just a few blocks away is looking to buy that exact same thing for temporary use.
                </p>
                <p>
                    We thought, "What if we could create a platform that connects these two people?" A platform that makes it as easy to rent a neighbor's lawnmower as it is to order a pizza. This idea sparked the creation of Rentilia, a peer-to-peer marketplace designed to make renting simple, safe, and beneficial for everyone involved.
                </p>
                <p>
                    From a small idea sketched on a napkin, we've grown into a passionate team dedicated to building a more sustainable and community-focused world. We're just getting started, and we're thrilled to have you on this journey with us.
                </p>
            </div>
        </section>


        {/* Team Section */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-8">Meet the Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-center">
            {teamMembers.map((member) => (
              <Card key={member.name} className="text-center">
                <CardContent className="p-6">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={getAvatarUrl(member.avatarId)} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h4 className="text-lg font-semibold">{member.name}</h4>
                  <p className="text-sm text-primary">{member.role}</p>
                  
                  {member.achievements && (
                    <div className="mt-4 pt-4 border-t border-border text-left space-y-3">
                      {member.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <achievement.icon className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{achievement.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
