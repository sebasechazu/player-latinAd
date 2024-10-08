import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Ad } from '../../models/ad.model';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  imports: [NgOptimizedImage,CommonModule],
  standalone: true,
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {

  ads: Ad[] = [];
  currentAd: Ad | null = null;
  nextAd: Ad | null = null;
  adsReceived = false;
  isLoading = true;
  adDisplayDuration = 5000;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadAds();
  }

  async loadAds() {
    // Enviar mensaje a Electron para obtener anuncios
    window.electron.send('get-ads');

    // Recibir anuncios una única vez
    if (!this.adsReceived) {
      this.adsReceived = true;
      window.electron.receive('send-ads', async (ads: Ad[]) => {
        console.log('Anuncios recibidos:', ads);
        if (ads.length > 0) {
          this.ads = ads.sort((a,b)=> a.position - b.position);
          // Asignar el primer anuncio como el actual
          this.currentAd = this.ads[0];
          // Asignar el siguiente anuncio (si existe)
          this.nextAd = this.ads.length > 1 ? this.ads[1] : null;

          this.isLoading = false;
          this.cdr.detectChanges();

          this.playCurrentAd();
          
        } else {
          console.log('No se recibieron anuncios.');
        }
      });
    }
  }

  playCurrentAd() {
    if(this.currentAd) {
      if(this.currentAd.type === 'image')
      {
        setTimeout(() => {
          this.nextAdHandler();
        }, this.adDisplayDuration)
      }
    }
  }

  nextAdHandler() {
    console.log('Siguiente anuncio activado');
    
    const currentIndex = this.ads.indexOf(this.currentAd!);

    // Si estamos al final de la lista, volver al primero
    const nextIndex = currentIndex + 1 < this.ads.length ? currentIndex + 1 : 0;

    // Cambiar el anuncio actual al siguiente
    this.currentAd = this.ads[nextIndex];

    // Establecer el siguiente anuncio
    this.nextAd = this.ads[nextIndex + 1] || this.ads[0];

    console.log('Nuevo anuncio actual:', this.currentAd?.local_url);
    console.log('Nuevo siguiente anuncio:', this.nextAd?.local_url);

    // Reproducir el siguiente anuncio (loop)
    this.cdr.detectChanges();
    this.playCurrentAd();
  }

  onError(event: Event) {
    console.error('Error al cargar el recurso:', event);
    this.nextAdHandler();
  }
}
