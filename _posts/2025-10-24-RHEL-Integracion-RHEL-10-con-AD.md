---
title: "Red Hat Enterprise Linux: Integración de RHEL 10 con Active Directory 2019 usando SSSD y realmd"
date: 2025-10-24
categories:
  - RedHat
  - ActiveDirectory
tags:
  - RHEL
  - ActiveDirectory
  - SSSD
toc: true
read_time: true
comments: true
classes: wide
excerpt: "Guía para integrar Red Hat Enterprise Linux 10.0 (RHEL 10) con Active Directory 2019, utilizando las herramientas SSSD y realmd"
header:
  overlay_image: /assets/images/RedHatbanner.png # Asegúrate de tener una imagen de banner en esta ruta
  overlay_filter: 0.5 # Ajusta el oscurecimiento de la imagen si es necesario
---

# Integración de RHEL 10 con Active Directory 2019 usando SSSD y realmd

## Introducción

La gestión centralizada de identidades y accesos es clave. Microsoft Active Directory (AD) se ha consolidado como el estándar en muchas infraestructuras para esta tarea.  

En esta guía, desglosaremos las opciones de integración y veremos paso a paso cómo conectar un sistema RHEL a un dominio de Active Directory.


## Opciones de Integración: ¿Cuál elegir?

Existen varias formas de lograr esta integración, cada una con sus particularidades. Aquí te presentamos las principales:

### Tabla de opciones de integración

| Opción de Integración | Descripción Técnica |
|----------------------|------------------|
| **System Security Services Daemon (SSSD)** | Es el componente de autenticación y resolución de identidades más moderno y recomendado. Permite a RHEL integrarse de forma nativa con dominios Active Directory utilizando protocolos como Kerberos, LDAP y DNS. Ofrece funcionalidades avanzadas como caché de credenciales, resolución de grupos y usuarios, mapeo de atributos AD a NSS/PAM, y soporte para autenticación offline. SSSD actúa como un middleware entre las aplicaciones del sistema y las fuentes externas de identidad, centralizando la gestión de políticas y sesiones. |
| **Samba Winbind** | Implementación basada en Samba que permite a los sistemas Linux funcionar como miembros de un dominio Windows/AD. Utiliza protocolos SMB/CIFS, NTLM y Kerberos, proporcionando resolución de usuarios y grupos de dominio a través de nsswitch y PAM. Aunque es funcional, su arquitectura basada en SMB puede implicar una mayor carga y dependencia del stack de Samba en comparación con SSSD. |
| **Managed Service Account (MSA)** | Una característica de Active Directory que permite crear cuentas de servicio administradas. Diseñada para que aplicaciones o demonios específicos en RHEL se autentiquen contra AD de forma segura sin requerir la unión completa del host al dominio. Las MSA gestionan automáticamente la rotación de contraseñas y las políticas de autenticación mediante Kerberos, reduciendo la sobrecarga administrativa y los riesgos asociados a credenciales estáticas. Ideal para servicios, no para login de usuarios interactivos. |

En esta guía, nos centraremos en el método más recomendado y versátil para una integración profunda: **SSSD**.


## Descubriendo SSSD

El **System Security Services Daemon (SSSD)** es un servicio esencial en los sistemas Linux/UNIX que actúa como intermediario inteligente para la gestión de identidad y autenticación. Su propósito es conectar tu sistema local (el "cliente SSSD") a diversas fuentes de identidad y mecanismos de autenticación remotos (los "proveedores").

SSSD opera en dos etapas clave:

1. **Conexión con el proveedor remoto:** Se comunica con un proveedor remoto (LDAP, AD, Kerberos, IdM) para obtener información de identidad del usuario (UID, GID, etc.) y datos necesarios para autenticación.
2. **Caché local de identidad y credenciales:** Crea y mantiene una caché local de esta información, permitiendo autenticación offline y mejor rendimiento.

Gracias a esta arquitectura, los usuarios pueden autenticarse en Linux usando cuentas almacenadas en el proveedor remoto sin crear cuentas locales duplicadas. SSSD puede configurarse para crear directorios de inicio automáticamente.


### Los Pilares de la Autenticación: PAM y NSS

SSSD obtiene la información de identidad desde un servidor remoto y la almacena localmente. ¿Cómo utiliza el sistema operativo esa información?

#### PAM (Pluggable Authentication Modules)

- **Función:** Autenticación y autorización de usuarios.  
- **Pregunta clave:** "¿Puede este usuario autenticarse y acceder?"

#### NSS (Name Service Switch)

