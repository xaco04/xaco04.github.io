---
title: "Red Hat Ansible Automation Platform 2.6: Guía de Integración con Active Directory (LDAP/LDAPS)"
date: 2025-11-07
categories:
  - RedHat
  - ActiveDirectory
tags:
  - AAP
  - LDAP
  - LDAPS
  - ActiveDirectory
  - Autenticación
toc: true
read_time: true
comments: true
classes: wide
excerpt: "Guía detallada para integrar Red Hat Ansible Automation Platform 2.6 con Active Directory 2019, utilizando autenticación LDAP o LDAPS para permitir el acceso de usuarios del dominio."
header:
  overlay_image: /assets/images/RedHatbanner.png # Asegúrate de tener una imagen de banner en esta ruta
  overlay_filter: 0.5 # Ajusta el oscurecimiento de la imagen si es necesario
---

# Introducción

El propósito de este documento es mostrar cómo integrar Ansible Automation Platform (AAP) con Active Directory mediante el protocolo LDAP o LDAPS, permitiendo que los usuarios del dominio puedan autenticarse directamente con sus credenciales corporativas. Con esta configuración, los usuarios del dominio podrán iniciar sesión directamente en AAP con sus credenciales, sin que el sistema almacene contraseñas locales.

AAP delega la autenticación a AD a través de consultas LDAP/LDAPS, lo que permite una gestión segura y centralizada de usuarios, grupos y permisos.

## Arquitectura de autenticación en AAP 2.6

En la versión 2.6, AAP utiliza un servicio central de autenticación (Platform Gateway). Este gateway consolida los métodos de login (LDAP, SAML, OIDC, autenticación local, etc.) en un sistema modular y extensible, basado en autenticadores y mapeos.

Cada autenticador define cómo se conecta la plataforma a una fuente externa (como AD), mientras que los mapeos controlan cómo los usuarios autenticados se asocian a organizaciones, equipos o roles dentro de AAP.


| Concepto             | Descripción |
|----------------------|-------------|
| **Authenticator Plugin** | Tipo de conexión (LDAP, SAML, OIDC, etc.). |
| **Authenticator** | Instancia del plugin con su configuración específica (por ejemplo, la URL del servidor LDAP al que necesita conectarse). |
| **Authenticator Map** | Reglas que definen permisos o acceso según grupos o atributos de usuario. |

> Esta arquitectura “pluggable” permite tener múltiples autenticadores activos, incluso del mismo tipo (por ejemplo, varios LDAP apuntando a distintos dominios o unidades organizativas).

## Flujo de autenticación

![Texto alternativo](/assets/images/20251107/20251107-01.png)

## Requisitos previos

Antes de empezar, tenemos que asegurarnos de tener todo lo necessario:

*   Ansible Automation Platform 2.6 instalado y operativo.
*   Una instancia en ejecución de su fuente de autenticación (Active Directory Windows Server 2019 en mi caso) funcionando, con acceso de red desde AAP.
*   Certificado del servidor LDAPS, en caso de usar conexión segura.
*   Credenciales de administrador en AAP con acceso a Access Management → Authentication Methods.

Siempre se recomienda usar LDAPS (puerto 636) para cifrar las credenciales y proteger las consultas del dominio.



## Guía DEMO

El objetivo de esta guía es integrar Ansible Automation Platform con Active Directory (Windows Server 2019) usando LDAP, de modo que la autenticación de usuarios se gestione desde el directorio corporativo sin necesidad de credenciales locales en AAP.

Primero vamos a crear un nuevo autenticador en Ansible Automation Platform, para ello iniciamos sesión entrando desde el navegador.

![Texto alternativo](/assets/images/20251107/20251107-02.png)

En la interfaz de AAP, navegamos hasta Access Management → Authentication Methods → Create authentication.

![Texto alternativo](/assets/images/20251107/20251107-03.png)

Una vez aquí podemos ver los métodos de autenticación creados, seleccionamos crear método para configurar otro método de autenticación.

### Configuración del método de autenticación

Esta parte es importante vamos a ver cada uno de los campos para entender mejor cómo funciona todo. Es una parte un poco más teórica y larga, así que si ya sabemos cómo van estos parámetros, podemos saltarnos esto i ir directamente al punto “Active Directory Authenticator – Configuración”.


![Texto alternativo](/assets/images/20251107/20251107-04.png)

---

<details>
  <summary><strong>📘 Name</strong></summary>

