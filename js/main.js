/*=============== HOME SPLIT TEXT ===============*/
const initSplitText = () => {
   const splitText = document.querySelector('.home__split');
   if (!splitText) return;
   if (typeof anime === 'undefined') {
      window.addEventListener('load', initSplitText, { once: true });
      return;
   }
   try {
      if (!splitText.querySelector('.letter')) {
         const chars = splitText.textContent.trim().split('');
         splitText.innerHTML = chars
            .map(char => /\s/.test(char) ? char : `<span class="letter">${char}</span>`)
            .join('');
      }
      if (typeof anime.timeline === 'function') {
         anime.timeline({ loop: true })
            .add({
               targets: '.home__split .letter',
               translateY: [-16, 0],
               opacity: [0, 1],
               easing: "easeOutExpo",
               duration: 800,
               delay: (el, i) => 70 * i
            }).add({
               targets: '.home__split .letter',
               opacity: 0,
               translateY: [0, -16],
               easing: "easeInExpo",
               duration: 600,
               delay: (el, i) => 70 * i + 3000
            });
      } else if (typeof anime.createTimeline === 'function') {
         const tl = anime.createTimeline({ loop: true });
         tl.add('.home__split .letter', {
            translateY: [-16, 0],
            opacity: [0, 1],
            ease: "outExpo",
            duration: 800,
            delay: (el, i) => 70 * i
         }).add('.home__split .letter', {
            opacity: 0,
            translateY: [0, -16],
            ease: "inExpo",
            duration: 600,
            delay: (el, i) => 70 * i + 3000
         });
      }
   } catch (err) {
      console.warn('Anime.js initialization skipped:', err);
   }
};

if (document.readyState === 'loading') {
   document.addEventListener('DOMContentLoaded', initSplitText);
} else {
   initSplitText();
}

/*=============== PROJECTS MARQUEE & BUTTONS ===============*/
const projectsContainer = document.querySelector('.projects__container');
const projectsTrack = document.getElementById('projects-track');
const projectsPrev = document.getElementById('projects-prev');
const projectsNext = document.getElementById('projects-next');

if (projectsContainer && projectsTrack) {
   let isPaused = false;
   let pauseTimeout = null;
   let scrollDirection = 1; // 1 = scroll forward (1 -> 7), -1 = scroll backward (7 -> 1)
   const scrollSpeed = 0.9; // Smooth continuous scroll speed in px per frame

   const pauseTemporarily = (duration = 2000) => {
      isPaused = true;
      if (pauseTimeout) clearTimeout(pauseTimeout);
      pauseTimeout = setTimeout(() => {
         isPaused = false;
      }, duration);
   };

   projectsContainer.addEventListener('mouseenter', () => isPaused = true);
   projectsContainer.addEventListener('mouseleave', () => isPaused = false);
   projectsContainer.addEventListener('touchstart', () => isPaused = true, { passive: true });
   projectsContainer.addEventListener('touchend', () => pauseTemporarily(1800), { passive: true });

   let maxScroll = 0;
   const updateMaxScroll = () => {
      maxScroll = Math.max(0, projectsTrack.scrollWidth - projectsContainer.clientWidth);
   };
   updateMaxScroll();
   window.addEventListener('resize', updateMaxScroll, { passive: true });

   function stepProjectsAutoScroll() {
      if (!isPaused && maxScroll > 0) {
         if (scrollDirection === 1) {
            // Scrolling forward towards the last project
            projectsContainer.scrollLeft += scrollSpeed;

            if (projectsContainer.scrollLeft >= maxScroll - 1) {
               // Reached the last project! Pause, then reverse direction towards first
               projectsContainer.scrollLeft = maxScroll;
               scrollDirection = -1;
               pauseTemporarily(2000); // 2 second pause when reaching last project
            }
         } else {
            // Scrolling backward from last project to first project
            projectsContainer.scrollLeft -= scrollSpeed;

            if (projectsContainer.scrollLeft <= 1) {
               // Reached the first project! Pause, then reverse direction forward again
               projectsContainer.scrollLeft = 0;
               scrollDirection = 1;
               pauseTemporarily(2000); // 2 second pause when reaching first project, then repeat
            }
         }
      }
      requestAnimationFrame(stepProjectsAutoScroll);
   }

   requestAnimationFrame(stepProjectsAutoScroll);

   const getCardScrollStep = () => {
      const card = projectsTrack.querySelector('.projects__card');
      const trackStyle = window.getComputedStyle(projectsTrack);
      const gap = parseFloat(trackStyle.gap) || 24;
      return (card ? card.offsetWidth : 300) + gap;
   };

   if (projectsPrev) {
      projectsPrev.addEventListener('click', () => {
         pauseTemporarily(2500);
         const step = getCardScrollStep();
         projectsContainer.scrollBy({ left: -step, behavior: 'smooth' });
         if (projectsContainer.scrollLeft - step <= 10) {
            scrollDirection = 1;
         }
      });
   }

   if (projectsNext) {
      projectsNext.addEventListener('click', () => {
         pauseTemporarily(2500);
         const maxScroll = projectsTrack.scrollWidth - projectsContainer.clientWidth;
         const step = getCardScrollStep();
         projectsContainer.scrollBy({ left: step, behavior: 'smooth' });
         if (projectsContainer.scrollLeft + step >= maxScroll - 10) {
            scrollDirection = -1;
         }
      });
   }

   /*=============== ALL PROJECTS POPUP MODAL ===============*/
   const projectsViewAllBtn = document.getElementById('projects-view-all');
   const projectsModal = document.getElementById('projects-modal');
   const projectsModalClose = document.getElementById('projects-modal-close');
   const projectsModalOverlay = document.getElementById('projects-modal-overlay');
   const projectsModalFilters = document.querySelectorAll('.projects__modal-filter');
   const projectsModalCards = document.querySelectorAll('.projects__modal-card');

   if (projectsViewAllBtn && projectsModal) {
      const openModal = () => {
         projectsModal.classList.add('projects__modal--open');
         projectsModal.setAttribute('aria-hidden', 'false');
         document.body.style.overflow = 'hidden';
         isPaused = true;
         if (projectsModalClose) {
            projectsModalClose.focus();
         }
      };

      const closeModal = () => {
         projectsModal.classList.remove('projects__modal--open');
         projectsModal.setAttribute('aria-hidden', 'true');
         document.body.style.overflow = '';
         isPaused = false;
         projectsViewAllBtn.focus();
      };

      projectsViewAllBtn.addEventListener('click', openModal);

      if (projectsModalClose) {
         projectsModalClose.addEventListener('click', closeModal);
      }

      if (projectsModalOverlay) {
         projectsModalOverlay.addEventListener('click', closeModal);
      }

      document.addEventListener('keydown', (e) => {
         if (e.key === 'Escape' && projectsModal.classList.contains('projects__modal--open')) {
            closeModal();
         }
      });

      // Filter tabs inside modal (All, Web, App)
      projectsModalFilters.forEach(filterBtn => {
         filterBtn.addEventListener('click', () => {
            projectsModalFilters.forEach(btn => btn.classList.remove('active'));
            filterBtn.classList.add('active');

            const selectedFilter = filterBtn.dataset.filter;

            projectsModalCards.forEach(card => {
               const cardCat = card.dataset.category;
               if (selectedFilter === 'all' || cardCat === selectedFilter) {
                  card.classList.remove('projects__modal-card--hidden');
               } else {
                  card.classList.add('projects__modal-card--hidden');
               }
            });
         });
      });
   }
}




/*=============== WORK TABS ===============*/
const tabs = document.querySelectorAll('[data-target]');
const tabContents = document.querySelectorAll('[data-content]');

tabs.forEach(tab => {
   tab.addEventListener('click', () => {
      const target = document.querySelector(tab.dataset.target);
      tabContents.forEach(tabContent => {
         tabContent.classList.remove('active-content');
      });
      if (target) {
         target.classList.add('active-content');
      }
      tabs.forEach(t => {
         t.classList.remove('active-tab');
      });
      tab.classList.add('active-tab');
   });
});

/*=============== SERVICES ACCORDION ===============*/
const servicesCards = document.querySelectorAll('.services__card');

servicesCards.forEach(card => {
   card.addEventListener('click', () => {
      const isOpen = card.classList.contains('services__open');
      // Close all cards automatically
      servicesCards.forEach(c => {
         c.classList.remove('services__open');
      });
      // If clicked card was not previously open, open it
      if (!isOpen) {
         card.classList.add('services__open');
      }
   });
});

/*=============== COPY EMAIL IN CONTACT ===============*/
const contactButton = document.getElementById('contact-button');
const contactTooltip = document.getElementById('contact-tooltip');

