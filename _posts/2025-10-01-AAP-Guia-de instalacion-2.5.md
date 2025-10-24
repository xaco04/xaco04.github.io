---
title: "Red Hat Ansible Automation Platform 2.5: Guía de Instalación en RHEL 10 (Topología Growth Contenerizada)"
date: 2025-10-01
categories:
  - Automation
  - Ansible
  - RedHat
tags:
  - AAP
  - AnsibleAutomationPlatform
  - RHEL
  - InstallationGuide
  - Containerized
toc: true
read_time: true
comments: true
classes: wide
excerpt: "Instalación de Red Hat Ansible Automation Platform 2.5 en RHEL 10. Guía para configurar una topología 'Growth' contenerizada, ideal para desarrollo y pruebas."
header:
  overlay_image: /assets/images/RedHatbanner.png # Asegúrate de tener una imagen de banner en esta ruta
  overlay_filter: 0.5 # Ajusta el oscurecimiento de la imagen si es necesario
---

## Red Hat Ansible Automation Platform 2.5: Tu Guía Práctica de Instalación en RHEL 10 (Topología Growth Contenerizada)

### Introducción

Esta guía sirve para ver el proceso de instalación de Red Hat Ansible Automation Platform (AAP) 2.5 en un entorno Red Hat Enterprise Linux (RHEL) 10. El objetivo es instalar AAP utilizando una topología "Growth" contenerizada, lo que significa que todos los componentes se instalarán en una única máquina virtual.

Esta configuración es perfecta para desarrolladores, para realizar pruebas o para pequeñas implementaciones donde estás comenzando a explorar el poder de la automatización con AAP. Además, lo mejor de esta topología es su flexibilidad, se podrá escalar a una arquitectura "Enterprise" más compleja, con alta disponibilidad y recursos distribuidos.

En este artículo, revisaremos los requisitos previos del sistema, la configuración esencial del entorno y los componentes clave de AAP, para tener una base sólida antes de empezar la instalación paso a paso.

### Entendiendo Ansible Automation Platform (AAP)

Antes de meternos de lleno en los detalles técnicos, es fundamental entender qué es exactamente Ansible Automation Platform y por qué se ha convertido en una herramienta tan valiosa.

Para situarnos mejor, vamos a entender conceptos:

*   **Ansible**: el motor de automatización, la herramienta base que permite definir y ejecutar tareas en servidores y sistemas.
*   **AWX**: el proyecto open source que añade una interfaz gráfica y servicios básicos para gestionar Ansible de forma más cómoda.
*   **AAP (Ansible Automation Platform)**: la versión empresarial respaldada por Red Hat, que parte de AWX y lo expande con seguridad, soporte oficial y funcionalidades avanzadas para producción y grandes organizaciones.

Imagina que tienes que realizar la misma tarea repetidamente en decenas, o incluso cientos, de servidores o sistemas. Suena aburrido y un palo..., Ansible nació para resolver ese problema, permite escribir instrucciones que tus sistemas pueden ejecutar por ti, como, por ejemplo: "instalar un servidor web Apache en todos mis servidores Linux". Pues bien, AAP eleva esta capacidad a un nivel empresarial.

Piensa en AAP como la versión corporativa y robusta de AWX, el proyecto de código abierto y gratuito de Ansible. Mientras que AWX es fantástico para experimentar y familiarizarte con la interfaz y los conceptos de automatización, AAP añade capas críticas de seguridad, un soporte oficial de Red Hat inestimable, y herramientas avanzadas para gestionar entornos de gran escala con total confianza. No se limita a ejecutar comandos; AAP te ayuda a orquestar procesos complejos, centralizar inventarios y credenciales, y facilitar el trabajo en equipo a través de una interfaz gráfica intuitiva.

Muchas organizaciones empiezan con AWX para probar las aguas, pero cuando la automatización se convierte en un pilar fundamental de sus operaciones, necesitan una plataforma estable, respaldada y con funcionalidades avanzadas. Ahí es precisamente donde brilla AAP, incluyendo componentes como Automation Controller, Execution Environments, Automation Mesh, acceso a contenido validado, parches de seguridad y, crucialmente, el soporte oficial de Red Hat.

### Topologías y Métodos de Instalación

