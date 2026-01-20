---
title: "Red Hat Enterprise Linux: Guía de Configuración de un Servidor BIND DNS en RHEL 9.6"
date: 2026-01-09
categories:
  - RedHat
  - DNS
tags:
  - RHEL
  - BIND
  - DNS
toc: true
read_time: true
comments: true
classes: wide
excerpt: "Configuración basica de un servidor DNS con BIND en Red Hat Enterprise Linux 9.6, incluyendo zonas directas e inversas."
header:
  overlay_image: /assets/images/RedHatbanner.png
  overlay_filter: 0.5
---

# Introducción

El Sistema de Nombres de Dominio (DNS) es la infraestructura esencial de Internet que traduce los nombres legibles para los humanos (como www.ejemplo.com) en direcciones IP numéricas (como 192.0.2.1) que las máquinas utilizan para comunicarse.

El DNS se compone de tres elementos principales:
- Sintaxis: Una forma jerárquica de nombrar entidades en Internet.
- Reglas de delegación: Normas para asignar autoridad sobre ciertos nombres.
- Implementación: El sistema real que mapea los nombres a las direcciones.

El DNS funciona como un árbol invertido
- Root Domain (Raíz): Representado por un punto . (normalmente omitido, pero obligatorio en nombres de dominio completos o FQDN).
- Top-Level Domains (TLD): Como .com, .org o los territoriales (ccTLDs) como .es o .mx.
- Second-Level Domains (SLD): Como ejemplo.com.
- Subdominios: Como ventas.ejemplo.com.

Cada nivel del árbol DNS delega la autoridad a los niveles inferiores. Quien tiene autoridad sobre un dominio es responsable de mantener una lista de sus subdominios.

Aunque a menudo se usan como sinónimos, cuando hablamos de zona este es un punto administrativo que abarca un dominio y todos sus subdominios, a menos que estos hayan sido delegados a otra autoridad, zona y dominio se suelen confundir...

Otro concepto clave que debemos saber son los Servidores Autoritativos estos son aquellos que contienen la información oficial de una zona específica en un archivo de zona, lo veremos mas adelante.

# Funcionamiento de la Resolución de Nombres

Cuando escribes una dirección web, el stub resolver de tu ordenador actúa como un mensajero básico que le pasa el recado a un resolver externo para que busque la dirección real. Este resolver inicia un viaje preguntando primero a los servidores raíz, quienes lo dirigen a los servidores del tipo de dominio como el .com, hasta llegar finalmente al servidor autoritativo que tiene la respuesta exacta. Una vez encontrada la IP, el resolver la guarda en su caché para recordarla en el futuro y se la entrega a tu equipo para que la web cargue al instante. Todo este proceso es el que gestiona de forma profesional el software BIND, permitiendo que los nombres se conviertan en números de manera rápida y segura.

![Texto alternativo](/assets/images/20260109-22.png)


# BIND

BIND (Berkeley Internet Name Domain) es una herramienta versátil que permite gestionar todo el sistema DNS mediante su archivo de configuración named.conf, pudiendo actuar como servidor oficial de dominios, buscador de direcciones o intermediario básico. Su gran ventaja es la flexibilidad, ya que permite que un mismo equipo realice múltiples funciones a la vez para ahorrar recursos en redes pequeñas, aunque las grandes empresas prefieran dedicar un servidor exclusivo para cada tarea por seguridad y rendimiento.

En este artículo, muestro como instalar y configurar un servidor DNS con BIND en Red Hat Enterprise Linux (RHEL) 9.6, de forma sencilla y explicando cada paso, los conceptos clave y cómo verificar que todo funcione correctamente. 

BIND puede ejecutarse en modo normal o en un entorno chroot para mayor seguridad. Además, en RHEL, SELinux protege al servicio por defecto, evitando vulnerabilidades conocidas. 

# Configuración de Zonas DNS

Una zona DNS es un conjunto de registros que define cómo un dominio se resuelve en direcciones IP, qué servidores pueden responder y qué información adicional existe sobre servicios y políticas del dominio.

En entornos reales, una zona no suele estar en un único servidor; para fiabilidad y redundancia se utilizan servidores primarios y secundarios.

---

## Tipos de zonas

### Zonas directas

