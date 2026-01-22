---
title: "Red Hat Enterprise Linux: Guía de Configuración basica para un SMTP Postfix server"
date: 2026-01-09
categories:
  - RedHat
  - SMTP
tags:
  - RHEL
  - Postfix
  - SMTP
toc: true
read_time: true
comments: true
classes: wide
excerpt: "Configuracion basica de un servidor postfix SMTP."
header:
  overlay_image: /assets/images/RedHatbanner.png
  overlay_filter: 0.5
---

# Introducción

Mantener el correo funcionando es clave en cualquier infraestructura de TI. En Red Hat Enterprise Linux (RHEL), Postfix es la opción más confiable, rápido, seguro y modular.

Esta guía muestra cómo desplegar Postfix correctamente, explicando lo esencial del protocolo SMTP y las configuraciones de seguridad necesarias para evitar errores graves, como los Open Relays, y mantener tu servidor seguro desde el primer día.

Para administrar un servidor de correo con éxito, es fundamental entender que no se trata de un solo sistema, sino de una cadena de componentes que trabajan juntos.

**Importante:** Con la configuración mostrada, este servidor solo está preparado para uso dentro de la red local. No recibe correos directamente de Internet, y únicamente permite el envío de mensajes desde hosts confiables definidos en la red interna. Para un servidor SMTP público se requieren ajustes adicionales en interfaces, autenticación, TLS y DNS.

# El Protocolo SMTP (Simple Mail Transfer Protocol)

SMTP es el protocolo base que permite el intercambio de mensajes entre servidores de correo. A diferencia de los protocolos de acceso como IMAP o POP3, SMTP se enfoca únicamente en el transporte de los correos.

Funciona principalmente a través de tres puertos:

- Puerto 25: Para la transferencia entre servidores (MTA a MTA).
- Puerto 587 (Submission): El estándar moderno para que los clientes(Outlook, Gmail o Thunderbird) envíen correos al servidor; normalmente requiere autenticación y TLS.
- Puerto 465 (SMTPS): SMTP sobre SSL/TLS implícito. Aunque hoy se recomienda STARTTLS, este puerto aún se usa en algunos entornos.

# Componentes

El flujo de un correo electrónico depende de la interacción coordinada de tres componentes:

| Componente | Función | Ejemplos |
|------------|---------|----------|
| **MUA (Mail User Agent)** | Interfaz del usuario donde se origina o consulta el correo. | Outlook, Thunderbird, Gmail, comandos de shell |
| **MTA (Mail Transfer Agent)** | Núcleo del sistema que recibe correos del MUA o de otros MTA y decide su ruta hacia el destino. | Postfix, Sendmail, Exim |
| **MDA (Mail Delivery Agent)** | Recibe los correos del MTA y los entrega al buzón físico o virtual del usuario. | Dovecot, entrega local, procmail |



# Postfix

Postfix es un Agente de Transferencia de Correo (MTA). Su trabajo principal es enviar, recibir y enrutar correos electrónicos. Pero no todos los servidores necesitan hacerlo todo; Postfix es flexible:

- Servidor completo: Atiende tanto correos entrantes como salientes, ideal para organizaciones con flujo de correo grande.
- Solo envío local: Permite que tus aplicaciones internas envíen notificaciones o alertas sin depender de un proveedor externo. Perfecto si generas mucho correo saliente que un servicio externo no aceptaría.
- Opción ligera: Puedes usarlo solo para lo esencial, sin cargar tu sistema con un servidor SMTP completo, manteniendo la seguridad y eficiencia.


# Requisitos

- **Registro del sistema**
  - El servidor debe estar registrado correctamente mediante **Red Hat Subscription Management**.

- **Nombre de host completo (FQDN)**
  - El servidor debe contar con un **Fully Qualified Domain Name (FQDN)** válido.
  - Este FQDN se utilizará para identificar al servidor ante otros sistemas de correo en Internet.

- **Configuración de DNS**
  - **Registro MX:** Debe existir un registro MX que apunte al servidor, indicando que puede recibir correo.
  - **Registro A:** El FQDN debe resolverse correctamente a la dirección IP del servidor.

- **Reconocimiento externo**
  - Con un FQDN válido y los registros DNS configurados, el servidor podrá ser reconocido por otros servidores de correo y participar correctamente en el intercambio de mensajes.

Detalles del sistema utilizado en nuestro caso:

