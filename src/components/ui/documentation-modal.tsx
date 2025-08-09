import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Bot, 
  MessageCircle, 
  FileText, 
  Type, 
  Settings, 
  Palette, 
  Image, 
  Grid,
  Sparkles,
  Zap,
  Target,
  RefreshCw
} from "lucide-react";

interface DocumentationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DocumentationModal = ({ open, onOpenChange }: DocumentationModalProps) => {
  const features = [
    {
      icon: MessageCircle,
      title: "Chat IA",
      description: "Converse com a IA para gerar sua landing page. Descreva seu negócio e objetivos."
    },
    {
      icon: FileText,
      title: "Briefing",
      description: "Preencha um formulário detalhado com informações do seu negócio para gerar automaticamente."
    },
    {
      icon: Type,
      title: "Editor de Conteúdo",
      description: "Edite textos, títulos e conteúdo das seções. Adicione novas seções personalizadas."
    },
    {
      icon: Bot,
      title: "Sellerbot",
      description: "Configure um chatbot de vendas inteligente para sua landing page."
    },
    {
      icon: Settings,
      title: "SEO",
      description: "Otimize sua página para mecanismos de busca com meta tags e estruturas."
    },
    {
      icon: Palette,
      title: "Design",
      description: "Personalize cores, tipografia e paletas visuais. Configure cores por seção."
    },
    {
      icon: Grid,
      title: "Layouts",
      description: "Configure layouts das seções: colunas, alinhamento e posicionamento."
    },
    {
      icon: Image,
      title: "Imagens",
      description: "Adicione e gerencie imagens para cada seção da sua landing page."
    }
  ];

  const sections = [
    "Cabeçalho - Header principal da página",
    "O que é (What) - Descrição do produto/serviço",
    "Para quem (Who) - Público-alvo",
    "Quando (When) - Timing e urgência",
    "Onde (Where) - Localização e alcance",
    "Por que (Why) - Benefícios e razões",
    "Como (How) - Processo e funcionamento",
    "Quanto (How Much) - Preços e investimento",
    "Rodapé - Informações de contato e links"
  ];

  const tips = [
    "Use o Chat IA para gerar rapidamente uma landing page completa",
    "Preencha o Briefing para resultados mais precisos",
    "Configure cores específicas para cada seção no Design",
    "Use o Editor de Conteúdo para ajustar textos após a geração",
    "Configure layouts diferentes para desktop e mobile",
    "Adicione imagens de alta qualidade para melhor conversão",
    "Configure SEO para melhor rankeamento no Google",
    "Use o Sellerbot para automatizar vendas e suporte"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            Documentação do ChatDev
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Visão Geral */}
            <Card className="p-4 bg-gradient-card">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Visão Geral
              </h3>
              <p className="text-muted-foreground text-sm mb-3">
                O ChatDev é um gerador inteligente de landing pages que usa IA para criar páginas de alta conversão 
                baseadas nas informações do seu negócio.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">IA Generativa</Badge>
                <Badge variant="secondary">Editor Visual</Badge>
                <Badge variant="secondary">SEO Otimizado</Badge>
                <Badge variant="secondary">Responsivo</Badge>
              </div>
            </Card>

            {/* Funcionalidades */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Funcionalidades
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <Card key={index} className="p-3 bg-gradient-card/50">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-1">{feature.title}</h4>
                          <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Seções da Landing Page */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Seções da Landing Page (5W2H)
              </h3>
              <div className="space-y-2">
                {sections.map((section, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    <Badge variant="outline" className="text-xs">
                      {index + 1}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{section}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Dicas de Uso */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-primary" />
                Dicas de Uso
              </h3>
              <div className="space-y-2">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">{index + 1}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fluxo de Trabalho */}
            <Card className="p-4 bg-gradient-card">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Grid className="w-5 h-5 text-primary" />
                Fluxo de Trabalho Recomendado
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge>1</Badge>
                  <span className="text-sm">Preencha o Briefing ou use o Chat IA</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge>2</Badge>
                  <span className="text-sm">Personalize as cores e tipografia no Design</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge>3</Badge>
                  <span className="text-sm">Configure layouts das seções</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge>4</Badge>
                  <span className="text-sm">Edite conteúdos específicos se necessário</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge>5</Badge>
                  <span className="text-sm">Adicione imagens e configure SEO</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge>6</Badge>
                  <span className="text-sm">Configure o Sellerbot para automação</span>
                </div>
              </div>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentationModal;