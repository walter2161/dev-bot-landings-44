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
      console.log("Gerando landing page completa para:", userRequest);
      
      // Extrair informações do pedido do usuário
      const businessData = this.extractBusinessDataFromRequest(userRequest);
      
      return this.generateCompleteHTML(businessData);
      
    } catch (error) {
      console.warn("Erro ao gerar HTML:", error);
      return this.generateFallbackHTML(userRequest);
    }
  }

  private extractBusinessDataFromRequest(userRequest: string): any {
    // Extrair informações estruturadas do briefing
    const data: any = {
      companyName: this.extractCompanyName(userRequest),
      businessType: this.extractBusinessType(userRequest),
      city: this.extractCity(userRequest),
      description: this.generateDescription(userRequest),
      phone: "(11) 99999-9999",
      email: "contato@empresa.com",
      heroTitle: this.generateHeroTitle(userRequest),
      heroSubtitle: this.generateHeroSubtitle(userRequest),
      aboutTitle: this.generateAboutTitle(userRequest)
    };

    // Extrair informações específicas do briefing se presentes
    const briefingPatterns = {
      companyName: /(?:Criar landing page para|para)\s+([^,]+?)(?:,\s*um?)/i,
      businessType: /um\s+([^(]+?)(?:\s*\(tema:|$)/i,
      theme: /tema:\s*([^)]+)/i,
      description: /Descrição:\s*([^.]*\.?[^.]*\.?[^.]*\.?)(?:\s*Público-alvo:|$)/i,
      targetAudience: /Público-alvo:\s*([^.]*\.?[^.]*\.?)(?:\s*Objetivo principal:|$)/i,
      mainGoal: /Objetivo principal:\s*([^.]*\.?[^.]*\.?)(?:\s*Serviços principais:|$)/i,
      services: /Serviços principais:\s*([\s\S]*?)(?:\s*WhatsApp:|$)/i,
      whatsapp: /WhatsApp:\s*([^.]*?)(?:\s*Endereço:|$)/i,
      address: /Endereço:\s*([^.]*?)(?:\s*Contato:|$)/i,
      contact: /Contato:\s*([^.]*?)(?:\s*Ofertas especiais:|$)/i,
      specialOffers: /Ofertas especiais:\s*([^.]*?)(?:\s*O cliente enviou|$)/i
    };

    // Aplicar padrões de extração
    Object.entries(briefingPatterns).forEach(([key, pattern]) => {
      const match = userRequest.match(pattern);
      if (match && match[1]) {
        const value = match[1].trim();
        if (value && value !== '') {
          switch (key) {
            case 'companyName':
              data.companyName = value;
              break;
            case 'businessType':
              data.businessType = value.trim();
              break;
            case 'description':
              data.description = value;
              break;
            case 'targetAudience':
              data.targetAudience = value;
              break;
            case 'mainGoal':
              data.mainGoal = value;
              break;
            case 'services':
              data.services = value.replace(/\n/g, ' ').trim();
              break;
            case 'whatsapp':
              data.phone = value.replace(/[^\d\s()-]/g, '').trim() || data.phone;
              break;
            case 'address':
              data.address = value;
              break;
            case 'contact':
              // Extrair email e telefone do campo contato
              const emailMatch = value.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
              const phoneMatch = value.match(/\(?([0-9]{2})\)?\s?9?[0-9]{4,5}-?[0-9]{4}/);
              
              if (emailMatch) data.email = emailMatch[1];
              if (phoneMatch) data.phone = phoneMatch[0];
              
              data.contactInfo = value;
              break;
            case 'specialOffers':
              data.specialOffers = value;
              break;
          }
        }
      }
    });

    // Atualizar títulos com base nos dados extraídos
    if (data.companyName && data.city) {
      data.heroTitle = `${data.companyName} - ${data.city}`;
    } else if (data.companyName) {
      data.heroTitle = data.companyName;
    }

    if (data.description) {
      data.heroSubtitle = data.description.substring(0, 150) + (data.description.length > 150 ? '...' : '');
    }

    return data;
  }

  private generateCompleteHTML(businessData: any): string {
    const title = businessData.companyName || 'Sua Empresa';
    const description = businessData.description || 'Descrição da sua empresa';
    const city = businessData.city || 'Sua Cidade';
    const phone = businessData.phone || '(11) 99999-9999';
    const email = businessData.email || 'contato@empresa.com';
    
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - ${city}</title>
    <meta name="description" content="${description}" />
    <meta name="author" content="${title}" />
    <link rel="icon" href="/lovable-uploads/5a86d691-a877-4647-b08c-a2bddb5e5e71.png" type="image/png">

    <meta property="og:title" content="${title} - ${city}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@lovable_dev" />
    <meta name="twitter:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary: #0066cc;
            --secondary: #ff6b6b;
            --light: #f8f9fa;
            --dark: #343a40;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            overflow-x: hidden;
        }
        .hero {
            background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://image.pollinations.ai/prompt/${encodeURIComponent(businessData.businessType + ' em ' + city)}');
            background-size: cover;
            background-position: center;
            color: white;
            padding: 150px 0;
            text-align: center;
        }
        .section {
            padding: 80px 0;
        }
        .section-title {
            font-weight: 700;
            margin-bottom: 40px;
            position: relative;
            display: inline-block;
        }
        .section-title:after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 0;
            width: 50px;
            height: 3px;
            background: var(--primary);
        }
        .btn-primary {
            background: var(--primary);
            border: none;
            padding: 12px 30px;
            font-weight: 600;
            border-radius: 30px;
            transition: all 0.3s;
        }
        .btn-primary:hover {
            background: #0052a3;
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(0, 102, 204, 0.2);
        }
        .card {
            border: none;
            border-radius: 10px;
            overflow: hidden;
            transition: all 0.3s;
            height: 100%;
        }
        .card:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
        }
        .testimonial {
            text-align: center;
            margin-bottom: 30px;
        }
        .testimonial img {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            object-fit: cover;
            margin-bottom: 20px;
            border: 5px solid #f8f9fa;
        }
        .counter {
            font-size: 3rem;
            font-weight: 700;
            color: var(--primary);
        }
        .cta {
            background: linear-gradient(135deg, #0066cc, #0052a3);
            color: white;
            padding: 80px 0;
            text-align: center;
        }
        .form-control {
            border-radius: 30px;
            padding: 12px 20px;
            border: 1px solid #ddd;
        }
        .form-control:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 0.25rem rgba(0, 102, 204, 0.25);
        }
        .footer {
            background: var(--dark);
            color: white;
            padding: 40px 0;
            text-align: center;
        }
        .social-icons a {
            color: white;
            font-size: 1.5rem;
            margin: 0 10px;
            transition: all 0.3s;
        }
        .social-icons a:hover {
            color: var(--primary);
        }
        .service-icon {
            font-size: 3rem;
            color: var(--primary);
            margin-bottom: 20px;
        }
        .team-member {
            text-align: center;
            margin-bottom: 30px;
        }
        .team-member img {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            object-fit: cover;
            margin-bottom: 20px;
            border: 5px solid #f8f9fa;
        }
        .process-step {
            text-align: center;
            margin-bottom: 40px;
        }
        .process-step .step-number {
            width: 60px;
            height: 60px;
            background: var(--primary);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: 700;
            margin: 0 auto 20px;
        }
        .faq-item {
            margin-bottom: 20px;
            border: 1px solid #eee;
            border-radius: 10px;
            overflow: hidden;
        }
        .faq-question {
            background: #f8f9fa;
            padding: 15px 20px;
            font-weight: 600;
            cursor: pointer;
            position: relative;
        }
        .faq-question:after {
            content: '\\f107';
            font-family: 'Font Awesome 5 Free';
            font-weight: 900;
            position: absolute;
            right: 20px;
            top: 15px;
            transition: all 0.3s;
        }
        .faq-answer {
            padding: 0 20px;
            max-height: 0;
            overflow: hidden;
            transition: all 0.3s;
        }
        .faq-item.active .faq-question:after {
            transform: rotate(180deg);
        }
        .faq-item.active .faq-answer {
            padding: 15px 20px;
            max-height: 200px;
        }
        .floating-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: var(--primary);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            cursor: pointer;
            z-index: 1000;
        }
        .floating-btn i {
            font-size: 24px;
        }
        .floating-menu {
            position: fixed;
            flex-direction: column;
            bottom: 90px;
            right: 20px;
            width: 200px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            display: none;
            z-index: 1000;
            overflow: hidden;
        }
        .floating-menu-item {
            padding: 15px;
            border-bottom: 1px solid #eee;
            cursor: pointer;
            display: flex;
            align-items: center;
        }
        .floating-menu-item:last-child {
            border-bottom: none;
        }
        .floating-menu-item i {
            margin-right: 10px;
            color: var(--primary);
        }
        .floating-menu-item:hover {
            background-color: #f8f9fa;
        }
        .chat-modal {
            display: none;
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 350px;
            height: 450px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            flex-direction: column;
            overflow: hidden;
        }
        .chat-header {
            background-color: var(--primary);
            color: white;
            padding: 15px;
            text-align: center;
            font-weight: bold;
        }
        .chat-messages {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
        }
        .message {
            margin-bottom: 10px;
        }
        .chat-input {
            display: flex;
            padding: 10px;
            border-top: 1px solid #eee;
        }
        .chat-input input {
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 20px;
        }
        .chat-input button {
            margin-left: 10px;
            padding: 10px 20px;
            background-color: var(--primary);
            color: white;
            border: none;
            border-radius: 20px;
            cursor: pointer;
        }
        @media (max-width: 768px) {
            .hero {
                padding: 100px 0;
            }
            .section {
                padding: 60px 0;
            }
            .chat-modal {
                width: 300px;
                height: 400px;
            }
        }
    </style>
