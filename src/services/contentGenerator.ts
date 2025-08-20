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
          max_tokens: 3000,
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

  async generateBusinessContent(userRequest: string): Promise<BusinessContent> {
    const prompt = `INSTRUÇÃO CRÍTICA: Você deve criar conteúdo EXCLUSIVAMENTE sobre o negócio específico solicitado pelo usuário. PROIBIDO incluir qualquer conteúdo sobre marketing digital, agências ou serviços de marketing.

SOLICITAÇÃO DO USUÁRIO: "${userRequest}"

Crie um JSON seguindo EXATAMENTE este formato com conteúdo 100% específico do negócio solicitado:

{
  "title": "Nome/título específico do negócio solicitado",
  "subtitle": "Descrição específica do que o negócio oferece",
  "heroText": "Chamada principal específica do negócio",
  "ctaText": "Ação específica (Comprar, Agendar, Visitar, etc.)",
  "sections": [
    {
      "id": "intro",
      "title": "Título sobre o produto/serviço específico",
      "content": "Apresentação objetiva do negócio específico",
      "type": "intro"
    },
    {
      "id": "motivation",
      "title": "Por que escolher este negócio específico",
      "content": "Diferenciais e benefícios específicos",
      "type": "motivation"
    },
    {
      "id": "target",
      "title": "Para quem é direcionado",
      "content": "Público-alvo específico do negócio",
      "type": "target"
    },
    {
      "id": "method",
      "title": "Como funciona",
      "content": "Processo específico do negócio",
      "type": "method"
    },
    {
      "id": "results",
      "title": "Resultados esperados",
      "content": "O que o cliente pode esperar",
      "type": "results"
    },
    {
      "id": "access",
      "title": "Como acessar/encontrar",
      "content": "Formas de acesso ao negócio",
      "type": "access"
    },
    {
      "id": "investment",
      "title": "Investimento/Preços",
      "content": "Informações sobre preços e ofertas",
      "type": "investment"
    }
  ],
  "colors": {
    "primary": "cor HEX apropriada para o tipo de negócio",
    "secondary": "cor HEX complementar",
    "accent": "cor HEX de destaque"
  },
  "images": {
    "logo": "logotipo da empresa, imagem clara do logo",
    "hero": "foto realista específica do negócio",
    "motivation": "imagem dos diferenciais do negócio",
    "target": "foto do público-alvo específico",
    "method": "imagem do processo/funcionamento",
    "results": "foto dos resultados/benefícios",
    "access": "imagem de acesso/localização",
    "investment": "imagem relacionada a preços/ofertas"
  },
  "contact": {
    "email": "email@negocio.com (email específico do negócio)",
    "phone": "(XX) XXXXX-XXXX (telefone comercial com DDD)",
    "address": "Endereço completo: Rua, número, bairro, cidade - UF, CEP",
    "socialMedia": {
      "whatsapp": "(XX) 9XXXX-XXXX (WhatsApp comercial com DDD)",
      "instagram": "@perfil_do_negocio",
      "facebook": "facebook.com/paginadonegocio"
    }
  },
  "sellerbot": {
    "name": "Nome apropriado para assistente do negócio",
    "personality": "Personalidade adequada ao negócio",
    "knowledge": ["conhecimentos específicos do negócio"],
    "responses": {
      "greeting": "Saudação específica do negócio",
      "services": "Apresentação dos produtos/serviços",
      "pricing": "Informação sobre preços",
      "appointment": "Resposta sobre agendamento/compra"
    }
  }
}

RETORNE APENAS O JSON, SEM EXPLICAÇÕES ADICIONAIS.`;

    try {
      const response = await this.makeRequest(prompt);
      console.log("Raw API response:", response);
      
      // Procurar por JSON no response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        let jsonString = jsonMatch[0];
        
        // Limpar caracteres problemáticos e corrigir JSON malformado
        jsonString = jsonString
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
          .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3') // Quote unquoted keys
          .replace(/:\s*'([^']*)'/g, ': "$1"') // Convert single quotes to double quotes
          .replace(/\n|\r/g, ' ') // Replace newlines with spaces
          .trim();
        
        console.log("Cleaned JSON string:", jsonString);
        
        try {
          const parsed = JSON.parse(jsonString);
          return parsed;
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          console.error("Problematic JSON:", jsonString.slice(0, 1000) + "...");
          
          // Tentar parsing mais robusto
          try {
            // Remover possíveis caracteres extras no final
            const cleanedAgain = jsonString.replace(/[^}]*$/, '}');
            const parsed = JSON.parse(cleanedAgain);
            return parsed;
          } catch (secondParseError) {
            console.error("Second parse attempt failed:", secondParseError);
            throw new Error("JSON malformado retornado pela API");
          }
        }
      }
      
      throw new Error("Nenhum JSON válido encontrado na resposta da API");
    } catch (error) {
      console.error("Erro ao gerar conteúdo:", error);
      if (error.message.includes("JSON")) {
        throw new Error("Resposta da API em formato inválido. Tente novamente.");
      }
      throw new Error("Falha ao gerar conteúdo específico do negócio");
    }
  }

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
}

export const contentGenerator = new ContentGenerator();