El campo Name sirve para dar un nombre a esta configuración de autenticación.<br><br>  
Por ejemplo, podemos asignarle un nombre descriptivo como:

<br><br><code>Active Directory Authenticator</code><br><br>

</details>
---
<details>
  <summary><strong>📘 Authentication type</strong></summary>

Seleccionamos LDAP en el campo de Authentication type. La sección de Detalles de Autenticación se actualizará automáticamente para mostrar los campos relevantes según el tipo seleccionado.

<br><br><code>LDAP</code><br><br>

</details>
---

<details>
  <summary><strong>📘 LDAP Server URI</strong></summary>

En este campo se debe ingresar la URL del servidor LDAP o Active Directory al cual Ansible Automation Platform (AAP) se conectará para autenticar a los usuarios.<br><br>

La URL define el protocolo, el nombre del servidor (o su dirección IP), y el puerto de conexión. El formato general es:

<br><br><code>ldap://&lt;nombre_servidor&gt;:&lt;puerto&gt;</code><br><br>

Por ejemplo, en nuestro caso utilizaremos:

<br><br><code>ldap://padthai.org:389</code><br><br>

<ul>
  <li><code>ldap://</code> indica que se utilizará el protocolo LDAP estándar sin cifrado (el método seguro sería <code>ldaps://</code>).</li>
  <li><code>padthai.org</code> es el nombre del dominio o servidor que aloja el servicio LDAP.</li>
  <li><code>389</code> es el puerto predeterminado para conexiones LDAP sin TLS (con LDAPS sería <code>636</code>).</li>
</ul>

AAP también permite especificar múltiples servidores LDAP en este campo, separados por espacios o comas. Esto es útil para proporcionar alta disponibilidad o tolerancia a fallos. Por ejemplo:

<br><br><code>ldap://ldap1.padthai.org:389 ldap://ldap2.padthai.org:389</code><br><br>

Cuando sea posible, se recomienda utilizar LDAPS (LDAP sobre SSL) o StartTLS para cifrar la comunicación entre AAP y el servidor de directorio.  <br><br>
El formato para conexiones seguras es:

<br><br><code>ldaps://padthai.org:636</code><br><br>

</details>
---

<details>
  <summary><strong>📘 LDAP Bind DN</strong></summary>

En este campo se especifica el Distinguished Name (DN) del usuario que Ansible Automation Platform (AAP) utilizará para autenticarse contra el servidor LDAP o Active Directory.  <br><br>
Este usuario es conocido como la cuenta de enlace o <em>Bind User</em>, y su función es permitir que AAP realice búsquedas dentro del árbol de directorios para validar las credenciales de los usuarios que intentan iniciar sesión.<br><br>

El DN (<em>Distinguished Name</em>) es una cadena que identifica de forma única a un objeto dentro de la jerarquía del directorio LDAP. Está compuesto por varios componentes jerárquicos, como:

<ul>
  <li><strong>CN</strong> (Common Name): el nombre del objeto o usuario.</li>
  <li><strong>OU</strong> (Organizational Unit): la unidad organizativa donde se encuentra el objeto (si aplica).</li>
  <li><strong>DC</strong> (Domain Component): los componentes del dominio, que representan la estructura DNS del dominio de Active Directory.</li>
</ul>

Por ejemplo, si el usuario que AAP utilizará para enlazarse con el servidor LDAP es el Administrador del dominio, su DN podría tener el siguiente formato (en nuestro caso es este mismo, ya que lo hemos hecho lo más simple posible):

<br><br><code>CN=Administrator,CN=Users,DC=padthai,DC=org</code><br><br>

Esto indica que:

<ul>
  <li>El nombre común (<code>CN</code>) del usuario es <code>Administrator</code>.</li>
  <li>Este usuario se encuentra en el contenedor predeterminado <code>Users</code>.</li>
  <li>El dominio al que pertenece está formado por los componentes <code>padthai.org</code>.</li>
</ul>

En entornos más complejos, el usuario de enlace puede estar ubicado en una unidad organizativa diferente, por ejemplo:

<br><br><code>CN=ldap-bind,OU=ServiceAccounts,DC=padthai,DC=org</code><br><br>

Por motivos de seguridad, es preferible utilizar una cuenta de servicio dedicada con permisos mínimos de lectura en el directorio, en lugar de la cuenta de administrador del dominio.  <br><br>
Como esto es solo una prueba, hemos utilizado el Administrador, aunque en entornos de producción se debe evitar.

