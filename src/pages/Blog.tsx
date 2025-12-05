import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "How AI is Revolutionizing Legal Contract Review",
    excerpt: "Discover how artificial intelligence is helping lawyers and businesses review contracts faster and more accurately than ever before.",
    date: "March 15, 2024",
    category: "Legal Tech",
    slug: "ai-legal-contract-review"
  },
  {
    id: 2,
    title: "The Future of Academic Research: Chatting with Papers",
    excerpt: "Learn how students and researchers are using AI to extract insights from complex academic papers in seconds.",
    date: "March 10, 2024",
    category: "Education",
    slug: "future-academic-research"
  },
  {
    id: 3,
    title: "5 Ways to Speed Up Financial Report Analysis",
    excerpt: "Tips and tricks for financial analysts to process quarterly earnings reports and financial statements efficiently.",
    date: "March 5, 2024",
    category: "Finance",
    slug: "speed-up-financial-analysis"
  }
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header showChat={false} />
      
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              DocChat Blog
            </h1>
            <p className="text-xl text-muted-foreground">
              Insights, updates, and guides on AI document intelligence.
            </p>
          </div>

          <div className="grid gap-8">
            {blogPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {post.date}
                    </span>
                  </div>
                  <CardTitle className="text-2xl hover:text-primary transition-colors">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    {post.excerpt}
                  </p>
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <Link to={`/blog/${post.slug}`} className="flex items-center gap-2">
                      Read more <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
