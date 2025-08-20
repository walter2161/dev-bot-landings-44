import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/enhanced-button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SmartChat from "@/components/Chat/SmartChat";

import DesignTab from "./SidebarTabs/DesignTab";
import ContentTab from "./SidebarTabs/ContentTab";
import ImagesTab from "./SidebarTabs/ImagesTab";
import SellerbotTab from "./SidebarTabs/SellerbotTab";
import SEOTab from "./SidebarTabs/SEOTab";
import LayoutTab from "./SidebarTabs/LayoutTab";
import { BusinessContent } from "@/services/contentGenerator";
import { landingPageBuilder } from "@/services/landingPageBuilder";
import { 
  Layout, 
  Palette, 
  Type, 
  Image, 
  MessageCircle, 
  Download,
  Settings,
  Play,
  Eye,
  FileText,
  RefreshCw,
  Bot
} from "lucide-react";
import { toast } from "sonner";

interface SidebarProps {
  onLandingPageGenerated: (html: string, data: BusinessContent) => void;
  businessData?: BusinessContent | null;
}

const getBusinessThemes = (t: any) => [
  { value: "restaurante", label: t('themes.restaurante') },
  { value: "ecommerce", label: t('themes.ecommerce') },
  { value: "servicos", label: t('themes.servicos') },
  { value: "saude", label: t('themes.saude') },
  { value: "educacao", label: t('themes.educacao') },
  { value: "fitness", label: t('themes.fitness') },
  { value: "beleza", label: t('themes.beleza') },
  { value: "tecnologia", label: t('themes.tecnologia') },
  { value: "consultoria", label: t('themes.consultoria') },
  { value: "imobiliario", label: t('themes.imobiliario') },
  { value: "advocacia", label: t('themes.advocacia') },
  { value: "contabilidade", label: t('themes.contabilidade') },
  { value: "pet", label: t('themes.pet') },
  { value: "turismo", label: t('themes.turismo') },
  { value: "eventos", label: t('themes.eventos') },
  { value: "automotivo", label: t('themes.automotivo') },
  { value: "moda", label: t('themes.moda') },
  { value: "arte", label: t('themes.arte') },
  { value: "agricultura", label: t('themes.agricultura') },
  { value: "marketplace", label: t('themes.marketplace') }
];

