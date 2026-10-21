import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { extractYouTubeVideoId } from '../models/movie.models';

@Component({
  selector: 'app-trailer-modal',
  standalone: true,
  imports: [ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal
      [isOpen]="isOpen()"
      [title]="movieTitle() ? (movieTitle() + ' — Official Trailer') : 'Official Trailer'"
      (closed)="closed.emit()"
    >
      <div class="trailer-player-wrap">
        @if (safeEmbedUrl(); as embedUrl) {
          <iframe
            class="trailer-iframe"
            [src]="embedUrl"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        } @else {
          <div class="no-trailer-state">
            <p>Official trailer is not available for this film.</p>
          </div>
        }
      </div>
    </app-modal>
  `,
  styles: [`
    .trailer-player-wrap {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      background: #000;
      border-radius: var(--radius-md);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .trailer-iframe {
      width: 100%;
      height: 100%;
      border: 0;
    }

    .no-trailer-state {
      color: var(--text-muted);
      font-size: 0.95rem;
      padding: 32px;
      text-align: center;
    }
  `],
})
export class TrailerModalComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly isOpen = input<boolean>(false);
  readonly movieTitle = input<string>('');
  readonly trailerUrl = input<string | null | undefined>(null);

  readonly closed = output<void>();

  protected readonly safeEmbedUrl = computed<SafeResourceUrl | null>(() => {
    const rawUrl = this.trailerUrl();
    if (!rawUrl) return null;
    const videoId = extractYouTubeVideoId(rawUrl);
    if (!videoId) return null;

    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  });
}