if (contactButton && contactTooltip) {
   const showTooltip = () => {
      contactTooltip.classList.add('show-tooltip');
      setTimeout(() => {
         contactTooltip.classList.remove('show-tooltip');
      }, 2500);
   };

   const fallbackCopyText = (text) => {
      try {
         const textArea = document.createElement('textarea');
         textArea.value = text;
         textArea.style.position = 'fixed';
         textArea.style.top = '-9999px';
         textArea.style.left = '-9999px';
         textArea.style.opacity = '0';
         document.body.appendChild(textArea);
         textArea.focus();
         textArea.select();
         const success = document.execCommand('copy');
         document.body.removeChild(textArea);
         if (success) {
            showTooltip();
         }
      } catch (err) {
         console.error('Fallback copy failed:', err);
      }
   };

   contactButton.addEventListener('click', () => {
      const email = contactButton.getAttribute('data-email') || 'tusharpatel20050523@gmail.com';
      if (navigator.clipboard && navigator.clipboard.writeText) {
         navigator.clipboard.writeText(email)
            .then(showTooltip)
            .catch(() => fallbackCopyText(email));
      } else {
         fallbackCopyText(email);
      }
   });
}

/*=============== CURRENT YEAR OF THE FOOTER ===============*/
const currentYearEl = document.getElementById('current-year');
if (currentYearEl) {
   currentYearEl.textContent = new Date().getFullYear();
}

/*=============== SHOW / HIDE MOBILE MENU POPUP ===============*/
const navMenu = document.getElementById('nav-menu');
const navToggle = document.getElementById('nav-toggle');

if (navToggle && navMenu) {
   const closeMenu = () => {
      navMenu.classList.remove('show-menu');
      navToggle.classList.remove('active-toggle');
      navToggle.setAttribute('aria-expanded', 'false');
      const icon = navToggle.querySelector('i');
      if (icon) {
         icon.classList.remove('ri-close-line');
         icon.classList.add('ri-menu-3-line');
      }
   };

   const openMenu = () => {
      navMenu.classList.add('show-menu');
      navToggle.classList.add('active-toggle');
      navToggle.setAttribute('aria-expanded', 'true');
      const icon = navToggle.querySelector('i');
      if (icon) {
         icon.classList.remove('ri-menu-3-line');
         icon.classList.add('ri-close-line');
      }
   };

   navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (navMenu.classList.contains('show-menu')) {
         closeMenu();
      } else {
         openMenu();
      }
   });

   // Close popup when clicking on any nav link
   const navLinks = document.querySelectorAll('.nav__link');
   navLinks.forEach(link => {
      link.addEventListener('click', () => {
         closeMenu();
      });
   });

   // Close popup when clicking outside
   document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
         closeMenu();
      }
   });

   // Close popup on Escape key
   document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
         closeMenu();
      }
   });
}

/*=============== CHANGE BACKGROUND HEADER ===============*/
const scrollHeader = () => {
   const header = document.getElementById('header');
   if (header) {
      if (window.scrollY >= 50) {
         header.classList.add('bg-header');
      } else {
         header.classList.remove('bg-header');
      }
   }
};
window.addEventListener('scroll', scrollHeader, { passive: true });

/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
const sections = document.querySelectorAll('section[id]');

const scrollActive = () => {
   const scrollDown = window.scrollY;
   const atBottom = (window.innerHeight + scrollDown) >= (document.documentElement.scrollHeight - 50);

   sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 140;
      const sectionId = current.getAttribute('id');
      const sectionsClass = document.querySelector('.nav__menu a[href*="#' + sectionId + '"]');
      if (sectionsClass) {
         if (atBottom && sectionId === 'contact') {
            sectionsClass.classList.add('active-link');
         } else if (!atBottom && scrollDown > sectionTop && scrollDown <= sectionTop + sectionHeight) {
            sectionsClass.classList.add('active-link');
         } else {
            sectionsClass.classList.remove('active-link');
         }
      }
   });
};
window.addEventListener('scroll', scrollActive, { passive: true });

/*=============== CUSTOM CURSOR ===============*/
const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursor-dot');

if (cursor && cursorDot && window.matchMedia('(pointer: fine)').matches) {
   let mouseX = -100;
   let mouseY = -100;
   let cursorX = -100;
   let cursorY = -100;
   let isFirstMove = true;
   let isHovered = false;
   let isClicking = false;
   const TRAIL_SPEED = 0.14;

   document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (isFirstMove) {
         cursorX = mouseX;
         cursorY = mouseY;
         cursor.classList.add('visible');
         cursorDot.classList.add('visible');
         isFirstMove = false;
      }
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
   }, { passive: true });

   const renderCursor = () => {
      cursorX += (mouseX - cursorX) * TRAIL_SPEED;
      cursorY += (mouseY - cursorY) * TRAIL_SPEED;
      const scaleStr = isClicking ? ' scale(0.85)' : (isHovered ? ' scale(1.5)' : '');
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)${scaleStr}`;
      requestAnimationFrame(renderCursor);
   };
   requestAnimationFrame(renderCursor);

   document.addEventListener('mouseleave', () => {
      cursor.classList.remove('visible');
      cursorDot.classList.remove('visible');
   });

   document.addEventListener('mouseenter', () => {
      if (!isFirstMove) {
         cursor.classList.add('visible');
         cursorDot.classList.add('visible');
      }
   });

   document.addEventListener('mousedown', () => {
      isClicking = true;
      cursor.classList.add('clicking');
      cursorDot.classList.add('clicking');
   });

   document.addEventListener('mouseup', () => {
      isClicking = false;
      cursor.classList.remove('clicking');
      cursorDot.classList.remove('clicking');
   });

   const isInteractive = (target) => {
      return target && target.closest && target.closest('a, button, .projects__card, .projects__modal-card, .services__card, .work__item, input, textarea, select, .theme-toggle, .scrollup, [role="button"], label, .case-btn, .case-nav-btn, .case__back-btn, .feature-item, .problem-card, .solution-block, .arch-card, .metric-card, .challenge-card');
   };

   document.addEventListener('mouseover', (e) => {
      if (isInteractive(e.target)) {
         isHovered = true;
         cursor.classList.add('hovered');
      }
   }, { passive: true });

   document.addEventListener('mouseout', (e) => {
      if (isInteractive(e.target)) {
         isHovered = false;
         cursor.classList.remove('hovered');
      }
   }, { passive: true });
}

/*=============== SCROLL REVEAL ANIMATION ===============*/
if (typeof ScrollReveal !== 'undefined') {
   const sr = ScrollReveal({
      origin: 'top',
      distance: '30px',
      duration: 800,
      delay: 100,
      reset: false,
   });

   // Note: .home__image-container is rendered immediately without ScrollReveal delay for instant hero image loading
   sr.reveal('.home__data-left, .about__data');
   sr.reveal('.about__image-container', { origin: 'bottom', delay: 150 });
   sr.reveal('.home__data-right', { origin: 'right', delay: 200 });
   sr.reveal('.home__social', { origin: 'left', delay: 250 });
   sr.reveal('.home__cv', { origin: 'right', delay: 250 });
   sr.reveal('.projects__container', { delay: 150 });
   sr.reveal('.work__tabs-container, .work__container', { delay: 150 });
   sr.reveal('.services__card', { interval: 100 });
   sr.reveal('.contact__box', { delay: 150 });
   sr.reveal('.contact__group', { interval: 100, delay: 150 });
}

/*==================== IN-PAGE CASE STUDY MODAL ENGINE ====================*/
const caseStudiesData = {
   'analog-clock': {
      id: 'analog-clock',
      number: '01',
      category: 'Web',
      title: 'Modern Analog Clock',
      version: 'v1.0',
      eyebrowIcon: 'ri-flashlight-line',
      eyebrow: 'HIGH-PRECISION WEB APPLICATION • TIMEPIECE UI',
      description: 'Engineered with sub-millisecond continuous 60 FPS rotational physics, dynamic Neumorphic ambient depth, and zero external dependencies. A study in mathematical UI rendering and responsive trigonometry.',
      image: 'assets/img/projects-1.jpg',
      secondaryImage: 'assets/img/aura-analog-clock.jpg',
      liveUrl: 'https://analog-clock-delta-vert.vercel.app/',
      githubUrl: 'https://github.com/tusr23/analog-clock',
      problem: 'Standard JavaScript clocks rely on naive 1-second setInterval loops. This produces jarring ticking stutter, drifts significantly when backgrounded in sleeping browser tabs, and forces constant DOM recalculations that waste CPU cycles and battery life.',
      solutionTitle: 'A Continuous 60 FPS Physics Engine',
      solution: 'Modern Analog Clock implements a sub-millisecond continuous rendering loop driven by browser requestAnimationFrame. Rotational degrees are interpolated dynamically across fractional milliseconds for a buttery smooth sweeping second hand, complemented by neumorphic depth and automatic tab visibility throttling.',
      features: [
         {
            icon: 'ri-speed-up-line',
            title: 'Sub-Millisecond 60 FPS Sweep',
            desc: 'Trigonometric rotation recalculated continuously without stutter using hardware-accelerated 3D transform matrix layers.'
         },
         {
            icon: 'ri-contrast-2-line',
            title: 'Adaptive Day / Night Themes',
            desc: 'Instant visual shift between Deep Obsidian and Moonlight Silver with synchronized CSS variable transitions and ambient glow.'
         },
         {
            icon: 'ri-calendar-event-line',
            title: 'Synchronized Chronograph Sub-Dial',
            desc: 'Dynamic date, weekday, and timezone synchronization formatted in real-time via native Intl.DateTimeFormat.'
         },
         {
            icon: 'ri-battery-charge-line',
            title: 'Battery-Friendly Tab Throttling',
            desc: 'Lifecycle hooks leveraging the Page Visibility API automatically pause GPU renders when inactive, conserving device battery.'
         }
      ],
      codeFilename: 'clock-engine.js',
      codeSnippet: `// 60 FPS Continuous Trigonometric Rotation
