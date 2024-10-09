import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { Ad } from '../../models/ad.model';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
  hideCursor = false;
  cursorTimeout: any;

  constructor(private cdr: ChangeDetectorRef ,private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.loadAds();
  }

  async loadAds() {

    window.electron.send('get-ads');
    if (!this.adsReceived) {
      this.adsReceived = true;
      window.electron.receive('send-ads', async (ads: Ad[]) => {
        if (ads.length > 0) {
          this.ads = ads.sort((a,b)=> a.position - b.position);
          this.currentAd = this.ads[0];
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
    if (this.currentAd) {
      if (this.currentAd.type === 'image' || this.currentAd.type === 'url') {
        
        this.checkInternetConnection().then((isOnline) => {
          if (isOnline || this.currentAd?.type === 'image') {
            setTimeout(() => {
              this.nextAdHandler();
            }, this.adDisplayDuration);
          } else {
            this.nextAdHandler();
          }
        }).catch(() => {
          this.onError(new ErrorEvent('Error de conexión'));
        });
      } else if (this.currentAd.type === 'video') {
        
        const videoElement = document.querySelector('video');
        if (videoElement) {
          videoElement.onended = () => this.nextAdHandler();
        }
      }
    }
  }
  
  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  checkInternetConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      if (navigator.onLine) {
        resolve(true);  
      } else {
        resolve(false); 
      }
    });
  }
  
  nextAdHandler() { 
    const currentIndex = this.ads.indexOf(this.currentAd!);
    const nextIndex = currentIndex + 1 < this.ads.length ? currentIndex + 1 : 0;
    this.currentAd = this.ads[nextIndex];
    this.nextAd = this.ads[nextIndex + 1] || this.ads[0];
    this.cdr.detectChanges();
    this.playCurrentAd();
  }

  onError(event: Event) {
    console.error('Error al cargar el recurso:', event);
    this.nextAdHandler();
  }

  toggleFullscreen(){
    window.electron.send('toggle-fullscreen');
  }
  closeApp(){
    window.electron.send('close-app');
  }

  @HostListener('mousemove')
  onMouseMove() {
    this.hideCursor = false;
    this.resetCursorTimer();
  }

  resetCursorTimer() {
    if (this.cursorTimeout) {
      clearTimeout(this.cursorTimeout);
    }
    this.cursorTimeout = setTimeout(() => {
      this.hideCursor = true;
    }, 3000); 
  }

}
