import HeroCarousel from "@/components/home/HeroCarousel";
import KaaviDivider from "@/components/home/KaaviDivider";
import SpotlightCarousel from "@/components/home/SpotlightCarousel";
import HomeTiles from "@/components/home/HomeTiles";
import HomeFeatures from "@/components/home/HomeFeatures";
import BottomLinks from "@/components/home/BottomLinks";

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <KaaviDivider />
      <SpotlightCarousel />
      <HomeTiles />
      <HomeFeatures />
      <BottomLinks />
    </>
  );
}