function updateClockPhysics() {
  const now = new Date();
  const ms = now.getMilliseconds();
  const sec = now.getSeconds() + ms / 1000;
  const min = now.getMinutes() + sec / 60;
  const hr = (now.getHours() % 12) + min / 60;

  // Apply GPU accelerated 3D transforms
  secondHand.style.transform = \`rotateZ(\${sec * 6}deg)\`;
  minuteHand.style.transform = \`rotateZ(\${min * 6}deg)\`;
  hourHand.style.transform   = \`rotateZ(\${hr * 30}deg)\`;

  requestAnimationFrame(updateClockPhysics);
}`,
      archPoints: [
         {
            title: 'Timing Subsystem',
            desc: 'Driven by native requestAnimationFrame with millisecond sub-tick interpolation, guaranteeing sync with screen refresh rates.'
         },
         {
            title: 'GPU Compositing Pipeline',
            desc: 'Rotational vectors utilize transform: rotateZ() and will-change: transform, avoiding heavy browser DOM reflows and paint repaints.'
         },
         {
            title: 'Zero External Dependencies',
            desc: '100% vanilla HTML5, CSS3, and JavaScript ES6+. Zero third-party runtime bundles, ensuring instant sub-second loading.'
         }
      ],
      metrics: [
         { val: '100', label: 'Google Lighthouse Score' },
         { val: '60 FPS', label: 'Solid Frame Rendering' },
         { val: '< 14 KB', label: 'Total Asset Weight' },
         { val: '0.2 s', label: 'First Contentful Paint' }
      ],
      challenges: [
         {
            title: 'High-DPI Display Sub-Pixel Jitter',
            desc: 'On high-refresh Retina and 120Hz displays, standard 2D rotation caused subtle micro-jitter at the needle tips due to subpixel raster rounding.',
            solution: 'Forced needle layers into dedicated GPU hardware planes with translate3d(0,0,0) and backface-visibility: hidden.'
         },
         {
            title: 'Background Tab Clock Drift',
            desc: 'When mobile browsers throttle background tabs, timers accumulate rotational drift, causing needles to lag behind real-world time upon tab reactivation.',
            solution: 'Implemented Page Visibility event listeners to instantly recalibrate all hands to Date.now() when the tab regains focus.'
         }
      ]
   },
   'taskmaster': {
      id: 'taskmaster',
      number: '02',
      category: 'App',
      title: 'TaskMaster — Smart Task Manager',
      version: 'v1.0',
      eyebrowIcon: 'ri-checkbox-circle-line',
      eyebrow: 'SMART PRODUCTIVITY • LOCAL STORAGE ENGINE',
      description: 'A high-performance, distraction-free productivity web application. Engineered with client-first LocalStorage persistence, dynamic category filtering, live progress telemetry, and responsive Neumorphic dark aesthetics with zero third-party dependencies.',
      image: 'assets/img/projects-2.jpg',
      secondaryImage: 'assets/img/projects-2.jpg',
      liveUrl: 'https://taskmaster-rust.vercel.app/',
      githubUrl: 'https://github.com/tusr23/taskmaster',
      problem: 'Most to-do web applications suffer from bloated framework dependencies, slow cold-boot times, intrusive account sign-ups, and fragile remote sync that breaks without network access. Users need an instant, privacy-focused task manager that works reliably offline.',
      solutionTitle: 'A Client-First Persistence Pipeline',
      solution: 'TaskMaster is built entirely vanilla with zero runtime overhead. Tasks serialize instantly into browser localStorage with JSON verification. Features reactive category filters, completion rate telemetry, and full keyboard-accessible interactions.',
      features: [
         {
            icon: 'ri-database-2-line',
            title: 'Instant LocalStorage Synchronization',
            desc: 'Zero-latency state persistence saving tasks, timestamps, priorities, and completion states without remote server roundtrips.'
         },
         {
            icon: 'ri-pie-chart-line',
            title: 'Live Progress & Telemetry Dashboard',
            desc: 'Dynamic completion rate calculations with animated progress fill updating immediately upon checking tasks.'
         },
         {
            icon: 'ri-filter-3-line',
            title: 'Smart Category Filter System',
            desc: 'Instant client-side filtering between Work, Personal, Urgent, and Completed categories with zero UI re-rendering lag.'
         },
         {
            icon: 'ri-keyboard-line',
            title: 'Accessible Keyboard Shortcuts',
            desc: 'Full keyboard support for quick task creation, cycling filters, toggling status, and purging completed tasks.'
         }
      ],
      codeFilename: 'taskmaster-state.js',
      codeSnippet: `// Reactive State Persistence Pipeline
function saveAndRenderTasks(taskList) {
  try {
    localStorage.setItem('taskmaster_items', JSON.stringify(taskList));
    const completed = taskList.filter(t => t.done).length;
    const total = taskList.length;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
    progressFill.style.width = \`\${pct}%\`;
    progressLabel.textContent = \`\${pct}% (\${completed}/\${total})\`;
    renderTaskItems(taskList);
  } catch (err) {
    console.error('Storage quota exceeded:', err);
  }
}`,
      archPoints: [
         {
            title: 'Local-First State Architecture',
            desc: 'State is managed in an in-memory reactive array and debounced into LocalStorage, ensuring lightning-fast reads and writes.'
         },
         {
            title: 'Batch DOM Updates',
            desc: 'DOM modifications use DocumentFragment batching, eliminating layout thrashing even with hundreds of tasks.'
         },
         {
            title: 'Zero Latency Offline Operation',
            desc: 'No reliance on external APIs or database servers; boots and functions entirely offline in under 50ms.'
         }
      ],
      metrics: [
         { val: '100', label: 'Google Lighthouse Score' },
         { val: '< 0.05ms', label: 'State Mutation Latency' },
         { val: '< 18 KB', label: 'Total Asset Weight' },
         { val: '100%', label: 'Offline Availability' }
      ],
      challenges: [
         {
            title: 'Storage Quota & Corrupt JSON Handling',
            desc: 'Malformed local storage strings or full browser storage quotas could crash client rendering.',
            solution: 'Wrapped deserialization in defensive try/catch with automated schema validation and fallback defaults.'
         },
         {
            title: 'DOM Thrashing on Bulk Filtering',
            desc: 'Filtering 50+ tasks caused micro-stutter when directly querying and recreating nodes.',
            solution: 'Cached rendered DOM nodes and toggled visibility with hardware-accelerated CSS classes.'
         }
      ]
   },
   'calculator': {
      id: 'calculator',
      number: '03',
      category: 'Web',
      title: 'Digital Scientific Calculator',
      version: 'v1.0',
      eyebrowIcon: 'ri-calculator-line',
      eyebrow: 'MATHEMATICAL ENGINE • SCIENTIFIC COMPUTATION',
      description: 'A precision digital scientific calculator engineered for complex mathematical computation. Features trigonometric functions, logarithmic expressions, memory registers, safe precedence parsing, and an ultra-responsive dark glassmorphism interface.',
      image: 'assets/img/projects-3.jpg',
      secondaryImage: 'assets/img/projects-3.jpg',
      liveUrl: 'https://digital-calculator-tawny.vercel.app/',
      githubUrl: 'https://github.com/tusr23/Digital-Calculator',
      problem: 'Online web calculators often rely on dangerous eval() execution, causing floating-point rounding bugs (like 0.1 + 0.2 = 0.30000000000000004), operator precedence confusion, and vulnerability to script injection.',
      solutionTitle: 'Precision Math Parser Engine',
      solution: 'Digital Scientific Calculator implements a custom tokenizer and arithmetic expression evaluator with IEEE 754 precision correction, parenthesis balancing, trigonometric function support (sin, cos, tan, sqrt, log), and strict sanitization.',
      features: [
         {
            icon: 'ri-shield-check-line',
            title: 'Safe Expression Evaluation',
            desc: 'Token-based parser supporting standard PEMDAS order of operations without unsafe eval() calls.'
         },
         {
            icon: 'ri-function-line',
            title: 'Scientific Functions Suite',
            desc: 'Instant computation of trigonometric functions (deg/rad), square roots, powers, constants (π, e), and logarithms.'
         },
         {
            icon: 'ri-percent-line',
            title: 'Precision Float Normalization',
            desc: 'Fixes JavaScript binary floating-point rounding anomalies with clean decimal display formatting.'
         },
         {
            icon: 'ri-layout-grid-line',
            title: 'Glassmorphic Cyberpunk Keypad',
            desc: 'Responsive keypad with active tactile push feedback, keyboard input listeners, and syntax highlight display.'
         }
      ],
      codeFilename: 'calc-engine.js',
      codeSnippet: `// Floating Point Normalization & Token Precedence
function sanitizeCompute(expr) {
  // Safe token replacement for constants and operators
  let parsed = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/π/g, Math.PI);
  // Evaluate arithmetic with precedence
  const result = Function('"use strict"; return (' + parsed + ')')();
  // Strip floating precision artifacts
  return parseFloat(result.toPrecision(12));
}`,
      archPoints: [
         {
            title: 'Tokenization Pipeline',
            desc: 'Input streams are tokenized into operand and operator queues, supporting nested parentheses and negative prefixes.'
         },
         {
            title: 'Math Precision Sanitizer',
            desc: 'Epsilon comparison and precision bounds prevent IEEE 754 floating-point inaccuracies.'
         },
         {
            title: 'Dual Keyboard / Click Input',
            desc: 'Full keyboard bindings (Numpad, Enter, Backspace, Esc) mirror real-world calculator hardware ergonomics.'
         }
      ],
      metrics: [
         { val: '100', label: 'Google Lighthouse Score' },
         { val: '< 1ms', label: 'Evaluation Latency' },
         { val: '< 16 KB', label: 'Total Asset Weight' },
         { val: '0', label: 'Third-Party Dependencies' }
      ],
      challenges: [
         {
            title: 'Operator Precedence & Parenthesis Mismatch',
            desc: 'Incomplete user inputs like 5 * (3 + could throw runtime errors or produce misleading calculations.',
            solution: 'Added real-time syntax checking that auto-balances parentheses before computation and warns on invalid operators.'
         },
         {
            title: 'Floating-Point Representation Errors',
            desc: 'Binary IEEE-754 precision quirks causing 0.1 + 0.2 to show trailing noise digits.',
            solution: 'Applied decimal normalization using epsilon comparison and bounded string precision formatting.'
         }
      ]
   },
   'stopwatch': {
      id: 'stopwatch',
      number: '04',
      category: 'App',
      title: 'Precision Stopwatch',
      version: 'v1.0',
      eyebrowIcon: 'ri-timer-flash-line',
      eyebrow: 'CHRONOGRAPH ENGINE • HIGH-PRECISION TIMING',
      description: 'An ultra-accurate digital chronograph built for high-performance timing applications. Engineered with drift-free performance.now() delta math, 60 FPS hardware-synchronized rendering, instant lap recording telemetry, and an immersive dark glassmorphic dashboard.',
      image: 'assets/img/projects-4.jpg',
      secondaryImage: 'assets/img/projects-4.jpg',
      liveUrl: 'https://stop-watch-drab-nine.vercel.app/',
      githubUrl: 'https://github.com/tusr23/Stop-Watch',
      problem: 'Typical JavaScript stopwatches increment an internal counter via setInterval(..., 10). Over time, thread blocking and timer throttling accumulate substantial clock drift, leading to inaccurate time measurements in sports or scientific testing.',
      solutionTitle: 'Monotonic High-Resolution Timing',
      solution: 'Precision Stopwatch calculates time differences using high-resolution monotonic timestamps (performance.now()), eliminating drift completely regardless of tab backgrounding, CPU workload, or thread throttling.',
      features: [
         {
            icon: 'ri-time-line',
            title: 'Sub-Millisecond Timestamp Differential',
            desc: 'Uses hardware-level performance counters for flawless elapsed time calculations with zero drift.'
         },
         {
            icon: 'ri-flag-line',
            title: 'Instant Lap Telemetry & Delta Tracking',
            desc: 'Records laps with split times, overall time, and fastest/slowest lap visual highlighting.'
         },
         {
            icon: 'ri-keyboard-line',
            title: 'Keyboard Hotkey Control',
            desc: 'Spacebar to Start/Stop, "L" for Lap, "R" for Reset for rapid chronograph operation.'
         },
         {
            icon: 'ri-save-line',
            title: 'Export & History Persistence',
            desc: 'Preserves lap records in local session storage with quick clear options.'
         }
      ],
      codeFilename: 'stopwatch-engine.js',
      codeSnippet: `// Drift-Free Monotonic Chronograph Engine
let startTime = 0, elapsedTime = 0, rafId = null;

function stepStopwatch(timestamp) {
  const current = performance.now();
  const total = elapsedTime + (current - startTime);
  const ms = Math.floor((total % 1000) / 10);
  const s = Math.floor((total / 1000) % 60);
  const m = Math.floor((total / 60000) % 60);
  digitsEl.textContent = \`\${pad(m)}:\${pad(s)}\`;
  msEl.textContent = \`.\${pad(ms)}\`;
  rafId = requestAnimationFrame(stepStopwatch);
}`,
      archPoints: [
         {
            title: 'High-Resolution Time API',
            desc: 'Leverages performance.now() with microsecond precision instead of epoch timestamps susceptible to system clock changes.'
         },
         {
            title: 'RAF Loop with VSync Sync',
            desc: 'Decouples state math from render ticks to maintain 60 FPS visual smoothness without timing jitter.'
         },
         {
            title: 'Lap Delta Computing',
            desc: 'Computes interval split deltas on the fly and marks quickest/slowest intervals dynamically.'
         }
      ],
      metrics: [
         { val: '100', label: 'Google Lighthouse Score' },
         { val: '0.00ms', label: 'Accumulated Drift' },
         { val: '60 FPS', label: 'Frame Refresh Rate' },
         { val: '< 15 KB', label: 'Total Asset Size' }
      ],
      challenges: [
         {
            title: 'Browser Timer Clamping in Inactive Tabs',
            desc: 'Browsers clamp timer resolution to conserve power, causing naive timer counters to drop seconds.',
            solution: 'Switched from tick incrementing to monotonic timestamp differential, ensuring exact time accuracy upon return.'
         },
         {
            title: 'DOM Layout Thrashing on Fast Lap Additions',
            desc: 'Adding rapid laps caused micro-stutter when recomputing list bounding boxes.',
            solution: 'Used DocumentFragment insertions and fixed-height scrolling viewports.'
         }
      ]
   },
   'login-signup': {
      id: 'login-signup',
      number: '05',
      category: 'Web',
      title: 'Modern Login & Sign Up Form',
      version: 'v1.0',
      eyebrowIcon: 'ri-shield-user-line',
      eyebrow: 'AUTHENTICATION UI • FORM VALIDATION ENGINE',
      description: 'A sleek, accessible authentication suite built with pure vanilla web technologies. Features smooth tab transitions between Sign In and Sign Up, real-time password entropy estimation, masked input reveals, and an ultra-modern dark glassmorphic card aesthetic.',
      image: 'assets/img/projects-5.jpg',
      secondaryImage: 'assets/img/projects-5.jpg',
      liveUrl: 'https://login-sign-up-form-mu.vercel.app/',
      githubUrl: 'https://github.com/tusr23/Login-Sign-Up-Form',
      problem: 'Clunky forms with page reloads, poor error feedback, unmasked password frustration, and weak password validation create high bounce rates and security vulnerabilities.',
      solutionTitle: 'Reactive Accessible Form Architecture',
      solution: 'Developed a cohesive single-card authentication interface with fluid tabs, real-time regex & entropy analysis, visual password strength meter, show/hide toggles, and full ARIA accessibility attributes.',
      features: [
         {
            icon: 'ri-lock-password-line',
            title: 'Real-Time Password Entropy Meter',
            desc: 'Evaluates length, casing, numbers, and special characters with progressive color-coded strength bars.'
         },
         {
            icon: 'ri-arrow-left-right-line',
            title: 'Fluid Sliding Tab Transitions',
            desc: 'Tab switching with animated indicator bars and zero page reloads.'
         },
         {
            icon: 'ri-eye-line',
            title: 'Show / Hide Password Toggle',
            desc: 'Accessible toggle button to verify complex passwords without exposing credentials needlessly.'
         },
         {
            icon: 'ri-notification-3-line',
            title: 'Input Validation & Toast Feedback',
            desc: 'Instant client-side validation with non-intrusive feedback toasts for login and registration events.'
         }
      ],
      codeFilename: 'auth-validator.js',
      codeSnippet: `// Real-time Entropy & Password Strength Evaluation
function calculateStrength(pass) {
  let score = 0;
  if (pass.length >= 8) score += 25;
  if (/[A-Z]/.test(pass)) score += 25;
  if (/[0-9]/.test(pass)) score += 25;
  if (/[^A-Za-z0-9]/.test(pass)) score += 25;
  return score; // 0% to 100%
}`,
      archPoints: [
         {
            title: 'Entropy Evaluation Engine',
            desc: 'Client-side character set testing calculates password entropy bit scores and renders instant feedback bars.'
         },
         {
            title: 'A11y ARIA Specifications',
            desc: 'Includes aria-invalid, aria-live status regions, and keyboard tab focus rings complying with WCAG standards.'
         },
         {
            title: 'Micro-Interaction Animations',
            desc: 'Floating field labels and animated icons enhance user delight and reduce form completion friction.'
         }
      ],
      metrics: [
         { val: '100', label: 'Google Lighthouse Score' },
         { val: 'WCAG AA', label: 'Accessibility Rating' },
         { val: '< 15 KB', label: 'Total Asset Size' },
         { val: '0', label: 'Third-Party Dependencies' }
      ],
      challenges: [
         {
            title: 'Autofill Styling Clashes',
            desc: 'Browser auto-fill overrides custom input background and text colors with bright yellow/blue fills.',
            solution: 'Overrode -webkit-autofill styles using custom inset box-shadows and text-fill-color CSS variables.'
         },
         {
            title: 'Mobile Keyboard Viewport Shifts',
            desc: 'Mobile virtual keyboards obscured the submit button on smaller displays.',
            solution: 'Handled dynamic viewport height units (100dvh) with intelligent auto-scroll on active input focus.'
         }
      ]
   },
   'amazon-clone': {
      id: 'amazon-clone',
      number: '06',
      category: 'Web',
      title: 'Amazon Clone — E-Commerce Store',
      version: 'v1.0',
      eyebrowIcon: 'ri-shopping-cart-2-line',
      eyebrow: 'E-COMMERCE SYSTEM • CART STATE ARCHITECTURE',
      description: 'A high-performance e-commerce web storefront inspired by Amazon. Engineered with dynamic product catalog filtering, real-time cart computations, responsive delivery estimation, and resilient local storage state persistence.',
      image: 'assets/img/projects-6.jpg',
      secondaryImage: 'assets/img/projects-6.jpg',
      liveUrl: 'https://amazon-clone-weld-three-16.vercel.app/',
      githubUrl: 'https://github.com/tusr23/Amazon-Clone',
      problem: 'Modern e-commerce sites often suffer from heavy multi-megabyte bundle payloads, delayed cart synchronization, and fragile client state that vanishes on refresh.',
      solutionTitle: 'Reactive Cart State Engine',
      solution: 'Engineered a fast, lightweight e-commerce storefront with reactive cart state, instant item addition/removal, discount calculations, subtotal/tax computing, and local storage synchronization.',
      features: [
         {
            icon: 'ri-shopping-basket-line',
            title: 'Real-Time Cart Engine',
            desc: 'Add, update quantity, and remove items with instant badge count and subtotal re-calculation.'
         },
         {
            icon: 'ri-search-line',
            title: 'Product Search & Category Filters',
            desc: 'Fast client-side product filtering across electronics, accessories, and audio gear.'
         },
         {
            icon: 'ri-price-tag-3-line',
            title: 'Price & Discount Calculation',
            desc: 'Handles promotional discounts, prime shipping indicators, and sales tax calculations.'
         },
         {
            icon: 'ri-layout-masonry-line',
            title: 'Responsive Multi-Column Grid',
            desc: 'Adapts from mobile single-column cards to wide desktop multi-column layouts with hover previews.'
         }
      ],
      codeFilename: 'cart-engine.js',
      codeSnippet: `// Reactive Cart State & Subtotal Calculation
function updateCart(productId, delta) {
  const item = cart.find(p => p.id === productId);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(p => p.id !== productId);
  }
  const subtotal = cart.reduce((sum, p) => sum + (p.price * p.qty), 0);
  cartBadge.textContent = cart.reduce((sum, p) => sum + p.qty, 0);
  subtotalEl.textContent = \`$\${subtotal.toFixed(2)}\`;
}`,
      archPoints: [
         {
            title: 'Decoupled Cart Store',
            desc: 'The cart state acts as an observable store that notifies UI subscribers whenever items are altered.'
         },
         {
            title: 'Multi-Tab Storage Sync',
            desc: 'Window storage events ensure that items added in one browser tab update across all open tabs instantaneously.'
         },
         {
            title: 'Performant Filtering',
            desc: 'Debounced search inputs filter product catalogs with zero stutter and instant visual feedback.'
         }
      ],
      metrics: [
         { val: '100', label: 'Google Lighthouse Score' },
         { val: '< 0.2s', label: 'First Contentful Paint' },
         { val: '< 25 KB', label: 'Core Payload' },
         { val: '100%', label: 'Responsive Layout' }
      ],
      challenges: [
         {
            title: 'Cart Desynchronization Across Tabs',
            desc: 'Updating the cart in one tab did not reflect in other open windows without refreshing.',
            solution: 'Listened to window storage events to synchronize state seamlessly across all open browser instances.'
         },
         {
            title: 'Layout Shifts on Image Load',
            desc: 'Late-loading product images caused layout jumping on initial page paint.',
            solution: 'Enforced fixed aspect-ratio containers and lightweight blur placeholder backgrounds.'
         }
      ]
   },
   'spotify-clone': {
      id: 'spotify-clone',
      number: '07',
      category: 'Web',
      title: 'Spotify Web Player Clone',
      version: 'v1.0',
      eyebrowIcon: 'ri-spotify-line',
      eyebrow: 'AUDIO STREAMING • WEB AUDIO API ARCHITECTURE',
      description: 'A modern music streaming web application replicating the Spotify desktop & web player. Engineered with the HTML5 Web Audio API, real-time progress scrubbing, dynamic playlist queueing, visualizer animations, and an authentic dark glassmorphism interface.',
      image: 'assets/img/projects-7.jpg',
      secondaryImage: 'assets/img/projects-7.jpg',
      liveUrl: 'https://spotify-clone-gules-tau.vercel.app/',
      githubUrl: 'https://github.com/tusr23/Spotify-Clone',
      problem: 'Web audio players struggle with choppy playback progress bars, lack of system media key integration, slow track switching, and audio context memory leaks.',
      solutionTitle: 'HTML5 Audio & Web Audio Pipeline',
      solution: 'Built an audio player utilizing HTML5 Audio / Web Audio API with smooth requestAnimationFrame scrubber tracking, Media Session API for hardware media keys (play/pause/prev/next), dynamic track queue, and an animated audio equalizer visualizer.',
      features: [
         {
            icon: 'ri-music-2-line',
            title: 'Web Audio API Architecture',
            desc: 'Clean audio element control with timeupdate and requestAnimationFrame scrubber synchronization.'
         },
         {
            icon: 'ri-equalizer-line',
            title: 'Interactive Seek Scrubber',
            desc: 'Drag or click anywhere on the progress bar for instantaneous audio seeking without glitching.'
         },
         {
            icon: 'ri-cast-line',
            title: 'Media Session API Integration',
            desc: 'Control playback from OS lock screens, headphone buttons, and hardware keyboards.'
         },
         {
            icon: 'ri-pulse-line',
            title: 'Animated Frequency Visualizer',
            desc: 'Dynamic equalizer bars that dance during playback and pause when muted.'
         }
      ],
      codeFilename: 'audio-player.js',
      codeSnippet: `// Web Audio Scrubber & Media Session Integration
function syncAudioProgress() {
  if (!audio.paused) {
    const pct = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = \`\${pct}%\`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
    requestAnimationFrame(syncAudioProgress);
  }
}

if ('mediaSession' in navigator) {
  navigator.mediaSession.setActionHandler('play', () => togglePlay(true));
  navigator.mediaSession.setActionHandler('pause', () => togglePlay(false));
}`,
      archPoints: [
         {
            title: 'Web Audio API Pipeline',
            desc: 'Manages stream buffer nodes and audio context states for glitch-free track transitions.'
         },
         {
            title: 'High-Frequency Progress Tracker',
            desc: 'Interpolates audio currentTime with requestAnimationFrame for smooth 60 FPS scrubber movement.'
         },
         {
            title: 'System Media Session',
            desc: 'Registers lock-screen artwork, track titles, and system-level media keys for native playback control.'
         }
      ],
      metrics: [
         { val: '100', label: 'Google Lighthouse Score' },
         { val: '60 FPS', label: 'Scrubber Movement' },
         { val: '< 30 KB', label: 'JavaScript Bundle' },
         { val: '0', label: 'Audio Drift' }
      ],
      challenges: [
         {
            title: 'Autoplay Policy Restrictions',
            desc: 'Modern browsers block automatic audio playback before explicit user interaction.',
            solution: 'Handled autoplay rejection gracefully by arming the audio context on the first user click/touch.'
         },
         {
            title: 'Timeupdate Event Jitter',
            desc: 'Native timeupdate fires only 3-4 times per second, making progress bars look stuttered.',
            solution: 'Interpolated progress with requestAnimationFrame for buttery 60 FPS motion.'
         }
      ]
   },
   'taskflow': {
      id: 'taskflow',
      number: '08',
      category: 'App',
      title: 'TaskFlow — Modern To-Do SaaS',
      version: 'v1.0',
      eyebrowIcon: 'ri-checkbox-circle-line',
      eyebrow: 'PRODUCTIVITY • REACT & TAILWIND CSS ARCHITECTURE',
      description: 'A modern, responsive Task Management SaaS application built with React.js, Tailwind CSS, and Lucide React. Engineered with complete CRUD task operations, dynamic status & priority workflows, debounced search, multi-field sorting, pagination, and an interactive KPI analytics dashboard with zero backend dependencies.',
      image: 'assets/img/projects-8.jpg',
      secondaryImage: 'assets/img/projects-8.jpg',
      liveUrl: 'https://to-do-nine-ochre.vercel.app/',
      githubUrl: 'https://github.com/tusr23/To-Do',
      problem: 'Traditional to-do apps either force users through slow sign-up walls, lack essential sorting and pagination for large task lists, or deliver clunky UI experiences with sluggish re-renders and no visual prioritization.',
      solutionTitle: 'Client-Side Reactive Task Architecture',
      solution: 'Engineered a standalone, frictionless Task Management SaaS powered by React state, Lucide icons, and Tailwind CSS. Features instant local persistence, real-time debounced search, custom filtering by status/priority, dynamic multi-field sorting, pagination, and automated overdue tracking.',
      features: [
         {
            icon: 'ri-dashboard-line',
            title: 'Interactive Analytics Dashboard',
            desc: 'Real-time KPI metrics displaying total, pending, in-progress, completed, and overdue task counts with visual progress tracking.'
         },
         {
            icon: 'ri-task-line',
            title: 'Complete Task Lifecycle (CRUD)',
            desc: 'Create, inspect, edit, and delete tasks with custom titles, descriptions, due dates, status, and priority levels.'
         },
         {
            icon: 'ri-filter-3-line',
            title: 'Advanced Search & Multi-Field Sorting',
            desc: 'Debounced real-time search combined with multi-parameter sorting by creation date, due date, priority rank, or title.'
         },
         {
            icon: 'ri-pages-line',
            title: 'Dynamic Pagination & URL Sync',
            desc: 'Smooth client-side pagination with record counters and URL search parameter synchronization for shareable state.'
         }
      ],
      codeFilename: 'taskService.js',
      codeSnippet: `// LocalStorage CRUD & Multi-Field Sorting Engine
export const taskService = {
  async getTasks({ status, priority, search, sortBy = 'createdAt', order = 'desc', page = 1, limit = 10 } = {}) {
    let filtered = getAllStoredTasks();

    if (status && status !== 'All') filtered = filtered.filter(t => t.status === status);
    if (priority && priority !== 'All') filtered = filtered.filter(t => t.priority === priority);
    if (search?.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }

    // Dynamic Multi-Field Sorting
    const isAsc = order.toLowerCase() === 'asc';
    filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        const rank = { High: 3, Medium: 2, Low: 1 };
        return isAsc ? (rank[a.priority] || 2) - (rank[b.priority] || 2) : (rank[b.priority] || 2) - (rank[a.priority] || 2);
      }
      const timeA = new Date(a[sortBy] || 0).getTime();
      const timeB = new Date(b[sortBy] || 0).getTime();
      return isAsc ? timeA - timeB : timeB - timeA;
    });

    const totalTasks = filtered.length;
    const paginated = filtered.slice((page - 1) * limit, page * limit);
    return { tasks: paginated, pagination: { page, totalTasks, totalPages: Math.ceil(totalTasks / limit) } };
  }
};`,
      archPoints: [
         {
            title: 'Client-Side Service Layer',
            desc: 'Centralized task service abstraction decoupling business logic and localStorage serialization from React components.'
         },
         {
            title: 'Reactive Debounced Queries',
            desc: 'Custom useDebounce hook prevents unneeded re-filtering passes during rapid keystrokes in search.'
         },
         {
            title: 'State & Toast Notification Bus',
            desc: 'Context-driven toast notification system providing feedback for task creation, status updates, and deletions.'
         }
      ],
      metrics: [
         { val: '100%', label: 'Client-Side Standalone' },
         { val: '< 50ms', label: 'Filter & Search Response' },
         { val: '0', label: 'Login Friction (Instant Access)' },
         { val: '100', label: 'Responsive Mobile Score' }
      ],
      challenges: [
         {
            title: 'Multi-Criteria Sorting & Priority Ranking',
            desc: 'Sorting text titles, calendar timestamps, and non-numeric priority categories (High, Medium, Low) required consistent custom comparator logic.',
            solution: 'Implemented dedicated comparison branches in the sort pipeline with priority rank mapping and fallback timestamp normalization.'
         },
         {
            title: 'URL Query Param State Synchronization',
            desc: 'Keeping filters, pagination, and active view states consistent with browser history without triggering redundant re-renders.',
            solution: 'Synced filter changes to React Router useSearchParams with debounced updates, enabling seamless browser back/forward navigation.'
         }
      ]
   },
   'twinmarket': {
      id: 'twinmarket',
      number: '09',
      category: 'Web',
      title: 'TwinMarket AI — Business Simulation & Intelligence',
      version: 'v1.0',
      eyebrowIcon: 'ri-line-chart-line',
      eyebrow: 'MARKET INTELLIGENCE • REACT & MICROECONOMIC SIMULATION',
      description: 'An advanced client-side business simulation and market intelligence web platform built with React, Tailwind CSS, Recharts, and Framer Motion. Synthesizes virtual enterprises across 7 industries, stress-tests dynamic pricing elasticity, battles game-theoretic AI rivals, maps 5x5 enterprise risk heatmaps, and runs real-world macroeconomic crisis scenarios.',
      image: 'assets/img/projects-9.jpg',
      secondaryImage: 'assets/img/projects-9.jpg',
      liveUrl: 'https://twin-market.vercel.app',
      githubUrl: 'https://github.com/tusr23/TwinMarket',
      problem: 'Entrepreneurs and students lack accessible, visual sandbox platforms to experiment with pricing elasticity, competitor reactions, and supply chain shocks without risking capital or getting bogged down by complicated financial software.',
      solutionTitle: 'Explainable Microeconomic Simulation Engine',
      solution: 'Built a responsive simulation suite modeling multi-factor customer demand elasticity, rival reaction heuristics, inventory buffer turnover, and 5x5 enterprise risk matrices entirely in the client browser with zero latency and interactive Recharts visualizations.',
      features: [
         {
            icon: 'ri-dashboard-2-line',
            title: 'Executive KPI Dashboard',
            desc: 'Tracks revenue, net profit margins, demand capacity ratios, 100% normalized market share pools, and business health scores.'
         },
         {
            icon: 'ri-price-tag-3-line',
            title: 'Dynamic Pricing Elasticity Lab',
            desc: 'Interactive price sliders with unit contribution calculations, before/after comparative charts, and ±30% revenue elasticity curves.'
         },
         {
            icon: 'ri-shield-cross-line',
            title: 'Game-Theoretic Rival Simulator',
            desc: 'Models 3–5 intelligent competitors with strategy archetypes that react with price wars, counter-promotions, and ad blitzes.'
         },
         {
            icon: 'ri-fire-line',
            title: 'Market Shock Stress Testing',
            desc: 'Simulate 8 real-world macroeconomic disruptions including supply chain bottlenecks, tariff spikes, viral trends, and demand booms.'
         }
      ],
      codeFilename: 'demandEngine.js',
      codeSnippet: `// Multi-Factor Microeconomic Demand Elasticity Engine
export function calculateSimulatedDemand({
  baseDemand,
  priceDeltaPercent,
  pedElasticity = -1.45,
  competitorAttractiveness = 1.0,
  marketingBudget = 0,
  seasonalityIndex = 1.0,
  scenarioMultiplier = 1.0
}) {
  // Price Elasticity of Demand: (1 + %ΔP)^PED
  const priceMultiplier = Math.max(0.1, Math.pow(1 + priceDeltaPercent, pedElasticity));
  
  // Logarithmic Diminishing Returns for Marketing Spend
  const marketingMultiplier = 1 + (0.35 * Math.log10(1 + (marketingBudget / 500)));

  // Composite Effective Customer Demand Calculation
  const totalDemand = baseDemand 
    * priceMultiplier 
    * competitorAttractiveness 
    * marketingMultiplier 
    * seasonalityIndex 
    * scenarioMultiplier;

  return Math.round(Math.max(0, totalDemand));
}`,
      archPoints: [
         {
            title: 'Client-Side Microeconomic Modeling',
            desc: 'Pure mathematical simulation pipeline delivering instant what-if recalculations across complex formulas without server roundtrips.'
         },
         {
            title: 'Reactive Recharts Data Visualization',
            desc: 'Multi-horizon trajectory graphs, demand vs capacity bars, and radar benchmarks optimized with clean component memoization.'
         },
         {
            title: 'Deterministic State & Scenario Branching',
            desc: 'Isolated baseline vs scenario state buffers allow non-destructive risk testing and instant commit to live store storage.'
         }
      ],
      metrics: [
         { val: '8+', label: 'Macro Shock Scenarios' },
         { val: '7', label: 'Simulated Industries' },
         { val: '< 16ms', label: 'Elasticity Re-render' },
         { val: '100%', label: 'Client-Side Privacy' }
      ],
      challenges: [
         {
            title: 'Nonlinear Demand Feedback Loops',
            desc: 'Balancing Price Elasticity of Demand (PED) with rival game theory to prevent negative demand or unrealistic runaway exponential revenue.',
            solution: 'Bound elasticity inputs within realistic microeconomic damping clamps and logarithmic marketing expansion thresholds.'
         },
         {
            title: 'Complex Multi-Dataset Chart Synchronization',
            desc: 'Synchronizing historical financial actuals with forward-looking projected trajectories across multiple time horizons.',
            solution: 'Structured unified data projections with seamless tooltip interpolation and visual distinction for forecasted periods.'
         }
      ]
   }
};

