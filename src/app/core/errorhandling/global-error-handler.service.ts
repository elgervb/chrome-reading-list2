import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { GoogleAnalyticsService } from '@core/google-analytics.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler extends ErrorHandler {

  constructor(
    private injector: Injector,
  ) {
    super();
  }

  handleError(error: Error | HttpErrorResponse) {
    const gaService = this.injector.get<GoogleAnalyticsService>(GoogleAnalyticsService);
    if (error instanceof HttpErrorResponse) {
      // Server error happened
      if (!navigator.onLine) {
        // No Internet connection
        return;
      }
      // Http Error
      // Send the error to the server
      try {
        gaService.sendEvent('error', error.message, JSON.stringify(error));
      } catch {
        console.dir(error);
      }
      return;
    } else {
      // Client Error Happend
      // Send the error to the server
      try {
        gaService.sendEvent('error', error.message, JSON.stringify(error.stack));
      } catch {
        console.dir(error);
      }
    }
  }

}
