/**
 * src/composicion.js
 * 
 * Único lugar del sistema que instancia adaptadores concretos (Firestore, memoria, servicios externos)
 * y los inyecta en los casos de uso del dominio (Inversión de Dependencias).
 */

// Por ahora exporta el contenedor de dependencias vacío listo para recibir los casos de uso
export const contenedor = {};

