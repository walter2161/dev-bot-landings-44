import { toast } from 'sonner';
import { aiLandingPageGenerator } from './aiLandingPageGenerator';

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
  title?: string;
  subtitle?: string;
  heroText?: string;
  ctaText?: string;
  layouts?: any;
  sections?: Array<{
    id: string;
    title: string;
    content: string;
    type: string;
  }>;
  images?: {
    hero?: string;
    services?: string;
    about?: string;
    testimonials?: string;
    gallery?: string[];
    [key: string]: string | string[] | undefined;
  };
  customImages?: {
    [key: string]: string;
  };
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
    whatsapp?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      linkedin?: string;
      whatsapp?: string;
    };
  };
  sellerbot?: {
    name?: string;
    personality?: string;
    instructions?: string;
    whatsapp?: string;
    businessHours?: string;
    specialOffers?: string;
    knowledge?: string | string[];
    prohibitions?: string;
    responses?: {
      [key: string]: string;
    };
    media?: {
      images?: string[];
      links?: Array<{
        title?: string;
        url: string;
        description?: string;
      }>;
    };
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    canonicalUrl?: string;
    googleTagManagerId?: string;
    customBodyTags?: string;
    structuredData?: string | { [key: string]: any };
  };
}

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  structuredData?: string | { [key: string]: any };
  customHeadTags?: string;
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  facebookPixelId?: string;
}

class ContentGenerator {
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
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
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
    return this.buildLandingPageFromScratch(businessData);
  }

  private buildLandingPageFromScratch(data: BriefingData): string {
    const title = data.companyName || 'Empresa';
    const type = data.businessType || 'Negócio';
    const description = data.description || 'Descrição do negócio';
    const services = data.services?.split(',').map(s => s.trim()) || [];
    const city = data.city || 'Cidade';
    const phone = data.phone || '';
    const email = data.email || '';

    // Cores baseadas no tipo de negócio
    const colors = this.getBusinessColors(data.businessType || '');
    
    // Seções baseadas no briefing
    const sections = this.generateSections(data);
    
    // Imagens baseadas no tipo de negócio
    const images = this.getBusinessImages(data.businessType || '');

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - ${type} em ${city}</title>
    <meta name="description" content="${description}">
    <meta name="keywords" content="${type}, ${city}, ${services.join(', ')}">
    
    <!-- SEO -->
    <meta property="og:title" content="${title} - ${type}">
    <meta property="og:description" content="${description}">
    <meta property="og:type" content="website">
    
    <!-- Styles -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --primary: ${colors.primary};
            --secondary: ${colors.secondary};
            --accent: ${colors.accent};
            --background: #ffffff;
            --foreground: #1a1a1a;
            --muted: #f8f9fa;
            --border: #e9ecef;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: var(--foreground);
            background: var(--background);
        }
        
        .hero {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            padding: 100px 0;
            text-align: center;
        }
        
        .hero h1 {
            font-size: 3.5rem;
            font-weight: 800;
            margin-bottom: 1rem;
        }
        
        .hero .lead {
            font-size: 1.25rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        
        .btn-primary {
            background: var(--accent);
            border: none;
            padding: 15px 30px;
            font-weight: 600;
            border-radius: 10px;
            transition: all 0.3s;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        
        .section {
            padding: 80px 0;
        }
        
        .card {
            border: none;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            transition: transform 0.3s;
        }
        
        .card:hover {
            transform: translateY(-5px);
        }
        
        .service-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(45deg, var(--primary), var(--accent));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }
        
        footer {
            background: var(--foreground);
            color: white;
            padding: 40px 0;
            text-align: center;
        }
        
        @media (max-width: 768px) {
            .hero h1 { font-size: 2.5rem; }
            .section { padding: 60px 0; }
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top">
        <div class="container">
            <a class="navbar-brand fw-bold" href="#" style="color: var(--primary);">
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
                </ul>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section id="inicio" class="hero">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-6 text-lg-start">
                    <h1>${title}</h1>
                    <p class="lead">${description}</p>
                    <div class="d-flex gap-3 justify-content-center justify-content-lg-start">
                        <a href="#contato" class="btn btn-primary btn-lg">
                            Fale Conosco
                        </a>
                        <a href="#servicos" class="btn btn-outline-light btn-lg">
                            Nossos Serviços
                        </a>
                    </div>
                </div>
                <div class="col-lg-6 text-center">
                    <img src="${images.hero}" alt="${title}" class="img-fluid rounded shadow">
                </div>
            </div>
        </div>
    </section>

    ${sections.map(section => section.html).join('')}

    <!-- Contact Section -->
    <section id="contato" class="section" style="background: var(--muted);">
        <div class="container">
            <div class="text-center mb-5">
                <h2>Entre em Contato</h2>
                <p class="lead">Estamos prontos para atender você</p>
            </div>
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <div class="card p-5">
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
                                    <button type="submit" class="btn btn-primary btn-lg">
                                        Enviar Mensagem
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            
            ${phone || email ? `
            <div class="row mt-5 text-center">
                ${phone ? `<div class="col-md-6">
                    <div class="d-flex align-items-center justify-content-center">
                        <i class="fas fa-phone text-primary me-3 fs-4"></i>
                        <div>
                            <h6 class="mb-0">Telefone</h6>
                            <p class="mb-0">${phone}</p>
                        </div>
                    </div>
                </div>` : ''}
                ${email ? `<div class="col-md-6">
                    <div class="d-flex align-items-center justify-content-center">
                        <i class="fas fa-envelope text-primary me-3 fs-4"></i>
                        <div>
                            <h6 class="mb-0">E-mail</h6>
                            <p class="mb-0">${email}</p>
                        </div>
                    </div>
                </div>` : ''}
            </div>` : ''}
        </div>
    </section>

    <!-- Footer -->
    <footer>
        <div class="container">
            <div class="row align-items-center">
                <div class="col-md-6 text-start">
                    <p class="mb-0">&copy; 2024 ${title}. Todos os direitos reservados.</p>
                </div>
                <div class="col-md-6 text-end">
                    <p class="mb-0">Desenvolvido com ❤️</p>
                </div>
            </div>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    
    <script>
        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
        
        // Form submission
        document.querySelector('form').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Mensagem enviada! Entraremos em contato em breve.');
            this.reset();
        });
    </script>