Cuando instalas Ansible Automation Platform, la forma en que decides organizar tu infraestructura se conoce como "topología". Esto define cómo se distribuyen los diferentes componentes de AAP en tus servidores y cómo se interconectan para asegurar un rendimiento óptimo y una operación estable.

Red Hat valida y recomienda ciertas topologías de despliegue para asegurar que la plataforma funcione de manera fiable y con soporte completo:

*   **Topología Enterprise**: Diseñada para organizaciones grandes o entornos de producción críticos. Se enfoca en alta disponibilidad, máximo rendimiento y escalabilidad para manejar grandes volúmenes de usuarios y cargas de trabajo sin interrupciones.
*   **Topología Growth**: Ideal para organizaciones más pequeñas, entornos de desarrollo o con recursos limitados. Permite un despliegue más simple y económico al principio, con la flexibilidad de crecer y escalar a medida que tus necesidades evolucionan.

Es importante recordar que, si bien puedes instalar AAP en otras configuraciones, Red Hat solo garantiza soporte completo para las topologías que ellos mismos han probado y publicado. Utilizar una topología validada asegura que tu plataforma sea estable y confiable a largo plazo.

Existen tres métodos principales para instalar y desplegar Ansible Automation Platform 2.5, dependiendo de tu infraestructura y tus preferencias de gestión. Para esta guía, nos centraremos en el método "Contenedores" y la topología "Growth".

| Método       | Infraestructura                     | Descripción                                                                                                                | Topologías probadas                                    |
| :----------- | :---------------------------------- | :------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------- |
| RPM          | Máquinas virtuales y servidores físicos | El instalador RPM despliega AAP en Red Hat Enterprise Linux utilizando paquetes RPM. El cliente gestiona el ciclo de vida del producto e infraestructura. | RPM growth topology, RPM enterprise topology           |
| Contenedores | Máquinas virtuales y servidores físicos | El instalador basado en contenedores utiliza Podman para ejecutar AAP en contenedores sobre RHEL. El cliente gestiona el ciclo de vida del producto e infraestructura. | Container growth topology, Container enterprise topology |
| Operator     | Red Hat OpenShift                   | El operador despliega AAP dentro de OpenShift usando Red Hat OpenShift Operators. El cliente gestiona el ciclo de vida del producto e infraestructura. | Operator growth topology, Operator enterprise topology |

### Componentes

Para armar el "rompecabezas" de Ansible Automation Platform, es crucial conocer las piezas que lo componen. AAP no es solo una herramienta, sino un ecosistema de servicios interconectados que trabajan juntos para potenciar tu automatización.

Los componentes más importantes que debemos conocer, basándome en la documentación oficial de Red Hat:

| Componente                | Descripción                                                               | ¿Por qué importa?                                                                  |
| :------------------------ | :------------------------------------------------------------------------ | :--------------------------------------------------------------------------------- |
| Platform Gateway          | La puerta de entrada a AAP. Maneja autenticación, permisos y guarda un registro de cambios (activity stream). | Te logueas una sola vez y accedes a todo. Además, tienes trazabilidad de lo que pasa. |
| Automation Controller     | El cerebro de la plataforma. Define, ejecuta y escala automatizaciones.     | Permite orquestar playbooks desde lo simple hasta lo empresarial.                   |
| Automation Hub            | El “mercado central” de colecciones certificadas por Red Hat y partners. | Usas contenido probado y soportado, sin reinventar la rueda.                        |
| Private Automation Hub    | Tu propio hub privado y desconectado. Sincroniza contenido y guarda colecciones personalizadas. | Ideal para entornos on-premise o integrados con CI/CD.                              |
| High Availability Hub     | Una versión redundante y escalable del hub con múltiples nodos.           | Alta disponibilidad = menos caídas y más tranquilidad.                             |
| Event-Driven Ansible Controller | Automatización reactiva: escucha eventos y ejecuta acciones con rulebooks.  | Aumenta la agilidad y automatiza decisiones en tiempo real.                         |
| Automation Mesh           | Una red de nodos distribuida que reparte la carga de trabajo.             | Escalabilidad, resiliencia y flexibilidad en entornos grandes o dispersos.         |
| Execution Environments    | Contenedores donde se ejecutan los playbooks. Incluyen motor + módulos.   | Portabilidad y consistencia: “si funciona aquí, funciona en todos lados”.            |
| Ansible Galaxy            | Comunidad para compartir roles y colecciones.                             | Reutilizas contenido y aceleras tus proyectos.                                     |
| Content Navigator         | Interfaz de texto (TUI) y CLI principal para construir y ejecutar automatizaciones. | Tu navaja suiza en la terminal, base de futuros IDEs.                              |
| PostgreSQL                | Base de datos relacional donde se guarda todo: inventarios, credenciales, historial. | La memoria de la plataforma.                                                       |

