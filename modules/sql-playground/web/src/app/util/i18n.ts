import { APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { I18NEXT_SERVICE, ITranslationService } from 'angular-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { germanTranslation } from '../../i18n/de';
import { englishTranslation } from '../../i18n/en';

export function appInit(i18next: ITranslationService) {
  return () =>
    i18next
      .use(LanguageDetector)
      .init({
        supportedLngs: ['en', 'de'],
        fallbackLng: 'de',
        debug: false,
        returnEmptyString: false,
        resources: {
          en: { translation: englishTranslation },
          de: { translation: germanTranslation },
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
