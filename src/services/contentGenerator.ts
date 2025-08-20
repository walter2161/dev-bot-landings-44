const MISTRAL_API_KEY = "aynCSftAcQBOlxmtmpJqVzco8K4aaTDQ";
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

export interface BusinessContent {
  title: string;
  subtitle: string;
  heroText: string;
  ctaText: string;
  sections: BusinessSection[];
  colors: ColorScheme;
  images: ImageDescriptions;
  customImages?: { [key: string]: string };
  sellerbot: SellerbotConfig;
  contact: ContactInfo;
  seo?: SEOData;
  layouts?: { [key: string]: any };
  font?: string;
}

export interface SEOData {
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

export interface BusinessSection {
  id: string;
  title: string;
  content: string;
  type: "intro" | "motivation" | "target" | "method" | "results" | "access" | "investment";
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
}

export interface ImageDescriptions {
  logo: string;
  hero: string;
  motivation: string;
  target: string;
  method: string;
  results: string;
  access: string;
  investment: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    whatsapp?: string;
  };
}

export interface SellerbotConfig {
  name: string;
  personality: string;
  knowledge: string[];
  prohibitions?: string;
  responses: {
    greeting: string;
    services: string;
    pricing: string;
    appointment: string;
  };
  media?: {
    images: Array<{ url: string; description: string; title?: string }>;
    links: Array<{ url: string; title: string; description?: string }>;
  };
}

