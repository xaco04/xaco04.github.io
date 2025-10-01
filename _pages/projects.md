---
title: "Proyectos"
permalink: /projects/
layout: collection
collection: projects
entries_layout: grid
---
<style>
.entries-grid {
  display: flex !important;
  flex-wrap: wrap !important;
  justify-content: center !important;
  gap: 2rem !important;
}

/* Cada tarjeta */
.entries-grid .grid__item {
  flex: 0 1 45% !important;   /* ocupa aproximadamente 45% del ancho del contenedor */
  max-width: 500px !important;
  box-sizing: border-box !important;
}

/* Card interna */
.entries-grid .archive__item {
  padding: 1.5rem !important;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box !important;
}

/* Títulos completos */
.entries-grid .archive__item-title {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: clip !important;
  word-break: break-word !important;
}

/* Responsive: en pantallas pequeñas 1 por fila */
@media (max-width: 768px) {
  .entries-grid .grid__item {
    flex: 0 1 100% !important;
  }
}

</style>



Listado de proyectos realizados.
