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
   // Duplicate cards to make continuous infinite marquee scroll seamless
   projectsTrack.innerHTML += projectsTrack.innerHTML;
   let isPaused = false;
   let pauseTimeout = null;
   const scrollSpeed = 0.8;
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
   function stepProjectsMarquee() {
      if (!isPaused) {
         projectsContainer.scrollLeft += scrollSpeed;
         const halfWidth = projectsTrack.scrollWidth / 2;
         if (projectsContainer.scrollLeft >= halfWidth) {
            projectsContainer.scrollLeft = 0;
         }
      }
      requestAnimationFrame(stepProjectsMarquee);
   }
   requestAnimationFrame(stepProjectsMarquee);
   const getCardScrollStep = () => {
      const card = projectsTrack.querySelector('.projects__card');
      const trackStyle = window.getComputedStyle(projectsTrack);
      const gap = parseFloat(trackStyle.gap) || 24;
      return (card ? card.offsetWidth : 300) + gap;
   };
   if (projectsPrev) {
      projectsPrev.addEventListener('click', () => {
         pauseTemporarily(2500);
         const halfWidth = projectsTrack.scrollWidth / 2;
         if (projectsContainer.scrollLeft <= 10) {
            projectsContainer.scrollLeft += halfWidth;
         }
         projectsContainer.scrollBy({ left: -getCardScrollStep(), behavior: 'smooth' });
      });
   }
   if (projectsNext) {
      projectsNext.addEventListener('click', () => {
         pauseTemporarily(2500);
         const halfWidth = projectsTrack.scrollWidth / 2;
         if (projectsContainer.scrollLeft >= halfWidth - 10) {
            projectsContainer.scrollLeft -= halfWidth;
         }
         projectsContainer.scrollBy({ left: getCardScrollStep(), behavior: 'smooth' });
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

if (cursor && cursorDot) {
   let mouseX = window.innerWidth / 2;
   let mouseY = window.innerHeight / 2;
   let cursorX = mouseX;
   let cursorY = mouseY;
   let isFirstMove = true;
   // Trailing delay factor: lower value adds more delayed trailing lag (floaty inertia)
   const TRAIL_SPEED = 0.08;

   document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (isFirstMove) {
         cursorX = mouseX;
         cursorY = mouseY;
         cursor.style.left = `${cursorX}px`;
         cursor.style.top = `${cursorY}px`;
         cursor.classList.add('visible');
         cursorDot.classList.add('visible');
         isFirstMove = false;
      }
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
   });

   // Smooth follow for outer ring with more delayed trailing lag
   const renderCursor = () => {
      cursorX += (mouseX - cursorX) * TRAIL_SPEED;
      cursorY += (mouseY - cursorY) * TRAIL_SPEED;
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
      requestAnimationFrame(renderCursor);
   };
   requestAnimationFrame(renderCursor);

   // Window enter / leave handling
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

   // Click feedback
   document.addEventListener('mousedown', () => {
      cursor.classList.add('clicking');
      cursorDot.classList.add('clicking');
   });

   document.addEventListener('mouseup', () => {
      cursor.classList.remove('clicking');
      cursorDot.classList.remove('clicking');
   });

   // Hover effect for interactive elements with event delegation
   const isInteractive = (target) => {
      return target && target.closest && target.closest('a, button, .projects__card, .projects__modal-card, .services__card, .work__item, input, textarea, select, .theme-toggle, .scrollup, [role="button"], label');
   };

   document.addEventListener('mouseover', (e) => {
      if (isInteractive(e.target)) {
         cursor.classList.add('hovered');
      }
   });

   document.addEventListener('mouseout', (e) => {
      if (isInteractive(e.target)) {
         cursor.classList.remove('hovered');
      }
   });
}

/*=============== SCROLL REVEAL ANIMATION ===============*/
if (typeof ScrollReveal !== 'undefined') {
   const sr = ScrollReveal({
      origin: 'top',
      distance: '60px',
      duration: 1800,
      delay: 200,
      reset: false,
   });

   sr.reveal('.home__data-left, .about__data');
   sr.reveal('.home__image-container, .about__image-container', { origin: 'bottom', delay: 350 });
   sr.reveal('.home__data-right', { origin: 'right', delay: 400 });
   sr.reveal('.home__social', { origin: 'left', delay: 450 });
   sr.reveal('.home__cv', { origin: 'right', delay: 450 });
   sr.reveal('.projects__container', { delay: 300 });
   sr.reveal('.work__tabs-container, .work__container', { delay: 300 });
   sr.reveal('.services__card', { interval: 150 });
   sr.reveal('.contact__box', { delay: 200 });
   sr.reveal('.contact__group', { interval: 120, delay: 300 });
}
