---
title: "Seguridad Empresarial con Red Hat: Más Allá del Código Abierto"
date: 2025-09-15
categories: [Seguridad, Red Hat, Open Source]
tags: [RHEL, SELinux, Ansible, OpenShift, CVE, Seguridad Empresarial]
excerpt: "Exploramos cómo Red Hat refuerza la seguridad empresarial más allá del software de código abierto, integrando RHEL, SELinux, Ansible, Insights y OpenShift."
toc: true
read_time: true
comments: true
classes: wide
header:
  overlay_image: /assets/images/RedHatbanner.png # Asegúrate de tener una imagen de banner en esta ruta
  overlay_filter: 0.5 # Ajusta el oscurecimiento de la imagen si es necesario
---

## El Paradigma de la Seguridad en el Open Source

El software de código abierto se ha convertido en una pieza clave para impulsar la innovación tecnológica. Su esencia está en la colaboración y la transparencia, lo que ha permitido avances extraordinarios, pero aquí es donde aparece lo que podríamos llamar el dilema del código abierto. Aunque este modelo colaborativo es su mayor fortaleza, también plantea desafíos cuando se trata de adoptarlo a nivel empresarial. No es el código en sí el problema, sino cómo las organizaciones entienden y, sobre todo, cómo gestionan su seguridad y los riesgos asociados.  
  
El panorama de las vulnerabilidades ha cambiado radicalmente en las últimas décadas. Cuando nació el programa Common Vulnerabilities and Exposures (CVE) hace 25 años, se registraron 894 vulnerabilidades de seguridad en su primer año, estamos hablando de 1999. En 2024, esa cifra superó las 40,000. Este crecimiento exponencial ha dejado obsoleta la vieja estrategia de ‘parchearlo todo’, ya no es viable ni inteligente tratar todas las vulnerabilidades por igual. No todos los fallos representan el mismo nivel de riesgo, y centrarse en corregirlos todos sin priorizar ignora un punto clave, si realmente están siendo explotados o no. De hecho, los datos muestran que históricamente menos del 0.5% de las vulnerabilidades llegan a ser explotadas activamente. 

![Texto alternativo](/assets/images/SERH1.png)

Aquí es donde la transparencia del código abierto puede jugar en contra, al ser públicos por naturaleza, los proyectos open source tienden a reportar y documentar una gran cantidad de fallos, incluso los de impacto bajo o moderado, en cambio, muchos proveedores de software propietario no revelan este tipo de vulnerabilidades menores, lo que crea una ilusión de mayor seguridad y un panorama de riesgo mucho más opaco.  

Esto da lugar a un doble estándar, las políticas que exigen “Zero Known Vulnerabilities" terminan castigando al código abierto por ser más transparente, en lugar de enfocarse en lo que realmente importa, el riesgo real. Red Hat Product Security Risk Report 2024 lo deja claro. Aunque en 2024 aumentó notablemente el número de CVEs asignados a productos de Red Hat en parte porque el kernel de Linux empezó a funcionar como autoridad oficial para registrar fallos (CNA), el riesgo real detrás de esos números no cambió mucho, la mayoría de esas nuevas vulnerabilidades eran de bajo o moderado impacto, lo que refuerza una idea clave, necesitamos evaluar el riesgo con criterio, no simplemente contar vulnerabilidades.  

El caso de XZ Backdoor, también abordado en el informe, fue una verdadera llamada de atención a nivel global sobre lo sofisticados que se han vuelto los ataques a la cadena de suministro de software (SSCA). Un atacante logró infiltrarse durante casi dos años, ganándose la confianza de la comunidad, hasta que finalmente introdujo código malicioso con el potencial de comprometer una enorme cantidad de sistemas.  

Este incidente puso en evidencia lo crítica que es la seguridad en la cadena de suministro. Pero también dejó algo muy claro, el modelo de código abierto tiene una fortaleza única, gracias a la transparencia del código, la comunidad detectó y reaccionó rápidamente de forma colaborativa, esa respuesta ágil y abierta fue clave para contener la amenaza a tiempo.  

Red Hat no se limita a usar software de código abierto, participa activamente en su evolución, lo mantiene y lo fortalece, es un actor clave dentro del ecosistema, con un conocimiento profundo de las normativas globales y una visión anticipada de las amenazas emergentes, Red Hat incorpora la seguridad desde el inicio y a lo largo de todo su ciclo de desarrollo de software (RHSDLC).  

