---
title: "Sobre mí"
permalink: /about/
excerpt: "Técnico DevOps especializado en automatización y optimización de infraestructura."
last_modified_at: 2025-10-01T10:30:00-04:00
toc: false
author_profile: true
classes: wide
layout: single
feature_row:
  - image_path: /assets/images/githublogo.png
    alt: "Xavi - Foto de perfil"
    title: "¡Hola! Soy Xavi"
    excerpt: "Soy un técnico DevOps apasionado por construir y optimizar entornos robustos y automatizados. Mi enfoque es en la eficiencia y la resiliencia operativa."
    url: "#mis-habilidades"
    btn_label: "Explora mis habilidades"
    btn_class: "btn--primary"
---

<style>
/* Texto general más pequeño */
.page__content {
  font-size: 0.7rem;
}

/* Grid de proyectos recientes */
.entries-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
}

/* Tarjetas de proyecto */
.entries-grid .grid__item {
  flex: 0 1 300px;
  max-width: 400px;
  box-sizing: border-box;
}

/* Card interna */
.entries-grid .archive__item {
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
}

/* Títulos completos */
.entries-grid .archive__item-title {
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
  word-break: break-word;
}
</style>

¡Bienvenido/a a mi espacio digital! Soy técnico DevOps y trabajo en una consultoría tecnológica, dando soporte a clientes con sus sistemas y participando en proyectos de infraestructura IT. Me gusta aprender sobre diferentes tecnologías y ponerlas en práctica

Este espacio nació para compartir lo que voy aprendiendo y haciendo, me sirve para no perder detalles de mis proyectos y, de paso, espero que también pueda ser útil para quien esté pasando por algo parecido.

### Tecnologías
<div style="
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 50px;
  align-items: center;
  text-align: center;
">

  <div><img src="/assets/images/ansible.png" alt="Ansible" style="max-height: 60px;"></div>
  <div><img src="/assets/images/awx.png" alt="AWX" style="max-height: 60px;"></div>
  <div><img src="/assets/images/AAP.png" alt="AAP" style="max-height: 60px;"></div>
  <div><img src="/assets/images/podman.png" alt="Podman" style="max-height: 60px;"></div>
  <div><img src="/assets/images/docker.png" alt="Docker" style="max-height: 60px;"></div>
  <div><img src="/assets/images/kubernetes.png" alt="Kubernetes" style="max-height: 60px;"></div>
  <div><img src="/assets/images/openshift.png" alt="OpenShift" style="max-height: 60px;"></div>
  <div><img src="/assets/images/aws.png" alt="AWS" style="max-height: 60px;"></div>
  <div><img src="/assets/images/azure.png" alt="Azure" style="max-height: 60px;"></div>
  <div><img src="/assets/images/instana.png" alt="Instana" style="max-height: 60px;"></div>

</div>

### Proyectos



<div class="entries-grid">
  {% assign recent_projects = site.projects | sort: 'date' | reverse | slice: 0,3 %}
  {% for project in recent_projects %}
  <div class="grid__item">
    <article class="archive__item">
      <h2 class="archive__item-title">
        <a href="{{ project.url }}" rel="permalink">{{ project.title }}</a>
      </h2>
      {% if project.excerpt %}
      <p class="archive__item-excerpt">{{ project.excerpt }}</p>
      {% endif %}
    </article>
  </div>
  {% endfor %}
</div>
