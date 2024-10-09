const { app, BrowserWindow, ipcMain } = require('electron');
const Datastore = require('nedb');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

const createDirectoryIfNotExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Carpeta creada: ${dirPath}`);
  } else {
    console.log(`La carpeta ya existe: ${dirPath}`);
  }
};

const publicPath = path.join(__dirname, 'public');
const assetsPath = path.join(publicPath, 'assets');
const dbPath = path.join(publicPath, 'data');

createDirectoryIfNotExists(assetsPath);
createDirectoryIfNotExists(dbPath);

const db = new Datastore({ filename: path.join(dbPath, 'ads.db'), autoload: true });

async function downloadFile(item) {
  const { type, url, position } = item;
  console.log(`Intentando descargar: ${url}`);

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

  const fileName = `file_${position}.${fileExtension}`;
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

async function fetchAds() {
  try {
    const response = await axios.get('https://w9awwdcbhe.api.quickmocker.com/media');
    //const response = await axios.get('https://run.mocky.io/v3/62a4803f-a786-4e36-9e47-93db107f1c2c');

    const newAds = response.data;

    console.log(`Anuncios obtenidos: ${JSON.stringify(newAds)}`); 

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

          if(ad.type === 'url'){
            ad.local_url = ad.url ;
            console.log('actualizando solo la URL del anuncio ${ad._id}.');
          }else{
            const localFileName = await downloadFile(ad);
            const filePath = path.join(__dirname, 'dist', 'assets', localFileName);

            if (!fs.existsSync(filePath)) {           
              ad.local_url = `assets/${localFileName}`;
            } else {           
              ad.local_url = `assets/${localFileName}`;
            }
          }

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

ipcMain.on('get-ads', (event) => {
  db.find({}, (err, docs) => {
    if (err) {
      console.error('Error al recuperar anuncios:', err);
      event.reply('send-ads', []);
    } else {
      console.log('Anuncios enviados:', docs);
      event.reply('send-ads', docs);
    }
  });
});

function createWindow() {

  const windowWidth = 800;  
  const windowHeight = 600; 
  const windowX = 100;      
  const windowY = 100;      

  win = new BrowserWindow({
    
    width: windowWidth,
    height: windowHeight,
    x: windowX,  
    y: windowY,  
    frame: false, 
    fullscreenable : true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile(path.join('dist/browser/index.html'));

  ipcMain.on('toggle-fullscreen', () => {
    if (win.isFullScreen()) {
      win.setFullScreen(false);
    } else {
      win.setFullScreen(true);
    }
  });

  ipcMain.on('close-app', () => {
    win.close();
  });

}

app.whenReady().then(() => {
  createWindow();
  fetchAds();
  setInterval(fetchAds, 10000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
