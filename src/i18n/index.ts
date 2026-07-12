import en from './locale/en';
import ru from './locale/ru';
import type { TranslationKey } from './locale/en';

const locales: Record<string, Partial<Record<TranslationKey, string>>> = { en, ru };

function getLang(): string {
  try {
    const lang = window.localStorage.getItem('language');
    if (lang) {
      const code = lang.slice(0, 2);
      if (locales[code]) return code;
    }
  } catch {}
  return 'en';
}

const currentLang = getLang();
const locale = locales[currentLang] ?? en;

export function t(key: TranslationKey): string {
  return locale[key] ?? en[key] ?? key;
}

export function tpl(key: TranslationKey, vars: Record<string, string | number>): string {
  let s = t(key);
  for (const [k, v] of Object.entries(vars)) {
    s = s.replace(`{${k}}`, String(v));
  }
  return s;
}