- También llamadas forward zones.
- Asocian nombres de dominio a direcciones IP. 
- Se usan los registros A (IPv4) y AAAA (IPv6).

**Ejemplo: resolución directa de www.xebec.dlab a IPv4:**

```text
www IN A 192.168.6.29
```
### Zonas inversas

- También llamadas reverse zones.
- Hacen lo contrario: asocian IP a nombre de dominio. 
- Se usan los registros PTR.

**Ejemplo: resolución inversa de 192.168.6.29 a dns.xebec.dlab:**

```text
29.6.168.192.in-addr.arpa. IN PTR dns.xebec.dlab.
```

**Nota:**
Siempre que tengamos una zona directa, se recomienda crear la zona inversa correspondiente para que los servicios de correo, autenticación y seguridad funcionen correctamente.

---

## Registros DNS principales

| Registro | Función principal | Ejemplo |
|----------|-----------------|---------|
| SOA      | Autoridad y control de la zona | `@ IN SOA dns.xebec.dlab. admin.xebec.dlab. ( 2026010701 3600 900 604800 86400 )` |
| NS       | Servidores DNS autoritativos | `@ IN NS dns1.xebec.dlab.` |
| A        | Nombre → IPv4 | `www IN A 192.168.6.29` |
| AAAA     | Nombre → IPv6 | `www IN AAAA 2001:db8::1` |
| CNAME    | Alias DNS | `ftp IN CNAME www.xebec.dlab.` |
| MX       | Servidores de correo | `@ IN MX 10 mail.xebec.dlab.` |
| TXT      | Texto, políticas y verificación | `@ IN TXT "v=spf1 ip4:192.168.6.29 -all"` |
| PTR      | IP → Nombre (resolución inversa) | `29.6.168.192.in-addr.arpa. IN PTR dns.xebec.dlab.` |
| SRV      | Servicios y puertos | `_ldap._tcp IN SRV 0 5 389 ldap.xebec.dlab.` |

**Notas importantes:**

- Cada zona debe tener un único registro SOA; sin él, la zona no carga.
- Los registros NS definen qué servidores pueden responder consultas por la zona.

---

## Parámetros de control del SOA

| Valor      | Nombre      | Para qué sirve |
|------------|------------|----------------|
| 2026010701 | Serial     | Versión de la zona |
| 3600       | Refresh    | Cada cuánto el slave consulta cambios en el master |
| 900        | Retry      | Tiempo de espera si falla la conexión al master |
| 604800     | Expire     | Cuándo la zona deja de ser válida si no se actualiza |
| 86400      | Minimum TTL| Tiempo de caché de las respuestas |

Es fundamental incrementar el serial cada vez que se modifica la zona para que los servidores secundarios se sincronicen.

---

# Prerrequisitos

Antes de instalar BIND, debemos asegurarnos de:

- Tener una IP estática en el servidor.
- Contar con privilegios de root o un usuario con sudo.
- Sin conflictos con otros servicios DNS en el mismo host.

Detalles del sistema utilizado en nuestro caso:

| Categoría            | Detalle |
|---------------------|---------|
| Sistema Operativo    | Red Hat Enterprise Linux 9.6 (Plow) |
| ID del Sistema       | rhel |
| Versión              | 9.6 |
| Kernel               | 5.14.0-570.62.1.el9_6.x86_64 |
| Arquitectura         | x86_64 |
| Interfaz Loopback    | lo |
| IP Loopback IPv4     | 127.0.0.1/8 |
| IP Loopback IPv6     | ::1/128 |
| Interfaz de Red Real | ens192 (altname enp11s0) |
| IP IPv4              | 192.168.6.29/24 |
| IP IPv6              | fe80::20c:29ff:feb4:56e0/64 (link-local) |
| Puerta de enlace     | 192.168.6.1 |
| Red                  | 192.168.6.0/24 |
| Estado de interfaces | ambas UP |

---

# Diagrama de instalación DNS BIND server

![Texto alternativo](/assets/images/20260109-23.png)

# Demo

## Instalación de BIND

Primero instalamos los paquetes necesarios bind y bind-utils 

![Texto alternativo](/assets/images/20260109-01.png)

## Configuración Básica de BIND

El archivo principal de configuración es /etc/named.conf. Antes de modificarlo, es recomendable hacer una copia de seguridad. 

