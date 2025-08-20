import { useState } from "react";
import { Button } from "@/components/ui/enhanced-button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Maximize2, 
  RotateCcw,
  Code,
  ExternalLink,
  Download,
  Info
} from "lucide-react";
import { BusinessContent } from "@/services/contentGenerator";
import DocumentationModal from "@/components/ui/documentation-modal";

interface PreviewFrameProps {
  generatedHTML?: string;
  businessData?: BusinessContent;
}

const PreviewFrame = ({ generatedHTML, businessData }: PreviewFrameProps) => {
  const [deviceMode, setDeviceMode] = useState("desktop");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);

  const deviceModes = [
    { id: "desktop", icon: Monitor, label: "Desktop", width: "100%" },
    { id: "tablet", icon: Tablet, label: "Tablet", width: "768px" },
    { id: "mobile", icon: Smartphone, label: "Mobile", width: "375px" },
  ];

  const downloadHTML = () => {
    if (!generatedHTML) return;
    
    const blob = new Blob([generatedHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${businessData?.title || 'landing-page'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const emptyPreview = `
    <div style="font-family: 'Inter', sans-serif; margin: 0; padding: 0; background: #f8fafc; height: 100vh; display: flex; align-items: center; justify-content: center;">
      <div style="text-align: center; color: #64748b;">
        <div style="margin-bottom: 1rem;">
          <img src="/lovable-uploads/mascote-pagejet.png" alt="PageJet Mascote" style="width: 150px; height: auto; margin: 0 auto; display: block;" />
        </div>
        <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: #334155;">Aguardando Landing Page</h2>
        <p style="font-size: 1rem;">Use o PageJet para gerar sua landing page personalizada</p>
      </div>
    </div>
  `;

  const currentHTML = generatedHTML || emptyPreview;

  return (
    <>
      <DocumentationModal 
        open={showDocumentation} 
        onOpenChange={setShowDocumentation} 
      />
      <div className="flex-1 flex flex-col bg-muted/30">
      {/* Preview Controls */}
      <div className="border-b border-border bg-background/95 backdrop-blur p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-foreground">Preview</h3>
            <Badge variant="secondary" className="text-xs">
              {generatedHTML ? "Gerado por IA" : "Aguardando Geração"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Device Mode Buttons */}
            <div className="flex bg-muted p-1 rounded-lg">
              {deviceModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setDeviceMode(mode.id)}
                    className={`p-2 rounded-md transition-all ${
                      deviceMode === mode.id
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title={mode.label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            <div className="w-px h-6 bg-border" />

            {/* Action Buttons */}
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => {
                const iframe = document.querySelector('iframe[title="Landing Page Preview"]') as HTMLIFrameElement;
                if (iframe) {
                  iframe.contentWindow?.location.reload();
                }
              }}
              title="Recarregar Preview"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => {
                if (generatedHTML) {
                  // Show code in the same preview area
                  const codeHTML = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <title>Código Fonte - Landing Page</title>
                      <style>
                        body { 
                          font-family: 'Fira Code', 'Monaco', 'Consolas', monospace; 
                          margin: 0; 
                          padding: 20px; 
                          background: #1e1e1e; 
                          color: #d4d4d4;
                          line-height: 1.5;
                        }
                        .header {
                          background: #2d2d30;
                          margin: -20px -20px 20px -20px;
                          padding: 15px 20px;
                          border-bottom: 1px solid #454545;
                        }
                        .title {
                          color: #ffffff;
                          font-size: 18px;
                          margin: 0;
                        }
                        .subtitle {
                          color: #cccccc;
                          font-size: 14px;
                          margin: 5px 0 0 0;
                        }
                        pre { 
                          background: #1e1e1e; 
                          margin: 0;
                          padding: 0;
                          overflow: auto; 
                          white-space: pre-wrap;
                          word-wrap: break-word;
                        }
                        code { 
                          color: #d4d4d4; 
                          font-size: 13px;
                        }
                        .copy-btn {
                          position: fixed;
                          top: 20px;
                          right: 20px;
                          background: #0e639c;
                          color: white;
                          border: none;
                          padding: 8px 16px;
                          border-radius: 4px;
                          cursor: pointer;
                          font-size: 12px;
                        }
                        .copy-btn:hover {
                          background: #1177bb;
                        }
                      </style>
                    </head>
                    <body>
                      <div class="header">
                        <h1 class="title">Código Fonte - Landing Page</h1>
                        <p class="subtitle">HTML completo gerado pela IA</p>
                      </div>
                      <button class="copy-btn" onclick="copyToClipboard()">Copiar Código</button>
                      <pre><code id="sourceCode">${generatedHTML.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
                      
                      <script>
                        function copyToClipboard() {
                          const code = document.getElementById('sourceCode').textContent;
                          navigator.clipboard.writeText(code).then(() => {
                            const btn = document.querySelector('.copy-btn');
                            const originalText = btn.textContent;
                            btn.textContent = 'Copiado!';
                            btn.style.background = '#16a34a';
                            setTimeout(() => {
                              btn.textContent = originalText;
                              btn.style.background = '#0e639c';
                            }, 2000);
                          });
                        }
                      </script>
                    </body>
                    </html>
                  `;
                  
                  // Update the iframe with the source code view
                  const iframe = document.querySelector('iframe[title="Landing Page Preview"]') as HTMLIFrameElement;
                  if (iframe) {
                    iframe.srcdoc = codeHTML;
                  }
                }
              }}
              disabled={!generatedHTML}
              title="Ver código fonte"
            >
              <Code className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => {
                const previewContainer = document.querySelector('.preview-content');
                if (previewContainer) {
                  if (!document.fullscreenElement) {
                    previewContainer.requestFullscreen().catch(err => {
                      console.log(`Erro ao entrar em fullscreen: ${err.message}`);
                    });
                  } else {
                    document.exitFullscreen();
                  }
                }
              }}
              title="Maximizar"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={downloadHTML} 
              disabled={!generatedHTML}
            >
              <Download className="w-4 h-4" />
              Baixar HTML
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                if (generatedHTML) {
                  const newWindow = window.open('', '_blank');
                  if (newWindow) {
                    newWindow.document.open();
                    newWindow.document.write(generatedHTML);
                    newWindow.document.close();
                  }
                }
              }}
              disabled={!generatedHTML}
              title="Abrir em nova aba"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDocumentation(true)}
              className="h-8 w-8 p-0 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
              title="Documentação"
            >
              <Info className="w-4 h-4 text-primary" />
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 p-4 preview-content">
        <Card className="h-full bg-background border border-border/50 shadow-glow">
          <div className="h-full flex items-center justify-center">
            <div 
              className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300"
              style={{ 
                width: deviceModes.find(d => d.id === deviceMode)?.width,
                maxWidth: "100%",
                height: "80vh"
              }}
            >
              <iframe
                srcDoc={currentHTML}
                className="w-full h-full border-0"
                title="Landing Page Preview"
                key={generatedHTML ? generatedHTML.slice(0, 100) : 'empty'}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Status Bar */}
      <div className="border-t border-border bg-background/95 backdrop-blur p-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Seções: {businessData?.sections?.length || 7}/7</span>
            <span>Imagens: {generatedHTML ? "Geradas por IA" : "Demo"}</span>
            <span>Sellerbot: {businessData?.sellerbot?.name || "Configurado"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            <span>Auto-save ativo</span>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default PreviewFrame;