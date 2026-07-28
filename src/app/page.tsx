import { Hero } from "@/components/home/Hero";
import { Carousel } from "@/components/home/Carousel";
import { QuickNavRow } from "@/components/home/QuickNavRow";
import { PromoCards } from "@/components/home/PromoCards";
import { SeekingAnswersGrid } from "@/components/home/SeekingAnswersGrid";
import { SecondaryLinks } from "@/components/home/SecondaryLinks";

export default function Home() {
  return (
    <div className="pb-10">
      <Hero />
      <Carousel />
      <QuickNavRow />
      <PromoCards />
      <SeekingAnswersGrid />
      <SecondaryLinks />
    </div>
  );
}