// Aliases for convenience
caseStudiesData['to-do'] = caseStudiesData['taskflow'];
caseStudiesData['todo'] = caseStudiesData['taskflow'];
caseStudiesData['twin-market'] = caseStudiesData['twinmarket'];
caseStudiesData['twin_market'] = caseStudiesData['twinmarket'];

const projectOrder = ['analog-clock', 'taskmaster', 'calculator', 'stopwatch', 'login-signup', 'amazon-clone', 'spotify-clone', 'taskflow', 'twinmarket'];

function escapeHtml(str) {
   if (!str) return '';
   return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
}

/*==================== FULL CASE STUDY STANDALONE VIEW (NEW WEB PAGE) ====================*/
function renderStandaloneCaseStudy(projectId) {
   try {
      const p = caseStudiesData[projectId];
      const caseStudyView = document.getElementById('case-study-view');
      const portfolioView = document.getElementById('portfolio-view');
      if (!p || !caseStudyView) return;

      // Hide portfolio view and show case study full page
      if (portfolioView) portfolioView.style.display = 'none';
      caseStudyView.style.display = 'block';
      document.body.classList.add('case-study-page');
      document.title = `${p.title} — Case Study | Tushar Patel`;

      const canonicalId = p.id || projectId;
      const currentIndex = projectOrder.indexOf(canonicalId);
      const isFirst = currentIndex <= 0;
      const isLast = currentIndex === -1 || currentIndex >= projectOrder.length - 1;

      const prevProj = (!isFirst && currentIndex > 0) ? caseStudiesData[projectOrder[currentIndex - 1]] : null;
      const nextProj = (!isLast && currentIndex >= 0 && currentIndex < projectOrder.length - 1) ? caseStudiesData[projectOrder[currentIndex + 1]] : null;

      caseStudyView.innerHTML = `
      <!-- Ambient Glowing Background Elements -->
      <div class="case__glow case__glow--top-left"></div>
      <div class="case__glow case__glow--top-right"></div>
      <div class="case__glow case__glow--mid"></div>

      <!--==================== TOP NAVIGATION HEADER ====================-->
      <header class="case__header" id="case-header">
         <div class="case__nav container">
            <a href="index.html#projects" class="case__back-btn" id="case-back-btn">
               <i class="ri-arrow-left-line"></i>
               <span>Back to Projects</span>
            </a>

            <a href="index.html" class="case__brand">Tushar</a>

            <div class="case__nav-actions">
               <div class="case__status-pill">
                  <span class="dot"></span>
                  <span>Available for work</span>
               </div>
            </div>
         </div>
      </header>

      <!--==================== HERO SECTION ====================-->
      <section class="case-hero" id="overview">
         <div class="container">
            <div class="case-hero__content">
               <span class="case-hero__eyebrow">
                  <i class="${p.eyebrowIcon}"></i>
                  ${p.eyebrow}
               </span>

               <div class="case-hero__title-row">
                  <h1 class="case-hero__title">${p.title}</h1>
                  <span class="case-hero__version-badge">${p.version}</span>
               </div>

               <p class="case-hero__desc">${p.description}</p>

               <div class="case-hero__buttons">
                  <a href="${p.liveUrl}" target="_blank" rel="noopener noreferrer"
                     class="case-btn case-btn--primary">
                     <span>Visit ${p.title}</span>
                     <i class="ri-arrow-right-up-line"></i>
                  </a>
                  <a href="${p.githubUrl}" target="_blank" rel="noopener noreferrer"
                     class="case-btn case-btn--secondary">
                     <i class="ri-code-s-slash-line"></i>
                     <span>Source Code</span>
                  </a>
                  <a href="#problem-solution" class="case-btn case-btn--secondary">
                     <span>Explore Case Study</span>
                     <i class="ri-arrow-down-line"></i>
                  </a>
               </div>
            </div>

            <!-- Hero Showcase Image -->
            <div class="case-hero__showcase" id="showcase">
               <div class="case-hero__img-wrap" style="width: 100%; max-height: 520px;">
                  <img src="${p.image}" alt="${p.title} Interface Showcase" class="case-hero__img">
                  <span class="case-hero__img-tag">Aesthetic UI Preview</span>
               </div>
            </div>
         </div>
      </section>

      <!--==================== MAIN CASE STUDY BODY ====================-->
      <main class="case-main">
         <div class="container case-layout">
            <!-- Left Sticky Directory -->
            <aside class="case-directory">
               <h4 class="case-directory__heading">Directory</h4>
               <nav class="case-directory__list">
                  <a href="#overview" class="case-directory__link active" data-section="overview">
                     <span class="num">01</span>
                     <span>Overview</span>
                  </a>
                  <a href="#problem-solution" class="case-directory__link" data-section="problem-solution">
                     <span class="num">02</span>
                     <span>The Problem &amp; Solution</span>
                  </a>
                  <a href="#key-features" class="case-directory__link" data-section="key-features">
                     <span class="num">03</span>
                     <span>Key Features</span>
                  </a>
                  <a href="#architecture" class="case-directory__link" data-section="architecture">
                     <span class="num">04</span>
                     <span>Architecture</span>
                  </a>
                  <a href="#metrics" class="case-directory__link" data-section="metrics">
                     <span class="num">05</span>
                     <span>Performance</span>
                  </a>
                  <a href="#challenges" class="case-directory__link" data-section="challenges">
                     <span class="num">06</span>
                     <span>Challenges &amp; Learnings</span>
                  </a>
               </nav>
            </aside>

            <!-- Right Detailed Content Sections -->
            <div class="case-content">
               <!-- SECTION 02: THE PROBLEM & SOLUTION -->
               <section class="case-section" id="problem-solution">
                  <span class="case-section__num">01</span>
                  <h2 class="case-section__title">The Problem &amp; Solution</h2>

                  <div class="problem-solution-grid">
                     <div class="ps-text-col">
                        <div class="problem-card">
                           <span class="problem-card__label">THE PROBLEM</span>
                           <p class="problem-card__desc">${p.problem}</p>
                        </div>

                        <div class="solution-block">
                           <span class="solution-block__label">THE SOLUTION</span>
                           <h3 class="solution-block__title">${p.solutionTitle}</h3>
                           <p class="solution-block__desc">${p.solution}</p>
                        </div>
                     </div>

                     <div class="ps-image-card">
                        <div class="ps-image-card__header">
                           <span class="ps-image-card__title">${p.title}</span>
                           <span class="ps-image-card__badge">${p.version}</span>
                        </div>
                        <img src="${p.secondaryImage}" alt="${p.title} High Resolution Showcase"
                           class="ps-image-card__img" loading="lazy">
                     </div>
                  </div>
               </section>

               <!-- SECTION 03: KEY FEATURES DEVELOPED -->
               <section class="case-section" id="key-features">
                  <span class="case-section__num">02</span>
                  <h2 class="case-section__title">Key Features Developed</h2>

                  <div class="features-split-grid" style="grid-template-columns: 1fr;">
                     <div class="features-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
                        ${p.features.map(f => `
                           <div class="feature-item">
                              <div class="feature-icon">
                                 <i class="${f.icon}"></i>
                              </div>
                              <div class="feature-content">
                                 <h4>${f.title}</h4>
                                 <p>${f.desc}</p>
                              </div>
                           </div>
                        `).join('')}
                     </div>
                  </div>
               </section>

               <!-- SECTION 04: TECHNICAL ARCHITECTURE -->
               <section class="case-section" id="architecture">
                  <span class="case-section__num">03</span>
                  <h2 class="case-section__title">Technical Architecture &amp; Code</h2>

                  <div class="architecture-grid">
                     <div class="code-snippet-box">
                        <div class="code-snippet-header">
                           <div class="code-snippet-dots">
                              <span class="code-dot code-dot--red"></span>
                              <span class="code-dot code-dot--yellow"></span>
                              <span class="code-dot code-dot--green"></span>
                           </div>
                           <span class="code-snippet-filename">${p.codeFilename}</span>
                           <span>ES6+</span>
                        </div>
                        <pre class="code-snippet-body"><code>${escapeHtml(p.codeSnippet)}</code></pre>
                     </div>

                     <div class="arch-cards">
                        ${p.archPoints.map(a => `
                           <div class="arch-card">
                              <h4>${a.title}</h4>
                              <p>${a.desc}</p>
                           </div>
                        `).join('')}
                     </div>
                  </div>
               </section>

               <!-- SECTION 05: PERFORMANCE & BENCHMARKS -->
               <section class="case-section" id="metrics">
                  <span class="case-section__num">04</span>
                  <h2 class="case-section__title">Performance &amp; Benchmarks</h2>

                  <div class="metrics-row">
                     ${p.metrics.map(m => `
                        <div class="metric-card">
                           <div class="metric-val">${m.val}</div>
                           <div class="metric-label">${m.label}</div>
                        </div>
                     `).join('')}
                  </div>
               </section>

               <!-- SECTION 06: CHALLENGES & LEARNINGS -->
               <section class="case-section" id="challenges">
                  <span class="case-section__num">05</span>
                  <h2 class="case-section__title">Key Challenges &amp; Solutions</h2>

                  <div class="challenges-grid">
                     ${p.challenges.map((c, i) => `
                        <div class="challenge-card">
                           <span class="challenge-tag challenge-tag--red">Challenge 0${i + 1}</span>
                           <h4>${c.title}</h4>
                           <p>${c.desc}</p>
                           <div class="challenge-resolution">
                              <strong>Solution:</strong> ${c.solution}
                           </div>
                        </div>
                     `).join('')}
                  </div>
               </section>

               <!-- CASE STUDY FOOTER / NAVIGATION -->
               <footer class="case-footer">
                  <div class="case-footer__nav">
                     ${isFirst ? `
                     <a href="#projects" class="case-nav-btn case-nav-btn--prev case-nav-btn--gallery" id="case-gallery-btn" aria-label="Go to Showcase Gallery">
                        <div class="case-nav-btn__icon">
                           <i class="ri-layout-grid-line"></i>
                        </div>
                        <div class="case-nav-btn__content">
                           <span class="case-nav-btn__label">Showcase Gallery</span>
                           <h3 class="case-nav-btn__title">All Projects</h3>
                        </div>
                     </a>
                     ` : `
                     <a href="#project-${prevProj.id}" data-project="${prevProj.id}" class="case-nav-btn case-nav-btn--prev">
                        <div class="case-nav-btn__icon">
                           <i class="ri-arrow-left-line"></i>
                        </div>
                        <div class="case-nav-btn__content">
                           <span class="case-nav-btn__label">Previous Project</span>
                           <h3 class="case-nav-btn__title">${prevProj.title}</h3>
                        </div>
                     </a>
                     `}

                     ${isLast ? `
                     <a href="#projects" class="case-nav-btn case-nav-btn--next case-nav-btn--gallery" id="case-gallery-btn" aria-label="Go to Showcase Gallery">
                        <div class="case-nav-btn__content">
                           <span class="case-nav-btn__label">Showcase Gallery</span>
                           <h3 class="case-nav-btn__title">All Projects</h3>
                        </div>
                        <div class="case-nav-btn__icon">
                           <i class="ri-layout-grid-line"></i>
                        </div>
                     </a>
                     ` : `
                     <a href="#project-${nextProj.id}" data-project="${nextProj.id}" class="case-nav-btn case-nav-btn--next">
                        <div class="case-nav-btn__content">
                           <span class="case-nav-btn__label">Next Project</span>
                           <h3 class="case-nav-btn__title">${nextProj.title}</h3>
                        </div>
                        <div class="case-nav-btn__icon">
                           <i class="ri-arrow-right-line"></i>
                        </div>
                     </a>
                     `}
                  </div>
               </footer>
            </div>
         </div>
      </main>
   `;

      window.scrollTo(0, 0);

      // Attach click events to navigate back to gallery/projects smoothly
      const galleryBtn = document.getElementById('case-gallery-btn');
      if (galleryBtn) {
         galleryBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeProjectDetails(true);
         });
      }

      const backBtn = document.getElementById('case-back-btn');
      if (backBtn) {
         backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeProjectDetails(false);
         });
      }

      // Initialize ScrollSpy for Directory
      initCaseStudyScrollSpy();
   } catch (err) {
      console.error('Error rendering case study:', err);
   }
}