</details>
---
<details>
  <summary><strong>📘 LDAP Bind Password</strong></summary>

En este campo se debe ingresar la contraseña del usuario de enlace (<em>Bind DN</em>) configurado previamente.  
Esta credencial permite que Ansible Automation Platform (AAP) se autentique ante el servidor LDAP y realice las búsquedas necesarias dentro del directorio.<br><br>

Por ejemplo, si en el campo LDAP Bind DN se especificó el usuario:

<br><br><code>CN=Administrator,CN=Users,DC=padthai,DC=org</code><br><br>

Entonces en LDAP Bind Password se debe ingresar la contraseña correspondiente a esta cuenta.<br><br>

<strong>Importante:</strong>

<ul>
  <li>Esta contraseña se almacena sin cifrado si se utiliza el protocolo LDAP (puerto 389), ya que la comunicación no está protegida.</li>
  <li>Por esta razón, se recomienda utilizar LDAPS (puerto 636) o StartTLS para asegurar la conexión y evitar que las credenciales sean transmitidas en texto plano.</li>
  <li>En entornos de laboratorio o pruebas, esto puede no ser crítico, pero nunca debe aplicarse en entornos de producción sin cifrado.</li>
  <li>Por motivos de seguridad, en la interfaz de AAP el valor de este campo aparece enmascarado (por ejemplo, como <code>*******</code>), aunque internamente se guarda en texto claro si no se usa cifrado.</li>
</ul>

</details>

---
<details>
  <summary><strong>📘 LDAP Group Type</strong></summary>

Este campo define el tipo de grupos que utiliza el servidor LDAP o Active Directory, y determina cómo Ansible Automation Platform (AAP) interpretará y consultará la pertenencia de los usuarios a dichos grupos.<br><br>

Dependiendo del tipo de servidor LDAP en uso (por ejemplo, Active Directory, OpenLDAP, FreeIPA, etc.), la estructura interna de los grupos puede variar.  <br><br>
Por ello, AAP requiere que se seleccione el tipo de grupo adecuado para poder realizar correctamente la búsqueda de pertenencias y aplicar los permisos o roles asociados.<br><br>

Algunos de los tipos de grupo más comunes son:

<ul>
  <li><code>ActiveDirectoryGroupType</code> — para entornos Microsoft Active Directory.</li>
  <li><code>GroupOfNamesType</code> — para servidores LDAP que usan objetos del tipo <code>groupOfNames</code>.</li>
  <li><code>GroupOfUniqueNamesType</code> — similar al anterior, pero basado en el atributo <code>uniqueMember</code>.</li>
  <li><code>PosixGroupType</code> — para entornos Unix/Linux que utilizan el atributo <code>memberUid</code>.</li>
</ul>

La lista completa de tipos de grupo disponibles y su descripción detallada puede consultarse en la documentación oficial de Django Auth LDAP: <br><br>

<a href="https://django-auth-ldap.readthedocs.io/en/stable/groups.html#types-of-groups" target="_blank">Documentación oficial de tipos de grupos</a> <br><br>

En la mayoría de los entornos con Active Directory, el valor correcto será <code>ActiveDirectoryGroupType</code>, ya que coincide con el esquema de grupo utilizado por Microsoft.

</details>
---

<details>
  <summary><strong>📘 LDAP User DN Template</strong></summary>

Este campo permite definir una plantilla fija para construir el Distinguished Name (DN) de los usuarios que intentan autenticarse, como alternativa a realizar búsquedas en el directorio.<br><br>

Cuando todos los usuarios dentro del servidor LDAP o Active Directory siguen una estructura de DN consistente, esta opción puede ser más eficiente que usar el método de búsqueda (<em>User Search Base</em>), ya que evita consultas adicionales al directorio.<br><br>

La sintaxis general de este campo es:

<br><br><code>uid=%(user)s,&lt;ruta_del_contenedor&gt;</code><br><br>

o, en el caso de Active Directory:

<br><br><code>CN=%(user)s,CN=Users,DC=padthai,DC=org</code><br><br>

Donde:

<ul>
  <li><code>%(user)s</code> se reemplaza automáticamente por el nombre de usuario ingresado en el inicio de sesión.</li>
  <li>Los demás componentes (CN, OU, DC, etc.) definen la ubicación en el árbol LDAP donde se encuentran los usuarios.</li>
</ul>

Por ejemplo, si todos los usuarios del dominio <code>padthai.org</code> se ubican en el contenedor <code>Users</code>, la plantilla podría ser:

<br><br><code>CN=%(user)s,CN=Users,DC=padthai,DC=org</code><br><br>

Esto permitirá que AAP construya directamente el DN completo de cada usuario a partir del nombre ingresado, sin necesidad de buscarlo en el directorio.


<ul>
  <li>Si se define este campo, AAP ignorará la configuración de User Search Base (<code>AUTH_LDAP_USER_SEARCH</code>).</li>
  <li>Esta opción solo debe utilizarse cuando la estructura del directorio es uniforme y todos los usuarios siguen el mismo patrón de DN.</li>
  <li>En entornos más complejos, donde los usuarios se distribuyen en varias unidades organizativas (OU), es preferible usar la búsqueda de usuarios (User Search Base) para evitar fallos de autenticación.</li>
</ul>

</details>

---

<details>
  <summary><strong>📘 LDAP Start TLS</strong></summary>

Este parámetro determina si se debe habilitar el cifrado TLS (Transport Layer Security) sobre una conexión LDAP estándar que no usa SSL (es decir, conexiones a través del puerto 389).<br><br>

Cuando esta opción está activada, Ansible Automation Platform (AAP) establece primero una conexión LDAP sin cifrar y, a continuación, inicia una negociación TLS para proteger la comunicación.  <br><br>
Esto permite mantener el mismo puerto de conexión (389) pero garantizando la confidencialidad e integridad de los datos transmitidos, incluidas las credenciales del usuario de enlace (Bind DN) y las respuestas del servidor.<br><br>

En términos prácticos:

<ul>
  <li>Si la URL del servidor es <code>ldap://padthai.org:389</code> y esta opción está habilitada, la sesión LDAP se cifrará mediante TLS.</li>
  <li>Si la URL es <code>ldaps://padthai.org:636</code>, no es necesario habilitar StartTLS, ya que la conexión ya está protegida mediante SSL nativo.</li>
</ul>

<strong>Recomendaciones:</strong>

<ul>
  <li>En entornos de producción, siempre debe habilitarse StartTLS (o usarse LDAPS) para evitar la transmisión de credenciales en texto claro.</li>
  <li>Si se trata de un entorno de laboratorio o pruebas, puede dejarse desactivado, aunque esto implica que las comunicaciones no estarán cifradas.</li>
  <li>El servidor LDAP debe tener un certificado válido configurado para que la negociación TLS funcione correctamente.</li>
</ul>

</details>
---

<details>
  <summary><strong>📘 Additional Authenticator Fields</strong></summary>

Este campo permite definir parámetros adicionales que pueden ser utilizados por el autenticador, en este caso el conector LDAP.<br><br>

Los valores que se introduzcan aquí no son validados ni procesados directamente por Ansible Automation Platform (AAP); en su lugar, son transmitidos tal cual al autenticador subyacente.  <br><br>
Esto ofrece flexibilidad para incluir configuraciones o atributos personalizados que no estén contemplados en los campos estándar de la interfaz.<br><br>

Por ejemplo, podrían definirse parámetros específicos del entorno o del servidor LDAP, tales como:

<br><br><code>
AUTH_LDAP_CONNECTION_TIMEOUT: 5<br>
AUTH_LDAP_REQUIRE_GROUP: "CN=admins,CN=Users,DC=padthai,DC=org"
</code><br><br>

En este caso:

<ul>
  <li><code>AUTH_LDAP_CONNECTION_TIMEOUT</code> establece un tiempo máximo de espera (en segundos) para la conexión LDAP.</li>
  <li><code>AUTH_LDAP_REQUIRE_GROUP</code> obliga a que el usuario pertenezca a un grupo determinado para poder autenticarse en AAP.</li>
</ul>

<strong>Importante:</strong>

<ul>
  <li>AAP no valida ni interpreta estos campos, por lo que cualquier error de formato o valor inválido puede causar fallos en la autenticación.</li>
  <li>Se recomienda usar esta opción únicamente cuando sea necesario aplicar configuraciones avanzadas o extender el comportamiento predeterminado del autenticador LDAP.</li>
  <li>La lista completa de variables adicionales disponibles se puede consultar en la documentación oficial de Django Auth LDAP: <br>
  <a href="https://django-auth-ldap.readthedocs.io/en/stable/" target="_blank">https://django-auth-ldap.readthedocs.io/en/stable/</a></li>
</ul>

</details>