### Detalles Técnicos

Esta sección se enfoca en los requisitos validados por Red Hat para una instalación "Growth" contenerizada. Aquí muestro el diseño y las especificaciones para desplegar AAP en una única máquina virtual, de forma clara y sencilla.

#### Virtual machine requirements

Estos son los requisitos mínimos de hardware para tu VM de RHEL 10 en una topología "Growth":

| Requirement       | Minimum requirement                                                                                                                                                                                                                                                                          |
| :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RAM               | 16 GB                                                                                                                                                                                                                                                                                        |
| CPUs              | 4                                                                                                                                                                                                                                                                                            |
| Local disk        | Total available disk space: 60 GB<br>Installation directory: 15 GB (if on a dedicated partition)<br>/var/tmp for online installations: 1 GB<br>/var/tmp for offline or bundled installations: 3 GB<br>Temporary directory (defaults to /tmp) for offline or bundled installations: 10GB |
| Disk IOPS         | 3000                                                                                                                                                                                                                                                                                         |

#### System configuration

Estos son los aspectos clave que tu sistema RHEL 10 debe cumplir. Atención a la suscripción, ya que es un paso que a menudo se pasa por alto y puede causar problemas:

| Tipo              | Descripción                                                                                                                                                                 | Notas                                                                                                                                                                                                                                    |
| :---------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Suscripción       | Suscripción válida de Red Hat Ansible Automation Platform<br>Suscripción válida de Red Hat Enterprise Linux (para poder usar los repositorios BaseOS y AppStream)              |                                                                                                                                                                                                                                          |
| Sistema operativo | Red Hat Enterprise Linux 9.2 o versiones posteriores de Red Hat Enterprise Linux 9.<br>Red Hat Enterprise Linux 10 o versiones posteriores de Red Hat Enterprise Linux 10. | —                                                                                                                                                                                                                                        |
| Arquitectura de CPU | x86_64, AArch64, s390x (IBM Z), ppc64le (IBM Power)                                                                                                                         | —                                                                                                                                                                                                                                        |
| ansible-core      | RHEL 9: el programa de instalación usa `ansible-core` 2.14; la operación de Ansible Automation Platform usa `ansible-core` 2.16.<br>RHEL 10: el programa de instalación y la operación de Ansible Automation Platform usan `ansible-core` 2.16. | El programa de instalación utiliza el paquete `ansible-core` del repositorio AppStream de RHEL. Ansible Automation Platform incluye `ansible-core` 2.16 para su operación, por lo que no es necesario instalarlo manualmente. |
| Navegador         | Una versión actualmente soportada de Mozilla Firefox o Google Chrome                                                                                                       | —                                                                                                                                                                                                                                        |
| Base de datos     | PostgreSQL 15                                                                                                                                                               | Las bases de datos externas (soporte por el cliente) requieren soporte ICU.                                                                                                                                                              |

#### Network ports and protocols

A continuación, se listan los puertos de red y protocolos que AAP utiliza para la comunicación entre sus componentes. Es crucial que estos puertos estén abiertos en el firewall para asegurar la correcta operación de la plataforma:

