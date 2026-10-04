import AboutSplit from "@/components/home/about-split";
import ClosingBanner from "@/components/home/closing-banner";
import ContactSection from "@/components/home/contact-section";
import Faq from "@/components/home/faq";
import IndustriesStrip from "@/components/home/industries-strip";
import ProcessCarousel from "@/components/home/process-carousel";
import RecentWork from "@/components/home/recent-work";
import ServicesAccordion from "@/components/home/services-accordion";
import Testimonials from "@/components/home/testimonials";
import Hero from "@/components/hero";

export default function Home() {
  return (
    <>
      <Hero />
      <IndustriesStrip />
      <AboutSplit />
      <RecentWork />
      <ServicesAccordion />
      <ProcessCarousel />
      <Faq />
      <Testimonials />
      <ClosingBanner />
      <ContactSection />
    </>
  );
}
