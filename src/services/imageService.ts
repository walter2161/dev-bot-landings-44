export class ImageService {
  async generateImageUrl(prompt: string): Promise<string> {
    // Encode the prompt for URL
    const encodedPrompt = encodeURIComponent(prompt);
    // Usar múltiplos serviços como fallback
    const services = [
      `https://image.pollinations.ai/prompt/${encodedPrompt}?width=400&height=300&model=flux&nologo=true&quality=80`,
      `https://picsum.photos/400/300?random=${Date.now()}`, // Fallback com imagens placeholder
    ];
    
    // Tentar primeiro serviço, se falhar usar fallback
    try {
      const response = await fetch(services[0]);
      if (response.ok) {
        return services[0];
      }
    } catch (error) {
      console.warn('Pollinations indisponível, usando fallback');
    }
    
    return services[1];
  }

  async convertImageToBase64(imageUrl: string): Promise<string> {
    try {
      console.log("Convertendo imagem para base64:", imageUrl);
      
      // Usar modo cors para contornar problemas de CORS
      const response = await fetch(imageUrl, { 
        mode: 'cors',
        headers: {
          'Accept': 'image/*'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      console.log("Blob criado:", blob.type, blob.size);
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          console.log("Base64 gerado:", base64.substring(0, 100) + "...");
          resolve(base64);
        };
        reader.onerror = (error) => {
          console.error("Erro no FileReader:", error);
          reject(error);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Erro ao converter imagem para Base64:", error);
      console.log("Retornando placeholder para:", imageUrl);
      // Retorna uma imagem placeholder em base64
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MDAgMzAwTDQ2MCAyNDBINDYwTDQ2MCAzNjBINDAwVjMwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+";
    }
  }

  async generateLandingPageImages(imagePrompts: { hero: string; features: string[] }): Promise<{ hero: string; features: string[] }> {
    try {
      const heroImageUrl = await this.generateImageUrl(imagePrompts.hero);
      const heroBase64 = await this.convertImageToBase64(heroImageUrl);

      const featureImages = await Promise.all(
        imagePrompts.features.map(async (prompt) => {
          const imageUrl = await this.generateImageUrl(prompt);
          return await this.convertImageToBase64(imageUrl);
        })
      );

      return {
        hero: heroBase64,
        features: featureImages
      };
    } catch (error) {
      console.error("Erro ao gerar imagens:", error);
      return {
        hero: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjwvZz4KPC9zdmc+",
        features: []
      };
    }
  }
}

export const imageService = new ImageService();