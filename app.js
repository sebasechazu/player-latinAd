const { app, BrowserWindow, ipcMain } = require('electron');
const Datastore = require('nedb');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

// Crear carpetas si no existen
const createDirectoryIfNotExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Carpeta creada: ${dirPath}`);
  } else {
    console.log(`La carpeta ya existe: ${dirPath}`);
  }
};

// Rutas de las carpetas
const publicPath = path.join(__dirname, 'public');
const assetsPath = path.join(publicPath, 'assets');
const dbPath = path.join(publicPath, 'data');

// Crear las carpetas necesarias
createDirectoryIfNotExists(assetsPath);
createDirectoryIfNotExists(dbPath);

// Inicializar la base de datos NeDB
const db = new Datastore({ filename: path.join(dbPath, 'ads.db'), autoload: true });

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile(path.join('dist/browser/index.html')); // Cargar el archivo HTML de Angular
}

// Descargar archivo (imagen o video) y guardarlo en la carpeta assets
async function downloadFile(item) {
  const { type, url, position } = item;
  console.log(`Intentando descargar: ${url}`); // Log de URL

  let fileExtension = '';

  if (type === 'image') {
    fileExtension = url.split('.').pop().split(/\#|\?/)[0];
    if (!['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      fileExtension = 'jpg';
    }
  } else if (type === 'video') {
    fileExtension = 'mp4';
  } else {
    console.error(`Tipo de archivo desconocido: ${type}`);
    return;
  }

  const fileName = `file_${position}_${Date.now()}.${fileExtension}`;
  const filePath = path.join(assetsPath, fileName);

  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`Archivo descargado y guardado en: ${filePath}`);
        resolve(fileName);
      });
      writer.on('error', (error) => {
        console.error(`Error al guardar el archivo: ${error.message}`);
        reject(error);
      });
    });
  } catch (error) {
    console.error(`Error al descargar el archivo: ${error.message}`);
    throw error;
  }
}


// Función para detectar y actualizar anuncios
async function fetchAds() {
  try {
    //const response = await axios.get('https://w9awwdcbhe.api.quickmocker.com/media');
    const response = await axios.get('https://run.mocky.io/v3/527aaa00-31f8-427b-8032-cafe711c9e56');
    const newAds = response.data;

    console.log(`Anuncios obtenidos: ${JSON.stringify(newAds)}`); // Log de anuncios obtenidos

    for (const [index, ad] of newAds.entries()) {
      ad._id = ad._id || `ad_${index}`;

      try {
        const existingAd = await new Promise((resolve, reject) => {
          db.findOne({ _id: ad._id }, (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
        });

        if (!existingAd || ad.updated_at !== existingAd.updated_at) {
          console.log(`Actualizando anuncio ${ad._id}, cambios detectados.`);

          const localFileName = await downloadFile(ad);
          ad.local_url = path.join('assets', localFileName).replace(/\\/g, '/');

          await new Promise((resolve, reject) => {
            db.update({ _id: ad._id }, ad, { upsert: true }, (err) => {
              if (err) return reject(err);
              console.log(`Anuncio ${ad._id} actualizado en la base de datos.`);
              resolve();
            });
          });
        }
      } catch (err) {
        console.error('Error al procesar el anuncio:', err.message);
      }
    }

  } catch (error) {
    console.error('Error al obtener anuncios:', error.message);
  }
}



// Enviar anuncios a Angular
ipcMain.on('get-ads', (event) => {
  db.find({}, (err, docs) => {
    if (err) {
      console.error('Error al recuperar anuncios:', err);
      event.reply('send-ads', []); // Enviar una lista vacía en caso de error
    } else {
      console.log('Anuncios enviados:', docs); // Verifica que se envíen los anuncios
      event.reply('send-ads', docs);
    }
  });
});


app.whenReady().then(() => {
  createWindow();
  fetchAds(); // Descargar anuncios al iniciar la app

  // Configurar la actualización automática cada 10 segundos
  setInterval(fetchAds, 10000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
