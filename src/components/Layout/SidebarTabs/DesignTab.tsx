import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { BusinessContent } from "@/services/contentGenerator";

interface DesignTabProps {
  businessData?: BusinessContent;
  onLandingPageGenerated: (html: string, data: BusinessContent) => void;
}

const DesignTab = ({ businessData, onLandingPageGenerated }: DesignTabProps) => {
  const [selectedColors, setSelectedColors] = useState({
    primary: businessData?.colors?.primary || "#8B5CF6",
    secondary: businessData?.colors?.secondary || "#10B981",
    accent: businessData?.colors?.accent || "#F59E0B"
  });

  const [selectedFont, setSelectedFont] = useState("Inter");
  const [borderRadius, setBorderRadius] = useState([12]);
  const [spacing, setSpacing] = useState([16]);

  const colorPalettes = [
    { name: "Purple", colors: ["#8B5CF6", "#A78BFA", "#C4B5FD"] },
    { name: "Green", colors: ["#10B981", "#34D399", "#6EE7B7"] },
    { name: "Blue", colors: ["#3B82F6", "#60A5FA", "#93C5FD"] },
    { name: "Orange", colors: ["#F59E0B", "#FBBF24", "#FCD34D"] },
    { name: "Red", colors: ["#EF4444", "#F87171", "#FCA5A5"] },
    { name: "Teal", colors: ["#14B8A6", "#5EEAD4", "#99F6E4"] }
  ];

  const fonts = [
    { name: "Inter", description: "Modern Sans" },
    { name: "Playfair Display", description: "Elegant Serif" },
    { name: "JetBrains Mono", description: "Tech Mono" },
    { name: "Roboto", description: "Clean Sans" },
    { name: "Merriweather", description: "Classic Serif" }
  ];

  const handleColorChange = async (type: string, color: string) => {
    const newColors = { ...selectedColors, [type]: color };
    setSelectedColors(newColors);
    
    if (businessData) {
      const updatedBusinessData = {
        ...businessData,
        colors: newColors
      };
      
      // Regenerar HTML com novas cores
      const { landingPageBuilder } = await import("@/services/landingPageBuilder");
      const updatedHTML = await landingPageBuilder.generateHTML(updatedBusinessData);
      onLandingPageGenerated(updatedHTML, updatedBusinessData);
    }
  };

  const handleApplyPalette = async (palette: any) => {
    const newColors = {
      primary: palette.colors[0],
      secondary: palette.colors[1],
      accent: palette.colors[2]
    };
    setSelectedColors(newColors);
    
    if (businessData) {
      const updatedBusinessData = {
        ...businessData,
        colors: newColors
      };
      
      // Regenerar HTML com nova paleta
      const { landingPageBuilder } = await import("@/services/landingPageBuilder");
      const updatedHTML = await landingPageBuilder.generateHTML(updatedBusinessData);
      onLandingPageGenerated(updatedHTML, updatedBusinessData);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-foreground">Personalização Visual</h3>
      
      {/* Color Palettes */}
      <Card className="p-4 bg-gradient-card">
        <h4 className="font-medium text-sm mb-3 text-foreground">Paletas de Cores</h4>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {colorPalettes.map((palette) => (
            <Button
              key={palette.name}
              variant="outline"
              size="sm"
              onClick={() => handleApplyPalette(palette)}
              className="h-auto p-2 flex flex-col items-center gap-1"
            >
              <div className="flex gap-1">
                {palette.colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="text-xs">{palette.name}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Custom Colors */}
      <Card className="p-4 bg-gradient-card">
        <h4 className="font-medium text-sm mb-3 text-foreground">Cores Personalizadas</h4>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Cor Primária</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                value={selectedColors.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="w-12 h-8 p-0 border-0"
              />
              <Input
                value={selectedColors.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="flex-1 text-xs"
                placeholder="#8B5CF6"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-xs">Cor Secundária</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                value={selectedColors.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="w-12 h-8 p-0 border-0"
              />
              <Input
                value={selectedColors.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="flex-1 text-xs"
                placeholder="#10B981"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-xs">Cor de Destaque</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                value={selectedColors.accent}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                className="w-12 h-8 p-0 border-0"
              />
              <Input
                value={selectedColors.accent}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                className="flex-1 text-xs"
                placeholder="#F59E0B"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Typography */}
      <Card className="p-4 bg-gradient-card">
        <h4 className="font-medium text-sm mb-3 text-foreground">Tipografia</h4>
        <div className="space-y-2">
          {fonts.map((font) => (
            <button
              key={font.name}
              onClick={() => setSelectedFont(font.name)}
              className={`w-full text-left p-2 rounded hover:bg-muted transition-colors ${
                selectedFont === font.name ? 'bg-muted border border-primary' : ''
              }`}
            >
              <div className="text-sm font-medium" style={{ fontFamily: font.name }}>
                {font.name}
              </div>
              <div className="text-xs text-muted-foreground">{font.description}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* Section Font Colors */}
      <Card className="p-4 bg-gradient-card">
        <h4 className="font-medium text-sm mb-3 text-foreground">Cores de Fonte por Seção</h4>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Cabeçalho</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                defaultValue="#ffffff"
                className="w-12 h-8 p-0 border-0"
              />
              <Input
                defaultValue="#ffffff"
                className="flex-1 text-xs"
                placeholder="#ffffff"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-xs">Títulos das Seções</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                defaultValue="#1a1a1a"
                className="w-12 h-8 p-0 border-0"
              />
              <Input
                defaultValue="#1a1a1a"
                className="flex-1 text-xs"
                placeholder="#1a1a1a"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-xs">Texto Corpo</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                defaultValue="#666666"
                className="w-12 h-8 p-0 border-0"
              />
              <Input
                defaultValue="#666666"
                className="flex-1 text-xs"
                placeholder="#666666"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-xs">Rodapé</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                defaultValue="#ffffff"
                className="w-12 h-8 p-0 border-0"
              />
              <Input
                defaultValue="#ffffff"
                className="flex-1 text-xs"
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Layout Settings */}
      <Card className="p-4 bg-gradient-card">
        <h4 className="font-medium text-sm mb-3 text-foreground">Layout</h4>
        <div className="space-y-4">
          <div>
            <Label className="text-xs mb-2 block">Bordas Arredondadas: {borderRadius[0]}px</Label>
            <Slider
              value={borderRadius}
              onValueChange={setBorderRadius}
              max={30}
              min={0}
              step={2}
              className="w-full"
            />
          </div>
          
          <div>
            <Label className="text-xs mb-2 block">Espaçamento: {spacing[0]}px</Label>
            <Slider
              value={spacing}
              onValueChange={setSpacing}
              max={32}
              min={8}
              step={4}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      <Button 
        variant="hero" 
        className="w-full"
        onClick={async () => {
          if (businessData) {
            const updatedBusinessData = {
              ...businessData,
              colors: selectedColors,
              font: selectedFont
            };
            
            const { landingPageBuilder } = await import("@/services/landingPageBuilder");
            const updatedHTML = await landingPageBuilder.generateHTML(updatedBusinessData);
            onLandingPageGenerated(updatedHTML, updatedBusinessData);
          }
        }}
        disabled={!businessData}
      >
        Aplicar Personalização
      </Button>
    </div>
  );
};

export default DesignTab;