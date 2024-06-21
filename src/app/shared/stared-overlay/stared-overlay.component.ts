import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input,
  numberAttribute,
  ViewChild
} from '@angular/core';

interface SVGImage {
  svgData: string;
  width: number;
  height: number;
  x: number;
  y: number;
  opacity: number;
}

@Component({
  selector: 'app-stared-overlay',
  standalone: true,
  imports: [],
  templateUrl: './stared-overlay.component.html',
  styleUrl: './stared-overlay.component.scss'
})
export class StaredOverlayComponent implements AfterViewInit {
  readonly #http = inject(HttpClient);

  @Input({ transform: numberAttribute }) starCount = 10;
  @Input({ transform: numberAttribute }) delay = 300;
  @ViewChild('canvas', { static: true })
  protected canvas!: ElementRef<HTMLCanvasElement>;
  private context!: CanvasRenderingContext2D;
  private svgImages: SVGImage[] = [];

  public ngAfterViewInit(): void {
    this.context = this.canvas.nativeElement.getContext('2d')!;
    this.resizeCanvas();
    this.loadSVG('assets/images/star.svg', this.starCount);
  }

  private resizeCanvas(): void {
    const canvas = this.canvas.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  private loadSVG(url: string, count: number): void {
    this.#http.get(url, { responseType: 'text' }).subscribe(svgData => {
      for (let i = 0; i < count; i++) {
        const delay = i * this.delay; // Delay each SVG rendering by 300 ms
        setTimeout(() => {
          const randomWidth = Math.random() * 20 + 20; // Random width between 20 and 40
          const randomHeight = Math.random() * 100 + 20; // Random height between 20 and 120

          const x =
            Math.random() * (this.canvas.nativeElement.width - randomWidth);
          const y =
            Math.random() * (this.canvas.nativeElement.height - randomHeight);

          const svgImage: SVGImage = {
            svgData: svgData,
            width: randomWidth,
            height: randomHeight,
            x: x,
            y: y,
            opacity: 0 // Initial opacity set to 0 for fade-in effect
          };

          this.svgImages.push(svgImage);
          this.fadeInSVG(svgImage);
        }, delay);
      }
    });
  }

  private fadeInSVG(svgImage: SVGImage): void {
    let start: number;
    const duration = 1000; // Animation duration in milliseconds (1 second)

    const animate = (timestamp: number) => {
      if (!start) {
        start = timestamp;
      }

      const elapsed = timestamp - start;
      const progress = elapsed / duration;

      svgImage.opacity = Math.min(progress, 1); // Opacity gradually increases from 0 to 1

      this.renderSVG(svgImage);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  private renderSVG(svgImage: SVGImage): void {
    const img = new Image();
    const svgBlob = new Blob([svgImage.svgData], { type: 'image/svg+xml' });
    const objectURL = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = svgImage.width;
      offscreenCanvas.height = svgImage.height;
      const offscreenContext = offscreenCanvas.getContext('2d');

      if (offscreenContext) {
        offscreenContext.globalAlpha = svgImage.opacity; // Set opacity for fade-in effect
        offscreenContext.drawImage(img, 0, 0, svgImage.width, svgImage.height);
        this.context.drawImage(
          offscreenCanvas,
          svgImage.x,
          svgImage.y,
          svgImage.width,
          svgImage.height
        );
      }

      URL.revokeObjectURL(objectURL);
    };

    img.src = objectURL;
  }
}
