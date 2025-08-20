import { BusinessContent, SEOData } from './contentGenerator';

export class LandingPageBuilder {
  async generateHTML(businessData: BusinessContent): Promise<string> {
    // Garantir que todos os campos necessários existem
    const safeBusinessData = this.ensureDataIntegrity(businessData);
    const images = await this.generateImageUrls(safeBusinessData.images, safeBusinessData.customImages);
    
    return this.buildHTMLTemplate(safeBusinessData, images);
  }

  private generateSEOTags(businessData: BusinessContent, seo?: SEOData): string {
    const defaultTitle = `${businessData.title} - ${businessData.subtitle}`;
    const defaultDescription = businessData.subtitle;
    const defaultKeywords = `${businessData.title}, ${businessData.sections.map(s => s.title).join(", ")}`;

    return `
    <title>${seo?.title || defaultTitle}</title>
    <meta name="description" content="${seo?.description || defaultDescription}">
    <meta name="keywords" content="${seo?.keywords || defaultKeywords}">
    ${seo?.canonicalUrl ? `<link rel="canonical" href="${seo.canonicalUrl}">` : ''}
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="${seo?.ogTitle || businessData.title}">
    <meta property="og:description" content="${seo?.ogDescription || businessData.subtitle}">
    ${seo?.ogImage ? `<meta property="og:image" content="${seo.ogImage}">` : ''}
    ${seo?.canonicalUrl ? `<meta property="og:url" content="${seo.canonicalUrl}">` : ''}
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${seo?.twitterTitle || businessData.title}">
    <meta name="twitter:description" content="${seo?.twitterDescription || businessData.subtitle}">
    ${seo?.twitterImage ? `<meta name="twitter:image" content="${seo.twitterImage}">` : ''}
    
    <!-- Structured Data -->
    ${seo?.structuredData ? `
    <script type="application/ld+json">
    ${seo.structuredData}
    </script>` : ''}
    
    <!-- Custom Head Tags -->
    ${seo?.customHeadTags || ''}`;
  }

  private generateTrackingScripts(seo?: SEOData): string {
    let scripts = '';

    // Google Analytics
    if (seo?.googleAnalyticsId) {
      scripts += `
      <!-- Google Analytics -->
      <script async src="https://www.googletagmanager.com/gtag/js?id=${seo.googleAnalyticsId}"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${seo.googleAnalyticsId}');
      </script>`;
    }

    // Google Tag Manager
    if (seo?.googleTagManagerId) {
      scripts += `
      <!-- Google Tag Manager -->
      <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${seo.googleTagManagerId}');</script>`;
    }

    // Facebook Pixel
    if (seo?.facebookPixelId) {
      scripts += `
      <!-- Facebook Pixel Code -->
      <script>
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${seo.facebookPixelId}');
        fbq('track', 'PageView');
      </script>
      <noscript><img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=${seo.facebookPixelId}&ev=PageView&noscript=1"
      /></noscript>`;
    }

    return scripts;
  }

  private async convertImageToBase64(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  }

