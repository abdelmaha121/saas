import Header from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HomePage } from '@/components/home/HomePage';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <HomePage />
      </main>
      <Footer />
    </div>
  );
}
