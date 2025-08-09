
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/enhanced-button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  EyeOff, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  ExternalLink
} from "lucide-react";
import { BusinessContent } from "@/services/contentGenerator";

interface ImageStatus {
  url: string;
  status: 'loading' | 'loaded' | 'error';
  loadTime?: number;
}

interface ImageDebuggerProps {
  businessData?: BusinessContent;
  isVisible: boolean;
  onToggle: () => void;
}

const ImageDebugger = ({ businessData, isVisible, onToggle }: ImageDebuggerProps) => {
  const [imageStatuses, setImageStatuses] = useState<Record<string, ImageStatus>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const generateImageUrls = (images: any) => {
    if (!images) return {};
    
    const baseUrl = 'https://image.pollinations.ai/prompt/';
    const imageParams = '?width=1200&height=800&enhance=true&nologo=true';
    
    return Object.entries(images).reduce((acc, [key, prompt]) => {
      acc[key] = `${baseUrl}${encodeURIComponent(prompt as string)}${imageParams}`;
      return acc;
    }, {} as Record<string, string>);
  };

  const testImageLoad = (key: string, url: string): Promise<ImageStatus> => {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const img = new Image();
      
      img.onload = () => {
        resolve({
          url,
          status: 'loaded',
          loadTime: Date.now() - startTime
        });
      };
      
      img.onerror = () => {
        resolve({
          url,
          status: 'error',
          loadTime: Date.now() - startTime
        });
      };
      
      img.src = url;
    });
  };

  const refreshImages = async () => {
    if (!businessData?.images) return;
    
    setIsRefreshing(true);
    const imageUrls = generateImageUrls(businessData.images);
    
    // Reset all to loading
    const loadingStatuses = Object.entries(imageUrls).reduce((acc, [key, url]) => {
      acc[key] = { url, status: 'loading' as const };
      return acc;
    }, {} as Record<string, ImageStatus>);
    
    setImageStatuses(loadingStatuses);

    // Test each image
    const promises = Object.entries(imageUrls).map(async ([key, url]) => {
      const result = await testImageLoad(key, url);
      setImageStatuses(prev => ({ ...prev, [key]: result }));
      return { key, result };
    });

    await Promise.all(promises);
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (businessData?.images && isVisible) {
      refreshImages();
    }
  }, [businessData?.images, isVisible]);

  const getStatusIcon = (status: ImageStatus['status']) => {
    switch (status) {
      case 'loaded':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'loading':
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: ImageStatus['status']) => {
    switch (status) {
      case 'loaded':
        return <Badge variant="default" className="bg-green-500">Carregada</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'loading':
        return <Badge variant="secondary">Carregando...</Badge>;
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
          className="bg-background/80 backdrop-blur"
        >
          <Eye className="w-4 h-4 mr-2" />
          Debug Imagens
        </Button>
      </div>
    );
  }

  const totalImages = Object.keys(imageStatuses).length;
  const loadedImages = Object.values(imageStatuses).filter(s => s.status === 'loaded').length;
  const errorImages = Object.values(imageStatuses).filter(s => s.status === 'error').length;

  return (
    <div className="fixed bottom-4 left-4 z-50 w-80">
      <Card className="bg-background/95 backdrop-blur border shadow-lg">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Debug de Imagens</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshImages}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
              >
                <EyeOff className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              {loadedImages}/{totalImages}
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-red-500" />
              {errorImages} erros
            </span>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {Object.entries(imageStatuses).map(([key, status]) => (
            <div key={key} className="p-3 border-b last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.status)}
                  <span className="text-sm font-medium capitalize">{key}</span>
                </div>
                {getStatusBadge(status.status)}
              </div>
              
              {status.loadTime && (
                <div className="text-xs text-muted-foreground mb-2">
                  Tempo: {status.loadTime}ms
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded p-2">
                  <div className="text-xs font-mono break-all">
                    {businessData?.images?.[key] || 'Prompt não encontrado'}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(status.url, '_blank')}
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
              
              {status.status === 'loaded' && (
                <div className="mt-2">
                  <img
                    src={status.url}
                    alt={key}
                    className="w-full h-16 object-cover rounded border"
                    onError={() => {
                      setImageStatuses(prev => ({
                        ...prev,
                        [key]: { ...status, status: 'error' }
                      }));
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {totalImages === 0 && (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Nenhuma imagem para debugar
          </div>
        )}
      </Card>
    </div>
  );
};

export default ImageDebugger;
