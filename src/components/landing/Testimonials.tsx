import { Star } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Legal Associate",
    content: "DocChat has completely transformed how I review contracts. What used to take hours now takes minutes. The accuracy of the summaries is impressive.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Research Scientist",
    content: "The ability to chat with my research papers is a game changer. I can quickly extract key findings and methodologies without reading every single page.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 5
  },
  {
    name: "Emily Rodriguez",
    role: "Student",
    content: "I use this for all my course readings. The summaries are concise and help me study much more efficiently. Highly recommended for students!",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 5
  }
];

export const Testimonials = () => {
  return (
    <section className="py-16 sm:py-24 bg-secondary/30">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">
            Loved by Professionals
          </h2>
          <p className="mx-auto mt-3 sm:mt-4 max-w-[700px] text-sm sm:text-base text-muted-foreground md:text-xl px-2">
            Join thousands of users who are saving time and working smarter with DocChat.
          </p>
        </div>
        <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-background border-none shadow-lg">
              <CardHeader className="flex flex-row items-center gap-3 sm:gap-4 pb-3 sm:pb-4">
                <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="font-semibold text-sm sm:text-base">{testimonial.name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "{testimonial.content}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
