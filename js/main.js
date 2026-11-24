document.addEventListener("DOMContentLoaded", () => {
  // =========================================================================
  // 1. REGISTRO DE PLUGINS Y LENIS (SMOOTH SCROLL)
  // =========================================================================
  if (typeof gsap !== "undefined" && typeof DrawSVGPlugin !== "undefined") {
    gsap.registerPlugin(DrawSVGPlugin);
  }

  const rootEl = document.documentElement;
  const bodyEl = document.body;
  const curtainEl = document.querySelector(".cortinilla");

  // Bloquear scroll desde el inicio mientras dura la cortinilla
  rootEl.classList.add("is-locked");
  bodyEl.classList.add("is-locked");

  const lenis = typeof Lenis !== "undefined"
    ? new Lenis({
        duration: 1.15,
        smoothWheel: true
      })
    : null;

  if (lenis) {
    lenis.stop();
    if (typeof gsap !== "undefined") {
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  function unlockScroll() {
    rootEl.classList.remove("is-locked");
    bodyEl.classList.remove("is-locked");
    if (lenis) {
      lenis.start();
    }
  }

  // =========================================================================
  // 2. CORTINILLA INICIAL Y ANIMACIÓN DEL SVG
  // =========================================================================
  if (curtainEl) {
    curtainEl.removeAttribute("hidden");
  }

  if (typeof gsap !== "undefined" && document.querySelector("#svg-stage")) {
    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" }
    });

    tl.set("#svg-stage", { opacity: 1 })
      .from("#svg-stage path", {
        drawSVG: "0%",
        duration: 2.2,
        stagger: 0.08
      })
      .to("#svg-stage", {
        scale: 1.05,
        duration: 0.35,
        ease: "power2.out"
      })
      .to(".cortinilla", {
        yPercent: -100,
        duration: 1.1,
        ease: "expo.inOut",
        onComplete: () => {
          gsap.set(".cortinilla", { display: "none", pointerEvents: "none" });
          unlockScroll();
        }
      }, "+=0.15");
  } else {
    unlockScroll();
  }

  // =========================================================================
  // 3. HELPER DE ANIMACIÓN AL HACER CLICK EN BOTONES DEL HEADER
  // =========================================================================
  function triggerClickAnim(btn) {
    if (!btn) return;
    btn.classList.remove("is-animating");
    void btn.offsetWidth; // Reinicia la animación CSS
    btn.classList.add("is-animating");
  }

  // =========================================================================
  // 4. MODO CLARO / OSCURO
  // =========================================================================
  const themeToggle = document.getElementById("theme-toggle");

  function applyTheme(theme) {
    rootEl.setAttribute("data-theme", theme);
    localStorage.setItem("site-theme", theme);
  }

  const savedTheme = localStorage.getItem("site-theme") || "dark";
  applyTheme(savedTheme);

  themeToggle?.addEventListener("click", () => {
    const currentTheme = rootEl.getAttribute("data-theme") || "dark";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    triggerClickAnim(themeToggle);
  });

  // =========================================================================
  // 5. CAMBIO DE IDIOMA (ES / EN)
  // =========================================================================
  const langToggle = document.getElementById("lang-toggle");
  const langLabel = document.getElementById("lang-label");

  const translations = {
    es: {
      projects: "Proyectos",
      archive: "Archive",
      about: "Sobre mí",
      contact: "Contacto"
    },
    en: {
      projects: "Projects",
      archive: "Archive",
      about: "About me",
      contact: "Contact"
    }
  };

  function setLanguage(lang) {
    const dict = translations[lang] || translations.es;
    rootEl.lang = lang;
    localStorage.setItem("site-lang", lang);

    if (langLabel) {
      langLabel.textContent = lang.toUpperCase();
    }

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key] !== undefined) {
        el.textContent = dict[key];
        el.style.opacity = "1";
      }
    });
  }

  const savedLang = localStorage.getItem("site-lang") || "es";
  setLanguage(savedLang);

  langToggle?.addEventListener("click", () => {
    const activeLang = localStorage.getItem("site-lang") || "es";
    const nextLang = activeLang === "es" ? "en" : "es";
    setLanguage(nextLang);
    triggerClickAnim(langToggle);
  });
});




