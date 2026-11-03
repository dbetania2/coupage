const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const dotenv = require('dotenv');

// Asegurar carga de variables de entorno si se importa de forma aislada
dotenv.config({ path: path.join(__dirname, '..', '.env') });

if (!admin.getApps().length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  admin.initializeApp({
    credential: admin.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
}

const db = getFirestore();

module.exports = { admin, db };
