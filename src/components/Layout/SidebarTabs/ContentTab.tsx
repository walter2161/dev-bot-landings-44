import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { BusinessContent } from "@/services/contentGenerator";
import { Edit3, Save, RotateCcw, Plus, Trash2 } from "lucide-react";

interface ContentTabProps {
  businessData?: BusinessContent;
  onContentUpdate?: (content: BusinessContent) => void;
  onLandingPageGenerated: (html: string, data: BusinessContent) => void;
}

const ContentTab = ({ businessData, onContentUpdate, onLandingPageGenerated }: ContentTabProps) => {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<BusinessContent | null>(null);

  const handleEditSection = (sectionId: string) => {
    setEditingSection(sectionId);
    setEditedContent(businessData || null);
  };

  const handleSaveSection = async () => {
    if (editedContent) {
      onContentUpdate?.(editedContent);
      
      // Regenerar a landing page com o conteúdo atualizado
      try {
        const { landingPageBuilder } = await import("@/services/landingPageBuilder");
        const updatedHTML = await landingPageBuilder.generateHTML(editedContent);
        onLandingPageGenerated(updatedHTML, editedContent);
      } catch (error) {
        console.error('Erro ao regenerar landing page:', error);
      }
    }
    setEditingSection(null);
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setEditedContent(null);
  };

  const updateSectionContent = (sectionId: string, field: string, value: string) => {
    if (!editedContent) return;
    
    const updatedSections = editedContent.sections.map(section => 
      section.id === sectionId ? { ...section, [field]: value } : section
    );
    
    setEditedContent({
      ...editedContent,
      sections: updatedSections
    });
  };

  const updateMainContent = (field: string, value: string) => {
    if (!editedContent) return;
    
    setEditedContent({
      ...editedContent,
      [field]: value
    });
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!businessData) return;
    
    const updatedSections = businessData.sections.filter(section => section.id !== sectionId);
    const updatedBusinessData = {
      ...businessData,
      sections: updatedSections
    };
    
    onContentUpdate?.(updatedBusinessData);
    
    // Regenerar a landing page sem a seção removida
    try {
      const { landingPageBuilder } = await import("@/services/landingPageBuilder");
      const updatedHTML = await landingPageBuilder.generateHTML(updatedBusinessData);
      onLandingPageGenerated(updatedHTML, updatedBusinessData);
    } catch (error) {
      console.error('Erro ao regenerar landing page:', error);
    }
  };

  if (!businessData) {
    return (
      <div className="space-y-4">
        <h3 className="font-medium text-foreground">Editor de Conteúdo</h3>
        <Card className="p-4 bg-gradient-card text-center">
          <p className="text-muted-foreground text-sm">
            Gere uma landing page primeiro para editar o conteúdo
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">Editor de Conteúdo</h3>
        <Badge variant="secondary" className="text-xs">
          {businessData.sections.length} seções
        </Badge>
      </div>

      {/* Main Content */}
      <Card className="p-4 bg-gradient-card">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-sm text-foreground">Conteúdo Principal</h4>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEditSection('main')}
            className="h-6 w-6 p-0"
          >
            <Edit3 className="w-3 h-3" />
          </Button>
        </div>
        
        {editingSection === 'main' ? (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Título Principal</Label>
              <Input
                value={editedContent?.title || ''}
                onChange={(e) => updateMainContent('title', e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Subtítulo</Label>
              <Input
                value={editedContent?.subtitle || ''}
                onChange={(e) => updateMainContent('subtitle', e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Texto Hero</Label>
              <Textarea
                value={editedContent?.heroText || ''}
                onChange={(e) => updateMainContent('heroText', e.target.value)}
                className="text-xs resize-none"
                rows={2}
              />
            </div>
            <div>
              <Label className="text-xs">Texto do CTA</Label>
              <Input
                value={editedContent?.ctaText || ''}
                onChange={(e) => updateMainContent('ctaText', e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveSection}>
                <Save className="w-3 h-3 mr-1" />
                Salvar
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                <RotateCcw className="w-3 h-3 mr-1" />
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div>
              <Label className="text-xs font-medium">Título:</Label>
              <p className="text-sm text-muted-foreground">{businessData.title}</p>
            </div>
            <div>
              <Label className="text-xs font-medium">Subtítulo:</Label>
              <p className="text-sm text-muted-foreground">{businessData.subtitle}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Sections */}
      {businessData.sections.map((section, index) => (
        <Card key={section.id} className="p-4 bg-gradient-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Seção {index + 1}
              </Badge>
              <h4 className="font-medium text-sm text-foreground">{section.type}</h4>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEditSection(section.id)}
                className="h-6 w-6 p-0"
              >
                <Edit3 className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteSection(section.id)}
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                title="Excluir seção"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {editingSection === section.id ? (
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Título da Seção</Label>
                <Input
                  value={editedContent?.sections.find(s => s.id === section.id)?.title || ''}
                  onChange={(e) => updateSectionContent(section.id, 'title', e.target.value)}
                  className="text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Conteúdo</Label>
                <Textarea
                  value={editedContent?.sections.find(s => s.id === section.id)?.content || ''}
                  onChange={(e) => updateSectionContent(section.id, 'content', e.target.value)}
                  className="text-xs resize-none"
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveSection}>
                  <Save className="w-3 h-3 mr-1" />
                  Salvar
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <Label className="text-xs font-medium">Título:</Label>
                <p className="text-sm text-muted-foreground">{section.title}</p>
              </div>
              <div>
                <Label className="text-xs font-medium">Conteúdo:</Label>
                <p className="text-sm text-muted-foreground line-clamp-3">{section.content}</p>
              </div>
            </div>
          )}
        </Card>
      ))}

      <Button 
        variant="outline" 
        className="w-full"
        onClick={async () => {
          if (businessData) {
            const newSection = {
              id: `custom-${Date.now()}`,
              type: 'investment' as const,
              title: 'Nova Seção',
              content: 'Conteúdo da nova seção. Clique em editar para personalizar.',
              order: businessData.sections.length + 1
            };
            
            const updatedBusinessData = {
              ...businessData,
              sections: [...businessData.sections, newSection]
            };
            
            onContentUpdate?.(updatedBusinessData);
            
            // Regenerar a landing page com a nova seção
            try {
              const { landingPageBuilder } = await import("@/services/landingPageBuilder");
              const updatedHTML = await landingPageBuilder.generateHTML(updatedBusinessData);
              onLandingPageGenerated(updatedHTML, updatedBusinessData);
            } catch (error) {
              console.error('Erro ao regenerar landing page:', error);
            }
          }
        }}
      >
        <Plus className="w-4 h-4 mr-2" />
        Adicionar Seção
      </Button>
    </div>
  );
};

export default ContentTab;