| Categoría | Detalle |
|---------|--------|
| Sistema Operativo | Red Hat Enterprise Linux 9.7 (Plow) |
| ID del Sistema | rhel |
| Versión | 9.7 |
| Kernel | 5.14.0-570.62.1.el9_6.x86_64 |
| Arquitectura | x86_64 |
| Hostname | smtp.rocks.dlab |
| Tipo de sistema | Máquina Virtual |
| Virtualización | VMware |
| Chassis | vm |
| Firmware | 6.00 |
| Machine ID | 31259135be044e90b95787e4502c6c2e |
| Boot ID | d288b5ba21854d65a3099c1743924257 |
| Interfaz Loopback | lo |
| IP Loopback IPv4 | 127.0.0.1/8 |
| IP Loopback IPv6 | ::1/128 |
| Interfaz de Red Real | ens192 (altname enp11s0) |
| Dirección MAC | 00:0c:29:ce:f7:06 |
| IP IPv4 | 192.168.6.28/24 |
| IP IPv6 | fe80::20c:29ff:fece:f706/64 (link-local) |
| Puerta de enlace | 192.168.6.1 |
| Red | 192.168.6.0/24 |
| Estado de interfaces | lo y ens192 → UP |
| Tipo de IP | IPv4 dinámica |
| Ámbito IPv6 | link-local |


# Demo

## Instalación

En muchas instalaciones de RHEL, el servicio Sendmail puede estar presente. Para evitar conflictos en la ocupación del puerto 25 y asegurar una gestión de colas limpia, es necesario eliminarlo antes de proceder:

![Texto alternativo](/assets/images/20260120/20260120-01.png)


Postfix se encuentra en los repositorios oficiales de RHEL. Su instalación se realiza mediante el gestor de paquetes DNF:

![Texto alternativo](/assets/images/20260120/20260120-02.png)



## Configuración del Servicio

El archivo principal de configuración se encuentra en **/etc/postfix/main.cf**. Este archivo utiliza una sintaxis de "parámetro = valor" y es donde reside toda la lógica operativa del MTA.

### Parámetro `inet_interfaces`

| Aspecto | Descripción |
|-------|-------------|
| **Función** | Define en qué direcciones IP debe escuchar Postfix para aceptar conexiones entrantes de correo. |
| **Comportamiento por defecto** | Postfix escucha únicamente en la interfaz de loopback (`127.0.0.1` o `::1`), permitiendo recibir correos solo desde la propia máquina. |
| **Configuración con IP específica** | Al especificar una dirección IP (por ejemplo `192.0.2.1`), Postfix aceptará conexiones SMTP desde otras máquinas que se conecten a esa IP. |
| **Escuchar en todas las interfaces** | Permite que Postfix escuche en todas las interfaces de red disponibles. |
| **Ejemplo de configuración** | `inet_interfaces = all` |


![Texto alternativo](/assets/images/20260120/20260120-03.png)


### Parámetro `myhostname`

| Aspecto | Descripción |
|-------|-------------|
| **Función** | Define el nombre de host del servidor SMTP. |
| **Uso principal** | Se utiliza en los encabezados de los correos (por ejemplo, en el `HELO` y `Received`). |
| **Recomendación** | Debe ser un **FQDN válido** que resuelva correctamente en DNS. |
| **Ejemplo de configuración** | `myhostname = smtp.example.com` |

![Texto alternativo](/assets/images/20260120/20260120-04.png)


### Parámetro `mydomain`

| Aspecto | Descripción |
|-------|-------------|
| **Función** | Define el dominio principal del servidor de correo. |
| **Relación con `myhostname`** | Generalmente corresponde a la parte de dominio del FQDN definido en `myhostname`. |
| **Uso común** | Se utiliza como base para otros parámetros de configuración de Postfix. |
| **Ejemplo de configuración** | `mydomain = example.com` |

![Texto alternativo](/assets/images/20260120/20260120-05.png)

### Parámetro `myorigin`

| Aspecto | Descripción |
|-------|-------------|
| **Función** | Define el dominio que se añade a los correos enviados localmente. |
| **Comportamiento** | Determina el dominio de origen para usuarios locales que envían correo. |
| **Valor recomendado** | Utilizar el dominio definido en `mydomain`. |
| **Ejemplo de configuración** | `myorigin = $mydomain` |

![Texto alternativo](/assets/images/20260120/20260120-06.png)