---
<details>
  <summary><strong>📘 LDAP Connection Options</strong></summary>

Este campo permite definir opciones adicionales de configuración para la conexión LDAP que establece Ansible Automation Platform (AAP) con el servidor de directorio.<br><br>

Estas opciones se aplican directamente a la biblioteca python-ldap, que es la capa utilizada por AAP (a través de Django Auth LDAP) para gestionar las conexiones.  <br><br>
Se trata, por tanto, de parámetros de bajo nivel que ajustan el comportamiento de la conexión y pueden ser útiles para entornos con configuraciones específicas de Active Directory o LDAP.<br><br>

Por defecto, AAP deshabilita las referencias LDAP (<code>OPT_REFERRALS = 0</code>) para evitar bloqueos en ciertas consultas realizadas contra servidores Active Directory.  <br><br>
Esto es especialmente importante porque las referencias pueden hacer que las operaciones de búsqueda queden en espera indefinidamente.<br><br>

Podemos agregar otras opciones según las necesidades de tu entorno, utilizando el formato de clave-valor, donde los nombres de las opciones deben ser cadenas de texto (por ejemplo, <code>"OPT_NETWORK_TIMEOUT"</code>, <code>"OPT_DEBUG_LEVEL"</code>, etc.).  <br><br>
Ejemplo:

<br><br><code>
{<br>
&nbsp;&nbsp;"OPT_REFERRALS": 0,<br>
&nbsp;&nbsp;"OPT_NETWORK_TIMEOUT": 5,<br>
&nbsp;&nbsp;"OPT_DEBUG_LEVEL": 0<br>
}
</code><br><br>

En este ejemplo:

<ul>
  <li><code>OPT_REFERRALS</code>: <code>0</code> desactiva las referencias LDAP (valor predeterminado).</li>
  <li><code>OPT_NETWORK_TIMEOUT</code>: <code>5</code> establece un tiempo máximo de 5 segundos para las operaciones de red.</li>
  <li><code>OPT_DEBUG_LEVEL</code>: <code>0</code> define el nivel de depuración (0 = desactivado).</li>
</ul>

<strong>Se recomienda:</strong>

<ul>
  <li>Utilizar este campo únicamente para ajustar comportamientos específicos o resolver problemas de conectividad.</li>
  <li>Los nombres y valores válidos de las opciones disponibles se encuentran en la documentación oficial de python-ldap: <br>
  <a href="https://www.python-ldap.org/doc/html/ldap.html#options" target="_blank">https://www.python-ldap.org/doc/html/ldap.html#options</a></li>
  <li>Un valor mal configurado puede causar errores de conexión o comportamiento inesperado, por lo que se recomienda probar los cambios en un entorno de desarrollo antes de aplicarlos en producción.</li>
</ul>

</details>
---
<details>
  <summary><strong>📘 LDAP Group Type Parameters</strong></summary>

Este campo permite especificar parámetros adicionales (en formato clave-valor) que serán enviados al método de inicialización del tipo de grupo definido en el campo LDAP Group Type.<br><br>

Cada tipo de grupo en LDAP —por ejemplo, <code>ActiveDirectoryGroupType</code>, <code>GroupOfNamesType</code> o <code>PosixGroupType</code>— puede requerir o admitir opciones específicas para adaptar su comportamiento al esquema del servidor de directorio.  <br><br>
Estas opciones se pasan al inicializador del tipo de grupo elegido y permiten controlar cómo se interpretan los atributos de pertenencia a grupos o cómo se resuelven los miembros.<br><br>

Por ejemplo, para un entorno Active Directory, podrías especificar:

<br><br><code>
{<br>
&nbsp;&nbsp;"name_attr": "cn"<br>
}
</code><br><br>

O para un servidor OpenLDAP que utiliza el atributo <code>memberUid</code>:

<br><br><code>
{<br>
&nbsp;&nbsp;"member_attr": "memberUid"<br>
}
</code><br><br>

Estos parámetros le indican al autenticador cómo identificar los grupos y los miembros dentro del árbol LDAP según el esquema utilizado.

<ul>
  <li>Los nombres y valores de los parámetros dependen del tipo de grupo seleccionado en LDAP Group Type.</li>
  <li>Si no se requieren configuraciones especiales, este campo puede dejarse vacío.</li>
  <li>La lista completa de parámetros disponibles y ejemplos de uso puede consultarse en la documentación oficial de Django Auth LDAP: <br>
  <a href="https://django-auth-ldap.readthedocs.io/en/stable/groups.html" target="_blank">https://django-auth-ldap.readthedocs.io/en/stable/groups.html</a></li>
