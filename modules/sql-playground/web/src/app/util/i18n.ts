import { APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { I18NEXT_SERVICE, ITranslationService } from 'angular-i18next';

export function appInit(i18next: ITranslationService) {
  return () =>
    i18next.init({
      supportedLngs: ['en', 'de'],
      fallbackLng: 'en',
      debug: false,
      returnEmptyString: false,
      resources: {
        en: { translation: {} },
        de: { translation: {} },
      },
    });
}

export function localeIdFactory(i18next: ITranslationService) {
  return i18next.language;
}

export const I18N_PROVIDERS = [
  {
    provide: APP_INITIALIZER,
    useFactory: appInit,
    deps: [I18NEXT_SERVICE],
    multi: true,
  },
  {
    provide: LOCALE_ID,
    deps: [I18NEXT_SERVICE],
    useFactory: localeIdFactory,
  },
];
