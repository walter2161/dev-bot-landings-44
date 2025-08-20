const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_API_KEY = "aynCSftAcQBOlxmtmpJqVzco8K4aaTDQ";

interface BriefingData {
  companyName: string;
  businessType: string;
  description: string;
  services: string;
  city: string;
  phone: string;
  email: string;
  address?: string;
  goal?: string;
  specialOffers?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  about?: string;
  contactInfo?: string;
}

export interface BusinessContent {
  companyName: string;
  businessType: string;
  description: string;
  services: string;
  city: string;
  phone: string;
  email: string;
  address?: string;
  goal?: string;
  specialOffers?: string;
}

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
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
      console.error("API Error:", error);
      throw error;
    }
  }

  private extractBriefingData(briefing: any): BriefingData {
    const data: BriefingData = {
      companyName: 'Sua Empresa',
      businessType: 'Negócio',
      description: 'Descrição da empresa',
      services: 'Serviços especializados',
      city: 'Sua Cidade',
      phone: '(11) 99999-9999',
      email: 'contato@empresa.com'
    };

    if (typeof briefing === 'string') {
      const text = briefing.toLowerCase();
      
      // Extrair nome da empresa
      const companyMatch = text.match(/(?:empresa|negócio|nome)[:\s]*([a-zA-ZÀ-ÿ\s]+)/i);
      if (companyMatch) data.companyName = companyMatch[1].trim();

      // Extrair tipo de negócio
      const businessMatch = text.match(/(?:tipo|área|segmento|ramo)[:\s]*([a-zA-ZÀ-ÿ\s]+)/i);
      if (businessMatch) data.businessType = businessMatch[1].trim();

      // Extrair serviços
      const servicesMatch = text.match(/(?:serviços?|produtos?|oferecemos?)[:\s]*([a-zA-ZÀ-ÿ,\s]+)/i);
      if (servicesMatch) data.services = servicesMatch[1].trim();

      // Extrair cidade
      const cityMatch = text.match(/(?:cidade|local|região)[:\s]*([a-zA-ZÀ-ÿ\s\-]+)/i);
      if (cityMatch) data.city = cityMatch[1].trim();

      // Extrair telefone
      const phoneMatch = text.match(/(?:telefone|fone|celular)[:\s]*\(?([0-9]{2})\)?\s?[0-9]{4,5}-?[0-9]{4}/);
      if (phoneMatch) data.phone = phoneMatch[0].replace(/(?:telefone|fone|celular)[:\s]*/i, '');

      // Extrair email
      const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) data.email = emailMatch[1];

      // Extrair endereço
      const addressMatch = text.match(/(?:endereço|rua|av|avenida)[:\s]*([a-zA-ZÀ-ÿ0-9,\s\-]+)/i);
      if (addressMatch) data.address = addressMatch[1].trim();

      // Extrair objetivo
      const goalMatch = text.match(/(?:objetivo|meta|queremos?)[:\s]*([a-zA-ZÀ-ÿ\s]+)/i);
      if (goalMatch) data.goal = goalMatch[1].trim();

      // Extrair ofertas especiais
      const offerMatch = text.match(/(?:oferta|promoção|desconto)[:\s]*([a-zA-ZÀ-ÿ%0-9\s]+)/i);
      if (offerMatch) data.specialOffers = offerMatch[1].trim();

      // Extrair descrição mais ampla
      if (text.length > 50) {
        data.description = briefing.substring(0, 200) + (briefing.length > 200 ? '...' : '');
      }
    }

    // Se briefing é um objeto
    if (typeof briefing === 'object' && briefing !== null) {
      Object.keys(briefing).forEach(key => {
        const value = briefing[key];
        if (typeof value === 'string' && value.trim().length > 0) {
          switch (key.toLowerCase()) {
            case 'company':
            case 'empresa':
            case 'nome':
              data.companyName = value;
              break;
            case 'business':
            case 'negocio':
            case 'tipo':
              data.businessType = value;
              break;
            case 'description':
            case 'descricao':
              data.description = value;
              break;
            case 'services':
            case 'servicos':
              data.services = value;
              break;
            case 'city':
            case 'cidade':
              data.city = value;
              break;
            case 'phone':
            case 'telefone':
              data.phone = value;
              break;
            case 'email':
              data.email = value;
              break;
            case 'address':
            case 'endereco':
              data.address = value;
              break;
            case 'goal':
            case 'objetivo':
              data.goal = value;
              break;
            case 'offers':
            case 'ofertas':
              data.specialOffers = value;
              break;
          }
        }
      });
    }

    return data;
  }

  private generateCompleteHTML(businessData: BriefingData): string {
    const title = businessData.companyName || 'Sua Empresa';
    const description = businessData.description || 'Descrição da sua empresa';
    const city = businessData.city || 'Sua Cidade';
    const phone = businessData.phone || '(11) 99999-9999';
    const email = businessData.email || 'contato@empresa.com';
    const services = businessData.services || 'Serviços especializados';
    
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
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Merriweather:wght@300;400;700&family=Source+Sans+Pro:wght@300;400;600;700&family=Open+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --primary-color: #374151;
            --secondary-color: #6b7280;
            --accent-color: #f59e0b;
            --bg-color: #ffffff;
            --text-dark: #2d3748;
            --text-light: #718096;
            --heading-font: 'Poppins', sans-serif;
            --body-font: 'Poppins', sans-serif;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--body-font);
            line-height: 1.6;
            color: var(--text-dark);
            background-color: var(--bg-color);
        }

        h1, h2, h3, h4, h5, h6 {
            font-family: var(--heading-font);
            font-weight: 600;
            line-height: 1.2;
            margin-bottom: 1rem;
        }

        .hero-section {
            background: var(--bg-color);
            border-bottom: 1px solid #e2e8f0;
        }
        
        .card {
            border: 1px solid #f7fafc;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .btn-primary {
            background-color: var(--accent-color);
            border-color: var(--accent-color);
            color: #000;
        }
        
        .section {
            padding: 120px 0;
        }

        /* Chatbot Styles */
        .chatbot-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
        }

        .chatbot-toggle {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
        }

        .chatbot-toggle:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
        }

        .chatbot-window {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            display: none;
            flex-direction: column;
            overflow: hidden;
        }

        .chatbot-header {
            background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
            color: white;
            padding: 20px;
            text-align: center;
            position: relative;
        }

        .chatbot-close {
            position: absolute;
            top: 10px;
            right: 15px;
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
        }

        .chatbot-messages {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            background: #f8f9fa;
        }

        .message {
            margin-bottom: 15px;
            padding: 12px 16px;
            border-radius: 18px;
            max-width: 80%;
            word-wrap: break-word;
        }

        .message.bot {
            background: #e3f2fd;
            color: #1976d2;
            margin-right: auto;
        }

        .message.user {
            background: var(--primary-color);
            color: white;
            margin-left: auto;
        }

        .chatbot-input-area {
            padding: 15px;
            border-top: 1px solid #eee;
            background: white;
        }

        .chatbot-input-container {
            display: flex;
            gap: 10px;
        }

        .chatbot-input {
            flex: 1;
            border: 1px solid #ddd;
            border-radius: 20px;
            padding: 10px 15px;
            outline: none;
        }

        .chatbot-send {
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        @media (max-width: 768px) {
            .chatbot-window {
                width: 300px;
                height: 400px;
            }
        }
    </style>
</head>
<body>
    
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top">
        <div class="container">
            <a class="navbar-brand fw-bold" href="#" style="color: var(--primary-color);">
                ${title}
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item"><a class="nav-link" href="#inicio">Início</a></li>
                    <li class="nav-item"><a class="nav-link" href="#servicos">Serviços</a></li>
                    <li class="nav-item"><a class="nav-link" href="#sobre">Sobre</a></li>
                    <li class="nav-item"><a class="nav-link" href="#contato">Contato</a></li>
                    <li class="nav-item">
                        <a class="btn btn-primary btn-sm ms-2" href="#contato">Fale Conosco</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
  
    <!-- Hero Section -->
    <section id="inicio" class="hero-section d-flex align-items-center" style="min-height: 100vh; padding-top: 80px;">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-6">
                    <h1 class="display-4 fw-bold text-dark mb-4">
                        ${title}
                    </h1>
                    <h2 class="h3 text-dark mb-4 opacity-90">
                        ${businessData.businessType || 'Serviços Especializados'}
                    </h2>
                    <p class="lead text-dark mb-5 opacity-85">
                        ${description}
                    </p>
                    <div class="d-flex gap-3 flex-wrap">
                        <a href="#contato" class="btn btn-primary btn-lg px-4 py-3">
                            Solicitar Orçamento
                        </a>
                        <a href="#servicos" class="btn btn-outline-primary btn-lg px-4 py-3">
                            Nossos Serviços
                        </a>
                    </div>
                </div>
                <div class="col-lg-6 text-center">
                    <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                         alt="${title}" class="img-fluid rounded shadow-lg">
                </div>
            </div>
        </div>
    </section>
  
    <!-- Serviços -->
    <section id="servicos" class="section bg-light">
        <div class="container">
            <div class="text-center mb-5">
                <h2 class="section-title">Nossos Serviços</h2>
                <p class="lead">Oferecemos soluções completas</p>
            </div>
            <div class="row g-4">
                ${businessData.services ? businessData.services.split(',').map((service: string, index: number) => `
                    <div class="col-md-6 col-lg-4">
                        <div class="card h-100 shadow-sm border-0">
                            <div class="card-body text-center p-4">
                                <i class="fas fa-star text-primary mb-3" style="font-size: 2rem;"></i>
                                <h5 class="card-title">${service.trim()}</h5>
                                <p class="card-text text-muted">Serviço especializado em ${service.trim().toLowerCase()} com qualidade garantida.</p>
                            </div>
                        </div>
                    </div>
                `).join('') : `
                    <div class="col-md-6 col-lg-4">
                        <div class="card h-100 shadow-sm border-0">
                            <div class="card-body text-center p-4">
                                <i class="fas fa-star text-primary mb-3" style="font-size: 2rem;"></i>
                                <h5 class="card-title">Serviço Premium</h5>
                                <p class="card-text text-muted">Oferecemos serviços de alta qualidade com atendimento personalizado.</p>
                            </div>
                        </div>
                    </div>
                `}
            </div>
        </div>
    </section>

    <!-- Sobre -->
    <section id="sobre" class="section">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-6">
                    <h2 class="section-title">Sobre ${title}</h2>
                    <p class="lead mb-4">${description}</p>
                    <div class="row g-3">
                        <div class="col-sm-6">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-check-circle text-primary me-3"></i>
                                <span>Qualidade Garantida</span>
                            </div>
                        </div>
                        <div class="col-sm-6">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-check-circle text-primary me-3"></i>
                                <span>Atendimento Personalizado</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-6">
                    <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                         alt="Sobre nós" class="img-fluid rounded shadow">
                </div>
            </div>
        </div>
    </section>

    <!-- Depoimentos -->
    <section class="section bg-light">
        <div class="container">
            <div class="text-center mb-5">
                <h2 class="section-title">O que nossos clientes dizem</h2>
                <p class="lead">Depoimentos reais de clientes satisfeitos</p>
            </div>
            <div class="row g-4">
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 shadow-sm border-0">
                        <div class="card-body text-center p-4">
                            <i class="fas fa-quote-left text-primary mb-3" style="font-size: 2rem;"></i>
                            <p class="mb-3">"Excelente atendimento e resultados incríveis!"</p>
                            <h6 class="text-muted">- João Silva</h6>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 shadow-sm border-0">
                        <div class="card-body text-center p-4">
                            <i class="fas fa-quote-left text-primary mb-3" style="font-size: 2rem;"></i>
                            <p class="mb-3">"Superou todas as minhas expectativas!"</p>
                            <h6 class="text-muted">- Maria Santos</h6>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 shadow-sm border-0">
                        <div class="card-body text-center p-4">
                            <i class="fas fa-quote-left text-primary mb-3" style="font-size: 2rem;"></i>
                            <p class="mb-3">"Profissionais dedicados e competentes!"</p>
                            <h6 class="text-muted">- Carlos Oliveira</h6>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  
    <!-- Contato -->
    <section id="contato" class="section" style="background-color: var(--primary-color);">
        <div class="container">
            <div class="text-center text-white mb-5">
                <h2 class="section-title text-white">Entre em Contato</h2>
                <p class="lead">Estamos prontos para atender você</p>
            </div>
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <div class="card shadow-lg border-0">
                        <div class="card-body p-5">
                            <form>
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label class="form-label">Nome</label>
                                        <input type="text" class="form-control" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">E-mail</label>
                                        <input type="email" class="form-control" required>
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label">Telefone</label>
                                        <input type="tel" class="form-control" required>
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label">Mensagem</label>
                                        <textarea class="form-control" rows="4" required></textarea>
                                    </div>
                                    <div class="col-12 text-center">
                                        <button type="submit" class="btn btn-primary btn-lg px-5">
                                            Enviar Mensagem
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-dark text-white py-4">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <p class="mb-0">&copy; 2024 ${title}. Todos os direitos reservados.</p>
                </div>
                <div class="col-md-6 text-md-end">
                    <p class="mb-0">Desenvolvido com Landing Creator AI</p>
                </div>
            </div>
        </div>
    </footer>
  
    <!-- Chatbot -->
    <div class="chatbot-container">
        <button class="chatbot-toggle" onclick="toggleChatbot()">
            <i class="fas fa-comments"></i>
        </button>
        <div class="chatbot-window" id="chatbotWindow">
            <div class="chatbot-header">
                <button class="chatbot-close" onclick="toggleChatbot()">&times;</button>
                <h6 class="mb-1">Assistente</h6>
                <small>Como posso ajudar você?</small>
            </div>
            <div class="chatbot-messages" id="chatbotMessages">
                <div class="message bot">
                    Olá! Sou assistente da ${title}. Como posso ajudar você hoje?
                </div>
            </div>
            <div class="chatbot-input-area">
                <div class="chatbot-input-container">
                    <input type="text" class="chatbot-input" id="chatbotInput" placeholder="Digite sua mensagem...">
                    <button class="chatbot-send" onclick="sendMessage()">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
  
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <script>
        let chatbotOpen = false;
        
        const chatbotData = {
            name: 'Assistente',
            personality: 'profissional e prestativo',
            instructions: 'Você é o assistente virtual da ${title}. Seja cordial e ajude os clientes com informações sobre nossos serviços.',
            whatsapp: '${phone}',
            businessHours: 'Segunda à Sexta: 9h às 18h',
            specialOffers: '${businessData.specialOffers || ''}',
            companyName: '${title}',
            services: '${services}',
            targetAudience: 'clientes'
        };
        
        function toggleChatbot() {
            const window = document.getElementById('chatbotWindow');
            chatbotOpen = !chatbotOpen;
            window.style.display = chatbotOpen ? 'flex' : 'none';
            
            if (chatbotOpen) {
                document.getElementById('chatbotInput').focus();
            }
        }
        
        function sendMessage() {
            const input = document.getElementById('chatbotInput');
            const messages = document.getElementById('chatbotMessages');
            const userMessage = input.value.trim();
            
            if (!userMessage) return;
            
            // Add user message
            const userDiv = document.createElement('div');
            userDiv.className = 'message user';
            userDiv.textContent = userMessage;
            messages.appendChild(userDiv);
            
            // Clear input
            input.value = '';
            
            // Generate bot response
            setTimeout(() => {
                const botResponse = generateBotResponse(userMessage);
                const botDiv = document.createElement('div');
                botDiv.className = 'message bot';
                botDiv.innerHTML = botResponse;
                messages.appendChild(botDiv);
                messages.scrollTop = messages.scrollHeight;
            }, 1000);
            
            messages.scrollTop = messages.scrollHeight;
        }
        
        function generateBotResponse(userMessage) {
            const msg = userMessage.toLowerCase();
            
            // Respostas específicas baseadas na configuração da empresa
            if (msg.includes('horário') || msg.includes('funcionamento')) {
                return \`📅 Nosso horário de funcionamento: \${chatbotData.businessHours}\`;
            }
            
            if (msg.includes('serviço') || msg.includes('produto')) {
                return \`📋 Oferecemos: \${chatbotData.services}. Qual serviço específico você gostaria de saber mais?\`;
            }
            
            if (msg.includes('preço') || msg.includes('valor') || msg.includes('orçamento')) {
                let response = '💰 Para um orçamento personalizado, entre em contato conosco.';
                if (chatbotData.specialOffers) {
                    response += \` \${chatbotData.specialOffers}\`;
                }
                if (chatbotData.whatsapp) {
                    response += \` Ou fale diretamente no WhatsApp: \${chatbotData.whatsapp}\`;
                }
                return response;
            }
            
            if (msg.includes('contato') || msg.includes('telefone') || msg.includes('whatsapp')) {
                if (chatbotData.whatsapp) {
                    return \`📱 Você pode entrar em contato conosco pelo WhatsApp: \${chatbotData.whatsapp} ou pelo formulário de contato no site.\`;
                }
                return '📱 Entre em contato conosco pelo formulário no site ou pelos dados de contato disponíveis.';
            }
            
            if (msg.includes('localização') || msg.includes('endereço') || msg.includes('onde')) {
                return '📍 Nossa localização está disponível na seção de contato. Como posso ajudar com mais informações?';
            }
            
            // Respostas genéricas baseadas na personalidade
            const responses = [
                \`Obrigado por entrar em contato com a \${chatbotData.companyName}! Como posso ajudar você hoje?\`,
                \`Fico feliz em ajudar! Conte-me mais sobre o que você precisa.\`,
                \`Perfeito! Vou te ajudar com isso. \${chatbotData.instructions}\`,
                \`Excelente pergunta! Para melhor atendê-lo, você pode me dar mais detalhes?\`
            ];
            
            return responses[Math.floor(Math.random() * responses.length)];
        }
        
        // Allow Enter key to send message
        document.getElementById('chatbotInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // Auto-open chatbot after 10 seconds (optional)
        setTimeout(() => {
            if (!chatbotOpen) {
                const welcomeDiv = document.createElement('div');
                welcomeDiv.className = 'message bot';
                welcomeDiv.innerHTML = '👋 Olá! Precisa de ajuda? Estou aqui para atendê-lo!';
                document.getElementById('chatbotMessages').appendChild(welcomeDiv);
            }
        }, 10000);
    </script>
  
</body>
</html>`;
  }

  async generateLandingPage(briefing: any): Promise<string> {
    try {
      const businessData = this.extractBriefingData(briefing);
      return this.generateCompleteHTML(businessData);
    } catch (error) {
      console.error("Error generating landing page:", error);
      throw new Error("Erro ao gerar landing page. Tente novamente.");
    }
  }

  async generateContent(userRequest: string, contentType: string = "general"): Promise<string> {
    const prompt = `Gere conteúdo em português brasileiro para: ${userRequest}
    
    Tipo de conteúdo: ${contentType}
    
    IMPORTANTE:
    - Seja profissional e persuasivo
    - Use linguagem clara e objetiva
    - Inclua elementos que geram confiança
    - Foque nos benefícios para o cliente
    - Retorne apenas o conteúdo solicitado`;

    return await this.makeRequest(prompt);
  }

  async generateChatResponse(message: string): Promise<string> {
    return `Olá! Como posso ajudar você com ${message}?`;
  }

  generateLandingPageHTML(briefing: any): Promise<string> {
    return this.generateLandingPage(briefing);
  }

  extractBusinessDataFromHTML(html: string): BusinessContent {
    return {
      companyName: 'Empresa',
      businessType: 'Negócio',
      description: 'Descrição',
      services: 'Serviços',
      city: 'Cidade',
      phone: '(11) 99999-9999',
      email: 'contato@empresa.com'
    };
  }
}

export const contentGenerator = new ContentGenerator();