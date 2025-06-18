// Importa las funciones principales de Firebase desde el CDN (v11.9.1)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getDatabase, ref, set, push, get, child } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

// Configuración usando variables de entorno de Vite
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializa la app de Firebase con el objeto de configuración importado desde las variables de entorno
const app = initializeApp(firebaseConfig);

// Obtiene la referencia a la base de datos en tiempo real
const db = getDatabase(app);

function saveVote(data) {
  const votesCollectionRef = ref(db, 'votes');
  const newUserRef = push(votesCollectionRef);
  return set(newUserRef, {
    user: data.userInput,
    email: data.email,
    message: data.message,
    date: new Date().toISOString()
  })
    .then(() => {
      return { success: true, message: 'Voto guardado correctamente.' };
    })
    .catch((error) => {
      return { success: false, message: 'Error al guardar el voto.', error };
    });
}

function saveReview(data) {
  const reviewsCollectionRef = ref(db, 'reviews');
  const newUserRef = push(reviewsCollectionRef);
  return set(newUserRef, {
    rating: data.rating,
    review: data.review,
    date: new Date().toISOString()
  })
    .then(() => {
      return { success: true, message: 'Voto guardado correctamente.' };
    })
    .catch((error) => {
      return { success: false, message: 'Error al guardar el voto.', error };
    });
}

async function getReviews() {
  const reviewsRef = ref(db, 'reviews');
  try {
    const snapshot = await get(reviewsRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return {};
    }
  } catch (error) {
    return { error: true, message: `Error al obtener las reseñas: ${error.message}` };
  }
}

export { saveVote, saveReview, getReviews };
