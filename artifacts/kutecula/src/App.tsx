import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LanguageProvider } from '@/context/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { Hero } from '@/components/Hero';
import { Portfolio } from '@/components/Portfolio';
import { Services } from '@/components/Services';
import { About } from '@/components/About';
import { Contact } from '@/components/Contact';
import { Switch, Route } from 'wouter';
import AdminPortfolio from '@/pages/AdminPortfolio';

const queryClient = new QueryClient();

function Home() {
  return (
    <div className="min-h-screen w-full bg-[#0d0d0d]">
      <Navigation />
      <Hero />
      <Portfolio />
      <Services />
      <About />
      <Contact />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <Switch>
            <Route path="/admin" component={AdminPortfolio} />
            <Route component={Home} />
          </Switch>
          <Toaster />
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