- **Función:** Define de dónde obtener información sobre usuarios, grupos, hosts, contraseñas, etc.  
- **Archivo de configuración:** `/etc/nsswitch.conf`

```bash
passwd:     files ldap sss
group:      files ldap sss
shadow:     files ldap sss
hosts:      files dns sss
```
Esto significa que, para passwd (usuarios), el sistema primero busca en /etc/passwd (files), luego en un servidor LDAP (ldap), y finalmente consulta a SSSD (sss). 

- **Pregunta clave:** "¿De dónde obtengo la información de este usuario (UID, GID, nombre)?" 

#### Flujo de Autenticación Detallado

![Texto alternativo](/assets/images/20251024/20251024-01.png)

### Requisitos y Opciones de Mapeo de IDs

#### Tipos de Servidores de Identidad Compatibles con SSSD

SSSD es altamente versátil y puede interactuar con diversas fuentes de identidad:

| Tipo de Servidor                     | Descripción |
|-------------------------------------|-------------|
| **Active Directory (AD)**           | Servicio de directorio de Microsoft que proporciona autenticación, autorización y políticas centralizadas, el foco de nuestro artículo. |
| **Identity Management (IdM) en RHEL** | Implementación de gestión de identidades integrada en RHEL basada en FreeIPA, ideal para entornos Linux puros o híbridos compatibles con AD. |
| **Servidores genéricos LDAP o Kerberos** | Sistemas de directorio o autenticación basados en estándares abiertos que proporcionan servicios de identidad sin la complejidad inherente de Active Directory o las características de IdM. |


#### POSIX ID Mapping vs. POSIX Attributes

Cuando integramos Linux con Active Directory, nos enfrentamos a una diferencia fundamental: cómo manejan las identidades los usuarios.

- Linux utiliza **UID (User ID)** y **GID (Group ID)**, siguiendo el estándar POSIX.
- Windows AD utiliza **SID (Security ID)**, un identificador único globalmente.

Para que un usuario de Active Directory pueda acceder a un sistema Linux, necesitamos traducir o asignar esos identificadores de Windows (SID) a los de Linux (UID/GID).  
Aquí es donde SSSD ofrece dos opciones principales:

1. **POSIX ID Mapping**
2. **POSIX Attributes**


##### POSIX ID Mapping (mapeo automático)

- Esta es la opción predeterminada.
- En este modo, SSSD genera automáticamente los **UID** y **GID** a partir del **SID** de cada usuario de AD mediante un algoritmo interno.
- Así, no es necesario modificar nada dentro de Active Directory.


##### POSIX Attributes (atributos POSIX en AD)

- En este modo, los **UID** y **GID** se definen directamente en Active Directory, utilizando los atributos POSIX estándar (como `uidNumber`, `gidNumber`, `unixHomeDirectory`, etc.).
- SSSD simplemente lee esos valores cuando el usuario inicia sesión.
- Requiere editar o extender el esquema de AD para incluir los atributos POSIX, y la configuración es más compleja.


## ¡Demo! Integrando RHEL con Active Directory

En esta práctica, integraremos un sistema **RHEL 10** a un dominio de **Active Directory 2019** utilizando **SSSD** y el método de **POSIX ID Mapping**.

Utilizaremos un dominio ficticio para fines educativos: `umbrella.corp`.

El objetivo es permitir que los usuarios de Active Directory puedan autenticarse directamente en Linux con su nombre de usuario y contraseña de AD, sin necesidad de crear cuentas locales en RHEL.  
Gracias a SSSD y POSIX ID Mapping, RHEL asignará automáticamente los **UID** y **GID** a los usuarios de AD, garantizando una identidad única dentro del sistema Linux sin modificar Active Directory.

---

### Información de los Sistemas

#### RHEL 10.0

| Campo | Valor |
|--------|--------|
| **Hostname** | leon |
| **IP** | 192.168.6.4 |
| **Sistema Operativo** | RHEL 10.0 |
| **Rol** | Servidor Linux a integrar con Active Directory |
| **Dominio** | umbrella.corp |
| **DNS Primario** | 192.168.6.7 |
| **Estado Integración AD** | Pendiente |
| **Comentarios** | Usará SSSD y realmd para unir al dominio |

---

#### Windows Server 2019 (Active Directory / DNS)

| Campo | Valor |
|--------|--------|
| **Hostname** | WIN-TURSKABH596 |
| **IP** | 192.168.6.7 |
| **Sistema Operativo** | Windows Server 2019 |
| **Rol** | Controlador de Dominio / DNS |
| **Dominio** | umbrella.corp |
| **DNS Primario** | 192.168.6.7 |
| **Comentarios** | Servidor principal del dominio, provee DNS interno |

