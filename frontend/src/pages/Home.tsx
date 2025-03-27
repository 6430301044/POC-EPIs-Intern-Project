import FirstSection from "@/components/home_section/FirstSection";
import FirstMidleSection from "@/components/home_section/midle_section/FirstMidleSection";
import SecondSection from "@/components/home_section/SecondSection";
import ThirdSection from "@/components/home_section/ThirdSection";
import FourSection from "@/components/home_section/FourSection";

export default function Home() {
  return (
    <>
      <div id="firstSection">
        <FirstSection />
      </div>
      <div id="firstMidleSection">
        <FirstMidleSection />
      </div>
      <div id="secondSection">
        <SecondSection />
      </div>
      <div id="thirdSection">
        <ThirdSection /> 
      </div>
      <div id="fourSection">
        <FourSection />
      </div>
    </>
  );
}