</head>
<body>
    <!-- Hero Section -->
    <section class="hero">
        <div class="container">
            <div class="row">
                <div class="col-lg-8 mx-auto">
                    <h1 class="display-4 fw-bold mb-4">${businessData.heroTitle || `Transforme seu ${businessData.businessType} em ${city}`}</h1>
                    <p class="lead mb-5">${businessData.heroSubtitle || description}</p>
                    <div class="d-flex flex-column flex-md-row justify-content-center gap-3">
                        <a href="#contato" class="btn btn-primary btn-lg">Solicitar Orçamento Gratuito</a>
                        <a href="#servicos" class="btn btn-outline-light btn-lg">Conhecer Nossos Serviços</a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Sobre Nós -->
    <section class="section">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-6 mb-4 mb-lg-0">
                    <h2 class="section-title">Sobre ${title}</h2>
                    <p class="lead">${businessData.aboutTitle || `Especialistas em ${businessData.businessType} em ${city}`}</p>
                    <p>${description}</p>
                    <p>Nossa equipe é composta por profissionais experientes, todos focados em entregar os melhores resultados para nossos clientes.</p>
                    <a href="#sobre" class="btn btn-primary mt-3">Saiba Mais Sobre Nós</a>
                </div>
                <div class="col-lg-6">
                    <img src="https://image.pollinations.ai/prompt/${encodeURIComponent('equipe profissional ' + businessData.businessType)}" class="img-fluid rounded shadow" alt="Equipe profissional">
                </div>
            </div>
        </div>
    </section>

    <!-- Serviços -->
    <section id="servicos" class="section bg-light">
        <div class="container">
            <div class="text-center mb-5">
                <h2 class="section-title">Nossos Serviços</h2>
                <p class="lead">Soluções completas para ${businessData.businessType}</p>
            </div>
            <div class="row g-4">
                ${this.generateServicesCards(businessData)}
            </div>
        </div>
    </section>

    <!-- Resultados -->
    <section class="section">
        <div class="container">
            <div class="text-center mb-5">
                <h2 class="section-title">Resultados Comprovados</h2>
                <p class="lead">Números que falam por si só</p>
            </div>
            <div class="row text-center">
                <div class="col-md-3 mb-4">
                    <div class="counter" data-target="95">0</div>
                    <h5>Satisfação dos Clientes</h5>
                </div>
                <div class="col-md-3 mb-4">
                    <div class="counter" data-target="150">0</div>
                    <h5>Projetos Concluídos</h5>
                </div>
                <div class="col-md-3 mb-4">
                    <div class="counter" data-target="7">0</div>
                    <h5>Anos de Experiência</h5>
                </div>
                <div class="col-md-3 mb-4">
                    <div class="counter" data-target="24">0</div>
                    <h5>Suporte 24h</h5>
                </div>
            </div>
        </div>
    </section>

    <!-- Depoimentos -->
    <section class="section bg-light">
        <div class="container">
            <div class="text-center mb-5">
                <h2 class="section-title">O Que Nossos Clientes Dizem</h2>
                <p class="lead">Histórias de sucesso reais</p>
            </div>
            <div class="row">
                ${this.generateTestimonials(businessData)}
            </div>
        </div>
    </section>

    <!-- Processo -->
    <section class="section">
        <div class="container">
            <div class="text-center mb-5">
                <h2 class="section-title">Nosso Processo de Trabalho</h2>
                <p class="lead">Como trabalhamos para entregar os melhores resultados</p>
            </div>
            <div class="row">
                <div class="col-md-4">
                    <div class="process-step">
                        <div class="step-number">1</div>
                        <h4>Análise e Diagnóstico</h4>
                        <p>Analisamos sua situação atual e identificamos oportunidades de melhoria.</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="process-step">
                        <div class="step-number">2</div>
                        <h4>Planejamento Estratégico</h4>
                        <p>Criamos um plano personalizado com base nos seus objetivos e necessidades.</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="process-step">
                        <div class="step-number">3</div>
                        <h4>Execução e Acompanhamento</h4>
                        <p>Implementamos as soluções e acompanhamos os resultados continuamente.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- FAQ -->
    <section class="section bg-light">
        <div class="container">
            <div class="text-center mb-5">
                <h2 class="section-title">Perguntas Frequentes</h2>
                <p class="lead">Tire suas dúvidas sobre nossos serviços</p>
            </div>
            <div class="row">
                <div class="col-lg-8 mx-auto">
                    ${this.generateFAQ(businessData)}
                </div>
            </div>
        </div>
    </section>

    <!-- CTA -->
    <section id="contato" class="cta">
        <div class="container">
            <div class="row">
                <div class="col-lg-8 mx-auto text-center">
                    <h2 class="mb-4">${businessData.mainGoal ? businessData.mainGoal : 'Pronto para Começar?'}</h2>
                    <p class="lead mb-5">${businessData.specialOffers || 'Entre em contato conosco e descubra como podemos ajudar'}</p>
                    <form class="row g-3 justify-content-center">
                        <div class="col-md-5">
                            <input type="text" class="form-control" placeholder="Seu nome" required>
                        </div>
                        <div class="col-md-5">
                            <input type="email" class="form-control" placeholder="Seu e-mail" required>
                        </div>
                        <div class="col-12">
                            <button type="submit" class="btn btn-light btn-lg">Solicitar Orçamento Gratuito</button>
                        </div>
                    </form>
                    ${businessData.address ? `<p class="mt-4 small">📍 ${businessData.address}</p>` : ''}
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="row">
                <div class="col-md-4 mb-4 mb-md-0">
                    <h5>${title}</h5>
                    <p>${description}</p>
                </div>
                <div class="col-md-4 mb-4 mb-md-0">
                    <h5>Contato</h5>
                    <p><i class="fas fa-phone me-2"></i> ${phone}</p>
                    <p><i class="fas fa-envelope me-2"></i> ${email}</p>
                    ${businessData.address ? `<p><i class="fas fa-map-marker-alt me-2"></i> ${businessData.address}</p>` : `<p><i class="fas fa-map-marker-alt me-2"></i> ${city}</p>`}
                </div>
                <div class="col-md-4">
                    <h5>Siga-nos</h5>
                    <div class="social-icons">
                        <a href="#"><i class="fab fa-facebook"></i></a>
                        <a href="#"><i class="fab fa-instagram"></i></a>
                        <a href="#"><i class="fab fa-linkedin"></i></a>
                        <a href="#"><i class="fab fa-youtube"></i></a>
                    </div>
                </div>
            </div>
            <hr class="my-4 bg-light">
            <div class="text-center">
                <p class="mb-0">&copy; 2024 ${title}. Todos os direitos reservados.</p>
            </div>
        </div>
    </footer>

    <!-- Botão flutuante -->
    <div class="floating-btn" id="floatingBtn">
        <i class="fas fa-comments"></i>
    </div>

    <!-- Menu flutuante -->
    <div class="floating-menu" id="floatingMenu">
        <div class="floating-menu-item" id="chatOption">
            <i class="fas fa-comment"></i> Chat
        </div>
        <div class="floating-menu-item" id="whatsappOption">
            <i class="fab fa-whatsapp"></i> WhatsApp
        </div>
    </div>

    <!-- Modal de chat -->
    <div class="chat-modal" id="chatModal">
        <div class="chat-header">
            Chat com ${title}
        </div>
        <div class="chat-messages" id="chatMessages">
            <!-- Mensagens do chat serão adicionadas aqui -->
        </div>
        <div class="chat-input">
            <input type="text" id="chatInput" placeholder="Digite sua mensagem...">
            <button id="chatSend">Enviar</button>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
    ${this.generateJavaScript(businessData, phone, email)}
    </script>