</ul>

</details>
---

<details>
  <summary><strong>📘 LDAP Group Search</strong></summary>

Este campo define la búsqueda LDAP utilizada para localizar los grupos dentro del directorio.  <br><br>
En Ansible Automation Platform (AAP), esta configuración es fundamental porque permite mapear a los usuarios con las organizaciones, equipos o roles basándose en su pertenencia a grupos definidos en el servidor LDAP o Active Directory.<br><br>

A diferencia de la búsqueda de usuarios (User Search Base), la búsqueda de grupos:

<ul>
  <li>Se utiliza exclusivamente para identificar grupos y sus miembros.</li>
  <li>No admite el uso de <code>LDAPSearchUnion</code>, por lo que solo puede configurarse una única búsqueda LDAP.</li>
</ul>

El formato general de la búsqueda es similar al utilizado para usuarios y se compone de tres partes principales:<br><br>

<code>Base DN, Scope, Filter</code><br><br>

Por ejemplo:

<br><br><code>
{<br>
&nbsp;&nbsp;"base_dn": "OU=Groups,DC=padthai,DC=org",<br>
&nbsp;&nbsp;"scope": "SUBTREE",<br>
&nbsp;&nbsp;"filter": "(objectClass=group)"<br>
}
</code><br><br>

En este ejemplo:

<ul>
  <li><code>base_dn</code> define el punto de inicio en el árbol LDAP desde donde se buscarán los grupos.</li>
  <li><code>scope</code> puede ser:
    <ul>
      <li><code>BASE</code> — solo el DN exacto especificado.</li>
      <li><code>ONELEVEL</code> — solo los objetos directamente bajo el DN base.</li>
      <li><code>SUBTREE</code> — todos los objetos dentro del DN base (recomendado).</li>
    </ul>
  </li>
  <li><code>filter</code> especifica el criterio LDAP que determina qué objetos se consideran grupos (por ejemplo, <code>objectClass=group</code> en Active Directory o <code>objectClass=groupOfNames</code> en OpenLDAP).</li>
</ul>

<ul>
  <li>Debemos asegurarnos de que el filtro y el ámbito de búsqueda coincidan con la estructura real de grupos en tu directorio.</li>
  <li>En entornos Active Directory, el contenedor predeterminado suele ser <code>CN=Users,DC=padthai,DC=org</code>, pero en configuraciones más organizadas puede usarse una OU específica como <code>OU=Groups</code>.</li>
  <li>Este campo trabaja en conjunto con <code>LDAP Group Type</code> y <code>LDAP Group Type Parameters</code> para determinar cómo se interpretan y procesan los resultados de la búsqueda de grupos.</li>
</ul>

</details>
---
<details>
  <summary><strong>📘 LDAP User Attribute Map</strong></summary>

Este campo define el mapeo entre los atributos del esquema LDAP y los atributos del modelo de usuario de Ansible Automation Platform (AAP).  <br><br>
En otras palabras, indica cómo deben traducirse los datos obtenidos del servidor LDAP (como nombre, apellido, correo electrónico, etc.) a los campos correspondientes del usuario dentro de AAP.<br><br>

Por defecto, los valores de este mapeo están configurados para ser compatibles con Microsoft Active Directory, pero pueden requerir ajustes si se utiliza otro tipo de servidor LDAP (por ejemplo, OpenLDAP o FreeIPA), ya que los nombres de los atributos pueden variar.<br><br>

Un ejemplo típico para Active Directory sería:

<br><br><code>
{<br>
&nbsp;&nbsp;"first_name": "givenName",<br>
&nbsp;&nbsp;"last_name": "sn",<br>
&nbsp;&nbsp;"email": "mail"<br>
}
</code><br><br>

Mientras que en un entorno OpenLDAP, los atributos podrían ser diferentes:

<br><br><code>
{<br>
&nbsp;&nbsp;"first_name": "givenName",<br>
&nbsp;&nbsp;"last_name": "surname",<br>
&nbsp;&nbsp;"email": "mail"<br>
}
</code><br><br>

AAP usa este mapeo al sincronizar usuarios desde el directorio LDAP, garantizando que los datos básicos del usuario (nombre, apellido, correo) se almacenen correctamente en la base de datos interna del sistema.


