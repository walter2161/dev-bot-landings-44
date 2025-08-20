import { toast } from 'sonner';

// API Configuration
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_API_KEY = "aynCSftAcQBOlxmtmpJqVzco8K4aaTDQ";

// Pollinations.ai é gratuito e não requer API key
const POLLINATIONS_API_URL = "https://image.pollinations.ai/prompt";

interface PromptAnalysis {
  businessType: string;
  companyName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  sections: Array<{
    name: string;
    type: 'hero' | 'two-columns' | 'centered' | 'bg-image';
    description: string;
  }>;
  keywords: string[];
  target: string;
  style: string;
  location?: string;
}

interface GeneratedSection {
  title: string;
  content: string;
  type: 'hero' | 'two-columns' | 'centered' | 'bg-image';
  imagePrompt?: string;
}

interface GeneratedImages {
  [key: string]: string; // base64 encoded images
}

export class AILandingPageGenerator {
  
  /**
   * Analisa o prompt do usuário usando Mistral AI
   */
  async analyzePrompt(userPrompt: string): Promise<PromptAnalysis> {
    const analysisPrompt = `
Analise este prompt de criação de landing page e retorne APENAS um JSON válido com a seguinte estrutura:

{
  "businessType": "tipo do negócio identificado",
  "companyName": "nome sugerido para a empresa", 
  "colors": {
    "primary": "#código_cor_principal",
    "secondary": "#código_cor_secundária", 
    "accent": "#código_cor_destaque"
  },
  "sections": [
    {
      "name": "nome_da_seção",
      "type": "hero|two-columns|centered|bg-image",
      "description": "descrição do conteúdo desta seção"
    }
  ],
  "keywords": ["palavra1", "palavra2", "palavra3"],
  "target": "público-alvo identificado",
  "style": "estilo visual descrito",
  "location": "cidade/região se mencionada"
}

Prompt para analisar: "${userPrompt}"

Responda APENAS com o JSON, sem explicações adicionais.`;

    try {
      const response = await fetch(MISTRAL_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: "mistral-large-latest",
          messages: [{ role: "user", content: analysisPrompt }],
          max_tokens: 1000,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`);
      }

      const data = await response.json();
      const jsonContent = data.choices[0].message.content.trim();
      
      // Extrair JSON caso venha com markdown
      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : jsonContent;
      
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("Erro ao analisar prompt:", error);
      // Fallback para análise básica
      return this.fallbackAnalysis(userPrompt);
    }
  }

  /**
   * Análise fallback caso a API falhe
   */
  private fallbackAnalysis(prompt: string): PromptAnalysis {
    const text = prompt.toLowerCase();
    
    let businessType = "Negócio";
    let colors = { primary: "#007bff", secondary: "#6c757d", accent: "#28a745" };
    
    // Detectar tipo de negócio
    if (text.includes("restaurante") || text.includes("comida")) {
      businessType = "Restaurante";
      colors = { primary: "#E67E22", secondary: "#2C3E50", accent: "#E74C3C" };
    } else if (text.includes("academia") || text.includes("fitness")) {
      businessType = "Academia";
      colors = { primary: "#2E8B57", secondary: "#1E6B3F", accent: "#FFD700" };
    } else if (text.includes("clínica") || text.includes("saúde")) {
      businessType = "Clínica";
      colors = { primary: "#3498DB", secondary: "#2980B9", accent: "#E74C3C" };
    } else if (text.includes("loja") || text.includes("roupa")) {
      businessType = "Loja";
      colors = { primary: "#9B59B6", secondary: "#8E44AD", accent: "#E91E63" };
    }

    return {
      businessType,
      companyName: `${businessType} Premium`,
      colors,
      sections: [
        { name: "hero", type: "hero", description: "Seção principal de apresentação" },
        { name: "sobre", type: "two-columns", description: "Sobre a empresa" },
        { name: "servicos", type: "centered", description: "Nossos serviços" },
        { name: "contato", type: "bg-image", description: "Entre em contato" }
      ],
      keywords: [businessType.toLowerCase(), "qualidade", "excelência"],
      target: "Clientes que buscam qualidade",
      style: "Moderno e profissional"
    };
  }

  /**
   * Gera conteúdo para cada seção usando Mistral AI
   */
  async generateSectionContent(analysis: PromptAnalysis): Promise<GeneratedSection[]> {
    const sections: GeneratedSection[] = [];

    for (const sectionPlan of analysis.sections) {
      const contentPrompt = `
Gere conteúdo para uma seção de landing page com as seguintes especificações:

Tipo de negócio: ${analysis.businessType}
Nome da empresa: ${analysis.companyName}
Seção: ${sectionPlan.name}
Tipo de layout: ${sectionPlan.type}
Descrição: ${sectionPlan.description}
Público-alvo: ${analysis.target}
Estilo: ${analysis.style}

Retorne APENAS um JSON válido com:
{
  "title": "título da seção",
  "content": "conteúdo detalhado da seção (HTML simples permitido)",
  "imagePrompt": "prompt específico para gerar imagem desta seção"
}

O conteúdo deve ser envolvente, profissional e otimizado para conversão.`;

      try {
        const response = await fetch(MISTRAL_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${MISTRAL_API_KEY}`,
          },
          body: JSON.stringify({
            model: "mistral-large-latest",
            messages: [{ role: "user", content: contentPrompt }],
            max_tokens: 800,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          throw new Error(`Mistral API error: ${response.status}`);
        }

        const data = await response.json();
        const jsonContent = data.choices[0].message.content.trim();
        
        const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : jsonContent;
        const sectionData = JSON.parse(jsonString);

        sections.push({
          title: sectionData.title,
          content: sectionData.content,
          type: sectionPlan.type,
          imagePrompt: sectionData.imagePrompt
        });

      } catch (error) {
        console.error(`Erro ao gerar conteúdo para seção ${sectionPlan.name}:`, error);
        // Fallback content
        sections.push({
          title: this.capitalize(sectionPlan.name),
          content: `Conteúdo da seção ${sectionPlan.name} para ${analysis.businessType}`,
          type: sectionPlan.type,
          imagePrompt: `Professional image for ${analysis.businessType} ${sectionPlan.name} section`
        });
      }
    }

    return sections;
  }