</body>
</html>`;
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
        body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; padding-top: 70px; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .section { padding: 80px 0; }
        .section:nth-child(even) { background: #f8f9fa; }
        .btn { background: ${colors.primary}; color: white; padding: 15px 30px; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; display: inline-block; transition: all 0.3s; }
        .btn:hover { background: ${colors.accent}; transform: translateY(-2px); }
        
        /* Header flutuante */
        .floating-header { position: fixed; top: 0; left: 0; right: 0; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); z-index: 1000; padding: 15px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .nav-container { display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .logo { font-size: 1.5rem; font-weight: bold; color: ${colors.primary}; }
        .nav-links { display: flex; gap: 30px; list-style: none; }
        .nav-links a { text-decoration: none; color: #333; font-weight: 500; transition: color 0.3s; }
        .nav-links a:hover { color: ${colors.primary}; }
        .mobile-menu { display: none; cursor: pointer; }
        
        /* Chat widget */
        .chat-widget { position: fixed; bottom: 20px; right: 20px; z-index: 1000; }
        .chat-button { background: ${colors.primary}; color: white; border: none; border-radius: 50px; padding: 15px 20px; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.3); font-size: 16px; transition: all 0.3s; }
        .chat-button:hover { background: ${colors.accent}; transform: translateY(-3px); }
        .chat-window { position: absolute; bottom: 70px; right: 0; width: 350px; height: 500px; background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); display: none; }
        .chat-header { background: ${colors.primary}; color: white; padding: 15px; border-radius: 15px 15px 0 0; display: flex; justify-content: space-between; align-items: center; }
        .chat-messages { height: 350px; overflow-y: auto; padding: 10px; }
        .chat-input-area { padding: 15px; border-top: 1px solid #eee; }
        .chat-input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 20px; resize: none; }
        .chat-send { background: ${colors.primary}; color: white; border: none; padding: 8px 15px; border-radius: 15px; margin-top: 5px; cursor: pointer; }
        
        @media (max-width: 768px) { 
            .container { padding: 0 15px; } 
            .section { padding: 60px 0; } 
            .nav-links { display: none; }
            .mobile-menu { display: block; }
            .chat-window { width: 300px; height: 400px; }
        }
    </style>
</head>
<body>`;
      
      case "navbar":
        return `<header class="floating-header">
    <div class="nav-container">
        <div class="logo">${this.getTitleForBusiness(businessType)}</div>
        <nav>
            <ul class="nav-links">
                <li><a href="#inicio">Início</a></li>
                <li><a href="#sobre">Sobre</a></li>
                <li><a href="#servicos">Serviços</a></li>
                <li><a href="#contato">Contato</a></li>
            </ul>
            <div class="mobile-menu">☰</div>
        </nav>
    </div>
</header>`;
      
      case "hero":
        return `<section id="inicio" class="section" style="background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}); color: white; text-align: center; min-height: 100vh; display: flex; align-items: center;">
    <div class="container">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">${this.getTitleForBusiness(businessType)}</h1>
        <p style="font-size: 1.2rem; margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto;">${this.getHeroTextForBusiness(businessType)}</p>
        <a href="#contato" class="btn" style="font-size: 1.1rem;">Saiba Mais</a>
    </div>
</section>`;
      
      case "about":
        return `<section id="sobre" class="section">
    <div class="container">
        <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 2rem; color: ${colors.primary};">Sobre Nós</h2>
        <p style="text-align: center; font-size: 1.1rem; max-width: 800px; margin: 0 auto;">${this.getAboutTextForBusiness(businessType)}</p>
    </div>
</section>`;
      
      case "services":
        return `<section id="servicos" class="section">
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
        return `<footer style="background: linear-gradient(135deg, #2c3e50, #34495e); color: white; padding: 60px 0 30px;">
    <div class="container">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 40px; margin-bottom: 40px;">
            <div>
                <h3 style="font-size: 1.5rem; margin-bottom: 20px; color: white;">${this.getTitleForBusiness(businessType)}</h3>
                <p style="margin-bottom: 15px;">${this.getDescriptionForBusiness(businessType)}</p>
            </div>
            <div>
                <h4 style="margin-bottom: 20px;">Contato</h4>
                <p style="margin-bottom: 10px;">📧 contato@empresa.com</p>
                <p style="margin-bottom: 10px;">📱 (11) 99999-9999</p>
                <p>📍 Endereço da empresa</p>
            </div>
            <div>
                <h4 style="margin-bottom: 20px;">Redes Sociais</h4>
                <div style="display: flex; gap: 15px;">
                    <a href="#" style="color: white; text-decoration: none; font-size: 1.2rem;">📘</a>
                    <a href="#" style="color: white; text-decoration: none; font-size: 1.2rem;">📷</a>
                    <a href="#" style="color: white; text-decoration: none; font-size: 1.2rem;">💼</a>
                </div>
            </div>
        </div>
        <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 30px; text-align: center;">
            <p>© 2024 ${this.getTitleForBusiness(businessType)}. Todos os direitos reservados.</p>
        </div>
    </div>
