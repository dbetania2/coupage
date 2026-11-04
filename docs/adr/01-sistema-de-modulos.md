# ADR 01: Adopción de ECMAScript Modules (ESM) en el microservicio orders-api

* **Fecha:** 03/11/2026
* **Quiénes participaron:** Gallardi, Satina, Del Grecco

### Contexto
Para estructurar `orders-api`, se requiere definir formalmente el sistema de módulos estándar. Inicialmente se utilizó CommonJS (`require`) para testear el servidor base, pero ante el avance del proyecto y la futura incorporación del asistente de IA en este microservicio, se define la arquitectura definitiva de módulos.

### Opciones consideradas

* **Opción 1: CommonJS (CJS)**
  * *Ventajas:* Es el sistema clásico de Node.js, muy estable y no hace falta escribir `.js` al final de los archivos que importamos.
  * *Desventajas:* Da errores al intentar usar librerías modernas (como las de Inteligencia Artificial) y se escribe con `require`, que es diferente al `import` que ya usamos en el frontend.

* **Opción 2: ECMAScript Modules (ESM)**
  * *Ventajas:* Es el estándar oficial moderno de JavaScript, funciona directo con las librerías de IA y usa la misma forma de importar (`import/export`) que Next.js en el frontend.
  * *Desventajas:* Obliga a escribir siempre `.js` al final de cada archivo local que llamemos y cambia la forma de buscar carpetas (ya no se usa `__dirname`).

### Decisión
Elegimos **ECMAScript Modules (ESM)** configurando `"type": "module"` en `package.json` para tener el mismo estándar de código que el frontend y dejar el backend listo para conectar la Inteligencia Artificial sin problemas.

### Consecuencias
* **Qué gana el sistema:** Trabajar con las librerías modernas de IA sin errores y usar la misma sintaxis (`import/export`) en todo el proyecto (frontend y backend).
* **Qué pierde el sistema:** La comodidad de no tener que escribir la extensión `.js` en cada archivo que importamos.
* **Qué queda más difícil de ahora en adelante:** Acostumbrarse a poner siempre el `.js` al final de cada import local.

### Qué nos haría cambiar de decisión
Si decidiéramos no poner la Inteligencia Artificial en este servicio de Node.js (por ejemplo, pasándola a otro lenguaje como Python) y alguna librería obligatoria de la materia no funcionara bien con ESM.