// =========================================================================
// 6. ANIMACIÓN DE ENTRADA DE ELEMENTOS AL HACER SCROLL
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const boxContainer = document.querySelector(".box-container");
  const items = gsap.utils.toArray(".box-container .item");
  const allCheck = document.getElementById("all");
  const filterChecks = Array.from(document.querySelectorAll(".checkboxes .filter"));

  if (!boxContainer || !items.length || typeof gsap === "undefined") return;

  let topZ = 10;

  function accumulateItems(targetItems) {
    targetItems.forEach((el, idx) => {
      const offsetX = ((idx % 3) - 1) * 14 + ((idx * 7) % 11) - 5;
      const offsetY = ((idx % 4) - 1.5) * 10;
      const rot = ((idx % 2.5) - 2) * 2.2;

      gsap.to(el, {
        x: offsetX,
        y: offsetY,
        rotation: rot,
        scale: 1,
        opacity: 1,
        duration: 0.55,
        delay: idx * 0.03,
        ease: "back.out(1.3)",
        clearProps: "visibility"
      });
    });
  }

  // Acumulación inicial
  accumulateItems(items);

  // Al pasar el ratón o hacer clic, la pieza sube al frente y se endereza
  items.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      topZ += 1;
      el.style.zIndex = String(topZ);
      gsap.to(el, {
        scale: 1.08,
        rotation: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    });

    el.addEventListener("mouseleave", () => {
      const idx = items.indexOf(el);
      const offsetX = ((idx % 3) - 1) * 14 + ((idx * 7) % 11) - 5;
      const offsetY = ((idx % 4) - 1.5) * 10;
      const rot = ((idx % 5) - 2) * 2.2;

      gsap.to(el, {
        x: offsetX,
        y: offsetY,
        rotation: rot,
        scale: 1,
        duration: 0.35,
        ease: "power2.inOut"
      });
    });
  });

  // Filtrado por checkboxes manteniendo la acumulación sin huecos
  function applyFilters() {
    const activeClasses = filterChecks
      .filter((chk) => chk.checked)
      .map((chk) => chk.id);

    const visible = [];
    const hidden = [];

    items.forEach((el) => {
      const matches =
        (allCheck && allCheck.checked) ||
        activeClasses.some((cls) => el.classList.contains(cls));

      if (matches) {
        el.style.display = "block";
        visible.push(el);
      } else {
        hidden.push(el);
      }
    });

    hidden.forEach((el) => {
      gsap.to(el, {
        opacity: 0,
        scale: 0.85,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          el.style.display = "none";
        }
      });
    });

    accumulateItems(visible);
  }

  allCheck?.addEventListener("change", () => {
    if (allCheck.checked) {
      filterChecks.forEach((chk) => (chk.checked = true));
    }
    applyFilters();
  });

  filterChecks.forEach((chk) => {
    chk.addEventListener("change", () => {
      if (!chk.checked && allCheck) {
        allCheck.checked = false;
      } else if (allCheck && filterChecks.every((c) => c.checked)) {
        allCheck.checked = true;
      }
      applyFilters();
    });
  });
});






















// =========================================================================
// PORTADA TIPO CARTEL: ELEMENTOS FIJOS MIENTRAS OTROS APARECEN CON SCROLL
// =========================================================================
// =========================================================================
// PORTADA TIPO CARTEL: IMAGEN PRINCIPAL CRECE CON EL SCROLL + APARICIONES
// =========================================================================
const posterHero = document.querySelector(".poster-hero");
const posterPin = document.querySelector(".poster-hero-pin");
const posterBlueFrame = document.querySelector(".poster-blue-frame");
const posterSvgPaths = gsap.utils.toArray(".poster-curve-svg path");