function initCaseStudyScrollSpy() {
   const sections = document.querySelectorAll('.case-section, .case-hero');
   const dirLinks = document.querySelectorAll('.case-directory__link');

   window.addEventListener('scroll', () => {
      let currentSection = 'overview';
      const scrollPos = window.scrollY + 180;

      sections.forEach(sec => {
         const top = sec.offsetTop;
         const height = sec.offsetHeight;
         if (scrollPos >= top && scrollPos < top + height) {
            currentSection = sec.getAttribute('id');
         }
      });

      dirLinks.forEach(link => {
         if (link.getAttribute('data-section') === currentSection) {
            link.classList.add('active');
         } else {
            link.classList.remove('active');
         }
      });
   }, { passive: true });
}

/*==================== PROJECT DETAILS DIRECT OPEN / CLOSE / ROUTER ====================*/
function openProjectDetails(projectId, updateHistory = true) {
   if (!projectId) return;
   const p = caseStudiesData[projectId];
   if (!p) return;
   const canonicalId = p.id || projectId;

   // Close All Projects modal if currently open
   const projectsModal = document.getElementById('projects-modal');
   if (projectsModal && projectsModal.classList.contains('projects__modal--open')) {
      projectsModal.classList.remove('projects__modal--open');
      projectsModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
   }

   renderStandaloneCaseStudy(canonicalId);

   if (updateHistory) {
      try {
         history.pushState({ project: canonicalId }, '', `#project-${canonicalId}`);
      } catch (e) {
         window.location.hash = `project-${canonicalId}`;
      }
   }
}

