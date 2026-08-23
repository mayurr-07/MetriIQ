import { useState } from "react";
import InspectionScene from "@/components/three/InspectionScene";
import SmoothScroll from "@/components/layout/SmoothScroll";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Preloader from "@/components/ui/Preloader";
import ContactModal from "@/components/ui/ContactModal";
import InspectSection from "@/components/sections/InspectSection";
import UnderstandSection from "@/components/sections/UnderstandSection";
import VerifySection from "@/components/sections/VerifySection";
import ProtectSection from "@/components/sections/ProtectSection";

export default function App() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <SmoothScroll>
      <Preloader />
      <Navbar onOpenContact={() => setContactOpen(true)} />

      {/* the physical world — always in frame, always the same package */}
      <div className="fixed inset-0 z-0">
        <InspectionScene />
      </div>

      {/* legibility scrims + atmosphere */}
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[linear-gradient(180deg,rgba(8,12,20,0.92)_0%,rgba(8,12,20,0.22)_22%,rgba(8,12,20,0.18)_60%,rgba(8,12,20,0.72)_100%)]" />
      <div className="pointer-events-none fixed inset-0 z-[1] hidden bg-[linear-gradient(90deg,rgba(8,12,20,0.85)_0%,rgba(8,12,20,0)_38%),linear-gradient(270deg,rgba(8,12,20,0.85)_0%,rgba(8,12,20,0)_38%)] lg:block" />
      <div className="fx-vignette" />
      <div className="fx-scanlines" />
      <div className="fx-grain" />

      <main id="story" className="relative z-10">
        <InspectSection />
        <UnderstandSection />
        <VerifySection />
        <ProtectSection />
      </main>

      <Footer onOpenContact={() => setContactOpen(true)} />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </SmoothScroll>
  );
}
