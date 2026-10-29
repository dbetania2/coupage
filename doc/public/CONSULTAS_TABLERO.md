# Guía de Comandos GitHub CLI: Repositorio y Tablero (Multiplataforma)

Esta guía define los comandos exactos para que cualquier integrante (Linux, macOS, Windows en PowerShell/CMD) o agente de IA pueda consultar el estado del proyecto, issues, etiquetas y tableros sin necesidad de scripts intermediarios.

---

## 📌 Parámetros del Proyecto
- **Dueño (Owner):** `dbetania2`
- **Repositorio:** `dbetania2/coupage`
- **Proyecto (Project v2):** `2`

> **Requisito previo:** Tener instalada la herramienta `gh` y haber iniciado sesión (`gh auth login`).

---

## 🔍 Fase 1: Descubrimiento (Comprobar qué existe antes de asumir)

Un agente o usuario no debe asumir la existencia de nombres de columnas o etiquetas sin verificar primero:

### 1. Consultar campos personalizados y columnas del Tablero
Permite conocer qué campos existen (ej. *Status*, *Sprint*, *Priority*, *Estimación*) y cuáles son las opciones válidas configuradas en cada uno:
```bash
gh project field-list 2 --owner dbetania2
```
*En formato JSON (ideal para que un agente o script lo parsee):*
```bash
gh project field-list 2 --owner dbetania2 --format json
```

### 2. Consultar Etiquetas (*Labels*) existentes en el Repositorio
```bash
gh label list --repo dbetania2/coupage
```

### 3. Consultar Hitos (*Milestones / Sprints*) existentes en el Repositorio
```bash
gh milestone list --repo dbetania2/coupage
```

---

## 📋 Fase 2: Consultas sobre el Tablero (Projects v2)

### 4. Ver todos los ítems cargados en el Tablero
Lista los elementos asociados al tablero junto con su estado:
```bash
# Formato tabla legible en consola:
gh project item-list 2 --owner dbetania2

# Formato JSON detallado:
gh project item-list 2 --owner dbetania2 --format json
```

---

## 📌 Fase 3: Consultas sobre Tickets e Issues

### 5. Ver tickets generales / totales
```bash
# Listar las issues abiertas (límite por defecto o ajustado):
gh issue list --repo dbetania2/coupage --state open --limit 50

# Listar todas (abiertas y cerradas):
gh issue list --repo dbetania2/coupage --state all --limit 100
```

### 6. Filtrar tickets por etiqueta (*Label*)
*(Utilizar únicamente etiquetas encontradas en la Fase 1)*:
```bash
gh issue list --repo dbetania2/coupage --label "backend"
```

### 7. Filtrar tickets por Hito (*Milestone*)
```bash
gh issue list --repo dbetania2/coupage --milestone "Sprint 1"
```

### 8. Consultar tareas asignadas
```bash
# Tareas del usuario autenticado actualmente:
gh issue list --repo dbetania2/coupage --assignee "@me"

# Tareas de un usuario en específico:
gh issue list --repo dbetania2/coupage --assignee "dbetania2"
```

### 9. Ver el detalle completo y criterios de aceptación de un Ticket
Para leer la descripción, criterios de aceptación (checklist) y comentarios de un issue específico (ejemplo `#1`):
```bash
gh issue view 1 --repo dbetania2/coupage
```