if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined" && posterHero && posterPin) {
  gsap.registerPlugin(ScrollTrigger);

  if (typeof DrawSVGPlugin !== "undefined" && posterSvgPaths.length) {
    gsap.registerPlugin(DrawSVGPlugin);
    gsap.set(posterSvgPaths, { drawSVG: "0%" });
  }

  gsap.set(".poster-appear", { autoAlpha: 0 });

  if (posterBlueFrame) {
    gsap.set(posterBlueFrame, {
      scale: 0.42,
      transformOrigin: "center center"
    });
  }

  const heroScrollTl = gsap.timeline({
    scrollTrigger: {
      trigger: posterHero,
      start: "top top",
      end: "+=220%",
      pin: posterPin,
      scrub: 1
    }
  });

  // La imagen principal empieza pequeña y va creciendo durante todo el recorrido
  if (posterBlueFrame) {
    heroScrollTl.to(
      posterBlueFrame,
      {
        scale: 1,
        duration: 0.95,
        ease: "power2.out"
      },
      0
    );
  }

  // 1. Aparecen etiquetas superiores y año
  heroScrollTl
    .fromTo(
      [".poster-top-left", ".poster-top-year"],
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.1, ease: "power2.out" },
      0.08
    )
    // 2. Aparecen textos laterales y cabecera derecha
    .fromTo(
      [".poster-side-left-word", ".poster-top-right"],
      { x: -24, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, duration: 0.45, stagger: 0.1, ease: "power2.out" },
      0.35
    );

  // 3. Se trazan ambos <path> del SVG con DrawSVGPlugin
  if (posterSvgPaths.length && typeof DrawSVGPlugin !== "undefined") {
    heroScrollTl.to(
      posterSvgPaths,
      { drawSVG: "100%", duration: 0.75, stagger: 0.12, ease: "power1.inOut" },
      0.5
    );
  }

  // 4. Aparecen etiqueta derecha inferior y cierre inferior izquierdo
  heroScrollTl
    .fromTo(
      [".poster-side-right-word", ".poster-bottom-right", ".poster-bottom-left"],
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.1, ease: "power2.out" },
      0.72
    )
    // Pequeña pausa final antes de liberar el pin hacia la siguiente sección
    .to({}, { duration: 0.2 });

  window.addEventListener("load", () => ScrollTrigger.refresh());
}






document.addEventListener("DOMContentLoaded", () => {
  const burgerBtn = document.getElementById("burger-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const closeBtn = document.getElementById("mobile-menu-close");

  console.log("burgerBtn:", burgerBtn, "mobileMenu:", mobileMenu);

  if (!burgerBtn || !mobileMenu) return;

  burgerBtn.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("is-open");
    burgerBtn.setAttribute("aria-expanded", String(isOpen));
    mobileMenu.setAttribute("aria-hidden", String(!isOpen));
    console.log("Click en hamburguesa, isOpen:", isOpen);
  });

  closeBtn?.addEventListener("click", () => {
    mobileMenu.classList.remove("is-open");
    burgerBtn.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
  });

  mobileMenu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      mobileMenu.classList.remove("is-open");
      burgerBtn.setAttribute("aria-expanded", "false");
      mobileMenu.setAttribute("aria-hidden", "true");
    });
  });
});
























// =========================================================================
// 6 PROYECTOS LARGOS: REVELADO CON GSAP + MICRO-INTERACCIÓN + LENIS
// =========================================================================
const featuredSection = document.querySelector(".featured-cases-section");
const caseCards = gsap.utils.toArray(".case-card");

if (typeof gsap !== "undefined" && featuredSection && caseCards.length) {
  if (typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      caseCards,
      { y: 36, autoAlpha: 0, rotate: -1 },
      {
        y: 0,
        autoAlpha: 1,
        rotate: 0,
        duration: 0.65,
        stagger: { amount: 0.35, from: "start" },
        ease: "power2.out",
        clearProps: "transform",
        scrollTrigger: {
          trigger: featuredSection,
          start: "top 82%",
          once: true
        }
      }
    );
  }

  // Movimiento lúdico y sutil al mover el ratón sobre cada tarjeta (en dispositivos con puntero)
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (canHover) {
    caseCards.forEach((card) => {
      const moveX = gsap.quickTo(card, "x", { duration: 0.45, ease: "power3.out" });
      const moveY = gsap.quickTo(card, "y", { duration: 0.45, ease: "power3.out" });
      const tilt = gsap.quickTo(card, "rotation", { duration: 0.45, ease: "power3.out" });

      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;

        moveX(relX * 12);
        moveY(relY * 10 - 4);
        tilt(relX * 2.4);
      });

      card.addEventListener("mouseleave", () => {
        moveX(0);
        moveY(0);
        tilt(0);
      });
    });
  }

  // Salida suave al hacer clic hacia la página de cada proyecto
  caseCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      const href = card.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      e.preventDefault();
      if (typeof lenis !== "undefined" && lenis) {
        lenis.stop();
      }

      gsap.to(card, {
        scale: 0.96,
        opacity: 0.4,
        duration: 0.24,
        ease: "power2.in",
        onComplete: () => {
          window.location.href = href;
        }
      });
    });
  });
}






















