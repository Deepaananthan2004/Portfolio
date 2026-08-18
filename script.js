/* =========================================================
   DEEPA ANANTHAN AR — INTERACTIVE 3D VIDEO PORTFOLIO
   ========================================================= */

document.documentElement.classList.remove("no-js");

document.addEventListener("DOMContentLoaded", () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     1. HERO VIDEO — AUTOPLAY / LOOP / SILENT
     --------------------------------------------------------- */
  const video = document.getElementById("heroVideo");
  const videoCard = document.getElementById("heroVideoCard");
  const videoScene = document.getElementById("heroVideoScene");

  if (video) {
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    video.loop = true;
    video.playsInline = true;

    const playVideo = () => {
      if (reducedMotion) return;
      video.muted = true;
      video.volume = 0;

      const promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {
          // Autoplay can be blocked by browser policy.
          // Poster image remains visible without breaking the page.
        });
      }
    };

    if (video.readyState >= 2) playVideo();
    else video.addEventListener("loadeddata", playVideo, { once: true });

    window.addEventListener("load", playVideo, { once: true });
  }

  /* ---------------------------------------------------------
     2. TEXT SCRAMBLE
     --------------------------------------------------------- */
  class TextScramble {
    constructor(el) {
      this.el = el;
      this.chars = "!<>-_\\/[]{}—=+*^?#";
      this.update = this.update.bind(this);
    }

    setText(newText) {
      const oldText = this.el.innerText;
      const length = Math.max(oldText.length, newText.length);
      this.queue = [];

      const promise = new Promise(resolve => (this.resolve = resolve));

      for (let i = 0; i < length; i++) {
        const from = oldText[i] || "";
        const to = newText[i] || "";
        const start = Math.floor(Math.random() * 25);
        const end = start + Math.floor(Math.random() * 30);
        this.queue.push({ from, to, start, end });
      }

      cancelAnimationFrame(this.frameRequest);
      this.frame = 0;
      this.update();

      return promise;
    }

    update() {
      let output = "";
      let complete = 0;

      for (const item of this.queue) {
        let { from, to, start, end, char } = item;

        if (this.frame >= end) {
          complete++;
          output += to;
        } else if (this.frame >= start) {
          if (!char || Math.random() < 0.25) {
            char = this.randomChar();
            item.char = char;
          }
          output += `<span>${char}</span>`;
        } else {
          output += from;
        }
      }

      this.el.innerHTML = output;

      if (complete === this.queue.length) {
        this.resolve();
      } else {
        this.frameRequest = requestAnimationFrame(this.update);
        this.frame++;
      }
    }

    randomChar() {
      return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
  }

  const scrambleEl = document.getElementById("scramble-text");

  if (scrambleEl && !reducedMotion) {
    const phrases = ["AI Engineer", "GenAI Developer"];
    const fx = new TextScramble(scrambleEl);
    let index = 0;

    const nextPhrase = () => {
      fx.setText(phrases[index]).then(() => {
        setTimeout(nextPhrase, 2800);
      });
      index = (index + 1) % phrases.length;
    };

    nextPhrase();
  }

  /* ---------------------------------------------------------
     3. GSAP SCROLL REVEALS
     --------------------------------------------------------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray(".gs-reveal").forEach((element, index) => {
      gsap.fromTo(
        element,
        { y: reducedMotion ? 0 : 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: reducedMotion ? 0.01 : 0.8,
          delay: reducedMotion ? 0 : Math.min(index * 0.015, 0.2),
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    /* Hero video reacts to scroll without changing layout size. */
    if (videoCard && !reducedMotion) {
      gsap.to(videoCard, {
        yPercent: -5,
        scale: 0.97,
        opacity: 0.78,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 1.2
        }
      });
    }
  }

  /* ---------------------------------------------------------
     4. NAVBAR SCROLL STATE
     --------------------------------------------------------- */
  const navbar = document.getElementById("navbar");

  const updateNavbar = () => {
    navbar?.classList.toggle("scrolled", window.scrollY > 30);
  };

  updateNavbar();
  window.addEventListener("scroll", updateNavbar, { passive: true });

  /* ---------------------------------------------------------
     5. MOBILE NAVIGATION
     --------------------------------------------------------- */
  const mobileMenu = document.querySelector(".mobile-menu");
  const navLinks = document.querySelector(".nav-links");

  mobileMenu?.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    mobileMenu.setAttribute("aria-expanded", String(open));
    mobileMenu.innerHTML = open
      ? '<i class="fas fa-xmark"></i>'
      : '<i class="fas fa-bars"></i>';
  });

  navLinks?.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      mobileMenu?.setAttribute("aria-expanded", "false");
      if (mobileMenu) mobileMenu.innerHTML = '<i class="fas fa-bars"></i>';
    });
  });

  /* ---------------------------------------------------------
     6. HERO VIDEO — MOUSE 3D TILT
     --------------------------------------------------------- */
  if (videoScene && videoCard && !reducedMotion && window.matchMedia("(pointer:fine)").matches) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let raf = 0;

    const animateTilt = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      videoCard.style.transform =
        `translate3d(${currentX}px, ${currentY}px, 0)
         rotateX(${currentY * -0.16}deg)
         rotateY(${currentX * 0.16}deg)`;

      raf = requestAnimationFrame(animateTilt);
    };

    const resetTilt = () => {
      targetX = 0;
      targetY = 0;
    };

    videoScene.addEventListener("mousemove", e => {
      const rect = videoScene.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;

      targetX = px * 14;
      targetY = py * 10;
    });

    videoScene.addEventListener("mouseleave", resetTilt);

    animateTilt();

    window.addEventListener("beforeunload", () => cancelAnimationFrame(raf));
  }

  /* ---------------------------------------------------------
     7. 3D CARD TILT
     --------------------------------------------------------- */
  if (!reducedMotion && window.matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll(".bento-card").forEach(card => {
      card.addEventListener("mousemove", e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const rotateY = (x - 0.5) * 4;
        const rotateX = (0.5 - y) * 4;

        card.style.transform =
          `translateY(-6px) perspective(900px)
           rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

        card.style.setProperty("--mouse-x", `${x * 100}%`);
        card.style.setProperty("--mouse-y", `${y * 100}%`);
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------------------------------------------------------
     8. MAGNETIC BUTTONS
     --------------------------------------------------------- */
  if (!reducedMotion && window.matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll(".magnetic-btn").forEach(btn => {
      btn.addEventListener("mousemove", e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        btn.style.transform = `translate(${x * 0.10}px, ${y * 0.10}px)`;
      });

      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  /* ---------------------------------------------------------
     9. SMOOTH ANCHOR FALLBACK
     --------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", e => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start"
      });
    });
  });

  /* ---------------------------------------------------------
     10. VIDEO ERROR FALLBACK
     --------------------------------------------------------- */
  video?.addEventListener("error", () => {
    if (videoCard) {
      videoCard.classList.add("video-fallback");
    }
  });
});
