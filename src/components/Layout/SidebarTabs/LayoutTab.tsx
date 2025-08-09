import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { BusinessContent } from "@/services/contentGenerator";
import { Grid, Columns, AlignLeft, AlignCenter, AlignRight, Plus, Trash2 } from "lucide-react";

interface LayoutTabProps {
  businessData?: BusinessContent;
  onLandingPageGenerated: (html: string, data: BusinessContent) => void;
}

interface SectionLayout {
  id: string;
  name: string;
  type: 'header' | 'footer' | 'section' | 'custom';
  columns: number;
  alignment: 'left' | 'center' | 'right';
  contentPosition: 'top' | 'center' | 'bottom';
  gridLayout?: string;
}

const defaultLayouts: SectionLayout[] = [
  { id: 'header', name: 'Cabeçalho', type: 'header', columns: 3, alignment: 'center', contentPosition: 'center' },
  { id: 'footer', name: 'Rodapé', type: 'footer', columns: 3, alignment: 'center', contentPosition: 'center' },
  { id: 'what', name: 'O que é (What)', type: 'section', columns: 1, alignment: 'left', contentPosition: 'top' },
  { id: 'who', name: 'Para quem (Who)', type: 'section', columns: 2, alignment: 'center', contentPosition: 'center' },
  { id: 'when', name: 'Quando (When)', type: 'section', columns: 1, alignment: 'left', contentPosition: 'top' },
  { id: 'where', name: 'Onde (Where)', type: 'section', columns: 1, alignment: 'center', contentPosition: 'center' },
  { id: 'why', name: 'Por que (Why)', type: 'section', columns: 2, alignment: 'left', contentPosition: 'top' },
  { id: 'how', name: 'Como (How)', type: 'section', columns: 3, alignment: 'center', contentPosition: 'center' },
  { id: 'how-much', name: 'Quanto (How Much)', type: 'section', columns: 2, alignment: 'center', contentPosition: 'center' }
];

const LayoutTab = ({ businessData, onLandingPageGenerated }: LayoutTabProps) => {
  const [layouts, setLayouts] = useState<SectionLayout[]>(defaultLayouts);
  const [newLayoutName, setNewLayoutName] = useState("");
  const [editingLayout, setEditingLayout] = useState<string | null>(null);

  const columnOptions = [
    { value: 1, label: "1 Coluna", icon: "▌" },
    { value: 2, label: "2 Colunas", icon: "▌▌" },
    { value: 3, label: "3 Colunas", icon: "▌▌▌" },
    { value: 4, label: "4 Colunas", icon: "▌▌▌▌" }
  ];

  const alignmentOptions = [
    { value: 'left', label: 'Esquerda', icon: AlignLeft },
    { value: 'center', label: 'Centro', icon: AlignCenter },
    { value: 'right', label: 'Direita', icon: AlignRight }
  ];

  const positionOptions = [
    { value: 'top', label: 'Topo' },
    { value: 'center', label: 'Centro' },
    { value: 'bottom', label: 'Base' }
  ];

  const handleLayoutUpdate = (id: string, field: keyof SectionLayout, value: any) => {
    setLayouts(layouts.map(layout => 
      layout.id === id ? { ...layout, [field]: value } : layout
    ));
  };

  const handleAddCustomLayout = () => {
    if (newLayoutName.trim()) {
      const newLayout: SectionLayout = {
        id: `custom-${Date.now()}`,
        name: newLayoutName,
        type: 'custom',
        columns: 1,
        alignment: 'left',
        contentPosition: 'top'
      };
      setLayouts([...layouts, newLayout]);
      setNewLayoutName("");
    }
  };

  const handleDeleteLayout = (id: string) => {
    setLayouts(layouts.filter(layout => layout.id !== id));
  };

  const handleApplyLayouts = async () => {
    if (businessData) {
      try {
        const updatedBusinessData = {
          ...businessData,
          layouts: layouts.reduce((acc, layout) => {
            acc[layout.id] = {
              columns: layout.columns,
              alignment: layout.alignment,
              contentPosition: layout.contentPosition,
              gridLayout: layout.gridLayout
            };
            return acc;
          }, {} as any)
        };
        
        const { landingPageBuilder } = await import("@/services/landingPageBuilder");
        const updatedHTML = await landingPageBuilder.generateHTML(updatedBusinessData);
        onLandingPageGenerated(updatedHTML, updatedBusinessData);
        
        console.log('Layouts aplicados:', layouts);
      } catch (error) {
        console.error('Erro ao aplicar layouts:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">Layouts das Seções</h3>
        <Badge variant="secondary" className="text-xs">
          {layouts.length} layouts
        </Badge>
      </div>

      {/* Add Custom Layout */}
      <Card className="p-4 bg-gradient-card">
        <h4 className="font-medium text-sm mb-3 text-foreground">Criar Layout Personalizado</h4>
        <div className="flex gap-2">
          <Input
            value={newLayoutName}
            onChange={(e) => setNewLayoutName(e.target.value)}
            placeholder="Nome do layout..."
            className="flex-1 text-xs"
          />
          <Button size="sm" onClick={handleAddCustomLayout} disabled={!newLayoutName.trim()}>
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </Card>

      {/* Layout List */}
      <div className="space-y-3">
        {layouts.map((layout) => (
          <Card key={layout.id} className="p-4 bg-gradient-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant={layout.type === 'custom' ? 'default' : 'outline'} className="text-xs">
                  {layout.name}
                </Badge>
                <Grid className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingLayout(editingLayout === layout.id ? null : layout.id)}
                  className="h-6 w-6 p-0"
                >
                  <Grid className="w-3 h-3" />
                </Button>
                {layout.type === 'custom' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteLayout(layout.id)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            {editingLayout === layout.id ? (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Número de Colunas</Label>
                  <Select
                    value={layout.columns.toString()}
                    onValueChange={(value) => handleLayoutUpdate(layout.id, 'columns', parseInt(value))}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columnOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs">{option.icon}</span>
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Alinhamento do Conteúdo</Label>
                  <div className="grid grid-cols-3 gap-1">
                    {alignmentOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <Button
                          key={option.value}
                          size="sm"
                          variant={layout.alignment === option.value ? "default" : "outline"}
                          onClick={() => handleLayoutUpdate(layout.id, 'alignment', option.value)}
                          className="h-8"
                        >
                          <Icon className="w-3 h-3" />
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Posição Vertical</Label>
                  <Select
                    value={layout.contentPosition}
                    onValueChange={(value) => handleLayoutUpdate(layout.id, 'contentPosition', value)}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {positionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{layout.columns} coluna{layout.columns > 1 ? 's' : ''}</span>
                  <span>•</span>
                  <span>Alinhamento: {layout.alignment}</span>
                  <span>•</span>
                  <span>Posição: {layout.contentPosition}</span>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Button 
        variant="hero" 
        className="w-full"
        onClick={handleApplyLayouts}
        disabled={!businessData}
      >
        <Grid className="w-4 h-4 mr-2" />
        Aplicar Layouts
      </Button>
    </div>
  );
};

export default LayoutTab;