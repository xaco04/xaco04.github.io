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
excerpt: "Aprende a instalar, configurar y administrar un servidor DNS con BIND en Red Hat Enterprise Linux 9.6, incluyendo zonas directas e inversas, registros principales y servidores master/slave."
header:
  overlay_image: /assets/images/RedHatbanner.png
  overlay_filter: 0.5
---

# Introducción

El DNS (Domain Name System) es el sistema que traduce nombres de dominio legibles por humanos, como `www.example.com`, en direcciones IP que los ordenadores utilizan para comunicarse.

En un entorno corporativo o incluso doméstico, tener un servidor DNS propio puede mejorar el rendimiento, la seguridad y el control de las consultas de tu red.

En este artículo, veremos como instalar y configurar un servidor DNS con BIND en Red Hat Enterprise Linux (RHEL) 9.6, de forma sencilla y explicando cada paso, los conceptos clave y cómo verificar que todo funcione correctamente.

---

# BIND

BIND (Berkeley Internet Name Domain) es un servidor DNS muy completo y compatible con los estándares de la IETF. Sus usos más comunes incluyen:

- Servidor caching para mejorar la velocidad de resolución de nombres.
- Servidor autoritativo para zonas que administras.
- Servidor secundario para replicar zonas y garantizar alta disponibilidad.

BIND puede ejecutarse en modo normal o en un entorno chroot para mayor seguridad. Además, en RHEL, SELinux protege al servicio por defecto, evitando vulnerabilidades conocidas.

---

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
Siempre que tengas una zona directa, se recomienda crear la zona inversa correspondiente para que los servicios de correo, autenticación y seguridad funcionen correctamente.

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

## Servidores Master y Slave

### Servidor primario (Master)

Es el dueño de la zona, donde se mantienen los registros originales.

Se edita directamente el archivo de zona:

```conf
zone "xebec.dlab" {
    type master;
    file "/var/named/xebec.dlab.zone";
};
```

Aquí se definen SOA, NS, A, AAAA, MX, TXT…
Incrementar el serial del SOA garantiza que los slaves se sincronicen correctamente.

### Servidor secundario (Slave)

No tiene el archivo editable, copia la zona automáticamente desde el master:



Guarda la copia local en `/var/named/slaves/xebec.dlab.zone`.
Responde consultas DNS igual que el master.

Ambos servidores (master y slave) deben aparecer como NS en la zona:

```text
@ IN NS dns1.xebec.dlab.  ; master
@ IN NS dns2.xebec.dlab.  ; slave
```

---

## Flujo de actualización de la zona

1. Se hace un cambio en el master (ej. agregar un registro A).
2. Se incrementa el serial del SOA.
3. El slave detecta el cambio consultando el serial (cada Refresh segundos).
4. El slave descarga la zona y la guarda localmente.
5. Ambos servidores pueden responder consultas de forma autoritativa.

---

# Prerrequisitos

Antes de instalar BIND, asegúrate de:

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

# Demo

## Instalación de BIND

Primero instalamos los paquetes necesarios bind y bind-utils 

```bash
dnf install bind bind-utils
```
![Texto alternativo](/assets/images/20260109-01.png)

## Configuración Básica de BIND

El archivo principal de configuración es /etc/named.conf. Antes de modificarlo, es recomendable hacer una copia de seguridad. 

```bash
sudo cp /etc/named.conf /etc/named.conf.bak
```

Ahora entramos en el archivo /etc/named.conf. 

El archivo /etc/named.conf tiene un bloque llamado options { … }. Aquí se definen configuraciones globales para tu servidor DNS, como: 

- En qué interfaces de red escuchará (IPv4 e IPv6). 

- Qué IP pueden hacer consultas. 

- Desde qué IP se permite hacer consultas recursivas. 

listen-on y listen-on-v6, estas líneas configuran las direcciones IP y puertos en los que el proceso named estará escuchando conexiones entrantes para consultas DNS, separadas por protocolo (IPv4/IPv6) 

```conf
listen-on port 53 { 127.0.0.1; 192.168.6.0/24; };
listen-on-v6 { ::1; };

```
El port 53 es el puerto estándar para DNS, listen-on lista de direcciones IPv4 donde escuchará y listen-on-v6 lo mismo pero para IPv6. 

allow-query define quién puede consultar tu servidor DNS

```conf
allow-query { 127.0.0.1; 192.168.6.0/24; };
```
En nuestro caso localhost el propio servidor y 192.168.6.0/24 toda la subred IPv4 de 192.168.6.0 a 192.168.6.255. 

**Esto evita que cualquier IP externa haga consultas a nuestro servidor (lo cual es más seguro).**

La línea allow-recursion define quién puede hacer consultas recursivas, es decir, cuando nuestro servidor tiene que buscar la respuesta en otros servidores DNS de internet. 

```conf
allow-recursion { 127.0.0.1; 192.168.6.0/24; };
```

**Si un cliente no está en esta lista, no podrá hacer consultas recursivas, esto previene que tu servidor sea usado en ataques de amplificación DNS.**

Finalmente, nuestro archivo de configuración quedaría de la siguiente manera

Antes de iniciar BIND, verificamos la sintaxis, si el comando no muestra ningún resultado, la sintaxis es correcta. 

```bash
named-checkconf
```

Si no hay salida, la sintaxis es correcta.

Permitimos el tráfico DNS en el firewall y arrancamos el servicio 

---

# Configuración de Zonas

## Zona directa (Forward Zone)

Añadimos la definición de zona en el archivo /etc/named.conf 

```conf
zone "xebec.dlab" {
    type master;
    file "/var/named/xebec.dlab.zone";
    allow-query { any; };
    allow-transfer { none; };
};
```
Este servidor actúa como el principal (type master) para la xebec.dlab zone 

Guardamos el archivo y volvemos a validar la sintaxis 


Creamos el archivo /var/named/xebec.dlab.zone con el siguiente contenido  

Establezemos los permisos adecuados para que solo el grupo named lo pueda leer  

```bash
chown root:named /var/named/xebec.dlab.zone
chmod 640 /var/named/xebec.dlab.zone
```
Verificamos la sintaxis de la zona 

```bash
named-checkzone xebec.dlab /var/named/xebec.dlab.zone
```

```bash
systemctl reload named
```
Finalmente verificamos que funciona correctamente 

## Zona inversa (Reverse Zone)

Primero agregamos una nueva definición de zona al /etc/named.conf 

```conf
zone "6.168.192.in-addr.arpa" {
    type master;
    file "/var/named/6.168.192.in-addr.arpa.zone";
    allow-query { any; };
    allow-transfer { none; };   
};
```
Verificamos sintaxis 

Creamos el archivo /var/named/6.168.192.in-addr.arpa.zone 

Asignamos los permisos adecuados igual que hemos hecho el la Zona directa (Forward zone) 

```bash
chown root:named /var/named/6.168.192.in-addr.arpa.zone
chmod 640 /var/named/6.168.192.in-addr.arpa.zone
```
Verificamos la sintaxis del archivo 

```bash
named-checkzone 6.168.192.in-addr.arpa /var/named/6.168.192.in-addr.arpa.zone
```
Y recargamos el BIND 

```bash
systemctl reload named
```
Para acabar verificamos que funciona  