Además, su rol como participante raíz del programa CVE y CNA lo coloca en una posición única, no solo identifica y evalúa vulnerabilidades, sino que ofrece a sus clientes soluciones concretas y respaldadas por un nivel de experiencia difícil de igualar.  

Las organizaciones necesitan más que solo software de código abierto, necesitan una plataforma open source reforzada, gestionada y segura por diseño, aquí es donde los productos de Red Hat marcan la diferencia. 

## Red Hat Enterprise Linux (RHEL): La Base Reforzada 

Toda estrategia de seguridad empresarial robusta debe construirse sobre una base sólida, en el ecosistema de Red Hat, esa base es Red Hat Enterprise Linux (RHEL), no todas las distribuciones de Linux son iguales en lo que a seguridad se refiere. RHEL se distingue por un enfoque proactivo que abarca desde el cumplimiento de normativas globales y el endurecimiento del sistema hasta la preparación para amenazas emergentes, a continuación, exploramos algunas de las capas de defensa fundamentales integradas en RHEL. 

### SELinux: Control de Acceso Obligatorio por Defecto 
La seguridad empresarial no consiste únicamente en cerrar puertos y aplicar parches, es una estrategia continua que debe abarcar el control de acceso, la integridad del software, la detección de intrusiones y la gestión proactiva de vulnerabilidades.  

La primera línea de defensa es controlar estrictamente quién puede acceder a qué recursos y qué software puede ejecutarse, y no se puede hablar de seguridad en RHEL sin mencionar a SELinux (Security-Enhanced Linux), una herramienta de seguridad avanzada que viene activada por defecto en sistemas RHEL.  

Aunque SELinux puede parecer una fuente de complicaciones especialmente cuando impide que aplicaciones personalizadas funcionen o bloquea el acceso a ciertas rutas o puertos, en realidad está haciendo su trabajo, aplicar un modelo de Control de Acceso Obligatorio (MAC). A diferencia del enfoque tradicional basado en permisos de archivos (DAC), SELinux define políticas estrictas y altamente granulares que controlan el comportamiento de usuarios, servicios y procesos. Utiliza etiquetas y tipos para decidir qué acciones están permitidas en archivos, carpetas y puertos, y cuáles no.  

Tomemos el servicio web httpd como ejemplo práctico.  

Por defecto:  

- El proceso httpd se ejecuta con el tipo SELinux httpd_t 

![Texto alternativo](/assets/images/SERH2.png)

- El contenido en /var/www/html/ tiene la etiqueta httpd_sys_content_t, lo que permite que el servicio acceda a esos archivos. 

![Texto alternativo](/assets/images/SERH3.png)

- Los puertos habituales como 80, 443, 8008 y 8443 están etiquetados como http_port_t, lo que autoriza a httpd a utilizarlos.

![Texto alternativo](/assets/images/SERH4.png)

Supongamos que decidimos desplegar un sitio personalizado en /var/www/my_site y queremos servirlo desde el puerto 4449, en ese momento, SELinux va a bloquear la operación. ¿Por qué? Porque ni el directorio ni el puerto tienen las etiquetas adecuadas, para que httpd pueda operar correctamente, debemos etiquetar el nuevo directorio con httpd_sys_content_t y asociar el puerto 4449 con el tipo http_port_t.  

Este tipo de intervenciones son comunes cuando se trabaja con aplicaciones personalizadas, y lejos de ser una molestia, representan una oportunidad para reforzar la seguridad, asegurándonos de que nada fuera de lo previsto pueda ejecutarse sin autorización explícita. 

Afortunadamente, RHEL ofrece herramientas para facilitar este proceso. Por ejemplo, existe un rol de sistema específico para SELinux en Ansible, que permite automatizar la verificación y asignación de etiquetas de forma sencilla y repetible, ideal para despliegues a gran escala o entornos CI/CD, estos son algunos ejemplos del rol rhel-system-roles.selinux. 

![Texto alternativo](/assets/images/SERH5.png)

