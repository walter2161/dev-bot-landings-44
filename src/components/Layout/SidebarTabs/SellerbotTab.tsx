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
import { Bot, MessageCircle, Phone, Mail, MapPin, MessageSquare, Image, Link, Plus, X } from "lucide-react";

interface SellerbotTabProps {
  businessData: BusinessContent | null;
  onLandingPageGenerated: (html: string, data: BusinessContent) => void;
}

const SellerbotTab: React.FC<SellerbotTabProps> = ({ businessData, onLandingPageGenerated }) => {
  const [sellerbotData, setSellerbotData] = useState({
    name: "",
    personality: "",
    knowledge: "",
    greeting: "",
    services: "",
    pricing: "",
    appointment: "",
    prohibitions: ""
  });

  const [businessInfo, setBusinessInfo] = useState({
    address: "",
    phone: "",
    email: "",
    whatsapp: ""
  });

  const [sellerbotMedia, setSellerbotMedia] = useState({
    images: [] as Array<{ url: string; description: string; title?: string }>,
    links: [] as Array<{ url: string; title: string; description?: string }>
  });

  // Preencher os campos quando businessData é atualizado
  useEffect(() => {
    if (businessData) {
      setSellerbotData({
        name: businessData.sellerbot?.name || '',
        personality: businessData.sellerbot?.personality || '',
        knowledge: Array.isArray(businessData.sellerbot?.knowledge) 
          ? businessData.sellerbot.knowledge.join(', ') 
          : businessData.sellerbot?.knowledge || '',
        greeting: businessData.sellerbot?.responses?.greeting || '',
        services: businessData.sellerbot?.responses?.services || '',
        pricing: businessData.sellerbot?.responses?.pricing || '',
        appointment: businessData.sellerbot?.responses?.appointment || '',
        prohibitions: businessData.sellerbot?.prohibitions || ''
      });

      setBusinessInfo({
        address: businessData.contact?.address || '',
        phone: businessData.contact?.phone || '',
        email: businessData.contact?.email || '',
        whatsapp: businessData.contact?.socialMedia?.whatsapp || ''
      });

      setSellerbotMedia({
        images: [],
        links: []
      });
    }
  }, [businessData]);

  const handleChange = (field: string, value: string) => {
    setSellerbotData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBusinessChange = (field: string, value: string) => {
    setBusinessInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addImage = () => {
    setSellerbotMedia(prev => ({
      ...prev,
      images: [...prev.images, { url: '', description: '', title: '' }]
    }));
  };

  const removeImage = (index: number) => {
    setSellerbotMedia(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const updateImage = (index: number, field: string, value: string) => {
    setSellerbotMedia(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, [field]: value } : img
      )
    }));
  };

  const addLink = () => {
    setSellerbotMedia(prev => ({
      ...prev,
      links: [...prev.links, { url: '', title: '', description: '' }]
    }));
  };

  const removeLink = (index: number) => {
    setSellerbotMedia(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  const updateLink = (index: number, field: string, value: string) => {
    setSellerbotMedia(prev => ({
      ...prev,
      links: prev.links.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const handleUpdate = async () => {
    if (!businessData) {
      toast.error('Nenhuma landing page para atualizar');
      return;
    }

    console.log('Dados antes da atualização:', businessData.contact);
    console.log('Novos dados de contato:', businessInfo);

    try {
      const updatedData: BusinessContent = {
        ...businessData,
        contact: {
          ...businessData.contact,
          address: businessInfo.address.trim() || businessData.contact.address,
          phone: businessInfo.phone.trim() || businessData.contact.phone,
          email: businessInfo.email.trim() || businessData.contact.email,
          socialMedia: {
            ...businessData.contact.socialMedia,
            whatsapp: businessInfo.whatsapp.trim() || businessData.contact.socialMedia.whatsapp
          }
        },
        sellerbot: {
          name: sellerbotData.name.trim() || businessData.sellerbot?.name || "Assistente",
          personality: sellerbotData.personality.trim() || businessData.sellerbot?.personality || "Atencioso e profissional",
          knowledge: sellerbotData.knowledge.trim() ? sellerbotData.knowledge.split(',').map(k => k.trim()) : businessData.sellerbot?.knowledge || [],
          prohibitions: sellerbotData.prohibitions.trim() || businessData.sellerbot?.prohibitions || "",
          responses: {
            greeting: sellerbotData.greeting.trim() || businessData.sellerbot?.responses?.greeting || "Olá! Como posso ajudá-lo?",
            services: sellerbotData.services.trim() || businessData.sellerbot?.responses?.services || "Conheça nossos serviços",
            pricing: sellerbotData.pricing.trim() || businessData.sellerbot?.responses?.pricing || "Entre em contato para preços",
            appointment: sellerbotData.appointment.trim() || businessData.sellerbot?.responses?.appointment || "Vamos agendar?",
          },
          media: {
            images: [],
            links: []
          }
        }
      };

      console.log('Dados finais para gerar HTML:', updatedData.contact);
      
      const updatedHTML = await landingPageBuilder.generateHTML(updatedData);
      onLandingPageGenerated(updatedHTML, updatedData);
      toast.success('Sellerbot atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar sellerbot');
    }
  };

  if (!businessData || !businessData.sellerbot) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Gere uma landing page primeiro para configurar o Sellerbot</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Informações do Negócio - Editáveis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Informações do Negócio
          </CardTitle>
          <CardDescription>
            Configure as informações de contato do seu negócio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business-address">Endereço</Label>
            <Input
              id="business-address"
              value={businessInfo.address}
              onChange={(e) => handleBusinessChange("address", e.target.value)}
              placeholder="Digite o endereço completo"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="business-phone">Telefone</Label>
            <Input
              id="business-phone"
              value={businessInfo.phone}
              onChange={(e) => handleBusinessChange("phone", e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="business-email">Email</Label>
            <Input
              id="business-email"
              type="email"
              value={businessInfo.email}
              onChange={(e) => handleBusinessChange("email", e.target.value)}
              placeholder="contato@empresa.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="business-whatsapp">WhatsApp</Label>
            <Input
              id="business-whatsapp"
              value={businessInfo.whatsapp}
              onChange={(e) => handleBusinessChange("whatsapp", e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Configurações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sellerbot-name">Nome do Assistente</Label>
            <Input
              id="sellerbot-name"
              value={sellerbotData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder={businessData.sellerbot?.name || "Nome do assistente"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sellerbot-personality">Personalidade</Label>
            <Textarea
              id="sellerbot-personality"
              value={sellerbotData.personality}
              onChange={(e) => handleChange("personality", e.target.value)}
              placeholder={businessData.sellerbot?.personality || "Personalidade do assistente"}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sellerbot-knowledge">Conhecimentos (separados por vírgula)</Label>
            <Textarea
              id="sellerbot-knowledge"
              value={sellerbotData.knowledge}
              onChange={(e) => handleChange("knowledge", e.target.value)}
              placeholder={Array.isArray(businessData.sellerbot?.knowledge) 
                ? businessData.sellerbot.knowledge.join(", ") 
                : businessData.sellerbot?.knowledge || "Conhecimentos do assistente"}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sellerbot-prohibitions">Restrições e Proibições</Label>
            <Textarea
              id="sellerbot-prohibitions"
              value={sellerbotData.prohibitions}
              onChange={(e) => handleChange("prohibitions", e.target.value)}
              placeholder="Descreva o que o sellerbot NÃO pode fazer ou falar..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Respostas Personalizadas */}
      <Card>
        <CardHeader>
          <CardTitle>Respostas Personalizadas</CardTitle>
          <CardDescription>
            Configure como o bot deve responder em situações específicas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sellerbot-greeting">Saudação Inicial</Label>
            <Textarea
              id="sellerbot-greeting"
              value={sellerbotData.greeting}
              onChange={(e) => handleChange("greeting", e.target.value)}
              placeholder={businessData.sellerbot?.responses?.greeting || "Saudação inicial"}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sellerbot-services">Apresentação de Serviços</Label>
            <Textarea
              id="sellerbot-services"
              value={sellerbotData.services}
              onChange={(e) => handleChange("services", e.target.value)}
              placeholder={businessData.sellerbot?.responses?.services || "Apresentação de serviços"}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sellerbot-pricing">Informações sobre Preços</Label>
            <Textarea
              id="sellerbot-pricing"
              value={sellerbotData.pricing}
              onChange={(e) => handleChange("pricing", e.target.value)}
              placeholder={businessData.sellerbot?.responses?.pricing || "Informações sobre preços"}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sellerbot-appointment">Agendamento/Contato</Label>
            <Textarea
              id="sellerbot-appointment"
              value={sellerbotData.appointment}
              onChange={(e) => handleChange("appointment", e.target.value)}
              placeholder={businessData.sellerbot?.responses?.appointment || "Agendamento e contato"}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Imagens e Links do Sellerbot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Imagens e Links
          </CardTitle>
          <CardDescription>
            Configure imagens e links que o sellerbot pode enviar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seção de Imagens */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Imagens</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addImage}
                className="h-8"
              >
                <Plus className="h-3 w-3 mr-1" />
                Adicionar
              </Button>
            </div>
            
            {sellerbotMedia.images.map((image, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Imagem {index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeImage(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`image-url-${index}`}>URL da Imagem</Label>
                  <Input
                    id={`image-url-${index}`}
                    value={image.url}
                    onChange={(e) => updateImage(index, 'url', e.target.value)}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`image-title-${index}`}>Título (opcional)</Label>
                  <Input
                    id={`image-title-${index}`}
                    value={image.title || ''}
                    onChange={(e) => updateImage(index, 'title', e.target.value)}
                    placeholder="Título da imagem"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`image-desc-${index}`}>Descrição</Label>
                  <Textarea
                    id={`image-desc-${index}`}
                    value={image.description}
                    onChange={(e) => updateImage(index, 'description', e.target.value)}
                    placeholder="Descreva quando esta imagem deve ser enviada"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Seção de Links */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Links</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLink}
                className="h-8"
              >
                <Plus className="h-3 w-3 mr-1" />
                Adicionar
              </Button>
            </div>
            
            {sellerbotMedia.links.map((link, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Link {index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLink(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`link-url-${index}`}>URL</Label>
                  <Input
                    id={`link-url-${index}`}
                    value={link.url}
                    onChange={(e) => updateLink(index, 'url', e.target.value)}
                    placeholder="https://exemplo.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`link-title-${index}`}>Título</Label>
                  <Input
                    id={`link-title-${index}`}
                    value={link.title}
                    onChange={(e) => updateLink(index, 'title', e.target.value)}
                    placeholder="Título do link"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`link-desc-${index}`}>Descrição (opcional)</Label>
                  <Textarea
                    id={`link-desc-${index}`}
                    value={link.description || ''}
                    onChange={(e) => updateLink(index, 'description', e.target.value)}
                    placeholder="Descreva quando este link deve ser enviado"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Button 
        onClick={handleUpdate}
        className="w-full bg-gradient-primary hover:shadow-primary transition-all duration-300"
        size="lg"
      >
        Atualizar Sellerbot
      </Button>
    </div>
  );
};

export default SellerbotTab;