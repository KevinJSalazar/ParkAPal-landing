"use strict";

import { saveVote , saveReview , getReviews } from "./firebase.js";

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

function enableFormReview() {
    const form = document.getElementById('form_review');
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        saveReview(data);
        fillStars(0);
        form.reset();
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

        // Limpiar contenido previo
        container.innerHTML = "";

        // Ordenar por rating descendente y fecha descendente
        const sorted = reviews.slice().sort((a, b) => {
            if (b.rating !== a.rating) {
                return b.rating - a.rating; // Mayor rating primero
            }
            return new Date(b.date) - new Date(a.date); // Más reciente primero
        });

        // Tomar las 3 mejores
        const topThree = sorted.slice(0, 3);

        // Renderizar
        container.innerHTML = topThree.map(review => {
            let stars = '';
            for (let i = 1; i <= 5; i++) {
                stars += `<span class="${i <= review.rating ? 'text-yellow-400' : 'text-gray-300'} text-2xl">&#9733;</span>`;
            }
            return `
                <div class="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto mb-6">
                    <div class="flex items-center mb-2">
                        <div class="flex mr-2">${stars}</div>
                        <span class="text-gray-500 text-sm">${new Date(review.date).toLocaleString()}</span>
                    </div>
                    <p class="text-gray-700 italic">${review.comment}</p>
                </div>
            `;
        }).join('');

        if (topThree.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500">No hay reseñas disponibles.</p>';
        }
    }).catch(() => {
        const container = document.getElementById('divReviews');
        if (container) {
            container.innerHTML = '<p class="text-center text-red-500">Error al cargar las reseñas.</p>';
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
