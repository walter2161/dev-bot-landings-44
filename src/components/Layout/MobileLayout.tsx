import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { Button } from '@/components/ui/enhanced-button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LanguageSelector } from '@/components/ui/language-selector';
import { BusinessContent } from '@/services/contentGenerator';
import { 
  Bot, 
  Menu, 
  MessageCircle, 
  FileText, 
  Type, 
  Settings, 
  Palette, 
  Layout, 
  Image,
  X,
  Info
} from 'lucide-react';
import SmartChat from '@/components/Chat/SmartChat';
import ContentTab from './SidebarTabs/ContentTab';
import DesignTab from './SidebarTabs/DesignTab';
import ImagesTab from './SidebarTabs/ImagesTab';
import SellerbotTab from './SidebarTabs/SellerbotTab';
import SEOTab from './SidebarTabs/SEOTab';
import LayoutTab from './SidebarTabs/LayoutTab';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import DocumentationModal from '@/components/ui/documentation-modal';

interface MobileLayoutProps {
  businessData?: BusinessContent | null;
  onLandingPageGenerated: (html: string, data: BusinessContent) => void;
  children: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  businessData,
  onLandingPageGenerated,
  children
}) => {
  const { t } = useTranslation();
  const deviceInfo = useDeviceDetection();
  const [activeTab, setActiveTab] = useState('chat');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);

  const tabs = [
    { id: 'chat', label: t('navigation.chat'), icon: MessageCircle },
    { id: 'briefing', label: t('navigation.briefing'), icon: FileText },
    { id: 'content', label: t('navigation.content'), icon: Type },
    { id: 'sellerbot', label: t('navigation.sellerbot'), icon: Bot },
    { id: 'seo', label: t('navigation.seo'), icon: Settings },
    { id: 'design', label: t('navigation.design'), icon: Palette },
    { id: 'layout', label: t('navigation.layouts'), icon: Layout },
    { id: 'images', label: t('navigation.images'), icon: Image },
  ];

  const handleLandingPageGeneratedInternal = (html: string, data: BusinessContent) => {
    onLandingPageGenerated(html, data);
    setIsMenuOpen(false); // Close menu after generation
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">
                {t('chat.title')}
              </h3>
              <Badge variant="secondary" className="text-xs">AI</Badge>
            </div>
            <div className="h-[60vh] bg-gradient-card rounded-lg border border-border/50">
              <SmartChat 
                onLandingPageGenerated={handleLandingPageGeneratedInternal}
                briefingPrompt=""
                isIntegrated={true}
                onNavigateToBriefing={() => setActiveTab('briefing')}
                businessData={businessData}
              />
            </div>
          </div>
        );
      case 'content':
        return (
          <ContentTab 
            businessData={businessData}
            onContentUpdate={() => {}}
            onLandingPageGenerated={handleLandingPageGeneratedInternal}
          />
        );
      case 'design':
        return (
          <DesignTab 
            businessData={businessData}
            onLandingPageGenerated={handleLandingPageGeneratedInternal}
          />
        );
      case 'images':
        return (
          <ImagesTab 
            businessData={businessData}
            onLandingPageGenerated={handleLandingPageGeneratedInternal}
          />
        );
      case 'sellerbot':
        return (
          <SellerbotTab 
            businessData={businessData}
            onLandingPageGenerated={handleLandingPageGeneratedInternal}
          />
        );
      case 'seo':
        return (
          <SEOTab 
            businessData={businessData}
            onLandingPageGenerated={handleLandingPageGeneratedInternal}
          />
        );
      case 'layout':
        return (
          <LayoutTab 
            businessData={businessData}
            onLandingPageGenerated={handleLandingPageGeneratedInternal}
          />
        );
      default:
        return (
          <div className="p-4 text-center text-muted-foreground">
            Select a tab to get started
          </div>
        );
    }
  };

  if (!deviceInfo.isMobile) {
    return <>{children}</>;
  }

  return (
    <>
      <DocumentationModal 
        open={showDocumentation} 
        onOpenChange={setShowDocumentation} 
      />
      
      <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/5a86d691-a877-4647-b08c-a2bddb5e5e71.png" 
                alt="PageJet Logo" 
                className="w-8 h-8 rounded-lg"
              />
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  {t('app.title')}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {t('app.subtitle')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDocumentation(true)}
                className="h-8 w-8 p-0 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <Info className="w-4 h-4 text-primary" />
              </Button>
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-[400px] p-0">
                  <div className="flex flex-col h-full">
                    {/* Mobile Menu Header */}
                    <div className="p-4 border-b border-border bg-card/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img 
                            src="/lovable-uploads/5a86d691-a877-4647-b08c-a2bddb5e5e71.png" 
                            alt="PageJet Logo" 
                            className="w-6 h-6 rounded-md"
                          />
                          <span className="font-semibold text-foreground">
                            {t('app.title')}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsMenuOpen(false)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Mobile Tab Navigation */}
                      <div className="grid grid-cols-4 gap-1 mt-4">
                        {tabs.map((tab) => {
                          const Icon = tab.icon;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id)}
                              className={`flex flex-col items-center gap-1 p-2 rounded-md text-xs transition-all ${
                                activeTab === tab.id
                                  ? "bg-primary/10 text-primary"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <span className="leading-none">{tab.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Mobile Tab Content */}
                    <div className="flex-1 overflow-y-auto">
                      {renderTabContent()}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {/* Mobile Main Content */}
        <main className="pb-20">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border">
          <div className="grid grid-cols-4 gap-1 p-2">
            {tabs.slice(0, 4).map((tab) => {
              const Icon = tab.icon;
              return (
                <Sheet key={tab.id} open={isMenuOpen && activeTab === tab.id} onOpenChange={(open) => {
                  if (open) {
                    setActiveTab(tab.id);
                    setIsMenuOpen(true);
                  } else {
                    setIsMenuOpen(false);
                  }
                }}>
                  <SheetTrigger asChild>
                    <button
                      className={`flex flex-col items-center gap-1 p-3 rounded-lg text-xs transition-all ${
                        activeTab === tab.id && isMenuOpen
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="leading-none">{tab.label}</span>
                    </button>
                  </SheetTrigger>
                </Sheet>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};