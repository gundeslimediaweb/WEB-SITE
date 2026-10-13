
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Açılış animasyonu: kısa tut, siteyi bekletme.
  const intro = document.getElementById("intro");

  if (intro) {
    window.setTimeout(() => {
      intro.classList.add("hide");
    }, 850);

    window.setTimeout(() => {
      intro.remove();
    }, 1400);
  }

  // 2. Mobil menü.
  const menuToggle = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Menüyü kapat" : "Menüyü aç"
      );
      menuToggle.textContent = isOpen ? "✕" : "☰";
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Menüyü aç");
        menuToggle.textContent = "☰";
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        navMenu.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "☰";
      }
    });
  }

  // 3. Kaydırma sırasında bölümleri yumuşakça göster.
  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("visible");
    });
  }

  // 4. Otomatik güncel yıl.
  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // 5. Fareye ve dokunmaya tepki veren hafif parçacıklar.
  const canvas = document.getElementById("particles");

  if (canvas) {
    const context = canvas.getContext("2d");

    if (context) {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

      const finePointer = window.matchMedia("(pointer: fine)");

      let width = 0;
      let height = 0;
      let particles = [];
      let animationFrame = 0;
      let lastFrame = 0;
      let isVisible = true;
      let pointer = {
        x: -1000,
        y: -1000,
        active: false
      };

      const PARTICLE_COUNT = 48;
      const MAX_DPR = 1.5;

      function random(min, max) {
        return Math.random() * (max - min) + min;
      }

      function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

        width = rect.width;
        height = rect.height;

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);

        context.setTransform(dpr, 0, 0, dpr, 0, 0);

        particles = Array.from(
          { length: Math.min(
              PARTICLE_COUNT,
              Math.max(18, Math.round(width / 18))
            )
          },
          () => ({
            x: random(0, width),
            y: random(0, height),
            vx: random(-0.22, 0.22),
            vy: random(-0.22, 0.22),
            radius: random(1.1, 2.5),
            alpha: random(0.15, 0.48)
          })
        );

        drawStatic();
      }

      function drawStatic() {
        if (!context) return;

        context.clearRect(0, 0, width, height);

        particles.forEach((particle) => {
          context.beginPath();
          context.arc(
            particle.x,
            particle.y,
            particle.radius,
            0,
            Math.PI * 2
          );
          context.fillStyle = `rgba(91, 111, 238, ${particle.alpha})`;
          context.fill();
        });
      }

      function render(timestamp) {
        if (!isVisible || document.hidden) {
          animationFrame = 0;
          return;
        }

        if (timestamp - lastFrame < 30) {
          animationFrame = requestAnimationFrame(render);
          return;
        }

        lastFrame = timestamp;
        context.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;

          if (pointer.active && finePointer.matches) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const distanceSquared = dx * dx + dy * dy;
            const radius = 105;

            if (distanceSquared < radius * radius && distanceSquared > 0) {
              const distance = Math.sqrt(distanceSquared);
              const force = (radius - distance) / radius;

              p.x += (dx / distance) * force * 2.4;
              p.y += (dy / distance) * force * 2.4;
            }
          }

          p.x = Math.max(0, Math.min(width, p.x));
          p.y = Math.max(0, Math.min(height, p.y));

          context.beginPath();
          context.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          context.fillStyle = `rgba(91, 111, 238, ${p.alpha})`;
          context.fill();

          // Yakındaki noktaları ince çizgilerle birleştir.
          for (let j = i + 1; j < particles.length; j++) {
            const q = particles[j];
            const dx = p.x - q.x;
            const dy = p.y - q.y;
            const distanceSquared = dx * dx + dy * dy;
            const maxDistance = 105;

            if (distanceSquared < maxDistance * maxDistance) {
              const opacity =
                (1 - Math.sqrt(distanceSquared) / maxDistance) * 0.13;

              context.beginPath();
              context.moveTo(p.x, p.y);
              context.lineTo(q.x, q.y);
              context.strokeStyle = `rgba(100, 116, 230, ${opacity})`;
              context.lineWidth = 0.7;
              context.stroke();
            }
          }
        }

        animationFrame = requestAnimationFrame(render);
      }

      function startAnimation() {
        if (reducedMotion.matches) {
          drawStatic();
          return;
        }

        if (!animationFrame && isVisible && !document.hidden) {
          animationFrame = requestAnimationFrame(render);
        }
      }

      function stopAnimation() {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = 0;
        }
      }

      canvas.addEventListener("pointermove", (event) => {
        const rect = canvas.getBoundingClientRect();

        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
        pointer.active = true;
      });

      canvas.addEventListener("pointerleave", () => {
        pointer.active = false;
        pointer.x = -1000;
        pointer.y = -1000;
      });

      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          stopAnimation();
        } else {
          startAnimation();
        }
      });

      if ("IntersectionObserver" in window) {
        const canvasObserver = new IntersectionObserver((entries) => {
          isVisible = entries[0].isIntersecting;

          if (isVisible) {
            startAnimation();
          } else {
            stopAnimation();
          }
        });

        canvasObserver.observe(canvas);
      }

      reducedMotion.addEventListener?.("change", () => {
        stopAnimation();

        if (reducedMotion.matches) {
          drawStatic();
        } else {
          startAnimation();
        }
      });

      window.addEventListener("resize", resizeCanvas, {
        passive: true
      });

      resizeCanvas();
      startAnimation();
    }
  }

  // 6. Sayfa içi bağlantılarda mobil menüyü kapat.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);

      if (target) {
        event.preventDefault();

        target.scrollIntoView({
          behavior: window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches
            ? "auto"
            : "smooth",
          block: "start"
        });

        if (history.replaceState) {
          history.replaceState(null, "", targetId);
        }
      }
    });
  });

  console.info("Gündeşli Media sitesi başlatıldı.");
});
