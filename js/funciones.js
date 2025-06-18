"use strict";

import { saveVote } from "./firebase.js";

function enableForm() {
    const form = document.getElementById('form_voting');
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        saveVote(data);
        form.reset();
    });
}

(() => {
    enableForm();
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