'use strict';

/**
 * Carrusel de imágenes: permite navegar entre slides.
 */
(function enableCarousel() {
    const carousel = document.querySelector('#carousel > div');
    if (!carousel) return;
    const slides = carousel.children.length;
    let current = 0;

    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');

    if (prevBtn) {
        prevBtn.onclick = function () {
            current = (current - 1 + slides) % slides;
            carousel.style.transform = `translateX(-${current * 100}%)`;
        };
    }
    if (nextBtn) {
        nextBtn.onclick = function () {
            current = (current + 1) % slides;
            carousel.style.transform = `translateX(-${current * 100}%)`;
        };
    }
})();

/**
 * Cambia el estilo de la barra de navegación al hacer scroll.
 */
(function enableHeaderScrollEffect() {
    const header = document.getElementById("header");
    const navcontent = document.getElementById("nav-content");
    const navaction = document.getElementById("navAction");
    const toToggle = document.querySelectorAll(".toggleColour");

    if (!header || !navcontent || !navaction) return;

    document.addEventListener("scroll", function () {
        const scrollpos = window.scrollY;

        if (scrollpos > 10) {
            header.classList.add("bg-white", "shadow");
            navaction.classList.remove("bg-white", "text-gray-800");
            navaction.classList.add("gradient", "text-white");
            navcontent.classList.remove("bg-gray-100");
            navcontent.classList.add("bg-white");
            toToggle.forEach(el => {
                el.classList.add("text-gray-800");
                el.classList.remove("text-white");
            });
        } else {
            header.classList.remove("bg-white", "shadow");
            navaction.classList.remove("gradient", "text-white");
            navaction.classList.add("bg-white", "text-gray-800");
            navcontent.classList.remove("bg-white");
            navcontent.classList.add("bg-gray-100");
            toToggle.forEach(el => {
                el.classList.add("text-white");
                el.classList.remove("text-gray-800");
            });
        }
    });
})();

/**
 * Lógica para mostrar/ocultar el menú de navegación en dispositivos móviles.
 */
(function enableNavDropdown() {
    const navMenuDiv = document.getElementById("nav-content");
    const navMenu = document.getElementById("nav-toggle");

    if (!navMenuDiv || !navMenu) return;

    document.onclick = function (e) {
        const target = (e && e.target) || (event && event.srcElement);

        // Si el click no es dentro del menú
        if (!checkParent(target, navMenuDiv)) {
            // Si el click es en el botón de menú
            if (checkParent(target, navMenu)) {
                navMenuDiv.classList.toggle("hidden");
            } else {
                // Click fuera del menú y del botón, ocultar menú
                navMenuDiv.classList.add("hidden");
            }
        }
    };

    // Función auxiliar para verificar si el elemento es hijo de otro
    function checkParent(t, elm) {
        while (t && t.parentNode) {
            if (t === elm) return true;
            t = t.parentNode;
        }
        return false;
    }
})();