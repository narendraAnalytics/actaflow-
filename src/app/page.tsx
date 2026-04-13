import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";

export default function Home() {
  return (
    <div className="h-svh overflow-hidden">
      <Navbar />
      <main className="h-full">
        <HeroSection />
      </main>
    </div>
  );
}