const Sidebar: React.FC<SidebarProps> = ({ onLandingPageGenerated, businessData: externalBusinessData }) => {
  const { t } = useTranslation();
  const businessThemes = getBusinessThemes(t);
  const [activeTab, setActiveTab] = useState("chatbot");
  const [businessData, setBusinessData] = useState<BusinessContent | undefined>();
  const [briefingData, setBriefingData] = useState({
    businessTheme: "",
    businessName: "",
    businessType: "",
    description: "",
    targetAudience: "",
    mainGoal: "",
    keyServices: "",
    contactInfo: "",
    whatsapp: "",
    address: "",
    specialOffers: "",
    customLogo: null as File | null
  });
  
  const handleLandingPageGeneratedInternal = (html: string, data: BusinessContent) => {
    setBusinessData(data);
    onLandingPageGenerated(html, data);
  };

  // Sync external businessData with internal state
  useEffect(() => {
    if (externalBusinessData) {
      setBusinessData(externalBusinessData);
    }
  }, [externalBusinessData]);

  const handleUpdateLandingPage = async () => {
    if (businessData) {
      try {
        const updatedHTML = await landingPageBuilder.generateHTML(businessData);
        onLandingPageGenerated(updatedHTML, businessData);
        toast.success(t('messages.landingPageUpdated'));
      } catch (error) {
        toast.error(t('messages.errorUpdating'));
      }
    } else {
      toast.error(t('messages.noLandingPageToUpdate'));
    }
  };

  const tabs = [
    { id: "chatbot", label: t('navigation.chat'), icon: MessageCircle },
    { id: "briefing", label: t('navigation.briefing'), icon: FileText },
    { id: "content", label: t('navigation.content'), icon: Type },
    { id: "sellerbot", label: t('navigation.sellerbot'), icon: Bot },
    { id: "seo", label: t('navigation.seo'), icon: Settings },
    { id: "design", label: t('navigation.design'), icon: Palette },
    { id: "layout", label: t('navigation.layouts'), icon: Layout },
    { id: "images", label: t('navigation.images'), icon: Image },
  ];

  const handleBriefingChange = (field: string, value: string | File | null) => {
    setBriefingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar se é uma imagem
      if (file.type.startsWith('image/')) {
        handleBriefingChange("customLogo", file);
      } else {
        toast.error(t('briefing.logoError'));
      }
    }
  };

  const getBriefingPrompt = () => {
    const { businessTheme, businessName, businessType, description, targetAudience, mainGoal, keyServices, contactInfo, whatsapp, address, specialOffers } = briefingData;
    const logoInfo = briefingData.customLogo ? `O cliente enviou um logo personalizado: ${briefingData.customLogo.name}` : '';
    return `Criar landing page para ${businessName}, um ${businessType} (tema: ${businessTheme}). Descrição: ${description}. Público-alvo: ${targetAudience}. Objetivo principal: ${mainGoal}. Serviços principais: ${keyServices}. WhatsApp: ${whatsapp}. Endereço: ${address}. Contato: ${contactInfo}. Ofertas especiais: ${specialOffers}. ${logoInfo}`;
  };


  return (
    <aside className="w-80 border-r border-border bg-card/50 backdrop-blur">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-center mb-4">
          <img 
            src="/lovable-uploads/6381dbd8-479d-45ec-aad0-a9b41c25b1e8.png" 
            alt="PageJet" 
            className="h-8"
          />
        </div>
        
        <div className="flex gap-0.5 bg-muted p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center px-1.5 py-2 rounded-md text-sm transition-all ${
                  activeTab === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {activeTab === "briefing" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">{t('briefing.title')}</h3>
              <Badge variant="secondary" className="text-xs">{t('briefing.form')}</Badge>
            </div>
            
            <Card className="p-4 bg-gradient-card space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessTheme" className="text-sm font-medium text-foreground">{t('briefing.businessTheme')}</Label>
                <Select
                  value={briefingData.businessTheme}
                  onValueChange={(value) => handleBriefingChange("businessTheme", value)}
                >
                  <SelectTrigger className="bg-background/50 border-border">
                    <SelectValue placeholder={t('briefing.businessThemePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 bg-background border-border">
                    {businessThemes.map((theme) => (
                      <SelectItem key={theme.value} value={theme.value}>
                        {theme.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-sm font-medium text-foreground">{t('briefing.businessName')}</Label>
                <Input
                  id="businessName"
                  value={briefingData.businessName}
                  onChange={(e) => handleBriefingChange("businessName", e.target.value)}
                  placeholder={t('briefing.businessNamePlaceholder')}
                  className="bg-background/50 border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customLogo" className="text-sm font-medium text-foreground">{t('briefing.customLogo')}</Label>
                <div className="space-y-2">
                  <Input
                    id="customLogo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="bg-background/50 border-border file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                  />
                  {briefingData.customLogo && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {briefingData.customLogo.name}
                      </Badge>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t('briefing.customLogoHelper')}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessType" className="text-sm font-medium text-foreground">{t('briefing.businessType')}</Label>
                <Input
                  id="businessType"
                  value={briefingData.businessType}
                  onChange={(e) => handleBriefingChange("businessType", e.target.value)}
                  placeholder={t('briefing.businessTypePlaceholder')}
                  className="bg-background/50 border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-foreground">{t('briefing.description')}</Label>
                <Textarea
                  id="description"
                  value={briefingData.description}
                  onChange={(e) => handleBriefingChange("description", e.target.value)}
                  placeholder={t('briefing.descriptionPlaceholder')}
                  className="bg-background/50 border-border resize-none"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience" className="text-sm font-medium text-foreground">{t('briefing.targetAudience')}</Label>
                <Input
                  id="targetAudience"
                  value={briefingData.targetAudience}
                  onChange={(e) => handleBriefingChange("targetAudience", e.target.value)}
                  placeholder={t('briefing.targetAudiencePlaceholder')}
                  className="bg-background/50 border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mainGoal" className="text-sm font-medium text-foreground">{t('briefing.mainGoal')}</Label>
                <Input
                  id="mainGoal"
                  value={briefingData.mainGoal}
                  onChange={(e) => handleBriefingChange("mainGoal", e.target.value)}
                  placeholder={t('briefing.mainGoalPlaceholder')}
                  className="bg-background/50 border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keyServices" className="text-sm font-medium text-foreground">{t('briefing.keyServices')}</Label>
                <Textarea
                  id="keyServices"
                  value={briefingData.keyServices}
                  onChange={(e) => handleBriefingChange("keyServices", e.target.value)}
                  placeholder={t('briefing.keyServicesPlaceholder')}
                  className="bg-background/50 border-border resize-none"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-sm font-medium text-foreground">{t('briefing.whatsapp')}</Label>
                <Input
                  id="whatsapp"
                  value={briefingData.whatsapp}
                  onChange={(e) => handleBriefingChange("whatsapp", e.target.value)}
                  placeholder={t('briefing.whatsappPlaceholder')}
                  className="bg-background/50 border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-foreground">{t('briefing.address')}</Label>
                <Input
                  id="address"
                  value={briefingData.address}
                  onChange={(e) => handleBriefingChange("address", e.target.value)}
                  placeholder={t('briefing.addressPlaceholder')}
                  className="bg-background/50 border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactInfo" className="text-sm font-medium text-foreground">{t('briefing.contactInfo')}</Label>
                <Input
                  id="contactInfo"
                  value={briefingData.contactInfo}
                  onChange={(e) => handleBriefingChange("contactInfo", e.target.value)}
                  placeholder={t('briefing.contactInfoPlaceholder')}
                  className="bg-background/50 border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialOffers" className="text-sm font-medium text-foreground">{t('briefing.specialOffers')}</Label>
                <Textarea
                  id="specialOffers"
                  value={briefingData.specialOffers}
                  onChange={(e) => handleBriefingChange("specialOffers", e.target.value)}
                  placeholder={t('briefing.specialOffersPlaceholder')}
                  className="bg-background/50 border-border resize-none"
                  rows={2}
                />
              </div>
              
              <Button 
                variant="hero" 
                className="w-full"
                onClick={() => {
                  setActiveTab("chatbot");
                  // Trigger automatic generation with briefing data
                  const briefingPrompt = getBriefingPrompt();
                  if (briefingData.businessName && briefingData.businessType) {
                    // Send briefing data to chat automatically
                    setTimeout(() => {
                      const event = new CustomEvent('auto-generate-landing-page', {
                        detail: { prompt: briefingPrompt }
                      });
                      window.dispatchEvent(event);
                    }, 100);
                  }
                }}
              >
                {t('briefing.updatePageJet')}
              </Button>
            </Card>
          </div>
        )}

        {activeTab === "design" && (
          <DesignTab 
            businessData={businessData}
            onLandingPageGenerated={handleLandingPageGeneratedInternal}
          />
        )}

        {activeTab === "content" && (
          <ContentTab 
            businessData={businessData}
            onContentUpdate={setBusinessData}
            onLandingPageGenerated={handleLandingPageGeneratedInternal}
          />
        )}

        {activeTab === "images" && (
          <ImagesTab 
            businessData={businessData}
            onLandingPageGenerated={handleLandingPageGeneratedInternal}
          />
        )}

        {activeTab === "sellerbot" && (
          <SellerbotTab 
            businessData={businessData}
            onLandingPageGenerated={onLandingPageGenerated}
          />
        )}

        {activeTab === "chatbot" && (
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">{t('chat.title')}</h3>
            
            <div className="h-[400px] bg-gradient-card rounded-lg border border-border/50">
              <SmartChat 
                onLandingPageGenerated={handleLandingPageGeneratedInternal}
                briefingPrompt={getBriefingPrompt()}
                isIntegrated={true}
                onNavigateToBriefing={() => setActiveTab("briefing")}
                businessData={businessData}
              />
            </div>
          </div>
        )}

        {activeTab === "layout" && (
          <LayoutTab 
            businessData={businessData}
            onLandingPageGenerated={handleLandingPageGeneratedInternal}
          />
        )}

        {activeTab === "seo" && (
          <SEOTab 
            businessData={businessData}
            onLandingPageGenerated={onLandingPageGenerated}
          />
        )}
      </div>

      {/* Update Button */}
      <div className="p-4 border-t border-border">
        <Button 
          variant="hero" 
          className="w-full"
          onClick={handleUpdateLandingPage}
          disabled={!businessData}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('buttons.updateLandingPage')}
        </Button>
      </div>

    </aside>
  );
};

export default Sidebar;