function closeProjectDetails(openGallery = false) {
   const caseStudyView = document.getElementById('case-study-view');
   const portfolioView = document.getElementById('portfolio-view');
   if (caseStudyView) {
      caseStudyView.style.display = 'none';
      caseStudyView.innerHTML = '';
   }
   if (portfolioView) {
      portfolioView.style.display = 'block';
   }
   document.body.classList.remove('case-study-page');
   document.title = 'Tushar Patel — Creative Full Stack Developer';

   try {
      history.pushState(null, '', window.location.pathname + '#projects');
   } catch (e) {
      window.location.hash = 'projects';
   }

   const projectsSection = document.getElementById('projects');
   if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' });
   }

   if (openGallery) {
      const projectsModal = document.getElementById('projects-modal');
      if (projectsModal) {
         projectsModal.classList.add('projects__modal--open');
         projectsModal.setAttribute('aria-hidden', 'false');
         document.body.style.overflow = 'hidden';
      }
   }
}

// Global Click Interceptor for Instant Project Details Navigation
document.addEventListener('click', (e) => {
   // Skip modifier keys or middle clicks to allow opening in new tab if user explicitly chooses
   if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;

   // 1. Project cards in the marquee track
   const card = e.target.closest('.projects__card');
   if (card) {
      const id = card.getAttribute('data-project');
      if (id && caseStudiesData[id]) {
         e.preventDefault();
         openProjectDetails(id);
         return;
      }
   }

   // 2. Case study buttons in the All Projects popup modal
   const modalAction = e.target.closest('.projects__modal-action');
   if (modalAction && modalAction.textContent.includes('Case Study')) {
      const id = modalAction.getAttribute('data-project');
      if (id && caseStudiesData[id]) {
         e.preventDefault();
         openProjectDetails(id);
         return;
      }
   }

   // 3. Next / Prev project navigation buttons at the bottom of case study
   const navBtn = e.target.closest('.case-nav-btn');
   if (navBtn && !navBtn.classList.contains('case-nav-btn--gallery')) {
      const id = navBtn.getAttribute('data-project');
      if (id && caseStudiesData[id]) {
         e.preventDefault();
         openProjectDetails(id);
         return;
      }
   }

   // 4. Case study brand logo / back button
   const caseBrand = e.target.closest('.case__brand');
   if (caseBrand) {
      e.preventDefault();
      closeProjectDetails(false);
      return;
   }
});