![Texto alternativo](/assets/images/SERH6.png)


 ### AIDE: Monitorización de la Integridad del Sistema 

 Mientras SELinux proporciona una defensa proactiva al prevenir acciones no autorizadas, una estrategia completa también necesita detectar cambios que ya han ocurrido, aquí es donde la monitorización de la integridad de archivos se vuelve crucial, uno de los métodos más comunes utilizados por atacantes consiste en modificar archivos o procesos ya existentes dentro del sistema, inyectando código malicioso o alterando configuraciones críticas. Este tipo de cambios, muchas veces sutiles, pueden abrir la puerta a vulnerabilidades graves o ser el inicio de un ataque más amplio.  

Para enfrentar este riesgo, RHEL incluye AIDE (Advanced Intrusion Detection Environment), una herramienta que actúa como un sistema de monitoreo de integridad. Su función principal es detectar cualquier cambio no autorizado en los archivos del sistema, lo hace manteniendo una base de datos con el estado esperado de cada archivo y directorio, y comparándola con el estado actual del sistema, así, si se añade, borra, modifica o mueve un archivo, AIDE lo reportará.  

Se necesita crear una base de datos inicial que represente el estado actual del sistema

![Texto alternativo](/assets/images/SERH7.png)

Esto generará un archivo con el nombre /var/lib/aide/aide.db.new.gz, esta base de datos contiene hashes y metadatos de los archivos escaneados. En una instalación típica puede incluir más de 50.000 entradas.  

Para empezar a usar esta base como referencia para futuros chequeos, simplemente se renombra a aide.db.gz, lo podemos hacer escribiendo en la terminal sudo mv /var/lib/aide/aide.db.new.gz /var/lib/aide/aide.db.gz  

Con AIDE ya configurado, puedes comenzar a detectar cambios en el sistema en cualquier momento ejecutando aide –-check, puedes configurar en /etc/aide.conf los cambios que quieres que detecte.  

En caso de encontrar diferencias entre la base de datos y el sistema actual, AIDE informará detalladamente. En este ejemplo creo un archivo dentro del directorio /root llamado test-aide-demo, al analizar la base de datos automáticamente detecta los cambios e informa. 

![Texto alternativo](/assets/images/SERH8.png)

Esto puede indicar que un archivo fue modificado, agregado o incluso solo accedido.  

Esto garantiza que cualquier cambio inesperado en el sistema pueda ser detectado rápidamente, permitiendo tomar acciones antes de que se conviertan en una brecha de seguridad.

###  Red Hat Insights: Seguridad Predictiva y a Escala 

Mientras que herramientas como SELinux y AIDE aseguran la integridad de un sistema individual, el verdadero desafío empresarial es aplicar esta disciplina a escala. ¿Cómo garantizamos que cientos o miles de sistemas no solo estén protegidos, sino que cumplan con normativas y respondan a las amenazas de forma unificada? Aquí es donde la estrategia de Red Hat escala con Red Hat Insights.  

Imaginate un analista de sistemas experto revisando incansablemente cada uno de sus sistemas RHEL, 24/7, este analista no solo detecta problemas, sino que predice fallos y entrega la solución exacta, a menudo como un script de automatización listo para usar, eso es, en esencia, Red Hat Insights  

Es un servicio SaaS (Software como Servicio) que se conecta de forma segura a tu entorno RHEL, ya sea on-premise, en la nube pública o en un entorno híbrido, recopila datos anónimos de configuración y telemetría, los compara con una knowledge base masiva curada por los ingenieros de Red Hat y te devuelve recomendaciones personalizadas y priorizadas. Veamos cómo transforma los desafíos diarios en tareas manejables.  

No se limita a detectar problemas de seguridad los entiende y te ayuda a resolverlos, su servicio de Vulnerability va mucho más allá de mostrar una lista de CVEs. Por cada vulnerabilidad encontrada, te ofrece contexto claro y útil, qué sistemas están afectados, qué tan grave es (según el estándar CVSS), y lo más importante, si ya existe un exploit conocido que podría ser usado por atacantes, además, guía paso a paso hacia la solución, indicando exactamente qué actualización aplicar o qué recurso técnico consultar para resolver la vulnerabilidad.  

Y aquí es donde pasa de ser una herramienta de análisis a una de acción si una vulnerabilidad crítica afecta a decenas o cientos de servidores, corregirla uno por uno sería lento, complicado y con riesgo de error. Insights automatiza ese proceso generando, con un solo clic, un Playbook personalizado. Este no es un guion genérico, sino un conjunto de instrucciones precisas para aplicar solo en los sistemas que tú elijas, con las tareas exactas para solucionar la vulnerabilidad. 