<ul>
  <li>Si nuestro servidor LDAP utiliza un esquema personalizado, debemos asegurarnos de conocer los nombres exactos de los atributos antes de modificarlos.</li>
  <li>Es posible agregar otros campos compatibles con la API de usuarios de AAP si nuestra organización necesita información adicional (por ejemplo, <code>username</code> o <code>phone_number</code>).</li>
  <li>Consultar la documentación de AAP o de Django Auth LDAP para obtener la lista completa de atributos compatibles y ejemplos detallados:  
  <a href="https://django-auth-ldap.readthedocs.io/en/stable/">https://django-auth-ldap.readthedocs.io/en/stable/</a></li>
</ul>

</details>

---

<details>
  <summary><strong>📘 LDAP User Search</strong></summary>

Este campo define la búsqueda LDAP utilizada para localizar y autenticar a los usuarios dentro del directorio.  <br><br>
Cuando un usuario intenta iniciar sesión en Ansible Automation Platform (AAP), el sistema ejecuta esta búsqueda para encontrar la entrada correspondiente en el servidor LDAP y validar sus credenciales.<br><br>

El resultado de esta búsqueda determina qué usuarios pueden autenticarse en la plataforma. Solo los usuarios que coincidan con los criterios especificados podrán iniciar sesión y deberán estar mapeados a una organización mediante la configuración <code>AUTH_LDAP_ORGANIZATION_MAP</code><br><br>

La búsqueda se especifica mediante tres componentes principales:<br><br>

<code>Base DN, Scope, Filter</code><br><br>

Por ejemplo:

<br><br><code>
{<br>
&nbsp;&nbsp;"base_dn": "OU=Users,DC=padthai,DC=org",<br>
&nbsp;&nbsp;"scope": "SUBTREE",<br>
&nbsp;&nbsp;"filter": "(sAMAccountName=%(user)s)"<br>
}
</code><br><br>

En este ejemplo:<br><br>

<ul>
  <li><strong>base_dn</strong>: indica el punto de partida dentro del árbol LDAP desde donde se buscarán los usuarios (por ejemplo, <strong>OU=Users,DC=padthai,DC=org</strong>).</li>
  <li><strong>scope</strong>: define el alcance de la búsqueda:
    <ul>
      <li><strong>BASE</strong>: busca solo en el DN exacto especificado.</li>
      <li><strong>ONELEVEL</strong>: busca solo en el nivel inmediatamente inferior al DN base.</li>
      <li><strong>SUBTREE</strong>: busca en todo el subárbol (recomendado).</li>
    </ul>
  </li>
  <li><strong>filter</strong>: especifica el criterio LDAP utilizado para identificar al usuario.
    <br>En Active Directory, el atributo más común es <strong>sAMAccountName</strong>, mientras que en OpenLDAP suele usarse <strong>uid</strong>.
  </li>
</ul>


<br><br>
Si el entorno requiere soportar múltiples búsquedas de usuarios (por ejemplo, cuando los usuarios están distribuidos en diferentes unidades organizativas), se puede utilizar la opción `LDAPSearchUnion`, que permite combinar varias consultas de búsqueda en una sola configuración.

<ul>
  <li>Lo mejor es utilizar filtros específicos para evitar coincidencias no deseadas y mejorar el rendimiento de las búsquedas.</li>
  <li>En entornos Active Directory, <code>(sAMAccountName=%(user)s)</code> es el filtro más habitual.</li>
  <li>En OpenLDAP, el equivalente común sería <code>(uid=%(user)s)</code>.</li>
  <li>Debemos assegurarnos de que la búsqueda sea coherente con la estructura real del árbol de usuarios en nuestra organización.</li>
  <li>La documentación completa sobre LDAPSearch y LDAPSearchUnion está disponible en:  
  <a href="https://django-auth-ldap.readthedocs.io/en/stable/searches.html">https://django-auth-ldap.readthedocs.io/en/stable/searches.html</a></li>
</ul>

</details>
---
<details>
  <summary><strong>📘 Opciones Generales del Autenticador LDAP</strong></summary>

Esta configuración controla cómo se comporta el autenticador LDAP dentro de Ansible Automation Platform (AAP), incluyendo si está activo, si puede crear objetos automáticamente y cómo manejar la pertenencia de usuarios a grupos o organizaciones.<br><br>

