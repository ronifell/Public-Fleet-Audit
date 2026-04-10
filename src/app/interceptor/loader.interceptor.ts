import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, finalize, delay } from 'rxjs';
import { LoaderService } from '../service/loader.service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {

  constructor(private loaderService: LoaderService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Recursos estáticos (ex.: mock JSON em /assets/) têm loader próprio nas telas — evita sobrepor ao app-loader
    const skipLoader =
      request.url.includes('/assets/') || request.url.startsWith('assets/');
    if (!skipLoader) {
      this.loaderService.isLoading.next(true);
    }
    let stream = next.handle(request);
    if (!skipLoader) {
      stream = stream.pipe(delay(2000));
    }
    return stream.pipe(
      finalize(() => {
        if (!skipLoader) {
          this.loaderService.isLoading.next(false);
        }
      })
    );
  }
}
