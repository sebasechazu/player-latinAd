
# Reproductor de Anuncios - Angular y Electron

Esta es una aplicación desarrollada en Angular y Electron que permite reproducir anuncios en formato de video, imágenes y URLs. Los anuncios se obtienen a través de una API externa, se almacenan localmente y se reproducen secuencialmente en una ventana sin bordes que puede alternar entre modo ventana y pantalla completa.

## Funcionalidades principales

- Reproduce anuncios de video, imágenes y URLs en una ventana sin bordes.
- Permite alternar entre modo ventana y pantalla completa.
- Descarga y almacena los anuncios localmente para su reproducción.
- Los anuncios se obtienen desde una API externa y se actualizan periódicamente.
- Utiliza `NeDB` como base de datos para almacenar y gestionar los anuncios descargados.

## Tecnologías utilizadas

- **Electron**: Para crear la aplicación de escritorio.
- **Angular**: Para el frontend de la aplicación.
- **NeDB**: Base de datos en formato local para almacenar la información de los anuncios.
- **Axios**: Para realizar las peticiones a la API externa y descargar los archivos de anuncios.
- **FS**: Sistema de archivos de Node.js para gestionar las descargas y el almacenamiento local.

## Instalación y Configuración

### Requisitos previos

- Node.js (v14+)
- Angular CLI
- Electron

### Instalación

1. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```

2. Inicia la aplicación Electron:
   ```bash
   npm run electron
   ```

## Estructura del Proyecto

- `app.js`: Archivo principal de la aplicación Electron. Se encarga de crear la ventana, gestionar la base de datos y descargar los anuncios.
- `player.component.ts`: Componente de Angular que maneja la lógica de reproducción de los anuncios.
- `ads.db`: Base de datos local gestionada por NeDB donde se almacenan los anuncios descargados.
- `assets/`: Carpeta donde se almacenan los archivos de los anuncios descargados.

## Uso de la Aplicación

1. **Inicio de la aplicación**: Al iniciar la aplicación, se abrirá una ventana que comenzará a reproducir los anuncios almacenados.
   
2. **Reproducción de anuncios**: Los anuncios se reproducen de manera secuencial. La aplicación admite tres tipos de anuncios:
   - **Imágenes**: Archivos con extensiones `.jpg`, `.jpeg`, `.png`, o `.gif`.
   - **Videos**: Archivos en formato `.mp4`.
   - **URLs**: Sitios web o recursos en línea que se muestran dentro de un `iframe`.

3. **Controles de reproducción**:
   - **Pantalla completa**: Puedes alternar entre modo ventana y pantalla completa utilizando el botón 🔲.
   - **Siguiente anuncio**: Avanza manualmente al siguiente anuncio con el botón ➡️.
   - **Cerrar aplicación**: Cierra la aplicación usando el botón ❌.

## Mantenimiento y Actualización de Anuncios

La aplicación descarga los anuncios desde una API externa cada 10 segundos. Si un anuncio ya existe pero ha sido actualizado en el servidor, la aplicación descargará nuevamente dicho anuncio y lo reemplazará en la base de datos local.

Los archivos descargados se almacenan en la carpeta `assets/` dentro de la carpeta `public/`.

## Detalles Técnicos

- **Persistencia**: Utiliza NeDB para almacenar los anuncios localmente.
- **Descarga de Anuncios**: Los archivos de video e imagen se descargan mediante `axios` y se almacenan en el sistema de archivos local.
- **Manejo de Errores**: Si un anuncio no puede ser cargado (ya sea por error de red o formato inválido), se avanza automáticamente al siguiente anuncio.

## Personalización

Para cambiar la fuente de los anuncios, edita la URL en el archivo `app.js` donde se define el endpoint de la API de anuncios:
```javascript
const response = await axios.get('https://w9awwdcbhe.api.quickmocker.com/media');
```

## Licencia

Este proyecto está licenciado bajo la licencia MIT. Consulta el archivo `LICENSE` para más detalles.
```
- Email: sebastianechazu@gmail.com
  - LinkedIn: [Sebastian Echazu](https://www.linkedin.com/in/sebastian-echazu)
  - Phone: +54 2615564713