  private buildHTMLTemplate(businessData: BusinessContent, images: any): string {
    const seo = businessData.seo;
    const layouts = businessData.layouts || {};
    const customColors = businessData.colors || {};
    
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${this.generateSEOTags(businessData, seo)}
    ${this.generateTrackingScripts(seo)}
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        /* Image Loading States */
        .image-loading {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        
        .image-error {
            background: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #999;
            font-size: 0.9rem;
        }
        
        /* Navigation */
        .navbar {
            position: fixed;
            top: 0;
            width: 100%;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            z-index: 1000;
            padding: 1rem 0;
            box-shadow: 0 2px 20px rgba(0,0,0,0.1);
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
            font-weight: bold;
            color: ${(customColors as any)?.primary || businessData.colors.primary};
        }
        
        .logo-image {
            width: 45px;
            height: 45px;
            object-fit: cover;
            border-radius: 50%;
            aspect-ratio: 1/1;
        }
        
        .logo-fallback {
            width: 45px;
            height: 45px;
            background: ${businessData.colors.primary};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            aspect-ratio: 1/1;
            font-size: 1.2rem;
        }
        
        .nav-links {
            display: flex;
            list-style: none;
            gap: 2rem;
        }
        
        .nav-links a {
            text-decoration: none;
            color: #333;
            font-weight: 500;
            transition: color 0.3s;
        }
        
        .nav-links a:hover {
            color: ${(customColors as any)?.primary || businessData.colors.primary};
        }
        
        .mobile-menu {
            display: none;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
        }
        
        /* Sections */
        .section {
            min-height: 100vh;
            display: flex;
            align-items: center;
            padding: 2rem 0;
            position: relative;
        }
        
        .section:nth-child(even) {
            background: #f8f9fa;
        }
        
        /* Hero Section - Improved background handling */
        .hero {
            position: relative;
            color: white;
            text-align: center;
            min-height: 100vh;
            background-color: #1a1a1a;
            overflow: hidden;
        }
        
        .hero-bg {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: url('${images.hero}');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            z-index: 1;
            transition: opacity 0.5s ease;
        }
        
        .hero-bg.loading {
            background-image: none;
            background: linear-gradient(45deg, #1a1a1a, #333, #1a1a1a);
            background-size: 400% 400%;
            animation: gradientShift 3s ease infinite;
        }
        
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        .hero-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 2;
        }
        
        .hero .container {
            position: relative;
            z-index: 3;
        }
        
        .hero-content h1 {
            font-size: 3.5rem;
            margin-bottom: 1rem;
            animation: fadeInUp 1s ease-out;
        }
        
        .hero-content p {
            font-size: 1.3rem;
            margin-bottom: 2rem;
            animation: fadeInUp 1s ease-out 0.3s both;
        }
        
        .cta-button {
            display: inline-block;
            background: ${(customColors as any)?.primary || businessData.colors.primary};
            color: white;
            padding: 1rem 2rem;
            text-decoration: none;
            border-radius: 50px;
            font-weight: bold;
            font-size: 1.1rem;
            transition: all 0.3s;
            animation: fadeInUp 1s ease-out 0.6s both;
        }
        
        .cta-button:hover {
            background: ${(customColors as any)?.accent || businessData.colors.accent};
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        /* Two Column Layout */
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
        
        /* Content Styling */
        .section-title {
            font-size: 2.5rem;
            margin-bottom: 1.5rem;
            color: ${(customColors as any)?.primary || businessData.colors.primary};
        }
        
        .section-text {
            font-size: 1.1rem;
            color: #666;
            margin-bottom: 2rem;
        }
        
        .feature-image {
            width: 100%;
            height: 400px;
            object-fit: cover;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            background: #f5f5f5;
        }
        
        /* Background Image Sections with better fallbacks */
        .bg-image-section {
            position: relative;
            background-color: #333;
        }
        
        .bg-section-bg {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            z-index: 0;
        }
        
        .bg-section-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.6);
            z-index: 1;
        }
        
        .bg-image-section .container {
            position: relative;
            z-index: 2;
        }
        
        .bg-image-section .section-content {
            color: white;
            text-align: center;
        }
        
        /* Centered Sections */
        .centered-section {
            text-align: center;
            padding: 4rem 0;
        }
        
        .centered-section .section-title {
            margin-bottom: 2rem;
        }
        
        .centered-section .section-text {
            max-width: 800px;
            margin: 0 auto 2rem;
            font-size: 1.2rem;
        }
        
        /* Investment Section */
        .investment-section {
            position: relative;
            color: white;
            text-align: center;
            background-color: #1a1a1a;
        }
        
        .investment-bg {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: url('${images.investment}');
            background-size: cover;
            background-position: center;
            z-index: 1;
        }
        
        .investment-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            z-index: 2;
        }
        
        .investment-section .container {
            position: relative;
            z-index: 3;
        }
        
        .price-highlight {
            background: ${(customColors as any)?.accent || businessData.colors.accent};
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 25px;
            display: inline-block;
            margin: 1rem 0;
            font-size: 1.3rem;
            font-weight: bold;
        }
        
        /* Footer */
        .footer {
            background: #2a2a2a;
            color: white;
            padding: 3rem 0 1rem;
        }
        
        .footer-content {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            gap: 3rem;
            margin-bottom: 2rem;
        }
        
        .footer-logo {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
            font-size: 1.3rem;
            font-weight: bold;
        }
        
        .footer-logo-image {
            width: 40px;
            height: 40px;
            object-fit: cover;
            border-radius: 50%;
            aspect-ratio: 1/1;
        }
        