export class ContentGenerator {
  private async makeRequest(prompt: string): Promise<string> {
    try {
      const response = await fetch(MISTRAL_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: "mistral-large-latest",
          messages: [
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(`API error: Limite de uso excedido. Aguarde alguns minutos e tente novamente.`);
        }
        if (response.status === 402) {
          throw new Error(`API error: Saldo insuficiente na chave API.`);
        }
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Erro na API:", error);
      throw error;
    }
  }

  async generateLandingPageHTML(userRequest: string): Promise<string> {
    try {
      console.log("Gerando landing page em partes para:", userRequest);
      
      // Dividir a geração em múltiplas partes
      const parts = await Promise.all([
        this.generateHTMLPart(userRequest, "header", "Gere apenas o <!DOCTYPE html>, <html>, <head> completo com meta tags, title e CSS inline para uma landing page sobre: "),
        this.generateHTMLPart(userRequest, "hero", "Gere apenas a seção hero (<section class='hero'>) com título, subtítulo e call-to-action para: "),
        this.generateHTMLPart(userRequest, "about", "Gere apenas a seção sobre (<section class='about'>) explicando o negócio para: "),
        this.generateHTMLPart(userRequest, "services", "Gere apenas a seção de serviços (<section class='services'>) listando os principais serviços para: "),
        this.generateHTMLPart(userRequest, "features", "Gere apenas a seção de diferenciais (<section class='features'>) destacando vantagens para: "),
        this.generateHTMLPart(userRequest, "contact", "Gere apenas a seção de contato (<section class='contact'>) com informações de contato para: "),
        this.generateHTMLPart(userRequest, "footer", "Gere apenas o footer (<footer>) e scripts JavaScript básicos para: "),
        this.generateHTMLPart(userRequest, "closing", "Gere apenas as tags de fechamento </body></html>")
      ]);

      // Juntar todas as partes
      const fullHTML = parts.join('\n');
      
      console.log("HTML gerado com sucesso em partes");
      return this.cleanAndValidateHTML(fullHTML);
      
    } catch (error) {
      console.warn("Geração em partes falhou, usando template local:", error);
      return this.generateLocalHTML(userRequest);
    }
  }

  private async generateHTMLPart(userRequest: string, partType: string, promptPrefix: string): Promise<string> {
    const prompt = `${promptPrefix}${userRequest}

IMPORTANTE: 
- Retorne APENAS o HTML solicitado, sem explicações
- Use CSS inline ou classes CSS modernas
- Seja responsivo e profissional
- Use cores atrativas e design moderno`;

    try {
      const response = await this.makeRequest(prompt);
      return this.cleanHTMLResponse(response);
    } catch (error) {
      console.warn(`Falha ao gerar parte ${partType}:`, error);
      return this.getLocalHTMLPart(userRequest, partType);
    }
  }

  private getLocalHTMLPart(userRequest: string, partType: string): string {
    const businessType = userRequest.toLowerCase();
    const colors = this.getColorsForBusiness(businessType);
    
    switch (partType) {
      case "header":
        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.getTitleForBusiness(businessType)}</title>
    <meta name="description" content="${this.getDescriptionForBusiness(businessType)}">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .section { padding: 80px 0; }
        .section:nth-child(even) { background: #f8f9fa; }
        .btn { background: ${colors.primary}; color: white; padding: 15px 30px; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; display: inline-block; }
        .btn:hover { background: ${colors.accent}; }
        @media (max-width: 768px) { .container { padding: 0 15px; } .section { padding: 60px 0; } }
    </style>
</head>
<body>`;
      
      case "hero":
        return `<section class="section" style="background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}); color: white; text-align: center; min-height: 100vh; display: flex; align-items: center;">
    <div class="container">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">${this.getTitleForBusiness(businessType)}</h1>
        <p style="font-size: 1.2rem; margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto;">${this.getHeroTextForBusiness(businessType)}</p>
        <a href="#contato" class="btn" style="font-size: 1.1rem;">Saiba Mais</a>
    </div>
</section>`;
      
      case "about":
        return `<section class="section">
    <div class="container">
        <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 2rem; color: ${colors.primary};">Sobre Nós</h2>
        <p style="text-align: center; font-size: 1.1rem; max-width: 800px; margin: 0 auto;">${this.getAboutTextForBusiness(businessType)}</p>
    </div>
</section>`;
      
      case "services":
        return `<section class="section">
    <div class="container">
        <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 2rem; color: ${colors.primary};">Nossos Serviços</h2>
        <p style="text-align: center; font-size: 1.1rem; max-width: 800px; margin: 0 auto;">${this.getServicesTextForBusiness(businessType)}</p>
    </div>
</section>`;
      
      case "features":
        return `<section class="section">
    <div class="container">
        <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 2rem; color: ${colors.primary};">Nossos Diferenciais</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin-top: 50px;">
            <div style="text-align: center; padding: 30px; background: white; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                <h3 style="color: ${colors.primary}; margin-bottom: 15px;">Qualidade</h3>
                <p>Serviços de alta qualidade com excelência comprovada.</p>
            </div>
            <div style="text-align: center; padding: 30px; background: white; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                <h3 style="color: ${colors.primary}; margin-bottom: 15px;">Experiência</h3>
                <p>Anos de experiência no mercado garantem o melhor resultado.</p>
            </div>
            <div style="text-align: center; padding: 30px; background: white; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                <h3 style="color: ${colors.primary}; margin-bottom: 15px;">Atendimento</h3>
                <p>Atendimento personalizado e dedicado para cada cliente.</p>
            </div>
        </div>
    </div>
</section>`;
      
      case "contact":
        return `<section class="section" id="contato">
    <div class="container">
        <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 2rem; color: ${colors.primary};">Entre em Contato</h2>
        <div style="text-align: center; max-width: 600px; margin: 0 auto;">
            <p style="margin-bottom: 20px;">Entre em contato conosco para saber mais sobre nossos serviços.</p>
            <p style="margin-bottom: 15px;"><strong>WhatsApp:</strong> (11) 99999-9999</p>
            <p style="margin-bottom: 15px;"><strong>Email:</strong> contato@empresa.com</p>
            <a href="https://wa.me/5511999999999" class="btn" style="margin-top: 20px;">Falar no WhatsApp</a>
        </div>
    </div>
</section>`;
      
      case "footer":
        return `<footer style="background: #333; color: white; padding: 40px 0; text-align: center;">
    <div class="container">
        <h3>${this.getTitleForBusiness(businessType)}</h3>
        <p>© 2024 ${this.getTitleForBusiness(businessType)}. Todos os direitos reservados.</p>
    </div>
</footer>

<script>
    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
</script>`;
      
      case "closing":
        return `</body>
</html>`;
      
      default:
        return "";
    }
  }

  private cleanAndValidateHTML(html: string): string {
    // Limpar HTML duplicado e tags mal formadas
    let cleanHTML = html.replace(/<!DOCTYPE html>/gi, '<!DOCTYPE html>');
    cleanHTML = cleanHTML.replace(/<html[^>]*>/gi, '<html lang="pt-BR">');
    
    // Remover duplicatas
    const parts = cleanHTML.split('<!DOCTYPE html>');
    if (parts.length > 2) {
      cleanHTML = '<!DOCTYPE html>' + parts[parts.length - 1];
    }
    
    return cleanHTML.trim();
  }

  private getColorsForBusiness(businessType: string): ColorScheme {
    if (businessType.includes('loja') || businessType.includes('roupas') || businessType.includes('moda')) {
      return { primary: "#e91e63", secondary: "#f48fb1", accent: "#ad1457" };
    } else if (businessType.includes('restaurante') || businessType.includes('comida')) {
      return { primary: "#ff5722", secondary: "#ff8a65", accent: "#d84315" };
    } else if (businessType.includes('imobiliario') || businessType.includes('imovel') || businessType.includes('corretor')) {
      return { primary: "#2196f3", secondary: "#64b5f6", accent: "#1976d2" };
    } else {
      return { primary: "#4caf50", secondary: "#81c784", accent: "#388e3c" };
    }
  }

  private getTitleForBusiness(businessType: string): string {
    if (businessType.includes('loja') || businessType.includes('roupas') || businessType.includes('moda')) {
      return "Estilo & Moda";
    } else if (businessType.includes('restaurante') || businessType.includes('comida')) {
      return "Sabor & Tradição";
    } else if (businessType.includes('imobiliario') || businessType.includes('imovel') || businessType.includes('corretor')) {
      return "Imóveis Premium";
    } else {
      return "Seu Negócio";
    }
  }

  private getDescriptionForBusiness(businessType: string): string {
    if (businessType.includes('loja') || businessType.includes('roupas') || businessType.includes('moda')) {
      return "Sua loja de roupas online com as melhores tendências";
    } else if (businessType.includes('restaurante') || businessType.includes('comida')) {
      return "Restaurante com os melhores pratos da região";
    } else if (businessType.includes('imobiliario') || businessType.includes('imovel') || businessType.includes('corretor')) {
      return "Seu novo lar está aqui - Imóveis de qualidade";
    } else {
      return "Soluções personalizadas para você";
    }
  }

  private getHeroTextForBusiness(businessType: string): string {
    if (businessType.includes('loja') || businessType.includes('roupas') || businessType.includes('moda')) {
      return "Vista-se com estilo, expresse sua personalidade";
    } else if (businessType.includes('restaurante') || businessType.includes('comida')) {
      return "Sabores autênticos que conquistam o paladar";
    } else if (businessType.includes('imobiliario') || businessType.includes('imovel') || businessType.includes('corretor')) {
      return "O imóvel dos seus sonhos está aqui";
    } else {
      return "Transforme suas ideias em realidade";
    }
  }

  private getAboutTextForBusiness(businessType: string): string {
    if (businessType.includes('loja') || businessType.includes('roupas') || businessType.includes('moda')) {
      return "Oferecemos as melhores peças de roupa com qualidade e estilo únicos";
    } else if (businessType.includes('restaurante') || businessType.includes('comida')) {
      return "Tradição familiar em cada prato, ingredientes frescos e receitas especiais";
    } else if (businessType.includes('imobiliario') || businessType.includes('imovel') || businessType.includes('corretor')) {
      return "Especialistas em imóveis residenciais e comerciais com as melhores opções";
    } else {
      return "Oferecemos serviços de qualidade com atendimento personalizado";
    }
  }

  private getServicesTextForBusiness(businessType: string): string {
    if (businessType.includes('loja') || businessType.includes('roupas') || businessType.includes('moda')) {
      return "Roupas casuais, sociais, esportivas e acessórios";
    } else if (businessType.includes('restaurante') || businessType.includes('comida')) {
      return "Almoço, jantar, delivery e eventos especiais";
    } else if (businessType.includes('imobiliario') || businessType.includes('imovel') || businessType.includes('corretor')) {
      return "Venda, locação, financiamento e consultoria imobiliária";
    } else {
      return "Consultorias, serviços especializados e soluções completas";
    }
  }

  private cleanHTMLResponse(response: string): string {
    let htmlContent = response.trim();
    
    // Remover blocos de código markdown se existirem (mais agressivo)
    htmlContent = htmlContent.replace(/```html\s*/gi, '');
    htmlContent = htmlContent.replace(/```\s*$/g, '');
    htmlContent = htmlContent.replace(/^```/g, '');
    htmlContent = htmlContent.replace(/```$/g, '');
    
    // Encontrar início do HTML
    const htmlStartIndex = htmlContent.indexOf('<!DOCTYPE');
    if (htmlStartIndex > 0) {
      htmlContent = htmlContent.substring(htmlStartIndex);
    }
    
    // Encontrar fim do HTML
    const htmlEndIndex = htmlContent.lastIndexOf('</html>');
    if (htmlEndIndex !== -1) {
      htmlContent = htmlContent.substring(0, htmlEndIndex + 7);
    }
    
    // Limpar espaços extras
    htmlContent = htmlContent.trim();
    
    return htmlContent;
  }

  private isValidHTML(html: string): boolean {
    const cleanHtml = html.trim();
    const hasDoctype = cleanHtml.includes('<!DOCTYPE') || cleanHtml.startsWith('<!doctype');
    const hasHtmlTag = cleanHtml.includes('<html');
    const hasClosingHtml = cleanHtml.includes('</html>');
    const hasHead = cleanHtml.includes('<head>') || cleanHtml.includes('<head ');
    const hasBody = cleanHtml.includes('<body>') || cleanHtml.includes('<body ');
    
    console.log('Validação HTML:', { hasDoctype, hasHtmlTag, hasClosingHtml, hasHead, hasBody });
    
    return hasDoctype && hasHtmlTag && hasClosingHtml && hasHead && hasBody;
  }

  private generateLocalHTML(userRequest: string): string {
    const businessType = userRequest.toLowerCase();
    let title, description, content, colors;

    // Determinar tipo de negócio e conteúdo
    if (businessType.includes('loja') || businessType.includes('roupas') || businessType.includes('moda')) {
      title = "Estilo & Moda";
      description = "Sua loja de roupas online com as melhores tendências";
      content = {
        hero: "Vista-se com estilo, expresse sua personalidade",
        about: "Oferecemos as melhores peças de roupa com qualidade e estilo únicos",
        services: "Roupas casuais, sociais, esportivas e acessórios"
      };
      colors = { primary: "#e91e63", secondary: "#f48fb1", accent: "#ad1457" };
    } else if (businessType.includes('restaurante') || businessType.includes('comida')) {
      title = "Sabor & Tradição";
      description = "Restaurante com os melhores pratos da região";
      content = {
        hero: "Sabores autênticos que conquistam o paladar",
        about: "Tradição familiar em cada prato, ingredientes frescos e receitas especiais",
        services: "Almoço, jantar, delivery e eventos especiais"
      };
      colors = { primary: "#ff5722", secondary: "#ff8a65", accent: "#d84315" };
    } else if (businessType.includes('imobiliario') || businessType.includes('imovel')) {
      title = "Imóveis Premium";
      description = "Seu novo lar está aqui - Imóveis de qualidade";
      content = {
        hero: "O imóvel dos seus sonhos está aqui",
        about: "Especialistas em imóveis residenciais e comerciais com as melhores opções",
        services: "Venda, locação, financiamento e consultoria imobiliária"
      };
      colors = { primary: "#2196f3", secondary: "#64b5f6", accent: "#1976d2" };
    } else {
      title = "Seu Negócio";
      description = "Soluções personalizadas para você";
      content = {
        hero: "Transforme suas ideias em realidade",
        about: "Oferecemos serviços de qualidade com atendimento personalizado",
        services: "Consultorias, serviços especializados e soluções completas"
      };
      colors = { primary: "#4caf50", secondary: "#81c784", accent: "#388e3c" };
    }

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - ${description}</title>
    <meta name="description" content="${description}">
    <meta name="keywords" content="${title}, ${userRequest}, serviços, qualidade">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        
        .hero { 
            background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}); 
            color: white; text-align: center; padding: 100px 0; min-height: 100vh;
            display: flex; align-items: center; justify-content: center;
        }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.2rem; margin-bottom: 2rem; }
        .cta-button { 
            background: ${colors.accent}; color: white; padding: 15px 30px; 
            text-decoration: none; border-radius: 50px; font-weight: bold;
            display: inline-block; transition: transform 0.3s;
        }
        .cta-button:hover { transform: translateY(-2px); }
        
        .section { padding: 80px 0; }
        .section:nth-child(even) { background: #f8f9fa; }
        .section h2 { font-size: 2.5rem; margin-bottom: 2rem; color: ${colors.primary}; text-align: center; }
        .section p { font-size: 1.1rem; margin-bottom: 2rem; text-align: center; max-width: 800px; margin-left: auto; margin-right: auto; }
        
        .footer { background: #333; color: white; padding: 40px 0; text-align: center; }
        .footer h3 { margin-bottom: 1rem; }
        
        #chat-widget {
            position: fixed; bottom: 20px; right: 20px; 
            background: ${colors.primary}; color: white; 
            padding: 15px; border-radius: 50px; cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 1000;
        }
        
        @media (max-width: 768px) {
            .hero h1 { font-size: 2rem; }
            .hero p { font-size: 1rem; }
            .section h2 { font-size: 2rem; }
        }
    </style>
</head>
<body>
    <section class="hero">
        <div class="container">
            <h1>${title}</h1>
            <p>${content.hero}</p>
            <a href="#contato" class="cta-button">Saiba Mais</a>
        </div>
    </section>
    
    <section class="section">
        <div class="container">
            <h2>Sobre Nós</h2>
            <p>${content.about}</p>
        </div>
    </section>
    
    <section class="section">
        <div class="container">
            <h2>Nossos Serviços</h2>
            <p>${content.services}</p>
        </div>
    </section>
    
    <section class="section" id="contato">
        <div class="container">
            <h2>Entre em Contato</h2>
            <p>Entre em contato conosco para saber mais sobre nossos serviços.</p>
            <p><strong>WhatsApp:</strong> (11) 99999-9999</p>
            <p><strong>Email:</strong> contato@empresa.com</p>
        </div>
    </section>
    
    <footer class="footer">
        <div class="container">
            <h3>${title}</h3>
            <p>© 2024 ${title}. Todos os direitos reservados.</p>
        </div>
    </footer>
    
    <div id="chat-widget" onclick="openChat()">💬 Chat</div>
    
    <script>
        function openChat() {
            alert('Chat em desenvolvimento. Entre em contato pelo WhatsApp: (11) 99999-9999');
        }
        
        // Smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
    </script>
</body>
</html>`;
  }

  // Manter método para chat que ainda precisa de dados estruturados
  async generateChatResponse(message: string, businessData: BusinessContent): Promise<string> {
    const mediaInfo = businessData.sellerbot?.media ? `

IMAGENS DISPONÍVEIS:
${businessData.sellerbot.media.images.map((img, i) => `${i + 1}. ${img.title || 'Imagem'}: ${img.description} (URL: ${img.url})`).join('\n')}

LINKS DISPONÍVEIS:
${businessData.sellerbot.media.links.map((link, i) => `${i + 1}. ${link.title}: ${link.description || 'Link útil'} (URL: ${link.url})`).join('\n')}

COMO ENVIAR MÍDIA:
- Para enviar uma imagem, use: [IMAGEM: ${businessData.sellerbot.media.images[0]?.url || 'URL_DA_IMAGEM'}]
- Para enviar um link, use: [LINK: URL | Título]
- Você pode enviar mídia quando apropriado para a conversa
- Se não tiver mídia personalizada, use as imagens da landing page: ${businessData.images.hero}, ${businessData.images.motivation}, etc.` : '';

    const prompt = `Você é ${businessData.sellerbot.name}, assistente específico do negócio: ${businessData.title}.

Personalidade: ${businessData.sellerbot.personality}
Conhecimentos: ${businessData.sellerbot.knowledge.join(", ")}

INFORMAÇÕES DO NEGÓCIO:
- Endereço: ${businessData.contact.address}
- Telefone: ${businessData.contact.phone}
- Email: ${businessData.contact.email}
- WhatsApp: ${businessData.contact.socialMedia.whatsapp || 'Não informado'}${mediaInfo}

INSTRUÇÕES CRÍTICAS:
- Responda APENAS sobre o negócio específico: ${businessData.title} - ${businessData.subtitle}
- Use as informações de contato quando relevante
- PROIBIDO qualquer conteúdo sexual, adulto ou inapropriado
- Mantenha o foco nos produtos/serviços legítimos do negócio
- Use linguagem profissional e adequada
- Conduza para conversão de forma ética
- Seja natural e útil, evite respostas robóticas
- Quando apropriado, envie imagens ou links usando os formatos especificados

Mensagem do cliente: "${message}"

Responda de forma natural e profissional, focando no negócio específico. Máximo 250 caracteres para manter fluidez.`;

    try {
      return await this.makeRequest(prompt);
    } catch (error) {
      console.error("Erro no chat:", error);
      return businessData.sellerbot.responses.greeting;
    }
  }

  // Método auxiliar para extrair dados básicos do HTML gerado (para compatibilidade)
  extractBusinessDataFromHTML(htmlContent: string): BusinessContent {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    const title = doc.querySelector('title')?.textContent || 'Landing Page';
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    
    return {
      title,
      subtitle: description,
      heroText: doc.querySelector('h1')?.textContent || title,
      ctaText: doc.querySelector('button, .cta-button')?.textContent || 'Clique aqui',
      sections: [
        {
          id: 'intro',
          title: 'Sobre',
          content: description,
          type: 'intro'
        }
      ],
      colors: {
        primary: '#007bff',
        secondary: '#6c757d',
        accent: '#28a745'
      },
      images: {
        logo: 'Logo da empresa',
        hero: 'Imagem principal',
        motivation: 'Imagem motivacional',
        target: 'Público-alvo',
        method: 'Método',
        results: 'Resultados',
        access: 'Acesso',
        investment: 'Investimento'
      },
      contact: {
        email: 'contato@empresa.com',
        phone: '(11) 99999-9999',
        address: 'Endereço da empresa',
        socialMedia: {
          whatsapp: '(11) 99999-9999'
        }
      },
      sellerbot: {
        name: `Assistente ${title}`,
        personality: 'Profissional e atencioso',
        knowledge: ['Informações gerais do negócio'],
        responses: {
          greeting: `Olá! Bem-vindo à ${title}. Como posso ajudá-lo?`,
          services: 'Conheça nossos serviços e produtos.',
          pricing: 'Entre em contato para conhecer nossos preços.',
          appointment: 'Agende uma conversa conosco!'
        }
      }
    };
  }
}

export const contentGenerator = new ContentGenerator();