</footer>`;
      
      case "chatbot":
        return `<div class="chat-widget">
    <button class="chat-button" onclick="toggleChat()">
        💬 Falar Conosco
    </button>
    <div class="chat-window" id="chatWindow">
        <div class="chat-header">
            <strong>Assistente Virtual</strong>
            <button onclick="toggleChat()" style="background: none; border: none; color: white; cursor: pointer;">✕</button>
        </div>
        <div class="chat-messages" id="chatMessages">
            <div style="background: #f1f1f1; padding: 10px; border-radius: 10px; margin-bottom: 10px;">
                Olá! Como posso ajudá-lo hoje? 😊
            </div>
        </div>
        <div class="chat-input-area">
            <textarea class="chat-input" id="chatInput" placeholder="Digite sua mensagem..." rows="2"></textarea>
            <button class="chat-send" onclick="sendMessage()">Enviar</button>
        </div>
    </div>
</div>

<script>
    let chatOpen = false;
    
    function toggleChat() {
        const chatWindow = document.getElementById('chatWindow');
        chatOpen = !chatOpen;
        chatWindow.style.display = chatOpen ? 'block' : 'none';
    }
    
    function sendMessage() {
        const input = document.getElementById('chatInput');
        const messages = document.getElementById('chatMessages');
        const message = input.value.trim();
        
        if (message) {
            // Adicionar mensagem do usuário
            const userMsg = document.createElement('div');
            userMsg.style.cssText = 'text-align: right; margin-bottom: 10px;';
            userMsg.innerHTML = '<div style="background: #007bff; color: white; padding: 10px; border-radius: 10px; display: inline-block;">' + message + '</div>';
            messages.appendChild(userMsg);
            
            // Simular resposta
            setTimeout(() => {
                const botMsg = document.createElement('div');
                botMsg.style.cssText = 'margin-bottom: 10px;';
                botMsg.innerHTML = '<div style="background: #f1f1f1; padding: 10px; border-radius: 10px; display: inline-block;">Obrigado pela sua mensagem! Em breve entraremos em contato. Para respostas mais rápidas, entre em contato pelo WhatsApp: (11) 99999-9999</div>';
                messages.appendChild(botMsg);
                messages.scrollTop = messages.scrollHeight;
            }, 1000);
            
            input.value = '';
            messages.scrollTop = messages.scrollHeight;
        }
    }
    
    // Enter para enviar
    document.getElementById('chatInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
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
  
  private generateFallbackHTML(userRequest: string): string {
    return this.generateLocalHTML(userRequest);
  }

  private extractCompanyName(userRequest: string): string {
    // Tentativa de extrair nome da empresa
    const patterns = [
      /empresa\s+([A-Za-z\s]+)/i,
      /nome\s+([A-Za-z\s]+)/i,
      /chamada?\s+([A-Za-z\s]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = userRequest.match(pattern);
      if (match) return match[1].trim();
    }
    
    return 'Sua Empresa';
  }

  private extractBusinessType(request: string): string {
    if (request.includes('clínica') || request.includes('consultório')) return 'clínica';
    if (request.includes('salão') || request.includes('beleza')) return 'salão de beleza';
    if (request.includes('advocacia') || request.includes('advogado')) return 'escritório de advocacia';
    if (request.includes('contabilidade') || request.includes('contador')) return 'escritório de contabilidade';
    if (request.includes('marketing') || request.includes('digital')) return 'agência de marketing';
    if (request.includes('consultoria')) return 'consultoria';
    if (request.includes('educação') || request.includes('curso')) return 'instituição de ensino';
    if (request.includes('imóveis') || request.includes('imobiliária')) return 'imobiliária';
    return 'empresa';
  }

  private extractCity(userRequest: string): string {
    const cityPatterns = [
      /em\s+([A-Za-z\s]+(?:SP|RJ|MG|PR|SC|RS|BA|PE|CE|GO|DF))/i,
      /cidade\s+([A-Za-z\s]+)/i,
      /localizada?\s+em\s+([A-Za-z\s]+)/i
    ];
    
    for (const pattern of cityPatterns) {
      const match = userRequest.match(pattern);
      if (match) return match[1].trim();
    }
    
    return 'Sua Cidade';
  }

  private generateDescription(businessType: string): string {
    const descriptions = {
      'clínica': 'Cuidamos da sua saúde e bem-estar com excelência e dedicação.',
      'salão de beleza': 'Realçamos sua beleza natural com profissionalismo e carinho.',
      'escritório de advocacia': 'Defendemos seus direitos com expertise e compromisso.',
      'escritório de contabilidade': 'Cuidamos da contabilidade da sua empresa com precisão.',
      'agência de marketing': 'Impulsionamos seu negócio no mundo digital.',
      'consultoria': 'Oferecemos soluções estratégicas para o crescimento do seu negócio.',
      'instituição de ensino': 'Educação de qualidade para formar o futuro.',
      'imobiliária': 'Encontramos o imóvel dos seus sonhos.'
    };
    
    return descriptions[businessType] || 'Oferecemos serviços de qualidade com excelência e dedicação.';
  }

  private generateHeroTitle(userRequest: string): string {
    const businessType = this.extractBusinessType(userRequest.toLowerCase());
    const city = this.extractCity(userRequest);
    
    const titles = {
      'clínica': `Clínica de Excelência em ${city}`,
      'salão de beleza': `Salão de Beleza Premium em ${city}`,
      'escritório de advocacia': `Advocacia Especializada em ${city}`,
      'escritório de contabilidade': `Contabilidade Confiável em ${city}`,
      'agência de marketing': `Marketing Digital que Funciona em ${city}`,
      'consultoria': `Consultoria Estratégica em ${city}`,
      'instituição de ensino': `Educação de Qualidade em ${city}`,
      'imobiliária': `Imóveis dos Sonhos em ${city}`
    };
    
    return titles[businessType] || `Sua Empresa de Confiança em ${city}`;
  }

  private generateHeroSubtitle(businessType: string): string {
    const subtitles = {
      'clínica': 'Cuidados médicos especializados com tecnologia de ponta e equipe qualificada.',
      'salão de beleza': 'Transformamos seu visual com as últimas tendências e produtos de qualidade.',
      'escritório de advocacia': 'Soluções jurídicas personalizadas para proteger seus interesses.',
      'escritório de contabilidade': 'Gestão contábil completa para o sucesso do seu negócio.',
      'agência de marketing': 'Estratégias digitais que geram resultados reais para sua empresa.',
      'consultoria': 'Orientação especializada para otimizar processos e aumentar lucros.',
      'instituição de ensino': 'Formação completa com metodologia inovadora e corpo docente especializado.',
      'imobiliária': 'Encontre o imóvel perfeito com nossa expertise no mercado imobiliário.'
    };
    
    return subtitles[businessType] || 'Soluções personalizadas para suas necessidades específicas.';
  }

  private generateAboutTitle(businessType: string): string {
    const titles = {
      'clínica': 'Especialistas em Cuidados Médicos',
      'salão de beleza': 'Especialistas em Beleza e Estética',
      'escritório de advocacia': 'Especialistas em Soluções Jurídicas',
      'escritório de contabilidade': 'Especialistas em Gestão Contábil',
      'agência de marketing': 'Especialistas em Marketing Digital',
      'consultoria': 'Especialistas em Consultoria Empresarial',
      'instituição de ensino': 'Especialistas em Educação',
      'imobiliária': 'Especialistas no Mercado Imobiliário'
    };
    
    return titles[businessType] || 'Especialistas no que Fazemos';
  }

  private generateServicesCards(businessData: any): string {
    // Se há serviços específicos do briefing, usar eles
    if (businessData.services && businessData.services.trim()) {
      const services = businessData.services.split('\n').filter(s => s.trim()).slice(0, 6);
      return services.map((service, index) => {
        const serviceName = service.trim();
        const icons = ['fas fa-star', 'fas fa-check-circle', 'fas fa-cog', 'fas fa-heart', 'fas fa-shield-alt', 'fas fa-trophy'];
        const icon = icons[index] || 'fas fa-star';
        
        return `
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body text-center p-4">
                            <div class="service-icon">
                                <i class="${icon}"></i>
                            </div>
                            <h4>${serviceName}</h4>
                            <p>Oferecemos serviços de qualidade em ${serviceName.toLowerCase()} com profissionalismo e dedicação.</p>
                        </div>
                    </div>
                </div>`;
      }).join('');
    }
    
    // Fallback para serviços padrão baseados no tipo de negócio
    const businessType = businessData.businessType;
    
    const servicesByType = {
      'clínica': [
        { icon: 'fas fa-stethoscope', title: 'Consultas Especializadas', desc: 'Atendimento médico especializado com profissionais qualificados.' },
        { icon: 'fas fa-x-ray', title: 'Exames Diagnósticos', desc: 'Equipamentos modernos para diagnósticos precisos e rápidos.' },
        { icon: 'fas fa-heartbeat', title: 'Acompanhamento Médico', desc: 'Acompanhamento contínuo para sua saúde e bem-estar.' },
        { icon: 'fas fa-pills', title: 'Tratamentos Personalizados', desc: 'Planos de tratamento adaptados às suas necessidades.' },
        { icon: 'fas fa-user-md', title: 'Segunda Opinião', desc: 'Orientação médica especializada para tomada de decisões.' },
        { icon: 'fas fa-ambulance', title: 'Atendimento de Urgência', desc: 'Atendimento rápido e eficiente em situações de urgência.' }
      ],
      'salão de beleza': [
        { icon: 'fas fa-cut', title: 'Corte e Penteado', desc: 'Cortes modernos e penteados para todas as ocasiões.' },
        { icon: 'fas fa-palette', title: 'Coloração', desc: 'Técnicas avançadas de coloração e mechas profissionais.' },
        { icon: 'fas fa-spa', title: 'Tratamentos Capilares', desc: 'Hidratação, reconstrução e nutrição dos cabelos.' },
        { icon: 'fas fa-hand-sparkles', title: 'Manicure e Pedicure', desc: 'Cuidados completos para suas mãos e pés.' },
        { icon: 'fas fa-eye', title: 'Design de Sobrancelhas', desc: 'Modelagem e design personalizado de sobrancelhas.' },
        { icon: 'fas fa-user-tie', title: 'Serviços Masculinos', desc: 'Cortes e tratamentos especializados para homens.' }
      ],
      'escritório de advocacia': [
        { icon: 'fas fa-balance-scale', title: 'Direito Civil', desc: 'Assessoria jurídica em questões civis e contratuais.' },
        { icon: 'fas fa-briefcase', title: 'Direito Empresarial', desc: 'Consultoria jurídica para empresas e negócios.' },
        { icon: 'fas fa-gavel', title: 'Direito Trabalhista', desc: 'Defesa em questões trabalhistas e previdenciárias.' },
        { icon: 'fas fa-home', title: 'Direito Imobiliário', desc: 'Assessoria em compra, venda e locação de imóveis.' },
        { icon: 'fas fa-users', title: 'Direito de Família', desc: 'Orientação em questões familiares e sucessórias.' },
        { icon: 'fas fa-shield-alt', title: 'Direito Penal', desc: 'Defesa criminal com experiência e competência.' }
      ],
      'agência de marketing': [
        { icon: 'fas fa-bullhorn', title: 'Marketing Digital', desc: 'Estratégias digitais para impulsionar seu negócio online.' },
        { icon: 'fas fa-search', title: 'SEO e SEM', desc: 'Otimização para mecanismos de busca e campanhas pagas.' },
        { icon: 'fas fa-share-alt', title: 'Redes Sociais', desc: 'Gestão profissional das suas redes sociais.' },
        { icon: 'fas fa-chart-line', title: 'Análise de Dados', desc: 'Relatórios e análises para otimizar seus resultados.' },
        { icon: 'fas fa-paint-brush', title: 'Design Gráfico', desc: 'Criação de materiais visuais impactantes.' },
        { icon: 'fas fa-video', title: 'Produção de Conteúdo', desc: 'Conteúdo engajante para suas campanhas.' }
      ],
      'imobiliária': [
        { icon: 'fas fa-home', title: 'Venda de Imóveis', desc: 'Assessoria completa na venda do seu imóvel.' },
        { icon: 'fas fa-key', title: 'Locação', desc: 'Administração e locação de propriedades.' },
        { icon: 'fas fa-search-location', title: 'Busca Personalizada', desc: 'Encontramos o imóvel ideal para você.' },
        { icon: 'fas fa-calculator', title: 'Avaliação', desc: 'Avaliação precisa do valor do seu imóvel.' },
        { icon: 'fas fa-handshake', title: 'Consultoria', desc: 'Orientação especializada em investimentos imobiliários.' },
        { icon: 'fas fa-file-contract', title: 'Documentação', desc: 'Suporte completo com documentação e contratos.' }
      ]
    };
    
    const services = servicesByType[businessType] || [
      { icon: 'fas fa-star', title: 'Serviço Premium', desc: 'Oferecemos serviços de alta qualidade.' },
      { icon: 'fas fa-check-circle', title: 'Atendimento Personalizado', desc: 'Cada cliente recebe atenção individualizada.' },
      { icon: 'fas fa-cog', title: 'Soluções Eficientes', desc: 'Processos otimizados para melhores resultados.' },
      { icon: 'fas fa-heart', title: 'Compromisso Total', desc: 'Dedicação completa aos seus objetivos.' },
      { icon: 'fas fa-shield-alt', title: 'Segurança e Confiança', desc: 'Trabalho baseado em transparência e ética.' },
      { icon: 'fas fa-trophy', title: 'Resultados Garantidos', desc: 'Foco em entregar resultados excepcionais.' }
    ];
    
    return services.map(service => `
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body text-center p-4">
                            <div class="service-icon">
                                <i class="${service.icon}"></i>
                            </div>
                            <h4>${service.title}</h4>
                            <p>${service.desc}</p>
                        </div>
                    </div>
                </div>`).join('');
  }
  private generateTestimonials(businessData: any): string {
    const businessType = businessData.businessType;
    
    const testimonialsByType = {
      'clínica': [
        { name: 'Ana Silva', company: 'Paciente', text: 'Atendimento excepcional e profissionais altamente qualificados. Recomendo a todos!', image: 'mulher%20satisfeita%20clinica' },
        { name: 'Carlos Mendes', company: 'Paciente', text: 'Equipamentos modernos e diagnósticos precisos. Mudou minha qualidade de vida.', image: 'homem%20satisfeito%20clinica' },
        { name: 'Maria Costa', company: 'Paciente', text: 'Cuidado humanizado e resultados excelentes. Equipe sempre atenciosa.', image: 'mulher%20madura%20satisfeita' }
      ],
      'salão de beleza': [
        { name: 'Fernanda Lima', company: 'Cliente', text: 'Sempre saio do salão me sentindo renovada! Profissionais incríveis e ambiente acolhedor.', image: 'mulher%20jovem%20cabelo%20bonito' },
        { name: 'Juliana Santos', company: 'Cliente', text: 'Transformaram meu visual completamente! Recomendo para todas as amigas.', image: 'mulher%20feliz%20salao%20beleza' },
        { name: 'Patricia Oliveira', company: 'Cliente', text: 'Qualidade excepcional e atendimento personalizado. Meu salão de confiança há anos.', image: 'mulher%20elegante%20satisfeita' }
      ],
      'default': [
        { name: 'João Silva', company: 'Cliente', text: 'Serviço de qualidade excepcional! Superou todas as minhas expectativas.', image: 'homem%20satisfeito%20profissional' },
        { name: 'Maria Santos', company: 'Cliente', text: 'Profissionais competentes e atendimento personalizado. Recomendo!', image: 'mulher%20profissional%20satisfeita' },
        { name: 'Pedro Costa', company: 'Cliente', text: 'Resultados excelentes e prazo cumprido. Parceria de longa data garantida.', image: 'homem%20executivo%20satisfeito' }
      ]
    };
    
    const testimonials = testimonialsByType[businessType] || testimonialsByType['default'];
    
    return testimonials.map(testimonial => `
      <div class="col-lg-4 mb-4">
        <div class="testimonial">
          <p class="mb-4">"${testimonial.text}"</p>
          <div class="d-flex align-items-center">
            <img src="https://image.pollinations.ai/prompt/${testimonial.image}" class="rounded-circle me-3" alt="${testimonial.name}">
            <div>
              <h5 class="mb-0">${testimonial.name}</h5>
              <small>${testimonial.company}</small>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  private generateFAQ(businessData: any): string {
    const businessType = businessData.businessType;
    
    const faqsByType = {
      'clínica': [
        { question: 'Como agendar uma consulta?', answer: 'Você pode agendar através do nosso site, telefone ou WhatsApp. Temos horários flexíveis para atender suas necessidades.' },
        { question: 'Vocês atendem convênios?', answer: 'Sim, trabalhamos com os principais convênios médicos. Entre em contato para verificar se o seu está na nossa lista.' },
        { question: 'Qual o tempo de espera para consultas?', answer: 'Normalmente conseguimos agendar consultas em até 7 dias. Para urgências, temos horários de encaixe disponíveis.' },
        { question: 'Os exames são realizados no local?', answer: 'Temos equipamentos modernos para diversos tipos de exames. Consulte nossa lista completa de serviços disponíveis.' }
      ],
      'salão de beleza': [
        { question: 'Preciso agendar horário?', answer: 'Recomendamos agendamento para garantir o melhor horário. Também atendemos por ordem de chegada quando possível.' },
        { question: 'Vocês usam produtos de qualidade?', answer: 'Trabalhamos apenas com produtos profissionais das melhores marcas do mercado, garantindo resultados excepcionais.' },
        { question: 'Fazem atendimento em domicílio?', answer: 'Sim, oferecemos serviços especiais a domicílio para ocasiões especiais. Consulte condições e disponibilidade.' },
        { question: 'Oferecem tratamentos para cabelos danificados?', answer: 'Temos tratamentos especializados para reconstrução e hidratação profunda. Nossa equipe avalia e recomenda o melhor.' }
      ],
      'default': [
        { question: 'Como funciona o atendimento?', answer: 'Nosso atendimento é personalizado desde o primeiro contato. Analisamos suas necessidades e criamos a melhor solução.' },
        { question: 'Qual é o prazo de entrega?', answer: 'Os prazos variam conforme a complexidade do projeto. Sempre informamos um cronograma detalhado no início.' },
        { question: 'Oferecem garantia dos serviços?', answer: 'Sim, todos os nossos serviços possuem garantia. Trabalhamos até você ficar completamente satisfeito.' },
        { question: 'Como é feito o orçamento?', answer: 'O orçamento é gratuito e sem compromisso. Entre em contato para avaliarmos suas necessidades específicas.' }
      ]
    };
    
    const faqs = faqsByType[businessType] || faqsByType['default'];
    
    return faqs.map(faq => `
      <div class="faq-item">
        <div class="faq-question">${faq.question}</div>
        <div class="faq-answer">
          <p>${faq.answer}</p>
        </div>
      </div>
    `).join('');
  }

  private generateJavaScript(businessData: any, phone: string, email: string): string {
    const whatsappNumber = businessData.phone?.replace(/[^\d]/g, '') || phone.replace(/[^\d]/g, '');
    const companyName = businessData.companyName || 'Empresa';
    
    return `
/* =========================
   1. Forçar carregamento de imagens
========================== */
function forceImageLoad(imgElement, fallbackUrl) {
    imgElement.onerror = function () {
        console.log("Falha ao carregar imagem, tentando fallback...");
        this.src = fallbackUrl;
    };
}

function checkImagesLoaded() {
    const images = document.querySelectorAll('img');
    let allLoaded = true;
    images.forEach(img => {
        if (!img.complete) {
            allLoaded = false;
            console.log('Imagem não carregada: ' + img.src);
        }
    });
    console.log(allLoaded ? "Todas as imagens carregadas!" : "Algumas imagens falharam.");
}

document.addEventListener('DOMContentLoaded', function () {
    const images = document.querySelectorAll('img');
    images.forEach(img => forceImageLoad(img, 'https://via.placeholder.com/150'));
    setTimeout(checkImagesLoaded, 2000);
});

/* =========================
   2. Contador Animado
========================== */
const counters = document.querySelectorAll('.counter');
const speed = 200;

function countUp(counter) {
    const target = +counter.getAttribute('data-target');
    const count = +counter.innerText;
    const increment = target / speed;

    if (count < target) {
        counter.innerText = Math.ceil(count + increment);
        setTimeout(() => countUp(counter), 10);
    } else {
        counter.innerText = target + '%';
    }
}

const observerOptions = { threshold: 0.7 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            countUp(entry.target);
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

counters.forEach(counter => observer.observe(counter));

/* =========================
   3. FAQ Accordion
========================== */
document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        document.querySelectorAll('.faq-item.active').forEach(activeItem => {
            if (activeItem !== item) activeItem.classList.remove('active');
        });
        item.classList.toggle('active');
    });
});

/* =========================
   4. Envio de Formulário + WhatsApp
========================== */
const form = document.querySelector('form');
if (form) {
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = this.querySelector('input[type="text"]').value;
        const emailInput = this.querySelector('input[type="email"]').value;

        if (name && emailInput) {
            const formContainer = this.parentElement;
            formContainer.innerHTML = '<div class="alert alert-success" role="alert"><h4 class="alert-heading">Obrigado, ' + name + '!</h4><p>Recebemos sua solicitação. Entraremos em contato no e-mail ' + emailInput + ' em até 24 horas.</p></div>';
            console.log('Form submitted:', { name, email: emailInput });

            // Também envia para WhatsApp
            const message = 'Novo formulário recebido:%0ANome: ' + name + '%0AEmail: ' + emailInput;
            window.open('https://wa.me/55${whatsappNumber}?text=' + message, '_blank');
        }
    });
}

