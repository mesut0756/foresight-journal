import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import { Moon, Sun, TrendingUp, Brain, BarChart3 } from 'lucide-react';

export default function Homepage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const features = [
    {
      icon: TrendingUp,
      title: "Track Every Trade",
      description: "Log entries, exits, lot size, risk, and results in seconds."
    },
    {
      icon: Brain,
      title: "Improve Discipline",
      description: "See patterns in your wins and losses with clear statistics."
    },
    {
      icon: BarChart3,
      title: "Built for Forex Traders",
      description: "Simple, fast, and focused on real trading performance."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold text-foreground">Forex Journal</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/auth')}
              className="border-primary text-primary hover:bg-primary/10"
            >
              Login
            </Button>
            
            <Button
              onClick={() => navigate('/auth')}
              className="bg-primary hover:bg-primary/90"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-16">
        <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Trade Smarter.{' '}
              <span className="text-primary">Journal Better.</span>
              <br />
              Win Consistently.
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Track every forex trade, analyze your performance, and build discipline like a professional trader.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Button
                size="lg"
                onClick={() => navigate('/auth?mode=signup')}
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
              >
                Get Started – It's Free
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/auth')}
                className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-6"
              >
                Login to Your Journal
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              No distractions. Just trading clarity.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 bg-secondary/30">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="bg-card rounded-2xl border border-border p-8 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Start Journaling Your Trades Today
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join traders who are serious about improving their performance.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/auth?mode=signup')}
              className="bg-primary hover:bg-primary/90 text-lg px-10 py-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
            >
              Create Your Free Journal
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-border">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>© {new Date().getFullYear()} Forex Journal. Built for traders, by traders.</span>
            <Link to="/privacy-policy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
