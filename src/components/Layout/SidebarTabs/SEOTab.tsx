import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BusinessContent } from "@/services/contentGenerator";
import { landingPageBuilder } from "@/services/landingPageBuilder";
import { toast } from "sonner";
import { Search, Code, Target, TrendingUp } from "lucide-react";

interface SEOData {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  googleAnalyticsId: string;
  facebookPixelId: string;
  googleTagManagerId: string;
  customHeadTags: string;
  customBodyTags: string;
  structuredData: string;
}

interface SEOTabProps {
  businessData: BusinessContent | null;
  onLandingPageGenerated: (html: string, data: BusinessContent) => void;
}

const SEOTab: React.FC<SEOTabProps> = ({ businessData, onLandingPageGenerated }) => {
  const [seoData, setSeoData] = useState<SEOData>({
    title: "",
    description: "",
    keywords: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "",
    googleAnalyticsId: "",
    facebookPixelId: "",
    googleTagManagerId: "",
    customHeadTags: "",
    customBodyTags: "",
    structuredData: ""
  });

  // Preencher com dados padrão quando businessData é carregado
  useEffect(() => {
    if (businessData) {
      setSeoData(prev => ({
        ...prev,
        title: prev.title || `${businessData.title} - ${businessData.subtitle}`,
        description: prev.description || businessData.subtitle,
        keywords: prev.keywords || `${businessData.title}, ${businessData.sections.map(s => s.title).join(", ")}`,
        ogTitle: prev.ogTitle || businessData.title,
        ogDescription: prev.ogDescription || businessData.subtitle,
        twitterTitle: prev.twitterTitle || businessData.title,
        twitterDescription: prev.twitterDescription || businessData.subtitle,
        structuredData: prev.structuredData || generateDefaultStructuredData(businessData)
      }));
    }
  }, [businessData]);

  const generateDefaultStructuredData = (data: BusinessContent): string => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": data.title,
      "description": data.subtitle,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": data.contact.address
      },
      "telephone": data.contact.phone,
      "email": data.contact.email,
      "url": window.location.origin,
      "sameAs": [
        data.contact.socialMedia.facebook,
        data.contact.socialMedia.instagram
      ].filter(Boolean)
    };
    
    return JSON.stringify(structuredData, null, 2);
  };

  const handleChange = (field: keyof SEOData, value: string) => {
    setSeoData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdate = async () => {
    if (!businessData) {
      toast.error('Nenhuma landing page para atualizar');
      return;
    }

    try {
      // Adicionar dados SEO ao businessData
      const updatedData: BusinessContent = {
        ...businessData,
        seo: seoData
      };

      const updatedHTML = await landingPageBuilder.generateHTML(updatedData);
      onLandingPageGenerated(updatedHTML, updatedData);
      toast.success('SEO e scripts atualizados com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar SEO e scripts');
      console.error(error);
    }
  };

  if (!businessData) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Gere uma landing page primeiro para configurar o SEO</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SEO Básico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            SEO Básico
          </CardTitle>
          <CardDescription>
            Configure os elementos básicos de SEO da sua landing page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seo-title">Título da Página (max 60 caracteres)</Label>
            <Input
              id="seo-title"
              value={seoData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder={`${businessData.title} - ${businessData.subtitle}`}
              maxLength={60}
            />
            <span className="text-xs text-muted-foreground">{seoData.title.length}/60</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-description">Meta Descrição (max 160 caracteres)</Label>
            <Textarea
              id="seo-description"
              value={seoData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder={businessData.subtitle}
              maxLength={160}
              rows={3}
            />
            <span className="text-xs text-muted-foreground">{seoData.description.length}/160</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-keywords">Palavras-chave (separadas por vírgula)</Label>
            <Textarea
              id="seo-keywords"
              value={seoData.keywords}
              onChange={(e) => handleChange("keywords", e.target.value)}
              placeholder="palavra1, palavra2, palavra3"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="canonical-url">URL Canônica</Label>
            <Input
              id="canonical-url"
              value={seoData.canonicalUrl}
              onChange={(e) => handleChange("canonicalUrl", e.target.value)}
              placeholder="https://seusite.com"
              type="url"
            />
          </div>
        </CardContent>
      </Card>

      {/* Open Graph / Facebook */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Open Graph (Facebook/WhatsApp)
          </CardTitle>
          <CardDescription>
            Configure como sua página aparece quando compartilhada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="og-title">Título OG</Label>
            <Input
              id="og-title"
              value={seoData.ogTitle}
              onChange={(e) => handleChange("ogTitle", e.target.value)}
              placeholder={businessData.title}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="og-description">Descrição OG</Label>
            <Textarea
              id="og-description"
              value={seoData.ogDescription}
              onChange={(e) => handleChange("ogDescription", e.target.value)}
              placeholder={businessData.subtitle}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="og-image">URL da Imagem OG (1200x630px)</Label>
            <Input
              id="og-image"
              value={seoData.ogImage}
              onChange={(e) => handleChange("ogImage", e.target.value)}
              placeholder="https://seusite.com/imagem-og.jpg"
              type="url"
            />
          </div>
        </CardContent>
      </Card>

      {/* Twitter Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Twitter Cards
          </CardTitle>
          <CardDescription>
            Configure como sua página aparece no Twitter
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="twitter-title">Título Twitter</Label>
            <Input
              id="twitter-title"
              value={seoData.twitterTitle}
              onChange={(e) => handleChange("twitterTitle", e.target.value)}
              placeholder={businessData.title}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter-description">Descrição Twitter</Label>
            <Textarea
              id="twitter-description"
              value={seoData.twitterDescription}
              onChange={(e) => handleChange("twitterDescription", e.target.value)}
              placeholder={businessData.subtitle}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter-image">URL da Imagem Twitter</Label>
            <Input
              id="twitter-image"
              value={seoData.twitterImage}
              onChange={(e) => handleChange("twitterImage", e.target.value)}
              placeholder="https://seusite.com/imagem-twitter.jpg"
              type="url"
            />
          </div>
        </CardContent>
      </Card>

      {/* Scripts e Pixels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Scripts e Pixels de Rastreamento
          </CardTitle>
          <CardDescription>
            Configure pixels e códigos de rastreamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="google-analytics">Google Analytics ID</Label>
            <Input
              id="google-analytics"
              value={seoData.googleAnalyticsId}
              onChange={(e) => handleChange("googleAnalyticsId", e.target.value)}
              placeholder="G-XXXXXXXXXX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebook-pixel">Facebook Pixel ID</Label>
            <Input
              id="facebook-pixel"
              value={seoData.facebookPixelId}
              onChange={(e) => handleChange("facebookPixelId", e.target.value)}
              placeholder="000000000000000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="google-tag-manager">Google Tag Manager ID</Label>
            <Input
              id="google-tag-manager"
              value={seoData.googleTagManagerId}
              onChange={(e) => handleChange("googleTagManagerId", e.target.value)}
              placeholder="GTM-XXXXXXX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-head">Tags Customizadas (HEAD)</Label>
            <Textarea
              id="custom-head"
              value={seoData.customHeadTags}
              onChange={(e) => handleChange("customHeadTags", e.target.value)}
              placeholder="<!-- Insira tags customizadas aqui -->"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-body">Scripts Customizados (BODY)</Label>
            <Textarea
              id="custom-body"
              value={seoData.customBodyTags}
              onChange={(e) => handleChange("customBodyTags", e.target.value)}
              placeholder="<!-- Insira scripts customizados aqui -->"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dados Estruturados */}
      <Card>
        <CardHeader>
          <CardTitle>Dados Estruturados (JSON-LD)</CardTitle>
          <CardDescription>
            Configure os dados estruturados para mecanismos de busca
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="structured-data">Schema.org JSON-LD</Label>
            <Textarea
              id="structured-data"
              value={seoData.structuredData}
              onChange={(e) => handleChange("structuredData", e.target.value)}
              placeholder="JSON-LD será gerado automaticamente"
              rows={8}
              className="font-mono text-xs"
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Button 
        onClick={handleUpdate}
        className="w-full bg-gradient-primary hover:shadow-primary transition-all duration-300"
        size="lg"
      >
        Atualizar SEO e Scripts
      </Button>
    </div>
  );
};

export default SEOTab;