![Texto alternativo](/assets/images/SERH9.png)

Es importante destacar que Red Hat Insights es una plataforma multifacética que va mucho más allá de la seguridad, sus servicios también abarcan la gestión proactiva del cumplimiento (Compliance), la optimización del rendimiento y la estabilidad (Advisor) y el análisis de la configuración, sin embargo, en esta ocasión, únicamente mencionamos Vulnerability, ya que aborda de manera directa el dilema del volumen de CVEs y la necesidad de una gestión basada en el riesgo real. 


## Red Hat Ansible Automation Platform: Automatización como Defensa 

Tener un plan de remediación automatizado es solo la mitad de la batalla. ¿Cómo se ejecuta ese plan de forma segura, controlada y auditable en toda la empresa? Aquí es donde entra Red Hat Ansible Automation Platform (AAP)  

Ansible proporciona un lenguaje común y un motor de automatización unificado que permite a los equipos de seguridad orquestar acciones a través de múltiples productos y proveedores. Transforma tareas complejas y manuales en playbooks simples, legibles por humanos y reutilizables, esto no solo acelera drásticamente la respuesta a incidentes, sino que también fomenta una cultura de colaboración, donde tanto los analistas de seguridad como los operadores de TI pueden entender, verificar y ejecutar las mismas automatizaciones.

### Orquestación del Firewall: De la Detección a la Contención 

El firewall de una organización es su portero digital, el guardián que decide qué tráfico entra y sale de la red, gestionar sus reglas es una de las tareas más críticas y, a menudo, más tediosas, en un entorno empresarial típico, esto implica interactuar con soluciones de proveedores como Check Point, Palo Alto Networks, Fortinet, y otros, cada uno tiene su propia API y su propia lógica. A través de roles y colecciones de contenido certificado, AAP facilita la interacción con distintos proveedores sin necesidad de adaptarse a cada interfaz o API específica. 

![Texto alternativo](/assets/images/SERH10.png)

Consideremos un escenario de respuesta a incidentes clásico, un sistema de monitorización detecta un comportamiento sospechoso proveniente de una dirección IP externa. El análisis confirma que se trata de un intento de ataque. La necesidad es inmediata, bloquear esa IP en el firewall perimetral para detener la amenaza en seco.  

En un flujo de trabajo tradicional, este sería un proceso manual. Con Ansible, se convierte en una acción instantánea y automatizada. Utilizando el rol ansible_security.acl_manager, un analista puede ejecutar un playbook preaprobado y extraordinariamente simple. Este playbook no requiere conocimientos profundos de la sintaxis específica del firewall simplemente define la intención, se especifican variables claras y concisas como la IP de origen a bloquear, la IP de destino que se está protegiendo, y el tipo de sistema 

![Texto alternativo](/assets/images/SERH11.png)

Al ejecutar este playbook, Ansible se conecta a la API del servidor de gestión de Check Point y traduce esta simple intención en las acciones necesarias para crear y aplicar una nueva regla de seguridad, en segundos, la IP del atacante es bloqueada, la amenaza se contiene, y todo el proceso queda registrado y es auditable.  

La misma lógica se aplica a la inversa, una vez que el incidente ha sido investigado y resuelto, la misma acl_manager puede ser utilizada con una tarea de unblock_ip para eliminar la regla, asegurando que los bloqueos temporales no se conviertan en problemas operativos permanentes. Esta capacidad de gestionar el ciclo de vida completo de una regla de firewall de forma programática, rápida y consistente es un cambio fundamental para cualquier equipo de seguridad 

### Gestión de IDPS: Despliegue de Reglas a Escala 

Si el firewall es ‘el portero’, el Sistema de Detección y Prevención de Intrusiones (IDPS) es el perro guardián que patrulla constantemente la red, buscando patrones de comportamiento malicioso. Herramientas como Snort son increíblemente potentes, pero su eficacia depende enteramente de la calidad y actualidad de sus reglas, cuando surge una nueva amenaza o se descubre una nueva técnica de ataque, es crucial desplegar una nueva firma de detección en todos los sensores de IDPS de la organización de manera rápida y uniforme.  

