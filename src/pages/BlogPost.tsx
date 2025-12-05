import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, User } from "lucide-react";

const BlogPost = () => {
  const { slug } = useParams();

  // Placeholder content - in a real app, fetch based on slug
  const post = {
    title: "How AI is Revolutionizing Legal Contract Review",
    date: "March 15, 2024",
    author: "Alex Thompson",
    category: "Legal Tech",
    content: `
      <p class="mb-6">The legal industry is undergoing a massive transformation. Artificial Intelligence is no longer just a buzzword; it's a practical tool that is changing how lawyers work every day.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">The Challenge of Manual Review</h2>
      <p class="mb-6">Traditionally, contract review has been a tedious, time-consuming process. Junior associates spend countless hours reading through hundreds of pages of dense legal text, looking for specific clauses, risks, and obligations. This process is not only slow but also prone to human error.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Enter AI-Powered Analysis</h2>
      <p class="mb-6">With tools like DocChat, legal professionals can now instantly extract key information from contracts. AI can identify:</p>
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li>Termination clauses and notice periods</li>
        <li>Indemnification obligations</li>
        <li>Non-compete and non-solicitation terms</li>
        <li>Payment terms and renewal dates</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">The Benefit: Speed and Accuracy</h2>
      <p class="mb-6">By automating the initial review, lawyers can focus on high-value strategic work. What used to take days can now be done in minutes, allowing firms to serve clients faster and more cost-effectively.</p>
      
      <p class="mb-6">As AI technology continues to evolve, we can expect even more sophisticated capabilities, making legal services more accessible and efficient for everyone.</p>
    `
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header showChat={false} />
      
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" asChild className="mb-8">
            <Link to="/blog" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </Button>

          <article>
            <div className="mb-8">
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                  {post.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {post.author}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight">
                {post.title}
              </h1>
            </div>

            <div 
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
