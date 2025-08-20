const MISTRAL_API_KEY = "eAa9Xuf7IpJElU8coKj3YWRtTLFU9tYl";
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
    const prompt = `INSTRUÇÃO CRÍTICA: Você DEVE criar uma landing page HTML completa e funcional baseada na solicitação do usuário.

SOLICITAÇÃO DO USUÁRIO: "${userRequest}"

Crie uma landing page HTML responsiva e profissional que contenha:

1. DOCTYPE e estrutura HTML5 completa
2. Meta tags para SEO (title, description, keywords, og tags)
3. CSS interno responsivo com design moderno
4. Seções estruturadas (hero, sobre, serviços, contato, etc.)
5. Chat widget integrado no canto inferior direito
6. JavaScript para funcionalidades básicas
7. Cores e design apropriados para o tipo de negócio
8. Conteúdo específico e relevante para o negócio solicitado

ESTRUTURA OBRIGATÓRIA:
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[TÍTULO ESPECÍFICO DO NEGÓCIO]</title>
    <meta name="description" content="[DESCRIÇÃO ESPECÍFICA]">
    <meta name="keywords" content="[PALAVRAS-CHAVE RELEVANTES]">
    <style>
        /* CSS RESPONSIVO E MODERNO AQUI */
    </style>
</head>
<body>
    <!-- NAVEGAÇÃO -->
    <nav>...</nav>
    
    <!-- SEÇÃO HERO -->
    <section class="hero">...</section>
    
    <!-- SEÇÕES DE CONTEÚDO -->
    <section class="intro">...</section>
    <section class="services">...</section>
    <section class="contact">...</section>
    
    <!-- FOOTER -->
    <footer>...</footer>
    
    <!-- CHAT WIDGET -->
    <div id="chat-widget">...</div>
    
    <script>
        // JAVASCRIPT PARA CHAT E FUNCIONALIDADES
    </script>
</body>
</html>

IMPORTANTE:
- O HTML deve ser 100% funcional e autocontido
- Use apenas conteúdo específico do negócio solicitado
- Inclua informações de contato realistas
- Chat widget deve usar a API Mistral com a chave: ${MISTRAL_API_KEY}
- Design responsivo e moderno
- Cores apropriadas para o tipo de negócio

Retorne APENAS o HTML completo, sem explicações.`;

    try {
      const response = await this.makeRequest(prompt);
      console.log("Raw HTML response length:", response.length);
      
      // Extrair HTML da resposta
      let htmlContent = response.trim();
      
      // Se há texto antes do HTML, remover
      const htmlStartIndex = htmlContent.indexOf('<!DOCTYPE');
      if (htmlStartIndex > 0) {
        htmlContent = htmlContent.substring(htmlStartIndex);
      }
      
      // Se há texto depois do HTML, remover
      const htmlEndIndex = htmlContent.lastIndexOf('</html>');
      if (htmlEndIndex !== -1) {
        htmlContent = htmlContent.substring(0, htmlEndIndex + 7);
      }
      
      // Validar se é HTML válido
      if (!htmlContent.includes('<!DOCTYPE') || !htmlContent.includes('</html>')) {
        throw new Error("HTML inválido gerado pela API");
      }
      
      console.log("Generated HTML preview:", htmlContent.substring(0, 500) + "...");
      return htmlContent;
      
    } catch (error) {
      console.error("Erro ao gerar HTML:", error);
      throw new Error("Falha ao gerar landing page HTML. Tente novamente.");
    }
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