Aquí, de nuevo, el proceso manual es un cuello de botella, iniciar sesión en cada servidor de Snort para editar manualmente los archivos de reglas es lento, propenso a errores de copia y pega, y difícil de escalar, a través de roles como ansible_security.ids_rule, los equipos pueden gestionar las firmas de Snort como si fueran código.  

Imaginemos que el equipo de seguridad descubre un nuevo tipo de ataque que intenta acceder al archivo /etc/passwd a través de peticiones web, se necesita una regla para detectar este patrón de inmediato, en lugar de enviar un correo electrónico con instrucciones, se crea un playbook.  

Este playbook es un ejemplo de claridad y potencia, primero, se asegura de que la automatización se ejecute con los privilegios necesarios en el servidor Snort (become: true). Luego, especifica el proveedor (ids_provider: snort). La parte más importante es la propia regla, definida en la variable ids_rule en la sintaxis nativa de Snort, pero gestionada y desplegada por Ansible. El playbook también indica exactamente dónde debe escribirse la regla (ids_rules_file) y que su estado debe ser presente, es decir, que se cree si no existe.

![Texto alternativo](/assets/images/SERH12.png)

Con la ejecución de ansible-navigator, este playbook se conecta a todos los servidores Snort definidos en el inventario y añade la nueva regla de forma atómica y consistente. La verificación es tan simple como conectarse a uno de los servidores y comprobar que la nueva línea ha sido añadida al final del archivo de reglas.  

Los ejemplos de gestión de firewalls y IDPS son potentes por sí solos, pero su verdadero valor transformador se revela cuando se combinan en flujos de trabajo de seguridad orquestados. Ansible Automation Platform no solo ejecuta tareas aisladas, permite construir una respuesta a incidentes coherente y de múltiples pasos que se ejecuta a la velocidad de la máquina, no a la velocidad humana.  

Este nivel de automatización reduce el tiempo medio de respuesta (MTTR) de horas a meros segundos. Libera a los analistas de seguridad de tareas repetitivas y les permite centrarse en actividades de mayor valor, como la caza de amenazas y el análisis estratégico 

## Red Hat OpenShift: Seguridad en la Cadena de Suministro de Software 

Hemos asegurado el sistema operativo y automatizado su gestión, pero las aplicaciones modernas ya no viven ahí, hoy se ejecutan en contenedores y se despliegan en nubes híbridas, por eso, la estrategia de seguridad de Red Hat se extiende naturalmente a esta capa con ‘Red Hat OpenShift’. 

En este apartado, nos enfocaremos en un aspecto clave de esa seguridad, la protección de la cadena de suministro de software (software supply chain). No cubriremos toda la seguridad de OpenShift, sino cómo garantizar que, desde la construcción hasta el despliegue, las aplicaciones sean legítimas, confiables y seguras.

### Construyendo una Cadena de Suministro Confiable 

El incidente XZ backdoor fue una llamada de atención global, la seguridad no puede empezar en el servidor de producción, sino desde el origen mismo del software, para el mundo de los contenedores, esto significa proteger toda la cadena de suministro, desde la construcción de la imagen hasta su despliegue final. 

Construir una cadena de suministro segura y confiable requiere cuidar cada etapa del ciclo de vida del software, desde la escritura del código hasta su puesta en producción. 

Todo comienza con la elección de una imagen base. Hoy existen miles de imágenes en repositorios públicos, pero no todas ofrecen el mismo nivel de calidad, mantenimiento o seguridad. Por eso, es responsabilidad de cada equipo elegir cuidadosamente.

![Texto alternativo](/assets/images/SERH13.png)

Muchas organizaciones prefieren partir de una imagen base mínima, confiable y mantenida, como las Red Hat Universal Base Images (UBI), estas contienen solo lo esencial, lo que permite mantener el control total para aplicar parches rápido y reducir la superficie de ataque, agregando solo los frameworks y librerías que la aplicación necesita. 

Pero, aunque una aplicación pase todas las pruebas de seguridad y funcione perfectamente, ¿cómo estar seguros de que realmente fue construida con nuestro código legítimo? Un atacante podría haber insertado código malicioso que robe información sin alterar el comportamiento visible. 

Antes, documentos físicos se protegían con sellos que garantizaban su integridad. Hoy, esa función la cumplen las firmas criptográficas. 

Firmar digitalmente el código fuente es un primer paso fundamental. Cada cambio debe llevar una firma que confirme la identidad del autor y asegure que el código no fue alterado. Las pipelines de CI/CD deben rechazar automáticamente cualquier commit sin firma válida. 

