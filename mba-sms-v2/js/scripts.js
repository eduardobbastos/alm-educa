/**
 * MBA SMS Óleo e Gás - Versão 2 (Imersiva com Plataforma Offshore)
 * Efeitos: Parallax Suave no Fundo, Google Ads Tracking, FormSubmit com Timeout Seguro
 */

document.addEventListener('DOMContentLoaded', () => {
  initParallaxBackground();
  initTrackingParams();
  initFormLead();
  initCopyCoupon();
  initAccordion();
  initWhatsAppTracking();
});

/* ============================================================
   1. PARALLAX SUAVE E EFEITO CINEMATOGRÁFICO DE SCROLL
   ============================================================ */
function initParallaxBackground() {
  const bgImg = document.getElementById('bgOffshoreImg');
  if (!bgImg) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        // Parallax sutil no eixo Y e zoom lento conforme desce
        const translateY = scrollY * 0.12; 
        const scale = 1.03 + Math.min(scrollY * 0.00008, 0.15);

        bgImg.style.transform = `translate3d(0, -${translateY}px, 0) scale(${scale})`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ============================================================
   2. GESTÃO E PRESERVAÇÃO DE PARÂMETROS UTM & GCLID
   ============================================================ */
function initTrackingParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const trackingKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'];

  trackingKeys.forEach(key => {
    if (urlParams.has(key)) {
      sessionStorage.setItem(key, urlParams.get(key));
    }
  });
}

function getStoredTrackingParams() {
  const params = new URLSearchParams();
  const trackingKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'];

  trackingKeys.forEach(key => {
    const val = sessionStorage.getItem(key);
    if (val) params.set(key, val);
  });

  return params;
}

/* ============================================================
   3. FORMULÁRIO DE CAPTURA COM TIMEOUT SEGURO & GTAG
   ============================================================ */
function initFormLead() {
  const form = document.getElementById('leadForm');
  const whatsappInput = document.getElementById('whatsapp');

  // Máscara de Telefone/WhatsApp (XX) XXXXX-XXXX
  if (whatsappInput) {
    whatsappInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').slice(0, 11);
      if (val.length > 2) val = '(' + val.slice(0, 2) + ') ' + val.slice(2);
      if (val.length > 9) val = val.slice(0, 9) + '-' + val.slice(9, 14);
      e.target.value = val;
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nome = form.nome.value.trim();
      const email = form.email.value.trim();
      const whatsapp = form.whatsapp ? form.whatsapp.value.trim() : '';
      const empresa = form.empresa ? form.empresa.value.trim() : '';

      if (!nome || !email) {
        alert('Por favor, preencha os campos obrigatórios (Nome e E-mail).');
        return;
      }

      // Feedback visual no botão
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.innerHTML = '⏳ Processando Inscrição...';
      submitBtn.disabled = true;

      // 1. Disparo de Conversão no Google Ads (Enhanced Conversions)
      if (typeof gtag === 'function') {
        gtag('set', 'user_data', {
          email: email,
          phone_number: whatsapp ? '+55' + whatsapp.replace(/\D/g, '') : undefined
        });
        gtag('event', 'conversion', {
          'send_to': 'AW-17289682652/dif2COrE4_gcENy9rrRA'
        });
      }

      // 2. Montar URL de Redirecionamento para o Checkout Voomp com Parâmetros
      const checkoutBaseUrl = form.getAttribute('action') || 'https://pay.voompcreators.com.br/16283';
      const checkoutUrl = new URL(checkoutBaseUrl);

      checkoutUrl.searchParams.set('nome', nome);
      checkoutUrl.searchParams.set('email', email);
      if (whatsapp) checkoutUrl.searchParams.set('whatsapp', whatsapp.replace(/\D/g, ''));
      if (empresa) checkoutUrl.searchParams.set('empresa', empresa);

      // Preservar UTMs e gclid
      const storedParams = getStoredTrackingParams();
      for (const [k, v] of storedParams) {
        checkoutUrl.searchParams.set(k, v);
      }

      // 3. Envio Assíncrono para o e-mail via FormSubmit com Timeout de 1.5s
      const emailPayload = {
        Nome: nome,
        Email: email,
        WhatsApp: whatsapp,
        Empresa: empresa,
        Curso: "MBA SMS na Indústria de Petróleo e Gás Natural (V2 Imersiva)",
        _subject: "🔥 Nova Inscrição MBA SMS (V2) - ALM Educa",
        _template: "table"
      };

      const sendEmailPromise = fetch('https://formsubmit.co/ajax/alm@almeduca.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      });

      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 1500));

      Promise.race([sendEmailPromise, timeoutPromise])
        .then(() => {
          window.location.href = checkoutUrl.toString();
        })
        .catch((err) => {
          console.warn('Fallback de envio do formulário:', err);
          window.location.href = checkoutUrl.toString();
        });
    });
  }
}

/* ============================================================
   4. BOTÃO COPIAR CUPOM PROMOCIONAL COM FEEDBACK
   ============================================================ */
function initCopyCoupon() {
  const copyBtn = document.getElementById('btnCopyCoupon');
  const couponInput = document.getElementById('couponCode');

  if (copyBtn && couponInput) {
    copyBtn.addEventListener('click', () => {
      couponInput.select();
      navigator.clipboard.writeText(couponInput.value).then(() => {
        const originalText = copyBtn.innerText;
        copyBtn.innerText = 'Copiado! ✓';
        copyBtn.style.backgroundColor = '#28a745';
        setTimeout(() => {
          copyBtn.innerText = originalText;
          copyBtn.style.backgroundColor = '';
        }, 2500);
      }).catch(() => {
        alert('Código do cupom: ' + couponInput.value);
      });
    });
  }
}

/* ============================================================
   5. ACORDEÃO PARA A GRADE CURRICULAR (UX MOBILE-FIRST)
   ============================================================ */
function initAccordion() {
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isActive = item.classList.contains('active');

      document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));

      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* ============================================================
   6. RASTREAMENTO DE CLIQUES EM BOTÕES DO WHATSAPP
   ============================================================ */
function initWhatsAppTracking() {
  const whatsappButtons = document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"], .btn-whatsapp-track');

  whatsappButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (typeof gtag === 'function') {
        gtag('event', 'conversion', {
          'send_to': 'AW-17289682652/O3KoCOql4PgcENy9rrRA',
          'event_category': 'Engagement',
          'event_label': btn.getAttribute('data-origin') || 'WhatsApp CTA'
        });
      }
    });
  });
}

