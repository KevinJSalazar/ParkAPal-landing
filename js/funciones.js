"use strict";

// Importa funciones de Firebase
import { saveVote, saveReview, getReviews } from "./firebase.js";

/**
 * Habilita el desplazamiento suave para el botón "Saber más".
 */
function enableSmoothScrollSaberMas() {
    // Busca el botón "Saber más" dentro de un enlace que apunte a #estacionamientos
    const saberMasLink = document.querySelector('a[href="#estacionamientos"] > button');
    if (saberMasLink) {
        saberMasLink.addEventListener('click', function (e) {
            e.preventDefault();
            const destino = document.getElementById('estacionamientos');
            if (destino) {
                destino.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

/**
 * Filtra y muestra los espacios disponibles según los criterios del formulario de búsqueda.
 * Además, muestra una alerta al reservar.
 */
function enableEspaciosSearchFilter() {
    const form = document.querySelector('section#estacionamientos form');
    const tablaSection = document.querySelector('section#estacionamientos section.bg-gray-100.py-8');
    const tbody = tablaSection ? tablaSection.querySelector('tbody') : null;
    let espaciosOriginales = [];

    function cargarEspacios() {
        fetch("/espacios.json")
            .then(response => response.json())
            .then(data => {
                espaciosOriginales = data;
                mostrarEspacios(data);
            })
            .catch(error => console.error("Error al cargar los espacios:", error));
    }

    function mostrarEspacios(espacios) {
        if (!tbody) return;
        tbody.innerHTML = '';
        if (espacios.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-gray-500">No se encontraron espacios disponibles.</td></tr>`;
            return;
        }
        espacios.forEach(espacio => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="py-2 px-4 border-b text-center text-gray-800">${espacio.lugar}</td>
                <td class="py-2 px-4 border-b text-center text-gray-800">${espacio.fecha}</td>
                <td class="py-2 px-4 border-b text-center text-gray-800">${espacio.tipoVehiculo}</td>
                <td class="py-2 px-4 border-b text-center text-gray-800">${espacio.distancia}</td>
                <td class="py-2 px-4 border-b text-center">
                    <button class="bg-pink-600 text-white px-4 py-1 rounded hover:bg-pink-700 reservar-btn">Reservar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Agrega el evento a todos los botones "Reservar"
        tbody.querySelectorAll('.reservar-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                alert('¡Reserva hecha!');
            });
        });
    }

    if (tablaSection) tablaSection.style.display = 'none';

    if (form && tablaSection) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const lugar = form.querySelector('#lugar-select').value;
            const fecha = form.querySelector('input[type="date"]').value;
            const tipoVehiculo = form.querySelector('select:not(#lugar-select)').value;
            const distancia = form.querySelector('input[type="number"]').value;

            const filtrados = espaciosOriginales.filter(espacio => {
                const coincideLugar = !lugar || espacio.lugar === lugar;
                const coincideFecha = !fecha || espacio.fecha === fecha;
                const coincideTipo = !tipoVehiculo || espacio.tipoVehiculo.toLowerCase() === tipoVehiculo.toLowerCase();
                const coincideDistancia = !distancia || Number(espacio.distancia) <= Number(distancia);
                return coincideLugar && coincideFecha && coincideTipo && coincideDistancia;
            });

            mostrarEspacios(filtrados);
            tablaSection.style.display = '';
        });
    }

    cargarEspacios();
}

/**
 * Habilita el formulario de votación y gestiona su envío.
 */
function enableFormVote() {
    const form = document.getElementById('form_voting');
    if (!form) return;
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        saveVote(data);
        form.reset();
    });
}

/**
 * Habilita el formulario de reseñas y gestiona su envío.
 */
function enableFormReview() {
    const form = document.getElementById('form_review');
    if (!form) return;
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        saveReview(data);
        fillStars(0);
        form.reset();
        displayReviews();
    });
}

/**
 * Rellena las estrellas de calificación visualmente.
 * @param {number} rating - Calificación seleccionada.
 */
function fillStars(rating) {
    const starRating = document.getElementById('star-rating');
    if (!starRating) return;
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating
            ? '<span style="color:#fbbf24">&#9733;</span>'
            : '<span style="color:#d1d5db">&#9733;</span>';
    }
    starRating.innerHTML = stars;
}

/**
 * Muestra las reseñas destacadas en la sección correspondiente.
 */