---

> **Nota:**  
> El controlador de dominio también funciona como servidor DNS del dominio.  
> Esto es importante porque Active Directory depende del DNS para localizar controladores de dominio y otros servicios.  
> RHEL apunta a este DNS para poder resolver nombres dentro del dominio y autenticar usuarios correctamente.

---

### Requisitos previos

Antes de empezar, hay que asegurarse de que el entorno tiene:

- **Conectividad de red** Los puertos necesarios para la comunicación con AD deben estar abiertos.

| Servicio | Puerto | Protocolo | Notas |
|-----------|---------|------------|--------|
| **DNS** | 53 | UDP y TCP | — |
| **LDAP** | 389 | UDP y TCP | — |
| **LDAPS** | 636 | TCP | Opcional |
| **Samba** | 445 | UDP y TCP | Para los Objetos de Directiva de Grupo (GPO) |
| **Kerberos** | 88 | UDP y TCP | — |
| **Kerberos (kadmin)** | 464 | UDP y TCP | Usado por *kadmin* para establecer y cambiar contraseñas |
| **Catálogo Global LDAP** | 3268 | TCP | Si se usa la opción `id_provider = ad` |
| **Catálogo Global LDAPS** | 3269 | TCP | Opcional |
| **NTP** | 123 | UDP | Opcional |
| **NTP** | 323 | UDP | Opcional |

---

- **Configuración DNS**

El servidor DNS de tu RHEL debe apuntar al controlador de dominio de Active Directory.  
Puedes verificarlo en `/etc/resolv.conf`.

![Texto alternativo](/assets/images/20251024/20251024-02.png)
![Texto alternativo](/assets/images/20251024/20251024-03.png)


---

- **Sincronización de hora (NTP)**

La hora del sistema RHEL debe estar sincronizada con el AD.  
Esto es crítico para el correcto funcionamiento de **Kerberos**.

![Texto alternativo](/assets/images/20251024/20251024-04.png)

---

### Empecemos con la instalación

Para empezar, instalamos los paquetes esenciales para la integración con Active Directory y el funcionamiento de SSSD:

```bash
sudo dnf install samba-common-tools realmd oddjob oddjob-mkhomedir sssd adcli krb5-workstation
```
![Texto alternativo](/assets/images/20251024/20251024-05.png)

Una vez instalados los paquetes, podemos usar realm discover para verificar la existencia y obtener información sobre nuestro dominio de Active Directory

```bash
realm discover ad.example.com
```

![Texto alternativo](/assets/images/20251024/20251024-06.png)

Es normal que el configured salga como no antes de unirse al dominio.

Antes de unir RHEL al dominio, es necesario ajustar las políticas criptográficas para soportar algunas configuraciones de Active Directory más antiguas

```bash
sudo update-crypto-policies --set DEFAULT:AD-SUPPORT-LEGACY
```

![Texto alternativo](/assets/images/20251024/20251024-07.png)

Se recomienda hacer un reboot para que se apliquen las politicas, es necessario reiniciar los servicios para que se aplique y con el reboot se inician todos de nuevo... 

Esto permite que el sistema Linux utilice algoritmos y protocolos de cifrado compatibles con versiones de Active Directory que aún no soportan las políticas criptográficas más estrictas de RHEL 10 por defecto. Si no se aplica este ajuste, el intento de unir el dominio (realm join) puede fallar debido a incompatibilidades de cifrado o autenticación. 

Ahora, el paso crucial, unir el sistema RHEL al dominio de Active Directory. El comando realm join no solo une el equipo, sino que también configura SSSD automáticamente con los parámetros adecuados. Te pedirá la contraseña de un usuario con permisos para unir equipos al dominio (por ejemplo, el usuario Administrator de AD).

```bash
sudo realm join ad.example.com -v 
```
![Texto alternativo](/assets/images/20251024/20251024-08.png)
![Texto alternativo](/assets/images/20251024/20251024-09.png)

Para comprobar que la integración ha sido exitosa y que los usuarios de Active Directory son reconocidos en RHEL, podemos usar el comando getent passwd con un usuario de AD.

```bash
getent passwd administrator@ad.example.com
```
![Texto alternativo](/assets/images/20251024/20251024-10.png)

Ahora RHEL ja está integrado con Active Directory. Cualquier usuario de AD puede iniciar sesión en RHEL utilizando las credenciales de dominio