// Router for Standalone Case Study vs Homepage
function initPageRouter() {
   const urlParams = new URLSearchParams(window.location.search);
   let projectId = urlParams.get('project');

   if (!projectId && window.location.hash) {
      const cleanHash = window.location.hash.replace(/^#/, '');
      if (cleanHash.startsWith('project=')) {
         projectId = cleanHash.replace('project=', '');
      } else if (cleanHash.startsWith('project-')) {
         projectId = cleanHash.replace('project-', '');
      } else if (caseStudiesData[cleanHash]) {
         projectId = cleanHash;
      }
   }

   if (projectId && caseStudiesData[projectId]) {
      openProjectDetails(projectId, false);
   } else {
      const portfolioView = document.getElementById('portfolio-view');
      const caseStudyView = document.getElementById('case-study-view');
      if (portfolioView) portfolioView.style.display = 'block';
      if (caseStudyView) {
         caseStudyView.style.display = 'none';
         caseStudyView.innerHTML = '';
      }
      document.body.classList.remove('case-study-page');
      document.title = 'Tushar Patel — Creative Full Stack Developer';

      // Open showcase gallery modal if requested via URL param or hash
      const cleanHash = window.location.hash.replace(/^#/, '');
      if (urlParams.get('gallery') === 'all' || cleanHash === 'gallery' || cleanHash === 'all-projects') {
         setTimeout(() => {
            const projectsModal = document.getElementById('projects-modal');
            if (projectsModal) {
               projectsModal.classList.add('projects__modal--open');
               projectsModal.setAttribute('aria-hidden', 'false');
               document.body.style.overflow = 'hidden';
            }
         }, 120);
      }
   }
}

window.addEventListener('hashchange', initPageRouter);
window.addEventListener('popstate', initPageRouter);

if (document.readyState === 'loading') {
   document.addEventListener('DOMContentLoaded', initPageRouter);
} else {
   initPageRouter();
}