function displayReviews() {
    getReviews().then(reviews => {
        const container = document.getElementById('divReviews');
        if (!container) return;

        const reviewCounts = [];
        if (reviews && typeof reviews === 'object') {
            Object.values(reviews).forEach(review => {
                reviewCounts.push(review);
            });
            // Ordenar por mayor rating y fecha más reciente
            reviewCounts.sort((a, b) => {
                if (b.rating !== a.rating) {
                    return b.rating - a.rating;
                }
                return new Date(b.date) - new Date(a.date);
            });

            // Mostrar solo las 3 mejores reseñas
            for (let i = 0; i < reviewCounts.length && i < 3; i++) {
                const review = reviewCounts[i];
                // Generar estrellas visuales
                let stars = '';
                for (let j = 1; j <= 5; j++) {
                    stars += `<span class="${j <= review.rating ? 'text-yellow-400' : 'text-gray-300'} text-2xl">&#9733;</span>`;
                }

                // Seleccionar los contenedores por id
                const starsContainer = document.getElementById(`plan-review${i + 1}-stars`);
                const commentContainer = document.getElementById(`plan-review${i + 1}-comment`);

                if (starsContainer) starsContainer.innerHTML = stars;
                if (commentContainer) commentContainer.textContent = review.review;
            }

            // Limpiar los contenedores restantes si hay menos de 3 reseñas
            for (let i = reviewCounts.length; i < 3; i++) {
                const starsContainer = document.getElementById(`plan-review${i + 1}-stars`);
                const commentContainer = document.getElementById(`plan-review${i + 1}-comment`);
                if (starsContainer) starsContainer.innerHTML = '';
                if (commentContainer) commentContainer.textContent = 'No hay reseñas disponibles.';
            }
        }
    });
}

/**
 * Inicializa el scroll suave al hacer clic en el botón "Contáctanos".
 */
function enableSmoothScrollToContact() {
    const btn = document.getElementById('navAction');
    if (btn) {
        btn.addEventListener('click', function () {
            const section = document.getElementById('contactanos');
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

/**
 * Pobla el combo box de lugares y de tipo de vehículo en la barra de búsqueda.
 */
function populateSearchCombos() {
    // Opciones de lugares (puedes hacer esto dinámico si lo deseas)
    const lugares = [
        "Mall del Sur",
        "Rio Centro Ceibos",
        "Mall del Sol"
    ];
    const selectLugar = document.getElementById('lugar-select');
    if (selectLugar) {
        lugares.forEach(lugar => {
            const option = document.createElement('option');
            option.value = lugar;
            option.textContent = lugar;
            selectLugar.appendChild(option);
        });
    }

    // Opciones de tipo de vehículo
    const tiposVehiculo = [
        "Carro",
        "Moto",
        "Bicicleta"
    ];
    // Busca todos los selects y agrega las opciones solo al de tipo de vehículo
    const selectsTipo = document.querySelectorAll('select');
    selectsTipo.forEach(select => {
        if (select.options[0] && select.options[0].textContent.includes('Tipo de vehículo')) {
            // Elimina las opciones existentes excepto la primera
            while (select.options.length > 1) {
                select.remove(1);
            }
            tiposVehiculo.forEach(tipo => {
                const option = document.createElement('option');
                option.value = tipo.toLowerCase();
                option.textContent = tipo;
                select.appendChild(option);
            });
        }
    });
}

/**
 * Inicializa el sistema de calificación con estrellas.
 */
function enableStarRating() {
    const starRating = document.getElementById('star-rating');
    const ratingInput = document.getElementById('rating');
    if (!starRating || !ratingInput) return;
    let currentRating = 0;

    starRating.addEventListener('mousemove', (e) => {
        const rect = starRating.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const starWidth = rect.width / 5;
        const hoverRating = Math.ceil(x / starWidth);
        fillStars(hoverRating);
    });

    starRating.addEventListener('mouseleave', () => {
        fillStars(currentRating);
    });

    starRating.addEventListener('click', (e) => {
        const rect = starRating.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const starWidth = rect.width / 5;
        currentRating = Math.ceil(x / starWidth);
        ratingInput.value = currentRating;
        fillStars(currentRating);
    });
}

/**
 * Inicializa el carrusel de imágenes.
 */
function enableCarousel() {
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
}

// Inicialización de todas las funciones al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    enableFormVote();
    enableFormReview();
    displayReviews();
    enableSmoothScrollToContact();
    populateSearchCombos();
    enableStarRating();
    enableCarousel();
    enableSmoothScrollSaberMas();
    enableEspaciosSearchFilter();

    // Scroll suave para enlaces de navegación internos
    document.querySelectorAll('nav a[href^="#"]').forEach(function (enlace) {
        enlace.addEventListener('click', function (e) {
            e.preventDefault();
            const destino = document.querySelector(this.getAttribute('href'));
            if (destino) {
                destino.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});