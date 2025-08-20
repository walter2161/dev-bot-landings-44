const MISTRAL_API_KEY = "lVs7pOO1VL71usIxZeWdMl0ILn50iKD4";
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
      // Tentar primeiro a API
      const prompt = `INSTRUÇÃO CRÍTICA: Você DEVE criar uma landing page HTML completa e funcional baseada na solicitação do usuário.

SOLICITAÇÃO DO USUÁRIO: "${userRequest}"

Retorne APENAS o HTML completo iniciando com <!DOCTYPE html> e terminando com </html>, sem explicações ou texto adicional.`;

      const response = await this.makeRequest(prompt);
      
      // Limpar e validar a resposta
      let htmlContent = this.cleanHTMLResponse(response);
      
      if (this.isValidHTML(htmlContent)) {
        console.log("HTML gerado com sucesso via API");
        return htmlContent;
      } else {
        throw new Error("HTML inválido da API");
      }
      
    } catch (error) {
      console.warn("API falhou, usando template local:", error);
      // Fallback para template local
      return this.generateLocalHTML(userRequest);
    }
  }

  private cleanHTMLResponse(response: string): string {
    let htmlContent = response.trim();
    
    // Remover blocos de código markdown se existirem
    htmlContent = htmlContent.replace(/```html\s*/gi, '').replace(/```\s*$/, '');
    
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
    
    return htmlContent;
  }

  private isValidHTML(html: string): boolean {
    return html.includes('<!DOCTYPE') && 
           html.includes('<html') && 
           html.includes('</html>') &&
           html.includes('<head>') &&
           html.includes('<body>');
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