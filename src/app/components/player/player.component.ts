import { Component, OnInit } from '@angular/core';
import { Ad } from '../../models/ad.model';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  imports: [NgOptimizedImage] ,
  standalone: true,
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {
  ads: Ad[] = [];
  currentAd: Ad | null = null;
  nextAd: Ad | null = null;

  ngOnInit() {
    this.loadAds();
  }

  loadAds() {
    console.log('Solicitando anuncios...');
    window.electron.send('get-ads');
  
    window.electron.receive('send-ads', (ads: Ad[]) => {
      console.log('Anuncios recibidos:', ads); // Debe imprimir la lista de anuncios
      if (ads.length > 0) {
        this.ads = ads;
        this.currentAd = ads[0];
        this.nextAd = ads[1];
      } else {
        console.warn('No se recibieron anuncios.');
      }
    });
  }
  
  
  nextAdHandler() {
    // Lógica para avanzar al siguiente anuncio
    console.log('Next ad clicked');
    // Cambiar `currentAd` a `nextAd` si existe
    if (this.nextAd) {
      this.currentAd = this.nextAd;
      // Actualizar `nextAd` si hay más anuncios
      const nextIndex = this.ads.indexOf(this.currentAd) + 1;
      this.nextAd = nextIndex < this.ads.length ? this.ads[nextIndex] : null;
    }
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  onError(event: Event) {
    console.error('Error al cargar la imagen:', event);
  }
}