| Port number | Protocol | Service    | Source                | Destination           |
| :---------- | :------- | :--------- | :-------------------- | :-------------------- |
| 80/443      | TCP      | HTTP/HTTPS | Event-Driven Ansible  | Automation hub        |
| 80/443      | TCP      | HTTP/HTTPS | Event-Driven Ansible  | Automation controller |
| 80/443      | TCP      | HTTP/HTTPS | Automation controller | Automation hub        |
| 80/443      | TCP      | HTTP/HTTPS | Platform gateway      | Automation controller |
| 80/443      | TCP      | HTTP/HTTPS | Platform gateway      | Automation hub        |
| 80/443      | TCP      | HTTP/HTTPS | Platform gateway      | Event-Driven Ansible  |
| 5432        | TCP      | PostgreSQL | Event-Driven Ansible  | External database     |
| 5432        | TCP      | PostgreSQL | Platform gateway      | External database     |
| 5432        | TCP      | PostgreSQL | Automation hub        | External database     |
| 5432        | TCP      | PostgreSQL | Automation controller | External database     |
| 6379        | TCP      | Redis      | Event-Driven Ansible  | Redis container       |
| 6379        | TCP      | Redis      | Platform gateway      | Redis container       |
| 8443        | TCP      | HTTPS      | Platform gateway      | Platform gateway      |
| 27199       | TCP      | Receptor   | Automation controller | Execution container   |

### PRACTICA - Instalación de Ansible Automation Platform

La instalación de Ansible Automation Platform requiere una serie de pasos preparatorios para asegurar un despliegue sin problemas. Nos centraremos en una instalación "Growth" contenerizada en RHEL 10.

#### Preparación del Sistema Operativo

**Configuración del Usuario y Privilegios Sudo**

Para la instalación, el usuario que ejecuta el instalador debe tener permisos para elevar privilegios a root sin necesidad de introducir una contraseña. Esto es fundamental, ya que muchos pasos del proceso requieren modificar servicios, paquetes y configuraciones críticas del sistema.

Para configurar esto, editamos el archivo `sudoers` (lo recomendado es crear un archivo nuevo en /etc/sudoers.d/user, esto es un ejemplo) y añadir una línea similar a la siguiente, sustituyendo `user` por el nombre de tu usuario:

```bash
user ALL=(ALL) NOPASSWD: ALL
```
![Texto alternativo](/assets/images/AAPInstallguide/AAP01.png)

Esto permite a `user` ejecutar comandos como `root` con `sudo` sin pedir contraseña.

**Verificación del Nombre de Host (FQDN)**

Es crucial que el nombre de host del servidor esté configurado como un Nombre de Dominio Completamente Cualificado (FQDN). Esto asegura una comunicación adecuada entre los servicios de AAP.

Podemos verificarlo con el siguiente comando:

```bash
hostname -f
```
![Texto alternativo](/assets/images/AAPInstallguide/AAP02.png)

Si no devuelve un FQDN, debemos configurarlo en nuestro sistema RHEL.

**Gestión de Suscripciones y Repositorios**

Para acceder a los paquetes y contenedores de Red Hat, el servidor RHEL debe estar correctamente suscrito y los repositorios necesarios deben estar habilitados.

Nos aseguramos de que el sistema está suscrito a Red Hat y que tiene acceso a los repositorios `BaseOS` y `AppStream`. Podemos comprobar el estado de la suscripción con:

```bash
sudo subscription-manager status
```
![Texto alternativo](/assets/images/AAPInstallguide/AAP03.png)

Si no está suscrito, podemos registrarlo con:

```bash
sudo subscription-manager register
```

Es necesario que los repositorios de `AppStream` y `BaseOS` estén habilitados, para ello verificamos que los tenemos activos.
Aquí tenemos una imagen que muestra cómo verificar los repositorios activos:

![Texto alternativo](/assets/images/AAPInstallguide/AAP04.png)


Siguiente paso, instalamos el paquete `ansible-core`, que el instalador de AAP utilizará.
```bash
sudo dnf install ansible-core -y
```
![Texto alternativo](/assets/images/AAPInstallguide/AAP05.png)


Y opcionalmente podemos instalar los paquetes `wget`, `git-core`, `rsync` y `vim` que nos pueden ser útiles durante la instalación:

```bash
sudo dnf install wget git-core rsync vim -y
```

#### Descarga del Instalador de Ansible Automation Platform

Visitamos el portal de descargas de Ansible Automation Platform. Desde allí es posible obtener las versiones más recientes del instalador.

Existen dos modalidades principales de instalación:

*   **Instalación Online**: Selecciona la opción “Ansible Automation Platform 2.5 Containerized Setup”. En este caso, durante el proceso de instalación, el instalador descargará los contenedores necesarios directamente desde los repositorios de Red Hat.
*   **Instalación Offline (paquete completo)**: Selecciona la opción “Ansible Automation Platform 2.5 Containerized Setup Bundle”. Este paquete incluye todos los artefactos requeridos para entornos aislados de Internet o con restricciones de red.