(function initGalleryLightbox() {
  function run() {
    const lightbox = document.getElementById("gallery-lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxCaption = document.getElementById("lightbox-caption");
    const lightboxCounter = document.getElementById("lightbox-counter");
    const closeBtn = document.getElementById("lightbox-close");
    const prevBtn = document.getElementById("lightbox-prev");
    const nextBtn = document.getElementById("lightbox-next");

    console.log("Lightbox elements:", { lightbox, lightboxImg });

    if (!lightbox || !lightboxImg) return;

    let activeSlides = [];
    let currentIndex = 0;
    let isOpen = false;

    function getVisibleItems() {
      return Array.from(document.querySelectorAll(".box-container .item")).filter((item) => {
        const st = window.getComputedStyle(item);
        return st.display !== "none" && st.visibility !== "hidden" && parseFloat(st.opacity) > 0.05;
      });
    }

    function renderSlide(index) {
      const slide = activeSlides[index];
      if (!slide) return;
      currentIndex = index;
      lightboxImg.src = slide.src;
      lightboxImg.alt = slide.alt;

      if (lightboxCounter) {
        const cur = String(index + 1).padStart(2, "0");
        const tot = String(activeSlides.length).padStart(2, "0");
        lightboxCounter.textContent = `${cur} / ${tot}`;
      }
      if (lightboxCaption) {
        lightboxCaption.textContent = slide.alt || "";
      }

      if (typeof gsap !== "undefined") {
        gsap.fromTo(
          lightboxImg,
          { scale: 0.75, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(1.25)" }
        );
      } else {
        lightboxImg.style.opacity = "1";
      }
    }

    function openLightbox(clickedItem) {
      const visibleItems = getVisibleItems();
      if (!visibleItems.length) return;

      activeSlides = visibleItems.map((item) => {
        const img = item.querySelector("img");
        return {
          src: img ? img.currentSrc || img.getAttribute("src") || "" : "",
          alt: img ? img.alt || "" : ""
        };
      });

      const idx = visibleItems.indexOf(clickedItem);
      const startIdx = idx >= 0 ? idx : 0;
      if (!activeSlides[startIdx] || !activeSlides[startIdx].src) return;

      isOpen = true;
      if (typeof lenis !== "undefined" && lenis && typeof lenis.stop === "function") {
        lenis.stop();
      }

      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");

      if (typeof gsap !== "undefined") {
        gsap.fromTo(lightbox, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" });
      } else {
        lightbox.style.opacity = "1";
      }

      renderSlide(startIdx);
    }

    function closeLightbox() {
      if (!isOpen) return;
      isOpen = false;

      const finishClose = () => {
        lightbox.classList.remove("is-open");
        lightbox.setAttribute("aria-hidden", "true");
        lightboxImg.src = "";
        if (typeof lenis !== "undefined" && lenis && typeof lenis.start === "function") {
          lenis.start();
        }
      };

      if (typeof gsap !== "undefined") {
        gsap.to(lightbox, {
          opacity: 0,
          duration: 0.22,
          ease: "power2.inOut",
          onComplete: finishClose
        });
      } else {
        lightbox.style.opacity = "0";
        finishClose();
      }
    }

    function stepSlide(dir) {
      if (!isOpen || activeSlides.length <= 1) return;
      const next = (currentIndex + dir + activeSlides.length) % activeSlides.length;
      renderSlide(next);
    }

    document.addEventListener(
      "click",
      (e) => {
        const item = e.target.closest(".box-container .item");
        if (item) {
          console.log("Clic detectado en .item:", item);
          e.preventDefault();
          openLightbox(item);
        }
      },
      true
    );

    closeBtn?.addEventListener("click", closeLightbox);
    prevBtn?.addEventListener("click", () => stepSlide(-1));
    nextBtn?.addEventListener("click", () => stepSlide(1));

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox || e.target.classList.contains("lightbox-stage")) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") stepSlide(-1);
      if (e.key === "ArrowRight") stepSlide(1);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();





















// =========================================================================
// SOBRE MÍ TIZZY: SCROLL DINÁMICO + GRÁFICOS + HERRAMIENTAS JUGUETONAS
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const vaSection = document.querySelector(".tizzy-visual-about");
  const vaPin = document.querySelector(".tizzy-va-pin");
  if (!vaSection || !vaPin || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  const steps = Array.from(vaSection.querySelectorAll(".tizzy-va-step"));
  const panels = Array.from(vaSection.querySelectorAll(".tizzy-va-panel"));
  const scrollFill = vaSection.querySelector(".tizzy-va-scroll-fill");
  const scrollCueIcon = vaSection.querySelector(".tizzy-va-scroll-cue i");
  const starShape = vaSection.querySelector(".tizzy-va-star");
  const pills = gsap.utils.toArray(".tizzy-va-pill");
  const toolDesc = document.getElementById("tizzy-va-tool-desc");
  const copyBtns = vaSection.querySelectorAll(".tizzy-va-copy");
  const toastEl = document.getElementById("tizzy-va-toast");

  let currentChapter = -1;

  function activateChapter(idx) {
    if (idx === currentChapter) return;
    currentChapter = idx;

    steps.forEach((step, i) => step.classList.toggle("is-active", i === idx));
    panels.forEach((panel, i) => {
      const match = i === idx;
      panel.classList.toggle("is-active", match);
      if (match) {
        gsap.fromTo(
          panel,
          { opacity: 0.25, y: 6 },
          { opacity: 1, y: 0, duration: 0.25, ease: "power2.out", overwrite: true }
        );
      }
    });
  }

  activateChapter(0);

  const mm = gsap.matchMedia();

  mm.add("(min-width: 901px)", () => {
    ScrollTrigger.create({
      trigger: vaSection,
      start: "top top",
      end: "+=150%",
      pin: vaPin,
      scrub: 0.8,
      onUpdate: (self) => {
        const p = self.progress;
        if (scrollFill) gsap.set(scrollFill, { scaleX: p });
        if (scrollCueIcon) gsap.set(scrollCueIcon, { y: Math.sin(p * Math.PI * 6) * 3 });
        if (starShape) gsap.set(starShape, { rotation: p * 180 });

        if (p < 0.34) activateChapter(0);
        else if (p < 0.67) activateChapter(1);
        else activateChapter(2);
      }
    });
  });

  mm.add("(max-width: 900px)", () => {
    ScrollTrigger.create({
      trigger: vaSection,
      start: "top 65%",
      end: "bottom 35%",
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress;
        if (scrollFill) gsap.set(scrollFill, { scaleX: p });
        if (starShape) gsap.set(starShape, { rotation: p * 140 });

        if (p < 0.34) activateChapter(0);
        else if (p < 0.67) activateChapter(1);
        else activateChapter(2);
      }
    });
  });

  const toolNotes = {
    "Adobe Photoshop": "Retoque fotográfico, color, texturas y montaje de carteles.",
    "Adobe Illustrator": "Logotipos, identidad de marca, iconos y arte vectorial.",
    "Adobe InDesign": "Maquetación editorial, libros, catálogos y piezas impresas.",
    "Adobe Premiere Pro": "Edición de vídeo, montaje y ritmo audiovisual.",
    "Adobe After Effects": "Motion graphics, animación y composición visual.",
    "Adobe Acrobat": "Revisión de PDF, ajustes de impresión y entrega final.",
    "Cinema 4D": "Modelado 3D, iluminación, materiales y renders.",
    "Figma": "Diseño de interfaz, sistemas visuales y prototipado.",
    "VisualStudioCode": "Desarrollo web en HTML, CSS y JavaScript."
  };

  pills.forEach((pill) => {
    const label = pill.textContent.trim();
    pill.addEventListener("click", () => {
      pills.forEach((p) => p.classList.remove("is-active"));
      pill.classList.add("is-active");
      gsap.fromTo(pill, { scale: 0.92, y: -4 }, { scale: 1, y: 0, duration: 0.3, ease: "back.out(1.7)" });
      if (toolDesc) toolDesc.textContent = `${label} — ${toolNotes[label] || label}`;
    });
  });

  copyBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.getAttribute("data-copy") || "";
      if (!value) return;
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(value).catch(() => {});
      }
      if (toastEl) {
        toastEl.textContent = `Copiado: ${value}`;
      }
    });
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
});
