Del mismo modo, las imágenes de contenedor deben firmarse en el momento de su creación, para asegurar que provienen de una fuente confiable y no han sido modificadas. Plataformas como OpenShift pueden validar estas firmas antes del despliegue, permitiendo solo la ejecución de imágenes autorizadas.

![Texto alternativo](/assets/images/SERH14.png)


### Escaneo Continuo y SBOM: Visibilidad y Control 

Incluso siguiendo estas mejores prácticas, el riesgo de vulnerabilidades persiste, estas pueden venir desde la imagen base o surgir durante la construcción de la aplicación. 

Por eso, es crucial escanear las imágenes en distintos puntos, revisar periódicamente las imágenes base y, si se detecta alguna vulnerabilidad, reconstruirlas y actualizarlas, además, escanear cada nueva imagen antes de pasarla a producción, bloqueando cualquier imagen con fallas críticas para devolverla al equipo de desarrollo. 

Para tener visibilidad total sobre los componentes que integran una imagen, es fundamental generar un Software Bill of Materials (SBOM), que documenta todas las librerías, frameworks y dependencias, facilitando auditorías y evaluaciones de riesgo. Este inventario debe generarse y almacenarse junto con la imagen en el registro de contenedores. 

### La Solución Integrada: Red Hat Trusted Software Supply Chain

Para enfrentar todos estos desafíos, Red Hat ofrece la Red Hat Trusted Software Supply Chain, una colección de soluciones integradas que incorporan seguridad en cada etapa del ciclo de vida de las aplicaciones nativas de la nube.

![Texto alternativo](/assets/images/SERH15.png)


En lugar de que los equipos deban armar y asegurar por su cuenta una cadena de herramientas y componentes dispares, Red Hat entrega una plataforma completa, fácil de usar y cohesiva, que conecta todo de forma segura y confiable. 

La plataforma integra un conjunto de herramientas diseñadas para cubrir todo el ciclo de vida del software, desde el desarrollo hasta la producción, asegurando agilidad y confianza en cada etapa. Para la fase de desarrollo, Red Hat Developer Hub actúa como un portal centralizado que simplifica la creación de aplicaciones, permitiendo a los equipos enfocarse en el código en lugar de la complejidad de la infraestructura. Este proceso se construye sobre las Universal Base Images, que ofrecen un cimiento fiable y seguro para minimizar riesgos desde el inicio. 

Para asegurar la cadena de suministro, Trusted Artefact Signer aplica una firma digital al software para validar su autenticidad. A su vez, Trusted Profile Analyzer evalúa de forma inteligente las dependencias para identificar solo las vulnerabilidades que suponen un riesgo real. La gestión de estas imágenes se centraliza en Quay, un registro que las almacena de forma segura y las analiza continuamente en busca de amenazas. 

Finalmente, OpenShift actúa como el motor de orquestación que automatiza el despliegue y la gestión de las aplicaciones, mientras que Advanced Cluster Security añade una capa de protección en tiempo de ejecución, monitoreando el entorno y garantizando el cumplimiento de las políticas de seguridad.  

Con esta oferta, Red Hat acompaña a los equipos para construir, verificar y desplegar software seguro y confiable, desde el primer código hasta la aplicación en producción. 

## Conclusiones y Reflexiones Finales 

El modelo open source, por su naturaleza transparente, tiende a reportar más vulnerabilidades que el software propietario, lo cual no significa que sea menos seguro, sino que permite un análisis más honesto y riguroso del riesgo real. En lugar de dejarnos llevar por el número de CVEs publicados, debemos cambiar el foco hacia la verdadera prioridad, entender qué vulnerabilidades representan un riesgo real y cuáles no. Este enfoque basado en el riesgo y no en la cantidad es indispensable en un mundo donde la estrategia de parches tradicional ya no es suficiente. 

Red Hat demuestra que no basta con consumir software libre, sino que se requiere un enfoque proactivo y estructurado para convertirlo en una verdadera plataforma empresarial segura. Herramientas como las que hemos hablado aquí, permiten construir una defensa integral que abarca desde el control de accesos, hasta la seguridad en entornos de contenedores. Todo esto bajo una misma visión coherente, donde la protección se integra desde la creación del software hasta su despliegue. 