Nosotros para esta guía elegiremos la online, una vez elegida la modalidad, descargamos el archivo `.tar.gz` correspondiente a la versión y arquitectura del sistema.

Aquí tenemos una imagen que ilustra la descarga desde el portal:

![Texto alternativo](/assets/images/AAPInstallguide/AAP06.png)


Los archivos descargados deben copiarse a la máquina donde se realizará la instalación. Esto suele hacerse desde la estación de administración hacia el servidor RHEL destino.

La forma más segura de realizar esta transferencia es mediante SCP (Secure Copy Protocol).

En el servidor RHEL, tendremos que definir un directorio que servirá como punto de instalación.

Requisito importante: debemos asegurarnos de contar con al menos 15 GB de espacio libre en el directorio seleccionado, ya que la instalación inicial genera múltiples contenedores y datos temporales.

En este caso utilizaremos `/home/user/demos` para descomprimir el archivo tar:

```bash
mkdir -p /home/user/demos
```

```bash
df -h /home/user/demos
```
![Texto alternativo](/assets/images/AAPInstallguide/AAP07.png)


Con los archivos ya presentes en el servidor, vamos a descomprimir el instalador en el directorio `demos`.

```bash
tar -xvzf ansible-automation-platform-setup-2.5-containerized-tar.gz -C /home/user/demos
```
![Texto alternativo](/assets/images/AAPInstallguide/AAP08.png)

Al finalizar, se creará un directorio con todos los archivos y scripts necesarios para continuar con el despliegue de la plataforma.

#### Configuración del Archivo de Inventario

![Texto alternativo](/assets/images/AAPInstallguide/AAP09.png)

Cuando instalamos Ansible Automation Platform (AAP), todo gira en torno a un archivo llamado `inventory`. Este archivo es como el “mapa” que le dice al instalador qué componentes debe desplegar, en qué servidores y con qué configuraciones.

Sin este archivo, el instalador no sabe qué hacer, así que aquí te explico cómo funciona y cómo puedes adaptarlo a tu entorno.

Dentro del paquete de instalación que hemos descargado vienen ejemplos de inventario:

*   `inventory`: pensado para instalaciones enterprise (distribuidas, con varios nodos).
*   `inventory-growth`: pensado para instalaciones all-in-one (todo en un mismo servidor).

![Texto alternativo](/assets/images/AAPInstallguide/AAP10.png)

La topología que queremos implementar es la growth, vamos a modificar el `inventory-growth` para que se ajuste a nuestra configuración.

Para ello abrimos el archivo y añadimos nuestro `fqdn` y credenciales de Red Hat en los campos necesarios. El archivo se verá similar a este:

