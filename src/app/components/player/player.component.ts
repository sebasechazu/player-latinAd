import { Component, OnInit } from '@angular/core';
import { Ad } from '../../models/ad.model';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  imports: [NgOptimizedImage],
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

  async loadAds() {
    console.log('Solicitando anuncios...');
    window.electron.send('get-ads');
  
    window.electron.receive('send-ads', async (ads: Ad[]) => {
      console.log('Anuncios recibidos:', ads);
      if (ads.length > 0) {
        this.ads = ads;

        await this.delay(500); 
  
        this.currentAd = ads[0];
        console.log('Primer anuncio:', this.currentAd);
        this.nextAd = ads.length > 1 ? ads[1] : null;
      } else {
        console.warn('No se recibieron anuncios.');
      }
    });
  }
  
  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  nextAdHandler() {
    console.log('Next ad clicked');
    console.log('Current Ad Before Change:', this.currentAd);
    if (this.nextAd) {
      this.currentAd = this.nextAd;

      const nextIndex = this.ads.indexOf(this.currentAd) + 1;
      console.log('Next Ad Index:', nextIndex);
      this.nextAd = nextIndex < this.ads.length ? this.ads[nextIndex] : null;
      console.log('New Current Ad:', this.currentAd);
      console.log('New Next Ad:', this.nextAd);
    }
  }

  onError(event: Event) {
    console.error('Error al cargar la imagen:', event);
  }
}

