import Banner from "@/components/landingPage/Banner";
import Club from "@/components/landingPage/Club";
import Feature from "@/components/landingPage/Feature";
import HowItWorks from "@/components/landingPage/HowItWorks";
import Navbar from "@/components/sheard/Navbar";
import Footer from "@/components/sheard/Footer";
import LatestNews from "@/components/landingPage/LatestNews";
import UpcomingEventsSection from "@/components/landingPage/UpcomingEvents";
import AddSection from "@/components/landingPage/AddSection";
import AdBanner from "@/components/landingPage/AdBanner";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="w-full font-sans">
        <Banner />
        <Club />
        <HowItWorks />
        <Feature />
        <div className="container mx-auto px-4 md:px-0">
          <AdBanner/>
        </div>
        <LatestNews />
        <UpcomingEventsSection />
        <AddSection />
      </main>
      <Footer />
    </>
  );
}