/* =========================
   5. Botão e Menu Flutuante + Controle Chat
========================== */
const floatingBtn = document.getElementById('floatingBtn');
const floatingMenu = document.getElementById('floatingMenu');
const chatOption = document.getElementById('chatOption');
const whatsappOption = document.getElementById('whatsappOption');
const chatModal = document.getElementById('chatModal');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');

function openChat() {
    chatModal.style.display = 'flex';
    loadChatHistory();
}

function closeChat() {
    chatModal.style.display = 'none';
}

function toggleMenu() {
    floatingMenu.style.display = floatingMenu.style.display === 'flex' ? 'none' : 'flex';
}

if (floatingBtn) {
    floatingBtn.addEventListener('click', () => {
        toggleMenu();
    });
}

if (chatOption) {
    chatOption.addEventListener('click', () => {
        floatingMenu.style.display = 'none';
        openChat();
    });
}

if (whatsappOption) {
    whatsappOption.addEventListener('click', () => {
        floatingMenu.style.display = 'none';
        const message = 'Olá, gostaria de mais informações sobre os serviços da ${companyName}.';
        window.open('https://wa.me/55${whatsappNumber}?text=' + encodeURIComponent(message), '_blank');
    });
}

document.addEventListener('click', (e) => {
    if (
        chatModal.style.display === 'flex' &&
        !chatModal.contains(e.target) &&
        !floatingMenu.contains(e.target) &&
        !floatingBtn.contains(e.target)
    ) {
        closeChat();
    }
});