<strong>Enabled</strong> <br><br>
Activa o desactiva el autenticador. Si está activado, los usuarios del directorio LDAP o Active Directory podrán autenticarse.  <br><br>
- Activada: el autenticador LDAP valida usuarios.  <br><br>
- Desactivada: AAP ignora este método, aunque la configuración se mantenga.  
<br><br>
Mantener desactivada durante pruebas y activarla solo cuando la conexión y autenticación estén verificadas.
<br><br>

<strong>Create Objects </strong><br><br>
Permite que AAP cree automáticamente usuarios, equipos u organizaciones basándose en la información obtenida de LDAP.  <br><br>
- Si un usuario se autentica por primera vez y no existe en AAP, se creará automáticamente.  <br><br>
- Lo mismo aplica para organizaciones o equipos que falten según la configuración.  
<br><br>
Habilitar solo si se confía en la integridad del directorio. En entornos grandes puede generar muchos objetos rápidamente.
<br><br>

<strong>Remove Users</strong> <br><br>
Controla si al autenticarse un usuario LDAP se eliminan sus pertenencias previas a grupos o equipos asignados desde otras fuentes.  <br><br>
- Activada: el usuario queda solo en los grupos definidos en LDAP.  <br><br>
- Desactivada: conserva las asociaciones anteriores.  
<br><br>
Mantener activada si LDAP es la fuente principal de autoridad. Si se usan múltiples autenticadores, puede dejarse desactivada para no perder asociaciones externas.

</details>

---

Finalmente, hacemos clic en Create Authentication Method para guardar la configuración y crear el método de autenticación. Con esta acción, se aplicarán todos los parámetros que hemos definido previamente, completando así el proceso de integración.


![Texto alternativo](/assets/images/20251107/20251107-05.png)
![Texto alternativo](/assets/images/20251107/20251107-06.png)



Después de toda esta parte teórica, a continuación se muestra una tabla con los valores utilizados para la integración de mi Active Directory con Ansible Automation Platform en un entorno de laboratorio.

### Active Directory Authenticator – Configuración

Esta es la configuración que hemos utilizado para esta guia.


| Name                      | Active Directory Autenticator                                     |
| :------------------------ | :---------------------------------------------------------------- |
| Type                      | LDAP                                                              |
| Authentication Enabled    | Yes                                                               |
| LDAP Bind DN              | CN=Administrator,CN=Users,DC=padthai,DC=org                       |
| LDAP Bind Password        | $encrypted$                                                       |
| LDAP Group Type           | ActiveDirectoryGroupType                                          |
| LDAP Start TLS            | Off                                                               |
| LDAP Group Type Parameters | name\_attr: cn                                                    |
| LDAP Server URI           | - ldap://padthai.org:389                                          |
| LDAP User Attribute Map   | email: mail<br>username: sAMAccountName<br>last\_name: sn<br>first\_name: givenName |
| LDAP User Search          | - CN=Users,DC=padthai,DC=org<br>- SCOPE\_SUBTREE<br>- (sAMAccountName=%(user)s) |

Una vez completada la creación, debemos asegurarnos de que el método de autenticación esté habilitado. Además, es posible ordenar los métodos según su prioridad para definir cuál se aplicará primero.

![Texto alternativo](/assets/images/20251107/20251107-07.png)


En mi Active Directory tengo un contenedor denominado Users, dentro del cual se encuentra el usuario xavi. Para verificar que Ansible Automation Platform se ha integrado correctamente con el Active Directory, realizaremos una prueba iniciando sesión con este usuario. En la siguiente imagen se muestra la estructura del árbol de mi Active Directory (correspondiente a Windows Server 2019 AD), en el aparece mi usuario.

![Texto alternativo](/assets/images/20251107/20251107-08.png)

Regresamos a la pantalla de inicio de sesión de Ansible Automation Platform i introducimos nuestras credenciales para verificar que el acceso funciona.

![Texto alternativo](/assets/images/20251107/20251107-09.png)

Si todo funciona correctamente, deberíamos poder iniciar sesión. Es probable que el usuario no disponga de permisos de administrador, por lo que es importante gestionar adecuadamente los niveles de acceso y asignar los privilegios necesarios según el rol de cada usuario.

![Texto alternativo](/assets/images/20251107/20251107-10.png)

Con esto finaliza esta guía sobre la integración de Active Directory con Ansible Automation Platform (AAP) a través de LDAP. Cabe destacar que esta configuración está pensada para un entorno de pruebas o desarrollo, ya que se ha utilizado LDAP en lugar de LDAPS, que sería el método recomendado para entornos de producción por motivos de seguridad.