        .footer-logo-fallback {
            width: 40px;
            height: 40px;
            background: ${businessData.colors.primary};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            aspect-ratio: 1/1;
            font-size: 1rem;
        }
        
        .footer-section h4 {
            color: ${businessData.colors.primary};
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }
        
        .footer-section p, 
        .footer-section a {
            color: #ccc;
            margin-bottom: 0.5rem;
            text-decoration: none;
            font-size: 0.9rem;
        }
        
        .footer-section a:hover {
            color: ${businessData.colors.primary};
        }
        
        .social-links {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
        }
        
        .social-link {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 35px;
            height: 35px;
            background: #444;
            border-radius: 50%;
            color: white;
            text-decoration: none;
            transition: all 0.3s;
        }
        
        .social-link:hover {
            background: ${businessData.colors.primary};
            transform: translateY(-2px);
        }
        
        .footer-bottom {
            border-top: 1px solid #444;
            padding-top: 1rem;
            text-align: center;
            font-size: 0.8rem;
            color: #999;
        }
        
        .footer-links {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-bottom: 1rem;
        }
        
        .footer-links a {
            color: #ccc;
            text-decoration: none;
            font-size: 0.8rem;
        }
        
        .footer-links a:hover {
            color: ${businessData.colors.primary};
        }
        
        /* PageJet Signature */
        .pagejet-signature {
            background: #000;
            padding: 15px 0;
            border-top: 2px solid #333;
        }
        
        .pagejet-content {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            color: #fff;
            font-size: 14px;
        }
        
        .pagejet-logo {
            width: 32px;
            height: 32px;
            object-fit: contain;
            border-radius: 6px;
        }
        