</body>
</html>`;
  }

  private getBusinessColors(businessType: string): { primary: string; secondary: string; accent: string } {
    const type = businessType.toLowerCase();
    
    if (type.includes('clínica') || type.includes('saúde')) {
      return { primary: '#0ea5e9', secondary: '#38bdf8', accent: '#22d3ee' };
    }
    if (type.includes('corretor') || type.includes('imóvel')) {
      return { primary: '#059669', secondary: '#10b981', accent: '#34d399' };
    }
    if (type.includes('restaurante') || type.includes('food')) {
      return { primary: '#dc2626', secondary: '#ef4444', accent: '#f87171' };
    }
    if (type.includes('moda') || type.includes('roupa')) {
      return { primary: '#7c3aed', secondary: '#8b5cf6', accent: '#a78bfa' };
    }
    if (type.includes('produto') || type.includes('curso')) {
      return { primary: '#ea580c', secondary: '#fb923c', accent: '#fdba74' };
    }
    
    return { primary: '#3b82f6', secondary: '#60a5fa', accent: '#93c5fd' };
  }

  private getBusinessImages(businessType: string): { hero: string; about: string; services: string } {
    const type = businessType.toLowerCase();
    
    if (type.includes('clínica') || type.includes('saúde')) {
      return {
        hero: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        about: 'https://images.unsplash.com/photo-1551076805-e1869033e561?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        services: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
      };
    }
    if (type.includes('corretor') || type.includes('imóvel')) {
      return {
        hero: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        about: 'https://images.unsplash.com/photo-1582407947304-fd86f028998c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        services: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
      };
    }
    if (type.includes('restaurante') || type.includes('food')) {
      return {
        hero: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        about: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        services: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
      };
    }
    if (type.includes('moda') || type.includes('roupa')) {
      return {
        hero: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        about: 'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        services: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
      };
    }
    
    return {
      hero: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      about: 'https://images.unsplash.com/photo-1553484771-371a605b060b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      services: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    };
  }

  private generateSections(data: BriefingData): Array<{ html: string }> {
    const sections = [];
    const services = data.services?.split(',').map(s => s.trim()) || [];
    const businessType = data.businessType?.toLowerCase() || '';
    
    // Seção de Serviços
    if (services.length > 0) {
      const serviceCards = services.map((service, index) => {
        const icon = this.getServiceIcon(service, businessType);
        return `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100 text-center p-4">
                <div class="service-icon mx-auto">
                    <i class="${icon}"></i>
                </div>
                <h5>${service}</h5>
                <p class="text-muted">Oferecemos ${service.toLowerCase()} com qualidade e profissionalismo.</p>
            </div>
        </div>`;
      }).join('');

      sections.push({
        html: `
        <section id="servicos" class="section">
            <div class="container">
                <div class="text-center mb-5">
                    <h2>Nossos Serviços</h2>
                    <p class="lead">Conheça todas as soluções que oferecemos</p>
                </div>
                <div class="row">
                    ${serviceCards}
                </div>
            </div>
        </section>`
      });
    }

    // Seção Sobre
    sections.push({
      html: `
      <section id="sobre" class="section" style="background: var(--muted);">
          <div class="container">
              <div class="row align-items-center">
                  <div class="col-lg-6">
                      <h2>Sobre ${data.companyName}</h2>
                      <p class="lead">${data.description}</p>
                      <div class="row g-3 mt-4">
                          <div class="col-sm-6">
                              <div class="d-flex align-items-center">
                                  <i class="fas fa-check-circle text-primary me-3 fs-5"></i>
                                  <span>Qualidade Garantida</span>
                              </div>
                          </div>
                          <div class="col-sm-6">
                              <div class="d-flex align-items-center">
                                  <i class="fas fa-check-circle text-primary me-3 fs-5"></i>
                                  <span>Atendimento Personalizado</span>
                              </div>
                          </div>
                          <div class="col-sm-6">
                              <div class="d-flex align-items-center">
                                  <i class="fas fa-check-circle text-primary me-3 fs-5"></i>
                                  <span>Experiência Comprovada</span>
                              </div>
                          </div>
                          <div class="col-sm-6">
                              <div class="d-flex align-items-center">
                                  <i class="fas fa-check-circle text-primary me-3 fs-5"></i>
                                  <span>Resultados Efetivos</span>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div class="col-lg-6">
                      <img src="${this.getBusinessImages(businessType).about}" alt="Sobre nós" class="img-fluid rounded shadow">
                  </div>
              </div>
          </div>
      </section>`
    });

    return sections;
  }

  private getServiceIcon(service: string, businessType: string): string {
    const serviceType = service.toLowerCase();
    const business = businessType.toLowerCase();
    
    if (business.includes('clínica') || business.includes('saúde')) {
      if (serviceType.includes('consulta')) return 'fas fa-stethoscope';
      if (serviceType.includes('exame')) return 'fas fa-x-ray';
      if (serviceType.includes('cirurg')) return 'fas fa-procedures';
      return 'fas fa-heartbeat';
    }
    
    if (business.includes('corretor') || business.includes('imóvel')) {
      if (serviceType.includes('venda')) return 'fas fa-home';
      if (serviceType.includes('compra')) return 'fas fa-key';
      if (serviceType.includes('locação') || serviceType.includes('aluguel')) return 'fas fa-handshake';
      return 'fas fa-building';
    }
    
    if (business.includes('restaurante') || business.includes('food')) {
      if (serviceType.includes('prato')) return 'fas fa-utensils';
      if (serviceType.includes('entrada')) return 'fas fa-cheese';
      if (serviceType.includes('sobremesa')) return 'fas fa-birthday-cake';
      return 'fas fa-concierge-bell';
    }
    
    return 'fas fa-star';
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

  async generateLandingPageHTML(briefing: any): Promise<string> {
    try {
      // Se o briefing é um prompt de texto, usar o novo sistema AI
      if (typeof briefing === 'string') {
        return await aiLandingPageGenerator.generateCompleteLandingPage(briefing);
      }
      
      // Caso contrário, usar o sistema antigo para compatibilidade
      return this.generateLandingPage(briefing);
    } catch (error) {
      console.error('Erro ao gerar HTML:', error);
      throw error;
    }
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