Ahora entramos en el archivo /etc/named.conf. 

El archivo /etc/named.conf tiene un bloque llamado options { … }. Aquí se definen configuraciones globales para tu servidor DNS, como: 

- En qué interfaces de red escuchará (IPv4 e IPv6). 

- Qué IP pueden hacer consultas. 

- Desde qué IP se permite hacer consultas recursivas. 

listen-on y listen-on-v6, estas líneas configuran las direcciones IP y puertos en los que el proceso named estará escuchando conexiones entrantes para consultas DNS, separadas por protocolo (IPv4/IPv6)

![Texto alternativo](/assets/images/20260109-02.png)


El port 53 es el puerto estándar para DNS, listen-on lista de direcciones IPv4 donde escuchará y listen-on-v6 lo mismo pero para IPv6. 

allow-query define quién puede consultar tu servidor DNS

![Texto alternativo](/assets/images/20260109-03.png)


En nuestro caso localhost el propio servidor y 192.168.6.0/24 toda la subred IPv4 de 192.168.6.0 a 192.168.6.255. 

**Esto evita que cualquier IP externa haga consultas a nuestro servidor (lo cual es más seguro).**

La línea allow-recursion define quién puede hacer consultas recursivas, es decir, cuando nuestro servidor tiene que buscar la respuesta en otros servidores DNS de internet. 

![Texto alternativo](/assets/images/20260109-04.png)

**Si un cliente no está en esta lista, no podrá hacer consultas recursivas, esto previene que tu servidor sea usado en ataques de amplificación DNS.**

Finalmente, nuestro archivo de configuración quedaría de la siguiente manera

![Texto alternativo](/assets/images/20260109-05.png)

Antes de iniciar BIND, verificamos la sintaxis, si el comando no muestra ningún resultado, la sintaxis es correcta. 

![Texto alternativo](/assets/images/20260109-06.png)

Si no hay salida, la sintaxis es correcta.

Permitimos el tráfico DNS en el firewall y arrancamos el servicio 

![Texto alternativo](/assets/images/20260109-07.png)

---

# Configuración de Zonas

## Zona directa (Forward Zone)

Añadimos la definición de zona en el archivo /etc/named.conf 

![Texto alternativo](/assets/images/20260109-08.png)


Este servidor actúa como el principal (type master) para la xebec.dlab zone 

Guardamos el archivo y volvemos a validar la sintaxis 

![Texto alternativo](/assets/images/20260109-09.png)

Creamos el archivo /var/named/xebec.dlab.zone con el siguiente contenido  

![Texto alternativo](/assets/images/20260109-10.png)

Establezemos los permisos adecuados para que solo el grupo named lo pueda leer  

![Texto alternativo](/assets/images/20260109-11.png)

Verificamos la sintaxis de la zona 

![Texto alternativo](/assets/images/20260109-12.png)

Recargamos el BIND

![Texto alternativo](/assets/images/20260109-13.png)

Finalmente verificamos que funciona correctamente 

![Texto alternativo](/assets/images/20260109-14.png)


## Zona inversa (Reverse Zone)

Primero agregamos una nueva definición de zona al /etc/named.conf 

![Texto alternativo](/assets/images/20260109-15.png)

Verificamos sintaxis 

![Texto alternativo](/assets/images/20260109-16.png)

Creamos el archivo /var/named/6.168.192.in-addr.arpa.zone 

![Texto alternativo](/assets/images/20260109-17.png)

Asignamos los permisos adecuados igual que hemos hecho el la Zona directa (Forward zone) 

![Texto alternativo](/assets/images/20260109-18.png)

Verificamos la sintaxis del archivo 

![Texto alternativo](/assets/images/20260109-19.png)

Y recargamos el BIND 

![Texto alternativo](/assets/images/20260109-20.png)

Para acabar verificamos que funciona  

![Texto alternativo](/assets/images/20260109-21.png)

Configurar BIND es el primer paso para profesionalizar la gestión de red en cualquier entorno. Esta guía es un ejemplo de cómo instalar un servidor DNS de forma sencilla y funcional. El siguiente nivel de madurez sería implementar alta disponibilidad mediante un servidor secundario (Slave), garantizando así que la red nunca se quede 'a ciegas' si el servidor principal falla, pero eso lo exploraremos en una futuro post.