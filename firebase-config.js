// Configuración de Firebase
// IMPORTANTE: Reemplaza estos valores con tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBLs4wdyleBMCuSOgD8L2kQW_lafOSnnvE",
  authDomain: "orquideas-monitor.firebaseapp.com",
  databaseURL: "https://orquideas-monitor-default-rtdb.firebaseio.com",
  projectId: "orquideas-monitor",
  storageBucket: "orquideas-monitor.firebasestorage.app",
  messagingSenderId: "692829732322",
  appId: "1:692829732322:web:dbfdd1afbec734a6b7cdbb"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referencias a servicios de Firebase
const database = firebase.database();
const firestore = firebase.firestore();

console.log('Firebase inicializado correctamente');