document.addEventListener("DOMContentLoaded", () => {
  const footer = document.querySelector(".tizzy-footer");
  if (!footer || typeof gsap === "undefined") return;

  const yearEl = document.getElementById("tizzy-year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // 1. Pulso continuo en el punto de estado
  const moodDot = footer.querySelector(".tizzy-mood-dot");
  if (moodDot) {
    gsap.to(moodDot, {
      scale: 1.45,
      opacity: 0.45,
      duration: 1.1,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }

  // 2. Alternar estado / mood con rebote
  const moods = [
    "DISPONIBLE PARA PROYECTOS",
    "MODO CARTEL & IDENTIDAD",
    "ABIERTO A COLABORACIONES"
  ];
  let moodIdx = 0;
  const moodBtn = document.getElementById("tizzy-mood-btn");
  const moodText = document.getElementById("tizzy-mood-text");

  moodBtn?.addEventListener("click", () => {
    moodIdx = (moodIdx + 1) % moods.length;
    if (moodText) moodText.textContent = moods[moodIdx];

    gsap.fromTo(
      moodBtn,
      { scale: 0.92, y: -3 },
      { scale: 1, y: 0, duration: 0.4, ease: "elastic.out(1.2, 0.45)" }
    );
  });

  // 3. Señal reactiva al pasar por las secciones del footer + scroll con Lenis
  const signalCode = document.getElementById("tizzy-signal-code");
  const signalNote = document.getElementById("tizzy-signal-note");
  const sectionNotes = {
    "#hero": "Portada tipo cartel, escala progresiva y trazado con scroll.",
    "#proyectos-largos": "Seis casos extendidos con entrada a su página propia.",
    "#galeria": "Galería acumulable con filtros y visor con zoom.",
    "#sobre-mi": "Perfil, marcas, carteles y herramientas en movimiento.",
    "#contacto": "Contacto directo, copia rápida y navegación."
  };

  footer.querySelectorAll(".tizzy-footer-link").forEach((link) => {
    const href = link.getAttribute("href");
    const idx = link.getAttribute("data-index") || "01";

    link.addEventListener("mouseenter", () => {
      if (signalCode) signalCode.textContent = `SEC · ${idx}`;
      if (signalNote && href && sectionNotes[href]) {
        signalNote.textContent = sectionNotes[href];
        gsap.fromTo(signalNote, { opacity: 0.35, x: -6 }, { opacity: 1, x: 0, duration: 0.25 });
      }
    });

    link.addEventListener("click", (e) => {
      if (!href || !href.startsWith("#")) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        if (typeof lenis !== "undefined" && lenis) {
          lenis.scrollTo(target, { offset: -70, duration: 1.2 });
        } else {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });

  // 4. Botón magnético de subir con Lenis
  const backTop = document.getElementById("tizzy-back-top");
  if (backTop) {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (canHover) {
      const xTo = gsap.quickTo(backTop, "x", { duration: 0.35, ease: "power3.out" });
      const yTo = gsap.quickTo(backTop, "y", { duration: 0.35, ease: "power3.out" });

      backTop.addEventListener("mousemove", (e) => {
        const rect = backTop.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.25;
        const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.25;
        xTo(dx);
        yTo(dy);
      });

      backTop.addEventListener("mouseleave", () => {
        xTo(0);
        yTo(0);
      });
    }

    backTop.addEventListener("click", (e) => {
      e.preventDefault();
      if (typeof lenis !== "undefined" && lenis) {
        lenis.scrollTo(0, { duration: 1.3 });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  // 5. Copiar email y @tizzy.designs
  const toastEl = document.getElementById("tizzy-f-toast");
  footer.querySelectorAll(".tizzy-f-copy").forEach((btn) => {
    btn.addEventListener("click", () => {
      const val = btn.getAttribute("data-copy") || "";
      if (!val) return;
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(val).catch(() => {});
      }
      if (toastEl) {
        toastEl.textContent = `Copiado: ${val}`;
        gsap.fromTo(toastEl, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.25 });
      }
      gsap.fromTo(btn, { scale: 0.94 }, { scale: 1, duration: 0.3, ease: "back.out(1.6)" });
    });
  });
});