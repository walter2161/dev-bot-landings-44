
import { useState } from "react";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import Sidebar from "@/components/Layout/Sidebar";
import { MobileLayout } from "@/components/Layout/MobileLayout";
import PreviewFrame from "@/components/LandingPageBuilder/PreviewFrame";
import ImageDebugger from "@/components/Debug/ImageDebugger";
import { BusinessContent } from "@/services/contentGenerator";

const Index = () => {
  const deviceInfo = useDeviceDetection();
  const [generatedHTML, setGeneratedHTML] = useState<string>();
  const [businessData, setBusinessData] = useState<BusinessContent>();
  const [isDebuggerVisible, setIsDebuggerVisible] = useState(false);

  const handleLandingPageGenerated = (html: string, data: BusinessContent) => {
    setGeneratedHTML(html);
    setBusinessData(data);
  };

  if (deviceInfo.isMobile) {
    return (
      <MobileLayout
        businessData={businessData}
        onLandingPageGenerated={handleLandingPageGenerated}
      >
        <PreviewFrame 
          generatedHTML={generatedHTML} 
          businessData={businessData} 
        />
        <ImageDebugger
          businessData={businessData}
          isVisible={isDebuggerVisible}
          onToggle={() => setIsDebuggerVisible(!isDebuggerVisible)}
        />
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <Sidebar onLandingPageGenerated={handleLandingPageGenerated} businessData={businessData} />
        <PreviewFrame 
          generatedHTML={generatedHTML} 
          businessData={businessData} 
        />
      </div>
      
      <ImageDebugger
        businessData={businessData}
        isVisible={isDebuggerVisible}
        onToggle={() => setIsDebuggerVisible(!isDebuggerVisible)}
      />
    </div>
  );
};

export default Index;