  /**
   * Gera imagens usando Pollinations AI e converte para base64
   */
  async generateImages(sections: GeneratedSection[], analysis: PromptAnalysis): Promise<GeneratedImages> {
    const images: GeneratedImages = {};
    
    // Gerar imagem de logo
    const logoPrompt = `Professional logo for ${analysis.businessType} company called ${analysis.companyName}, clean design, modern style`;
    images.logo = await this.generateAndConvertImage(logoPrompt, 400, 400);

    // Gerar imagens para cada seção
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (section.imagePrompt) {
        const enhancedPrompt = `${section.imagePrompt}, professional photography, high quality, ${analysis.style} style, ${analysis.businessType} business`;
        
        // Diferentes dimensões baseadas no tipo
        let width = 1200, height = 800;
        if (section.type === 'hero') {
          width = 1920;
          height = 1080;
        } else if (section.type === 'bg-image') {
          width = 1600;
          height = 900;
        }

        const imageKey = section.type === 'hero' ? 'hero' : `section_${i}`;
        images[imageKey] = await this.generateAndConvertImage(enhancedPrompt, width, height);
      }
    }

    return images;
  }

  /**
   * Gera uma imagem via Pollinations e converte para base64
   */
  private async generateAndConvertImage(prompt: string, width: number = 1200, height: number = 800): Promise<string> {
    try {
      console.log(`Generating image: ${prompt}`);
      
      // Lista de APIs de fallback
      const imageApis = [
        // Pollinations.ai
        `${POLLINATIONS_API_URL}/${encodeURIComponent(prompt)}?width=${width}&height=${height}&model=flux&enhance=true`,
        // Fallback para Pollinations sem parâmetros extras
        `${POLLINATIONS_API_URL}/${encodeURIComponent(prompt)}?width=${width}&height=${height}`,
        // Picsum para placeholder (não relacionado ao prompt, mas funcional)
        `https://picsum.photos/${width}/${height}?random=${Math.floor(Math.random() * 1000)}`
      ];

      for (let i = 0; i < imageApis.length; i++) {
        try {
          console.log(`Trying image API ${i + 1}/${imageApis.length}: ${imageApis[i]}`);
          
          const response = await fetch(imageApis[i], {
            method: 'GET',
            headers: {
              'Accept': 'image/*',
            },
          });

          if (!response.ok) {
            console.warn(`API ${i + 1} failed with status: ${response.status}`);
            continue;
          }

          // Converter para blob e depois base64
          const blob = await response.blob();
          
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              console.log(`Successfully generated image using API ${i + 1}`);
              resolve(result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

        } catch (apiError) {
          console.warn(`API ${i + 1} error:`, apiError);
          continue;
        }
      }

      // Se todas as APIs falharam, retornar placeholder gradient
      console.warn('All image APIs failed, using gradient placeholder');
      return this.createGradientPlaceholder(width, height);

    } catch (error) {
      console.error('Error generating image:', error);
      return this.createGradientPlaceholder(width, height);
    }
  }

  /**
   * Cria um placeholder gradient como fallback
   */
  private createGradientPlaceholder(width: number, height: number): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Criar gradient colorido
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Adicionar texto indicativo
      ctx.fillStyle = 'white';
      ctx.font = `${Math.min(width, height) / 20}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('Imagem Placeholder', width / 2, height / 2);
    }
    
    return canvas.toDataURL('image/png');
  }

  /**
   * Constrói o HTML completo da landing page
   */
  buildCompleteHTML(
    analysis: PromptAnalysis, 
    sections: GeneratedSection[], 
    images: GeneratedImages
  ): string {
    const seoTitle = `${analysis.companyName} - ${analysis.businessType}${analysis.location ? ` em ${analysis.location}` : ''}`;
    const seoDescription = `${analysis.businessType} especializado em qualidade e excelência. ${analysis.target}.`;
    const keywords = analysis.keywords.join(', ');

    // Structured Data para SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": analysis.businessType === 'Restaurante' ? 'Restaurant' : 
               analysis.businessType === 'Clínica' ? 'MedicalOrganization' : 'LocalBusiness',
      "name": analysis.companyName,
      "description": seoDescription,
      "address": analysis.location ? {
        "@type": "PostalAddress",
        "addressLocality": analysis.location
      } : undefined
    };

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- SEO Meta Tags -->
    <title>${seoTitle}</title>
    <meta name="description" content="${seoDescription}">
    <meta name="keywords" content="${keywords}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://exemplo.com">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="${seoTitle}">
    <meta property="og:description" content="${seoDescription}">
    <meta property="og:image" content="${images.hero || images.logo}">
    <meta property="og:url" content="https://exemplo.com">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${seoTitle}">
    <meta name="twitter:description" content="${seoDescription}">
    <meta name="twitter:image" content="${images.hero || images.logo}">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    ${JSON.stringify(structuredData, null, 2)}
    </script>
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
    
    <style>
        /* CSS Variables */
        :root {
            --primary: ${analysis.colors.primary};
            --secondary: ${analysis.colors.secondary};
            --accent: ${analysis.colors.accent};
            --background: #ffffff;
            --foreground: #1a1a1a;
            --muted: #f8f9fa;
            --border: #e9ecef;
            --shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        /* Reset and Base */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: var(--foreground);
            background: var(--background);
            overflow-x: hidden;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        /* Loading States */
        .image-loading {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        
        /* Navigation */
        .navbar {
            position: fixed;
            top: 0;
            width: 100%;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            z-index: 1000;
            padding: 1rem 0;
            box-shadow: var(--shadow);
            transition: all 0.3s ease;
        }
        
        .nav-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary);
            text-decoration: none;
        }
        
        .logo-image {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            object-fit: cover;
        }
        
        .nav-links {
            display: flex;
            list-style: none;
            gap: 2rem;
        }
        
        .nav-links a {
            text-decoration: none;
            color: var(--foreground);
            font-weight: 500;
            transition: color 0.3s;
            position: relative;
        }
        
        .nav-links a:hover {
            color: var(--primary);
        }
        
        .nav-links a::after {
            content: '';
            position: absolute;
            width: 0;
            height: 2px;
            bottom: -5px;
            left: 0;
            background: var(--primary);
            transition: width 0.3s;
        }
        
        .nav-links a:hover::after {
            width: 100%;
        }
        
        .mobile-menu {
            display: none;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--foreground);
        }
        
        /* Sections Base */
        .section {
            min-height: 100vh;
            display: flex;
            align-items: center;
            padding: 100px 0;
            position: relative;
        }
        
        .section:nth-child(even) {
            background: var(--muted);
        }
        
        /* Hero Section */
        .hero {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: url('${images.hero}');
            background-size: cover;
            background-position: center;
            opacity: 0.3;
            z-index: 1;
        }
        
        .hero .container {
            position: relative;
            z-index: 2;
        }
        
        .hero h1 {
            font-size: clamp(2.5rem, 5vw, 4rem);
            font-weight: 800;
            margin-bottom: 1.5rem;
            animation: fadeInUp 1s ease-out;
        }
        
        .hero p {
            font-size: clamp(1.1rem, 2.5vw, 1.3rem);
            margin-bottom: 2.5rem;
            opacity: 0.95;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
            animation: fadeInUp 1s ease-out 0.3s both;
        }
        
        .cta-button {
            display: inline-block;
            background: var(--accent);
            color: white;
            padding: 1.2rem 2.5rem;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 1.1rem;
            transition: all 0.3s;
            animation: fadeInUp 1s ease-out 0.6s both;
            box-shadow: var(--shadow);
        }
        
        .cta-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            color: white;
        }
        
        /* Two Columns Layout */
        .two-columns {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
        }
        
        .two-columns.reverse {
            direction: rtl;
        }
        
        .two-columns.reverse > * {
            direction: ltr;
        }
        
        .section-image {
            width: 100%;
            height: 400px;
            object-fit: cover;
            border-radius: 20px;
            box-shadow: var(--shadow);
        }
        
        /* Centered Layout */
        .centered {
            text-align: center;
            max-width: 800px;
            margin: 0 auto;
        }
        
        /* Background Image Section */
        .bg-image {
            position: relative;
            text-align: center;
            color: white;
        }
        
        .bg-image::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            z-index: 1;
        }
        
        .bg-image::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.6);
            z-index: 2;
        }
        
        .bg-image .container {
            position: relative;
            z-index: 3;
        }
        
        /* Typography */
        .section-title {
            font-size: clamp(2rem, 4vw, 2.5rem);
            font-weight: 700;
            margin-bottom: 1.5rem;
            color: var(--primary);
        }
        
        .section-text {
            font-size: 1.1rem;
            color: #666;
            margin-bottom: 2rem;
            line-height: 1.8;
        }
        
        /* Footer */
        footer {
            background: var(--foreground);
            color: white;
            padding: 3rem 0 1rem;
            text-align: center;
        }
        
        .footer-content {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .footer-section h3 {
            color: var(--primary);
            margin-bottom: 1rem;
        }
        
        .footer-section a {
            color: #ccc;
            text-decoration: none;
            transition: color 0.3s;
        }
        
        .footer-section a:hover {
            color: var(--primary);
        }
        
        .footer-bottom {
            border-top: 1px solid #444;
            padding-top: 1rem;
            margin-top: 2rem;
            color: #999;
            font-size: 0.9rem;
        }
        
        /* Animations */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .navbar {
                padding: 0.5rem 0;
            }
            
            .nav-links {
                display: none;
            }
            
            .mobile-menu {
                display: block;
            }
            
            .section {
                padding: 60px 0;
                min-height: auto;
            }
            
            .two-columns {
                grid-template-columns: 1fr;
                gap: 2rem;
            }
            
            .hero {
                padding: 80px 0;
            }
            
            .bg-image::before {
                background-attachment: scroll;
            }
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar">
        <div class="container">
            <div class="nav-content">
                <a href="#" class="logo">
                    ${images.logo ? `<img src="${images.logo}" alt="${analysis.companyName}" class="logo-image">` : ''}
                    ${analysis.companyName}
                </a>
                <ul class="nav-links">
                    <li><a href="#inicio">Início</a></li>
                    ${sections.map((section, index) => 
                        `<li><a href="#section-${index}">${section.title}</a></li>`
                    ).join('')}
                    <li><a href="#contato">Contato</a></li>
                </ul>
                <button class="mobile-menu" onclick="toggleMobileMenu()">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
        </div>
    </nav>

    ${sections.map((section, index) => {
        const sectionId = index === 0 ? 'inicio' : `section-${index}`;
        const backgroundImage = images[`section_${index}`] || images.hero;
        
        if (section.type === 'hero') {
            return `
    <!-- Hero Section -->
    <section id="${sectionId}" class="section hero">
        <div class="container">
            <h1>${section.title}</h1>
            <p>${section.content}</p>
            <a href="#section-1" class="cta-button">
                <i class="fas fa-arrow-right"></i> Saiba Mais
            </a>
        </div>
    </section>`;
        }
        
        if (section.type === 'two-columns') {
            const isReverse = index % 2 === 0;
            return `
    <!-- Two Columns Section -->
    <section id="${sectionId}" class="section">
        <div class="container">
            <div class="two-columns ${isReverse ? 'reverse' : ''}">
                <div>
                    <h2 class="section-title">${section.title}</h2>
                    <div class="section-text">${section.content}</div>
                </div>
                <div>
                    ${backgroundImage ? `<img src="${backgroundImage}" alt="${section.title}" class="section-image">` : ''}
                </div>
            </div>
        </div>
    </section>`;
        }
        
        if (section.type === 'centered') {
            return `
    <!-- Centered Section -->
    <section id="${sectionId}" class="section">
        <div class="container">
            <div class="centered">
                <h2 class="section-title">${section.title}</h2>
                <div class="section-text">${section.content}</div>
            </div>
        </div>
    </section>`;
        }
        
        if (section.type === 'bg-image') {
            return `
    <!-- Background Image Section -->
    <section id="${sectionId}" class="section bg-image" style="background-image: url('${backgroundImage}');">
        <div class="container">
            <h2 class="section-title" style="color: white;">${section.title}</h2>
            <div class="section-text" style="color: white;">${section.content}</div>
            <a href="#contato" class="cta-button">Entre em Contato</a>
        </div>
    </section>`;
        }
        
        return '';
    }).join('')}

    <!-- Contact Section -->
    <section id="contato" class="section" style="background: var(--muted);">
        <div class="container">
            <div class="centered">
                <h2 class="section-title">Entre em Contato</h2>
                <p class="section-text">Estamos prontos para atender você!</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 3rem;">
                    <div style="background: white; padding: 2rem; border-radius: 15px; box-shadow: var(--shadow);">
                        <form>
                            <div style="margin-bottom: 1rem;">
                                <input type="text" placeholder="Seu nome" required 
                                       style="width: 100%; padding: 0.8rem; border: 1px solid var(--border); border-radius: 8px; font-size: 1rem;">
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <input type="email" placeholder="Seu e-mail" required 
                                       style="width: 100%; padding: 0.8rem; border: 1px solid var(--border); border-radius: 8px; font-size: 1rem;">
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <input type="tel" placeholder="Seu telefone" required 
                                       style="width: 100%; padding: 0.8rem; border: 1px solid var(--border); border-radius: 8px; font-size: 1rem;">
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <textarea placeholder="Sua mensagem" rows="4" required 
                                          style="width: 100%; padding: 0.8rem; border: 1px solid var(--border); border-radius: 8px; font-size: 1rem; resize: vertical;"></textarea>
                            </div>
                            <button type="submit" class="cta-button" style="width: 100%;">
                                <i class="fas fa-paper-plane"></i> Enviar Mensagem
                            </button>
                        </form>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <div style="background: white; padding: 1.5rem; border-radius: 15px; box-shadow: var(--shadow); text-align: left;">
                            <i class="fas fa-map-marker-alt" style="color: var(--primary); font-size: 1.2rem; margin-bottom: 0.5rem;"></i>
                            <h4 style="margin-bottom: 0.5rem;">Localização</h4>
                            <p style="color: #666; margin: 0;">${analysis.location || 'Cidade, Estado'}</p>
                        </div>
                        
                        <div style="background: white; padding: 1.5rem; border-radius: 15px; box-shadow: var(--shadow); text-align: left;">
                            <i class="fas fa-phone" style="color: var(--primary); font-size: 1.2rem; margin-bottom: 0.5rem;"></i>
                            <h4 style="margin-bottom: 0.5rem;">Telefone</h4>
                            <p style="color: #666; margin: 0;">(11) 99999-9999</p>
                        </div>
                        
                        <div style="background: white; padding: 1.5rem; border-radius: 15px; box-shadow: var(--shadow); text-align: left;">
                            <i class="fas fa-envelope" style="color: var(--primary); font-size: 1.2rem; margin-bottom: 0.5rem;"></i>
                            <h4 style="margin-bottom: 0.5rem;">E-mail</h4>
                            <p style="color: #666; margin: 0;">contato@${analysis.companyName.toLowerCase().replace(/\s+/g, '')}.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>${analysis.companyName}</h3>
                    <p>${seoDescription}</p>
                </div>
                <div class="footer-section">
                    <h3>Links Rápidos</h3>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin-bottom: 0.5rem;"><a href="#inicio">Início</a></li>
                        ${sections.map((section, index) => 
                            `<li style="margin-bottom: 0.5rem;"><a href="#section-${index}">${section.title}</a></li>`
                        ).join('')}
                        <li style="margin-bottom: 0.5rem;"><a href="#contato">Contato</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>Redes Sociais</h3>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <a href="#" style="color: var(--primary); font-size: 1.5rem;"><i class="fab fa-facebook"></i></a>
                        <a href="#" style="color: var(--primary); font-size: 1.5rem;"><i class="fab fa-instagram"></i></a>
                        <a href="#" style="color: var(--primary); font-size: 1.5rem;"><i class="fab fa-linkedin"></i></a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 ${analysis.companyName}. Todos os direitos reservados.</p>
                <p>
                    <a href="#" onclick="showPrivacyPolicy()" style="color: #999;">Política de Privacidade</a> | 
                    <a href="#" onclick="showTerms()" style="color: #999;">Termos de Uso</a>
                </p>
            </div>
        </div>
    </footer>

    <script>
        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Navbar scroll effect
        window.addEventListener('scroll', function() {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'var(--shadow)';
            }
        });

        // Mobile menu toggle
        function toggleMobileMenu() {
            const navLinks = document.querySelector('.nav-links');
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        }

        // Form submission
        document.querySelector('form').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
        });

        // Privacy Policy Modal
        function showPrivacyPolicy() {
            alert('Política de Privacidade\\n\\nEsta empresa respeita sua privacidade e está em conformidade com a LGPD.');
        }

        // Terms Modal
        function showTerms() {
            alert('Termos de Uso\\n\\nAo utilizar nossos serviços, você concorda com nossos termos e condições.');
        }

        // Image lazy loading
        const images = document.querySelectorAll('img');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.style.opacity = '1';
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => {
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.5s';
            imageObserver.observe(img);
        });

        // Performance monitoring
        window.addEventListener('load', function() {
            if ('performance' in window) {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                console.log('Page load time:', loadTime + 'ms');
            }
        });
    </script>
</body>
</html>`;
  }

  /**
   * Método principal para gerar landing page completa
   */
  async generateCompleteLandingPage(userPrompt: string): Promise<string> {
    try {
      toast.loading('Analisando seu prompt...');
      
      // 1. Analisar o prompt
      const analysis = await this.analyzePrompt(userPrompt);
      
      toast.loading('Gerando conteúdo personalizado...');
      
      // 2. Gerar conteúdo das seções
      const sections = await this.generateSectionContent(analysis);
      
      toast.loading('Criando imagens personalizadas...');
      
      // 3. Gerar imagens
      const images = await this.generateImages(sections, analysis);
      
      toast.loading('Construindo HTML final...');
      
      // 4. Construir HTML completo
      const html = this.buildCompleteHTML(analysis, sections, images);
      
      toast.success('Landing page criada com sucesso!');
      
      return html;
      
    } catch (error) {
      console.error('Erro ao gerar landing page:', error);
      toast.error('Erro ao gerar landing page');
      throw error;
    }
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export const aiLandingPageGenerator = new AILandingPageGenerator();