```yaml
# This is the AAP installer inventory file intended for the Container growth deployment topology.  
# This inventory file expects to be run from the host where AAP will be installed.  
# Please consult the Ansible Automation Platform product documentation about this topology's tested hardware configuration.  
# https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.5/html/tested_deployment_models/container-topologies  
#  
# Please consult the docs if you're unsure what to add  
# For all optional variables please consult the included README.md  
# or the Ansible Automation Platform documentation:  
# https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.5/html/containerized_installation  
 
# This section is for your AAP Gateway host(s)  
# -----------------------------------------------------  
[automationgateway]  
your.fqdn.here  
 
# This section is for your AAP Controller host(s)  
# -----------------------------------------------------  
[automationcontroller]  
your.fqdn.here  
 
# This section is for your AAP Automation Hub host(s)  
# -----------------------------------------------------  
[automationhub]  
your.fqdn.here  
 
# This section is for your AAP EDA Controller host(s)  
# -----------------------------------------------------  
[automationeda]  
your.fqdn.here  
 
# This section is for the AAP database  
# -----------------------------------------------------  
[database]  
your.fqdn.here  
 
[all:vars]  
# Ansible  
ansible_connection=local  
 
# Common variables  
# https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.5/html/containerized_installation/appendix-inventory-files-vars#ref-general-inventory-variables  
# -----------------------------------------------------  
postgresql_admin_username=postgres  
postgresql_admin_password=your_postgresql_admin_password  
 
registry_username=your_rhn_username  
registry_password=your_rhn_password  
 
redis_mode=standalone  
 
# AAP Gateway  
# https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.5/html/containerized_installation/appendix-inventory-files-vars#ref-gateway-variables  
# -----------------------------------------------------  
gateway_admin_password=your_gateway_admin_password  
gateway_pg_host=your.fqdn.here  
gateway_pg_password=your_gateway_pg_password  
 
# AAP Controller  
# https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.5/html/containerized_installation/appendix-inventory-files-vars#ref-controller-variables  
# -----------------------------------------------------  
controller_admin_password=your_controller_admin_password  
controller_pg_host=your.fqdn.here  
controller_pg_password=your_controller_pg_password  
controller_percent_memory_capacity=0.5  
 
# AAP Automation Hub  
# https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.5/html/containerized_installation/appendix-inventory-files-vars#ref-hub-variables  
# -----------------------------------------------------  
hub_admin_password=your_hub_admin_password  
hub_pg_host=your.fqdn.here  
hub_pg_password=your_hub_pg_password  
hub_seed_collections=false  
 
# AAP EDA Controller  
# https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.5/html/containerized_installation/appendix-inventory-files-vars#event-driven-ansible-controller  
# -----------------------------------------------------  
eda_admin_password=your_eda_admin_password  
eda_pg_host=your.fqdn.here  
eda_pg_password=your_eda_pg_password 
```

Sustituimos `your.fqdn.here` por el `fqdn` de nuestra instancia donde instalaremos el Ansible Automation Platform.

Modificamos el `<set your own>` por las contraseñas que queramos para nuestro usuario admin en cada componente que se indica en el inventario.

Y en los campos `registry_username=your_rhn_username` y `registry_password=your_rhn_password` indicamos nuestro usuario y contraseña de la cuenta de Red Hat.

Una vez lo tenemos todo listo podemos lanzar el instalador y indicar el archivo de inventario correspondiente (opción `-i`). Nos tenemos que assegurar de estar en el directorio donde descomprimimos el instalador (e.g., `/home/user/demos/ansible-automation-platform-containerized-setup-2.5-19`).

```bash
cd /home/user/demos/ansible-automation-platform-containerized-setup-2.5-19
ansible-playbook -i inventory-growth ansible.containerized_installer.install
```
![Texto alternativo](/assets/images/AAPInstallguide/AAP11.png)
![Texto alternativo](/assets/images/AAPInstallguide/AAP12.png)


Cuando finalice la instalación de Ansible Automation Platform (AAP), el siguiente paso es comprobar que la interfaz web esté disponible.

De manera predeterminada, podemos acceder escribiendo en el navegador:

```
https://<gateway_node>:443
```

Aquí reemplazar `<gateway_node>` por el nombre o la dirección IP del servidor donde desplegamos el Automation Gateway.

Para entrar al panel, utilizar el usuario admin (`gateway_admin_username`) y la contraseña que definiste en la instalación (`gateway_admin_password`).

Aquí tenemos una captura de pantalla de la pantalla de inicio de sesión de AAP:
![Texto alternativo](/assets/images/AAPInstallguide/AAP13.png)

Para habilitar el soporte completo y recibir actualizaciones, debemos activar la suscripción de Ansible Automation Platform. Dentro de la interfaz web, nos dirigimos a la sección de administración de suscripciones e introducimos nuestras credenciales de acceso de Red Hat (Client ID y Client Secret).

![Texto alternativo](/assets/images/AAPInstallguide/AAP14.png)

Finalmente, ya accedemos, ahora podemos empezar a explorar todas las capacidades de automatización que ofrece Ansible Automation Platform.

![Texto alternativo](/assets/images/AAPInstallguide/AAP15.png)

Mi idea con este artículo era desmitificar el proceso, compartir esa "receta" que a mí me ha funcionado bien para arrancar rápido con una topología "Growth". Podemos pensar en ella como un campo de pruebas personal, donde podemos cacharrear, aprender y, lo más importante, empezar a ver lo que ofrece AAP sin el estrés de una configuración gigante y con una gran flexibilidad para crecer cuando nosotros queramos.
