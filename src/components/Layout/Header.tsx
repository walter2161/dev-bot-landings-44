import { Bot, Code, Palette, Sparkles, Info } from "lucide-react";
import { Button } from "@/components/ui/enhanced-button";
import { LanguageSelector } from "@/components/ui/language-selector";
import DocumentationModal from "@/components/ui/documentation-modal";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const Header = () => {
  const { t } = useTranslation();
  const [showDocumentation, setShowDocumentation] = useState(false);

  return (
    <>
      <DocumentationModal 
        open={showDocumentation} 
        onOpenChange={setShowDocumentation} 
      />
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/6381dbd8-479d-45ec-aad0-a9b41c25b1e8.png" 
            alt="PageJet" 
            className="h-8"
          />
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Palette className="w-4 h-4" />
            <span>{t('navigation.customization')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span>{t('navigation.aiAssistant')}</span>
          </div>
        </nav>

        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground hidden sm:block">
            {t('app.poweredBy')}
          </div>
          <LanguageSelector />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDocumentation(true)}
            className="h-8 w-8 p-0 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            title={t('buttons.documentation')}
          >
            <Info className="w-4 h-4 text-primary" />
          </Button>
        </div>
      </div>
    </header>
    </>
  );
};

export default Header;