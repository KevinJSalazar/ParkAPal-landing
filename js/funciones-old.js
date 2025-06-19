"use strict";

import { saveVote, saveReview, getReviews } from "./firebase.js";

function enableFormVote() {
    const form = document.getElementById('form_voting');
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        saveVote(data);
        form.reset();
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('navAction');
    if (btn) {
        btn.addEventListener('click', function () {
            const section = document.getElementById('contactanos');
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    fetch("public/espacios.json")
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector("tbody");

            data.forEach(espacio => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
          <td class="py-2 px-4 border-b text-center text-gray-800">${espacio.lugar}</td>
          <td class="py-2 px-4 border-b text-center text-gray-800">${espacio.fecha}</td>
          <td class="py-2 px-4 border-b text-center text-gray-800">${espacio.tipoVehiculo}</td>
          <td class="py-2 px-4 border-b text-center text-gray-800">${espacio.distancia}</td>
          <td class="py-2 px-4 border-b text-center">
            <button class="bg-pink-600 text-white px-4 py-1 rounded hover:bg-pink-700">Reservar</button>
          </td>
        `;

                tbody.appendChild(tr);
            });
        })
        .catch(error => console.error("Error al cargar los espacios:", error));
});


function enableFormReview() {
    const form = document.getElementById('form_review');
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

function fillStars(rating) {
    const starRating = document.getElementById('star-rating');
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating
            ? '<span style="color:#fbbf24">&#9733;</span>'
            : '<span style="color:#d1d5db">&#9733;</span>';
    }
    starRating.innerHTML = stars;
}

document.addEventListener('DOMContentLoaded', () => {
    // Poblar el combo box de lugares
    const lugares = [
        "Mall del Sur",
        "Rio Centro Ceibos",
        "Mall del Sol"
    ];
    const select = document.getElementById('lugar-select');
    if (select) {
        lugares.forEach(lugar => {
            const option = document.createElement('option');
            option.value = lugar;
            option.textContent = lugar;
            select.appendChild(option);
        });
    }

    // Poblar el combo box de tipo de vehículo
    const tiposVehiculo = [
        "Carro",
        "Moto",
        "Bicicleta"
    ];
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

    const starRating = document.getElementById('star-rating');
    const ratingInput = document.getElementById('rating');
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
});

function displayReviews() {
    getReviews().then(reviews => {
        const container = document.getElementById('divReviews');
        if (!container) return;

        const reviewCounts = [];
        if (reviews && typeof reviews === 'object') {
            Object.values(reviews).forEach(review => {
                reviewCounts.push(review);
            });
            // Ordenar por mayor rating y hora más reciente
            reviewCounts.sort((a, b) => {
                if (b.rating !== a.rating) {
                    return b.rating - a.rating; // Mayor rating primero
                }
                return new Date(b.date) - new Date(a.date); // Más reciente primero
            });

            // Tomar solo los 3 primeros
            for (let i = 0; i < reviewCounts.length && i < 3; i++) {
                const review = reviewCounts[i];
                // Generar estrellas
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

            // Si hay menos de 3 reseñas, limpiar los contenedores restantes
            for (let i = reviewCounts.length; i < 3; i++) {
                const starsContainer = document.getElementById(`plan-review${i + 1}-stars`);
                const commentContainer = document.getElementById(`plan-review${i + 1}-comment`);
                if (starsContainer) starsContainer.innerHTML = '';
                if (commentContainer) commentContainer.textContent = 'No hay reseñas disponibles.';
            }

        }
    });
}



(() => {
    enableFormVote();
    enableFormReview();
    displayReviews();
})();

const carousel = document.querySelector('#carousel > div');
const slides = carousel.children.length;
let current = 0;

document.getElementById('prev').onclick = function () {
    current = (current - 1 + slides) % slides;
    carousel.style.transform = `translateX(-${current * 100}%)`;
};
document.getElementById('next').onclick = function () {
    current = (current + 1) % slides;
    carousel.style.transform = `translateX(-${current * 100}%)`;
};