        .pagejet-content strong {
            color: #ff6b35;
            font-weight: 600;
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
        
        .fade-in {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease-out;
        }
        
        .fade-in.visible {
            opacity: 1;
            transform: translateY(0);
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
            .nav-links {
                display: none;
                position: absolute;
                top: 100%;
                left: 0;
                width: 100%;
                background: white;
                flex-direction: column;
                padding: 1rem;
                box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            }
            
            .nav-links.active {
                display: flex;
            }
            
            .mobile-menu {
                display: block;
            }
            
            .hero-content h1 {
                font-size: 2.5rem;
            }
            
            .two-columns {
                grid-template-columns: 1fr;
                gap: 2rem;
            }
            
            .section-title {
                font-size: 2rem;
            }
            
            .footer-content {
                grid-template-columns: 1fr;
                gap: 2rem;
                text-align: center;
            }
            
            .social-links {
                justify-content: center;
            }
            
            .footer-links {
                flex-direction: column;
                gap: 1rem;
            }
            .container {
                padding: 0 15px;
            }
        }
    </style>
</head>
<body>
    ${seo?.googleTagManagerId ? `
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${seo.googleTagManagerId}"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>` : ''}

    <nav class="navbar">
        <div class="container">
            <div class="nav-content">
                <div class="logo">
                    <img src="${images.logo}" alt="Logo ${businessData.title}" class="logo-image" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="logo-fallback" style="display:none;">${businessData.title.charAt(0).toUpperCase()}</div>
                    <span>${businessData.title}</span>
                </div>
                <ul class="nav-links" id="navLinks">
                    <li><a href="#intro">Início</a></li>
                    <li><a href="#motivation">Sobre</a></li>
                    <li><a href="#target">Público</a></li>
                    <li><a href="#method">Como Funciona</a></li>
                    <li><a href="#results">Resultados</a></li>
                    <li><a href="#access">Contato</a></li>
                    <li><a href="#investment">Preços</a></li>
                </ul>
                <button class="mobile-menu" onclick="toggleMenu()">☰</button>
            </div>
        </div>
    </nav>

    <!-- Intro Section (Hero) -->
    <section id="intro" class="section hero">
        <div class="hero-bg" id="heroBg"></div>
        <div class="hero-overlay"></div>
        <div class="container">
            <div class="hero-content">
                <h1>${businessData.sections[0]?.title || businessData.title}</h1>
                <p>${businessData.heroText}</p>
                <a href="#investment" class="cta-button">${businessData.ctaText}</a>
            </div>
        </div>
    </section>

    ${this.generateSectionsHTML(businessData, images)}

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <!-- Empresa -->
                <div class="footer-section">
                    <div class="footer-logo">
                        <img src="${images.logo}" alt="Logo ${businessData.title}" class="footer-logo-image" 
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="footer-logo-fallback" style="display:none;">${businessData.title.charAt(0).toUpperCase()}</div>
                        <span>${businessData.title}</span>
                    </div>
                    <p>${businessData.subtitle}</p>
                    <div class="social-links">
                        ${businessData.contact.socialMedia.whatsapp ? 
                            `<a href="https://wa.me/${businessData.contact.socialMedia.whatsapp.replace(/\D/g, '')}" class="social-link" target="_blank">📱</a>` : ''}
                        ${businessData.contact.socialMedia.instagram ? 
                            `<a href="https://instagram.com/${businessData.contact.socialMedia.instagram.replace('@', '')}" class="social-link" target="_blank">📷</a>` : ''}
                        ${businessData.contact.socialMedia.facebook ? 
                            `<a href="${businessData.contact.socialMedia.facebook}" class="social-link" target="_blank">📘</a>` : ''}
                    </div>
                </div>
                
                <!-- Contato -->
                <div class="footer-section">
                    <h4>Contato</h4>
                    <p>📧 ${businessData.contact.email}</p>
                    <p>📞 ${businessData.contact.phone}</p>
                    <p>📍 ${businessData.contact.address}</p>
                </div>
                
                <!-- Links Úteis -->
                <div class="footer-section">
                    <h4>Links Úteis</h4>
                    <a href="#intro">Início</a>
                    <a href="#motivation">Sobre</a>
                    <a href="#access">Contato</a>
                    <a href="#investment">Preços</a>
                </div>
            </div>
            
            <div class="footer-bottom">
                <div class="footer-links">
                    <a href="#" onclick="openPrivacyPolicy()">Política de Privacidade</a>
                    <a href="#" onclick="openTerms()">Termos de Uso</a>
                    <a href="#" onclick="openLGPD()">LGPD</a>
                </div>
                <p>&copy; 2024 ${businessData.title}. Todos os direitos reservados.</p>
            </div>
        </div>
        
        <!-- PageJet Signature -->
        <div class="pagejet-signature">
            <div class="container">
                <div class="pagejet-content">
                    <img src="/images/mascote-pagejet.png" alt="PageJet Mascot" class="pagejet-logo" 
                         onerror="this.style.display='none';">
                    <span>Criado com <strong>PageJet</strong></span>
                </div>
            </div>
        </div>
    </footer>

    ${this.generateChatScript(businessData)}

    <!-- Custom Body Tags -->
    ${seo?.customBodyTags || ''}

    <script>
        // Image loading diagnostics
        function testImageLoad(src, callback) {
            const img = new Image();
            img.onload = () => callback(true);
            img.onerror = () => callback(false);
            img.src = src;
        }

        // Test hero background
        const heroBg = document.getElementById('heroBg');
        const heroImageUrl = '${images.hero}';
        
        heroBg.classList.add('loading');
        testImageLoad(heroImageUrl, (loaded) => {
            if (loaded) {
                heroBg.classList.remove('loading');
                heroBg.style.backgroundImage = \`url('\${heroImageUrl}')\`;
                console.log('Hero image loaded successfully');
            } else {
                console.error('Hero image failed to load:', heroImageUrl);
            }
        });

        // Test investment background
        const investmentBg = document.querySelector('.investment-bg');
        const investmentImageUrl = '${images.investment}';
        
        testImageLoad(investmentImageUrl, (loaded) => {
            if (loaded) {
                investmentBg.style.backgroundImage = \`url('\${investmentImageUrl}')\`;
                console.log('Investment image loaded successfully');
            } else {
                console.error('Investment image failed to load:', investmentImageUrl);
            }
        });

        // Mobile menu toggle
        function toggleMenu() {
            const navLinks = document.getElementById('navLinks');
            navLinks.classList.toggle('active');
        }

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

        // Fade in animation on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });

        // Console log all image URLs for debugging
        console.log('All image URLs:', {
            hero: '${images.hero}',
            motivation: '${images.motivation}',
            target: '${images.target}',
            method: '${images.method}',
            results: '${images.results}',
            access: '${images.access}',
            investment: '${images.investment}'
         });
         
         // Privacy Policy Functions
         function openPrivacyPolicy() {
             alert('Política de Privacidade\\n\\nA ${businessData.title} está comprometida com a proteção da sua privacidade e com o cumprimento da LGPD.\\n\\nPara mais informações, entre em contato: ${businessData.contact.email}');
         }
         
         function openTerms() {
             alert('Termos de Uso\\n\\nAo utilizar nossos serviços, você concorda com nossos termos.\\n\\nPara mais informações: ${businessData.contact.email}');
         }
         
         function openLGPD() {
             alert('Lei Geral de Proteção de Dados (LGPD)\\n\\nSeus dados são protegidos conforme a LGPD Lei 13.709/2018.\\n\\nVocê tem direito a: confirmação, acesso, correção, anonimização, portabilidade, eliminação, oposição e revogação.\\n\\nContato: ${businessData.contact.email}');
         }
    </script>
</body>
</html>`;
  }

  private async generateImageUrls(images: any, customImages?: { [key: string]: string }): Promise<any> {
    const baseUrl = 'https://image.pollinations.ai/prompt/';
    const imageParams = '?width=1200&height=800&enhance=true&nologo=true';
    
    // Garantir que logo existe, se não existir, criar um padrão
    const logoPrompt = images.logo || `Logo da empresa ${images.hero || 'negócio profissional'}`;
    
    console.log('Generating image URLs:', { images, customImages, logoPrompt });
    
    const imageUrls = {
      logo: customImages?.logo || `${baseUrl}${encodeURIComponent(logoPrompt)}${imageParams}`,
      hero: customImages?.hero || `${baseUrl}${encodeURIComponent(images.hero)}${imageParams}`,
      motivation: customImages?.motivation || `${baseUrl}${encodeURIComponent(images.motivation)}${imageParams}`,
      target: customImages?.target || `${baseUrl}${encodeURIComponent(images.target)}${imageParams}`,
      method: customImages?.method || `${baseUrl}${encodeURIComponent(images.method)}${imageParams}`,
      results: customImages?.results || `${baseUrl}${encodeURIComponent(images.results)}${imageParams}`,
      access: customImages?.access || `${baseUrl}${encodeURIComponent(images.access)}${imageParams}`,
      investment: customImages?.investment || `${baseUrl}${encodeURIComponent(images.investment)}${imageParams}`
    };

    // Converter imagens para base64 se forem URLs de IA
    const convertedImages: any = {};
    for (const [key, url] of Object.entries(imageUrls)) {
      if (typeof url === 'string' && url.includes('pollinations.ai')) {
        try {
          convertedImages[key] = await this.convertImageToBase64(url);
        } catch (error) {
          console.warn(`Failed to convert ${key} to base64, using original URL`, error);
          convertedImages[key] = url;
        }
      } else {
        convertedImages[key] = url;
      }
    }

    return convertedImages;
  }

  private ensureDataIntegrity(businessData: BusinessContent): BusinessContent {
    // Garantir que contact existe
    const contact = businessData.contact || {
      email: 'contato@empresa.com',
      phone: '(11) 99999-9999',
      address: 'Endereço da empresa',
      socialMedia: {
        whatsapp: '11999999999',
        instagram: '@empresa',
        facebook: 'facebook.com/empresa'
      }
    };

    // Garantir que images.logo existe
    const images = {
      ...businessData.images,
      logo: businessData.images.logo || `Logo da empresa ${businessData.title}`
    };

    console.log('Data integrity check:', { 
      hasContact: !!businessData.contact, 
      hasLogo: !!businessData.images.logo,
      ensuredContact: contact,
      ensuredLogo: images.logo
    });

    return {
      ...businessData,
      contact,
      images
    };
  }

  private generateChatScript(businessData: BusinessContent): string {
    return `
    <!-- Chat Widget -->
    <div id="chatWidget" style="position: fixed; bottom: 20px; right: 20px; z-index: 10000;">
        <div id="chatButton" onclick="toggleChat()" style="
            width: 60px; 
            height: 60px; 
            background: ${businessData.colors.primary}; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            cursor: pointer; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            color: white;
            font-size: 24px;
        ">💬</div>
        
        <div id="chatBox" style="
            width: 350px; 
            height: 500px; 
            background: white; 
            border-radius: 15px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.3); 
            display: none; 
            flex-direction: column; 
            position: absolute; 
            bottom: 70px; 
            right: 0;
        ">
            <div style="
                background: ${businessData.colors.primary}; 
                color: white; 
                padding: 15px; 
                border-radius: 15px 15px 0 0; 
                font-weight: bold;
            ">
                ${businessData.sellerbot.name} - ${businessData.title}
            </div>
            
            <div id="chatMessages" style="
                flex: 1; 
                padding: 15px; 
                overflow-y: auto; 
                max-height: 350px;
            "></div>
            
            <div style="padding: 15px; border-top: 1px solid #eee;">
                <div style="display: flex; gap: 10px;">
                    <input type="text" id="chatInput" placeholder="Digite sua mensagem..." style="
                        flex: 1; 
                        padding: 10px; 
                        border: 1px solid #ddd; 
                        border-radius: 20px; 
                        outline: none;
                    " onkeypress="if(event.key==='Enter') sendMessage()">
                    <button onclick="sendMessage()" style="
                        background: ${businessData.colors.primary}; 
                        color: white; 
                        border: none; 
                        border-radius: 50%; 
                        width: 40px; 
                        height: 40px; 
                        cursor: pointer;
                    ">➤</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        let chatOpen = false;
        const businessData = ${JSON.stringify(businessData)};

        function toggleChat() {
            const chatBox = document.getElementById('chatBox');
            chatOpen = !chatOpen;
            chatBox.style.display = chatOpen ? 'flex' : 'none';
            
            if (chatOpen && document.getElementById('chatMessages').children.length === 0) {
                addMessage('bot', businessData.sellerbot.responses.greeting);
            }
        }

        function openChat() {
            if (!chatOpen) {
                toggleChat();
            }
        }

        function addMessage(sender, message) {
            const messagesDiv = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.style.cssText = \`
                margin-bottom: 10px; 
                padding: 10px; 
                border-radius: 15px; 
                max-width: 80%;
                \${sender === 'bot' ? 
                    \`background: #f0f0f0; align-self: flex-start;\` : 
                    \`background: \${businessData.colors.primary}; color: white; align-self: flex-end; margin-left: auto;\`
                }
            \`;
            messageDiv.textContent = message;
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        async function sendMessage() {
            const input = document.getElementById('chatInput');
            const message = input.value.trim();
            if (!message) return;

            addMessage('user', message);
            input.value = '';

            try {
                const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer eAa9Xuf7IpJElU8coKj3YWRtTLFU9tYl'
                    },
                    body: JSON.stringify({
                        model: 'mistral-large-latest',
                        messages: [{
                            role: 'user',
                            content: \`Você é \${businessData.sellerbot.name}, assistente específico do negócio: \${businessData.title}.

Personalidade: \${businessData.sellerbot.personality}
Conhecimentos: \${businessData.sellerbot.knowledge.join(", ")}

INFORMAÇÕES DO NEGÓCIO:
- Endereço: \${businessData.contact.address}
- Telefone: \${businessData.contact.phone}
- Email: \${businessData.contact.email}
- WhatsApp: \${businessData.contact.socialMedia.whatsapp || 'Não informado'}

INSTRUÇÕES CRÍTICAS:
- Responda APENAS sobre o negócio específico: \${businessData.title}
- Use as informações de contato quando relevante
- Mantenha o foco nos produtos/serviços do negócio
- Seja natural e útil, evite respostas robóticas
- Máximo 250 caracteres para manter fluidez

Mensagem do cliente: "\${message}"\`
                        }],
                        temperature: 0.7,
                        max_tokens: 300
                    })
                });

                const data = await response.json();
                const botMessage = data.choices[0].message.content;
                addMessage('bot', botMessage);
            } catch (error) {
                addMessage('bot', businessData.sellerbot.responses.greeting);
            }
        }
    </script>`;
  }

  private generateSectionsHTML(businessData: BusinessContent, images: any): string {
    const sections = businessData.sections.slice(1); // Pular a primeira seção (hero)
    let html = '';

    sections.forEach((section, index) => {
      const sectionId = section.id || section.type;
      const isEven = index % 2 === 0;
      const imageKey = this.getImageKeyForSection(section.type);
      const sectionImage = images[imageKey];

      switch (section.type) {
        case 'motivation':
          html += `
          <!-- ${section.title} Section -->
          <section id="${sectionId}" class="section">
              <div class="container">
                  <div class="two-columns">
                      <div class="section-content fade-in">
                          <h2 class="section-title">${section.title}</h2>
                          <p class="section-text">${section.content}</p>
                      </div>
                      <div class="fade-in">
                          <img src="${sectionImage}" alt="${section.title}" class="feature-image" 
                               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                          <div class="image-error feature-image" style="display:none;">
                              🖼️ Imagem não carregou
                          </div>
                      </div>
                  </div>
              </div>
          </section>`;
          break;

        case 'target':
          html += `
          <!-- ${section.title} Section -->
          <section id="${sectionId}" class="section bg-image-section">
              <div class="bg-section-bg" style="background-image: url('${sectionImage}')"></div>
              <div class="bg-section-overlay"></div>
              <div class="container">
                  <div class="section-content fade-in">
                      <h2 class="section-title">${section.title}</h2>
                      <p class="section-text">${section.content}</p>
                  </div>
              </div>
          </section>`;
          break;

        case 'method':
          html += `
          <!-- ${section.title} Section -->
          <section id="${sectionId}" class="section">
              <div class="container">
                  <div class="two-columns reverse">
                      <div class="section-content fade-in">
                          <h2 class="section-title">${section.title}</h2>
                          <p class="section-text">${section.content}</p>
                      </div>
                      <div class="fade-in">
                          <img src="${sectionImage}" alt="${section.title}" class="feature-image"
                               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                          <div class="image-error feature-image" style="display:none;">
                              🖼️ Imagem não carregou
                          </div>
                      </div>
                  </div>
              </div>
          </section>`;
          break;

        case 'results':
          html += `
          <!-- ${section.title} Section -->
          <section id="${sectionId}" class="section centered-section">
              <div class="container">
                  <div class="fade-in">
                      <h2 class="section-title">${section.title}</h2>
                      <p class="section-text">${section.content}</p>
                      <img src="${sectionImage}" alt="${section.title}" class="feature-image" 
                           style="max-width: 600px; margin: 2rem auto;"
                           onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                      <div class="image-error feature-image" style="display:none; max-width: 600px; margin: 2rem auto;">
                          🖼️ Imagem não carregou
                      </div>
                  </div>
              </div>
          </section>`;
          break;

        case 'access':
          html += `
          <!-- ${section.title} Section -->
          <section id="${sectionId}" class="section">
              <div class="container">
                  <div class="two-columns">
                      <div class="section-content fade-in">
                          <h2 class="section-title">${section.title}</h2>
                          <p class="section-text">${section.content}</p>
                      </div>
                      <div class="fade-in">
                          <img src="${sectionImage}" alt="${section.title}" class="feature-image"
                               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                          <div class="image-error feature-image" style="display:none;">
                              🖼️ Imagem não carregou
                          </div>
                      </div>
                  </div>
              </div>
          </section>`;
          break;

        case 'investment':
          html += `
          <!-- ${section.title} Section -->
          <section id="${sectionId}" class="section investment-section">
              <div class="investment-bg" style="background-image: url('${sectionImage}')"></div>
              <div class="investment-overlay"></div>
              <div class="container">
                  <div class="fade-in">
                      <h2 class="section-title">${section.title}</h2>
                      <p class="section-text">${section.content}</p>
                      <div class="price-highlight">Consulte nossos preços!</div>
                      <a href="#" class="cta-button" onclick="openChat()">${businessData.ctaText}</a>
                  </div>
              </div>
          </section>`;
          break;

        default:
          // Para seções customizadas ou desconhecidas
          html += `
          <!-- ${section.title} Section -->
          <section id="${sectionId}" class="section ${isEven ? '' : 'bg-image-section'}">
              ${isEven ? '' : '<div class="bg-section-overlay"></div>'}
              <div class="container">
                  <div class="section-content fade-in">
                      <h2 class="section-title">${section.title}</h2>
                      <p class="section-text">${section.content}</p>
                  </div>
              </div>
          </section>`;
          break;
      }
    });

    return html;
  }

  private getImageKeyForSection(sectionType: string): string {
    const imageMap: { [key: string]: string } = {
      'motivation': 'motivation',
      'target': 'target',
      'method': 'method',
      'results': 'results',
      'access': 'access',
      'investment': 'investment',
      'intro': 'hero'
    };
    
    return imageMap[sectionType] || 'hero';
  }
}

export const landingPageBuilder = new LandingPageBuilder();