### Parámetro `mynetworks`

| Aspecto | Descripción |
|-------|-------------|
| **Función** | Define las direcciones IP y subredes que están autorizadas a enviar correos a través del servidor sin autenticación. |
| **Uso principal** | Permite que sistemas internos o de confianza actúen como clientes SMTP del servidor. |
| **Formato** | Lista de direcciones IP o subredes en notación CIDR, separadas por comas. |
| **Ejemplo de configuración** | `mynetworks = 127.0.0.1/32, [::1]/128, 192.0.2.1/24, [2001:db8:1::1]/64` |
| **Consideración de seguridad** | Solo deben incluirse **IPs o redes totalmente confiables**. Agregar clientes externos puede convertir el servidor en un **Open Relay**. |

![Texto alternativo](/assets/images/20260120/20260120-07.png)


Otros parámetros importantes pero que no modificaremos en este post son los siguientes:

### Parámetro `inet_protocols`

| Aspecto | Descripción |
|-------|-------------|
| **Función** | Define qué versiones del protocolo IP utilizará Postfix. |
| **Valores comunes** | `ipv4`, `ipv6`, `all` |
| **Comportamiento por defecto** | En sistemas modernos, suele ser `all`. |
| **Recomendación** | Limitar a `ipv4` si el sistema no tiene IPv6 configurado correctamente. |
| **Ejemplo de configuración** | `inet_protocols = ipv4` |


### Parámetro `mydestination`

| Aspecto | Descripción |
|-------|-------------|
| **Función** | Define los dominios para los cuales este servidor considera que es el destino final del correo. |
| **Uso principal** | Determina qué correos deben entregarse localmente en lugar de reenviarse a otro servidor. |
| **Comportamiento típico** | Incluye el nombre del host, el dominio y `localhost`. |
| **Ejemplo de configuración** | `mydestination = $myhostname, localhost.$mydomain, localhost, $mydomain` |
| **Consideración** | No debe incluir dominios que se entreguen a otros servidores, ya que podría causar bucles de correo. |


### Parámetro `relayhost`

| Aspecto | Descripción |
|-------|-------------|
| **Función** | Define el servidor al que Postfix reenviará todo el correo saliente. |
| **Uso principal** | Se utiliza cuando el servidor no entrega correo directamente a Internet. |
| **Casos comunes** | Proveedores externos de correo, gateways SMTP o servidores corporativos. |
| **Formato** | Nombre de host o dirección IP, opcionalmente con puerto. |
| **Ejemplo de configuración** | `relayhost = [smtp.relay.example.com]:587` |
| **Nota** | Normalmente se combina con autenticación SMTP y TLS. |


Para asegurarnos de que no hay errores en el main.cf, lanzamos el siguiente comando:

![Texto alternativo](/assets/images/20260120/20260120-08.png)


## Habilitar y ejecutar Postfix

Iniciamos y habilitamos el servicio .

![Texto alternativo](/assets/images/20260120/20260120-09.png)

Para que el tráfico fluya, el firewall de RHEL (firewalld) debe permitir conexiones entrantes en el puerto 25. Esto se logra habilitando el servicio predefinido:

![Texto alternativo](/assets/images/20260120/20260120-10.png)

Verificamos el estado del servicio

![Texto alternativo](/assets/images/20260120/20260120-11.png)

Si el servicio no está activo, podemos reiniciarlo

![Texto alternativo](/assets/images/20260120/20260120-12.png)

Para aplicar los cambios en la configuración

![Texto alternativo](/assets/images/20260120/20260120-13.png)

## Verificación

Para verificar el correcto funcionamiento, podemos utilizar el siguiente comando:

```bash
echo "Este es un mensaje de prueba" | mail -s "Prueba SMTP" usuario@example.com
```

Para supervisar los errores de Postfix en tiempo real, se recomienda utilizar el siguiente comando:

```bash
tail -f /var/log/maillog | grep -i error
```

En este post hemos configurado un servidor SMTP Postfix, orientado a un entorno interno.

El servidor actúa como un MTA directo, entregando el correo saliente sin depender de un relay externo y aceptando conexiones únicamente en interfaces y redes explícitamente autorizadas.

El resultado es un servidor Postfix diseñado para manejar de forma segura y confiable el correo interno, perfecto para enviar notificaciones desde aplicaciones y operar en entornos de laboratorio.