/* =========================
   6. Chat simples + histórico
========================== */
let chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
let userMessagesCount = 0;
let meetingStep = 0;
let meetingData = { name: '', email: '', phone: '' };

function saveChatHistory() {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

function loadChatHistory() {
    chatMessages.innerHTML = '';
    chatHistory.forEach(msg => addMessage(msg.sender, msg.text, false));
}

function addMessage(sender, message, save = true) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = '<strong>' + sender + ':</strong> ' + message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    if (save) {
        chatHistory.push({ sender, text: message });
        saveChatHistory();
    }
}

async function sendSimpleResponse(message) {
    const responses = [
        'Olá! Como posso ajudá-lo hoje?',
        'Temos diversos serviços disponíveis. Qual seu interesse?',
        'Nossos profissionais estão prontos para atendê-lo.',
        'Gostaria de agendar uma consulta?',
        'Entre em contato pelo WhatsApp para mais informações: ${phone}'
    ];
    
    return new Promise((resolve) => {
        setTimeout(() => {
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            resolve(randomResponse);
        }, 1000);
    });
}

async function handleSendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage('Você', message);
    chatInput.value = '';

    if (meetingStep > 0) {
        if (meetingStep === 1) {
            meetingData.name = message;
            addMessage('Atendente', 'Qual seu e-mail?');
            meetingStep = 2;
            return;
        } else if (meetingStep === 2) {
            meetingData.email = message;
            addMessage('Atendente', 'E seu telefone para contato?');
            meetingStep = 3;
            return;
        } else if (meetingStep === 3) {
            meetingData.phone = message;
            addMessage('Atendente', 'Obrigado! Un representante entrará em contato em breve.');
            const wppMessage = 'Agendamento solicitado:%0ANome: ' + meetingData.name + '%0AEmail: ' + meetingData.email + '%0ATelefone: ' + meetingData.phone;
            window.open('https://wa.me/55${whatsappNumber}?text=' + wppMessage, '_blank');
            meetingStep = 0;
            return;
        }
    }

    if (meetingStep === -1) {
        if (/sim/i.test(message)) {
            meetingStep = 1;
            addMessage('Atendente', 'Ótimo! Qual seu nome?');
            return;
        } else if (/não/i.test(message)) {
            meetingStep = 0;
            addMessage('Atendente', 'Tudo bem! Continuamos por aqui então.');
            return;
        }
    }

    userMessagesCount++;
    const response = await sendSimpleResponse(message);
    addMessage('Atendente', response);

    if (userMessagesCount % 3 === 0) {
        addMessage('Atendente', 'Deseja marcar uma reunião com um representante? (sim/não)');
        meetingStep = -1;
    }
}

