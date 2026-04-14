import { auth } from "@clerk/nextjs/server";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import { getOrCreateUser } from "@/lib/auth";

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    try {
      await getOrCreateUser();
    } catch (err) {
      console.error('[getOrCreateUser] failed:', err);
    }
  }

  return (
    <div className="h-svh overflow-hidden">
      <Navbar />
      <main className="h-full">
        <HeroSection />
      </main>
    </div>
  );
}