if (chatSend) chatSend.addEventListener('click', handleSendMessage);
if (chatInput) chatInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') handleSendMessage();
});

function checkImagesLoaded() {
    const images = document.querySelectorAll('img');
    let allLoaded = true;
    images.forEach(img => {
        if (!img.complete) {
            allLoaded = false;
            console.log(\`Imagem não carregada: \${img.src}\`);
        }
    });
    console.log(allLoaded ? "Todas as imagens carregadas!" : "Algumas imagens falharam.");
}

document.addEventListener('DOMContentLoaded', function () {
    const images = document.querySelectorAll('img');
    images.forEach(img => forceImageLoad(img, 'https://via.placeholder.com/150'));
    setTimeout(checkImagesLoaded, 2000);
});

/* =========================
   2. Contador Animado
========================== */
const counters = document.querySelectorAll('.counter');
const speed = 200;

function countUp(counter) {
    const target = +counter.getAttribute('data-target');
    const count = +counter.innerText;
    const increment = target / speed;

    if (count < target) {
        counter.innerText = Math.ceil(count + increment);
        setTimeout(() => countUp(counter), 10);
    } else {
        counter.innerText = target + '%';
    }
}

const observerOptions = { threshold: 0.7 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            countUp(entry.target);
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

counters.forEach(counter => observer.observe(counter));

/* =========================
   3. FAQ Accordion
========================== */
document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        document.querySelectorAll('.faq-item.active').forEach(activeItem => {
            if (activeItem !== item) activeItem.classList.remove('active');
        });
        item.classList.toggle('active');
    });
});

/* =========================
   4. Envio de Formulário + WhatsApp
========================== */
const form = document.querySelector('form');
if (form) {
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;

        if (name && email) {
            const formContainer = this.parentElement;
            formContainer.innerHTML = \`
                <div class="alert alert-success" role="alert">
                    <h4 class="alert-heading">Obrigado, \${name}!</h4>
                    <p>Recebemos sua solicitação. Entraremos em contato no e-mail \${email} em até 24 horas.</p>
                </div>
            \`;
            console.log('Form submitted:', { name, email });

            // Também envia para WhatsApp
            const message = \`Novo formulário recebido:%0ANome: \${name}%0AEmail: \${email}\`;
            window.open(\`https://wa.me/5511974698846?text=\${message}\`, '_blank');
        }
    });
}

/* =========================
   5. Botão e Menu Flutuante + Controle Chat
========================== */
const floatingBtn = document.getElementById('floatingBtn');
const floatingMenu = document.getElementById('floatingMenu');
const chatOption = document.getElementById('chatOption');
const whatsappOption = document.getElementById('whatsappOption');
const chatModal = document.getElementById('chatModal');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');

function openChat() {
    chatModal.style.display = 'flex';
    loadChatHistory();
}

function closeChat() {
    chatModal.style.display = 'none';
}

function toggleMenu() {
    floatingMenu.style.display = floatingMenu.style.display === 'flex' ? 'none' : 'flex';
}

/* --- Botão flutuante: abre/fecha menu (NÃO fecha chat) --- */
if (floatingBtn) {
    floatingBtn.addEventListener('click', () => {
        toggleMenu();
    });
}

/* --- Clicar em "Chat" no menu abre o chat e fecha o menu --- */
if (chatOption) {
    chatOption.addEventListener('click', () => {
        floatingMenu.style.display = 'none';
        openChat();
    });
}

/* --- Clicar em "WhatsApp" no menu abre WhatsApp e fecha menu --- */
if (whatsappOption) {
    whatsappOption.addEventListener('click', () => {
        floatingMenu.style.display = 'none';
        const phoneNumber = '${phone.replace(/\D/g, '')}';
        const message = 'Olá, gostaria de mais informações.';
        window.open(\`https://wa.me/\${phoneNumber}?text=\${encodeURIComponent(message)}\`, '_blank');
    });
}

/* --- Fechar chat se clicar fora do chat modal e do menu e do botão flutuante --- */
document.addEventListener('click', (e) => {
    if (
        chatModal.style.display === 'flex' &&
        !chatModal.contains(e.target) &&
        !floatingMenu.contains(e.target) &&
        !floatingBtn.contains(e.target)
    ) {
        closeChat();
    }
});

/* =========================
   6. Chat com Mistral AI + histórico e reunião
========================== */
let chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
let userMessagesCount = 0;
let meetingStep = 0; // 0=normal, 1=nome,2=email,3=telefone
let meetingData = { name: '', email: '', phone: '' };

function saveChatHistory() {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

function loadChatHistory() {
    chatMessages.innerHTML = '';
    chatHistory.forEach(msg => addMessage(msg.sender, msg.text, false));
}

function addMessage(sender, message, save = true) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = \`<strong>\${sender}:</strong> \${message}\`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    if (save) {
        chatHistory.push({ sender, text: message });
        saveChatHistory();
    }
}

async function sendMessageToMistralAI(message) {
    const apiKey = '${MISTRAL_API_KEY}';
    const url = 'https://api.mistral.ai/v1/chat/completions';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': \`Bearer \${apiKey}\`
            },
            body: JSON.stringify({
                model: "mistral-tiny",
                messages: [
                    {
                        role: "system",
                        content: \`Você é um atendente virtual simpático e educado de ${businessData.companyName || 'nossa empresa'}.
                                Responda SEMPRE em português do Brasil.
                                Responda em no máximo 1 ou 2 frases curtas.
                                Se o usuário pedir telefone, responda apenas com o número: ${phone}.
                                Se o usuário for rude, mantenha a calma e responda de forma amigável.
                                Evite textos longos ou institucionais.
                                Faça perguntas adicionais para entender melhor a necessidade do usuário.
                                Informações da empresa:
                                - Nome: ${businessData.companyName || 'Sua Empresa'}
                                - Tipo: ${businessData.businessType || 'empresa'}
                                - Localização: ${businessData.city || 'Sua Cidade'}
                                - Telefone: ${phone}
                                - E-mail: ${email}\`
                    },
                    ...chatHistory.slice(-5).map(m => ({
                        role: m.sender === 'Você' ? 'user' : 'assistant',
                        content: m.text
                    })),
                    { role: "user", content: message }
                ],
                max_tokens: 60,
                temperature: 0.6
            })
        });

        if (!response.ok) throw new Error('Erro ao enviar mensagem para a API');

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Erro:', error);
        return '⚠️ Desculpe, ocorreu um erro ao processar sua mensagem.';
    }
}

async function handleSendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage('Você', message);
    chatInput.value = '';

    // fluxo de reunião
    if (meetingStep > 0) {
        if (meetingStep === 1) {
            meetingData.name = message;
            addMessage('Atendente', 'Qual seu e-mail?');
            meetingStep = 2;
            return;
        } else if (meetingStep === 2) {
            meetingData.email = message;
            addMessage('Atendente', 'E seu telefone para contato?');
            meetingStep = 3;
            return;
        } else if (meetingStep === 3) {
            meetingData.phone = message;
            addMessage('Atendente', 'Obrigado! Um representante entrará em contato em breve.');
            // Envia para WhatsApp
            const wppMessage = \`Agendamento solicitado:%0ANome: \${meetingData.name}%0AEmail: \${meetingData.email}%0ATelefone: \${meetingData.phone}\`;
            window.open(\`https://wa.me/${phone.replace(/\D/g, '')}?text=\${wppMessage}\`, '_blank');
            meetingStep = 0;
            return;
        }
    }

    // verifica se aceitou marcar reunião
    if (meetingStep === -1) {
        if (/sim/i.test(message)) {
            meetingStep = 1;
            addMessage('Atendente', 'Ótimo! Qual seu nome?');
            return;
        } else if (/não/i.test(message)) {
            meetingStep = 0;
            addMessage('Atendente', 'Tudo bem! Continuamos por aqui então.');
            return;
        }
    }

    userMessagesCount++;
    const response = await sendMessageToMistralAI(message);
    addMessage('Atendente', response);

    if (userMessagesCount % 3 === 0) {
        addMessage('Atendente', 'Deseja marcar uma reunião com um representante? (sim/não)');
        meetingStep = -1; // aguardando confirmação
    }
}

if (chatSend) chatSend.addEventListener('click', handleSendMessage);
if (chatInput) chatInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') handleSendMessage();
});
</script>

</body>
</html>
    `;
  }
}

export const contentGenerator = new ContentGenerator();