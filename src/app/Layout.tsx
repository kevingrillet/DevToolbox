/**
 * Coquille applicative : en-tête (marque + contrôles thème/langue), zone de
 * contenu principale et pied de page. Le contenu de la route courante est passé
 * en `children` (voir `App`).
 *
 * Accessibilité :
 *  - lien d'évitement vers `#main` qui déplace le focus par programmation (sans
 *    modifier le hash, ce qui changerait de route avec notre routeur) ;
 *  - `<main id="main" tabIndex={-1}>` pour être ciblable par le lien d'évitement ;
 *  - la marque est un lien vers l'accueil (le `<h1>` appartient à chaque page).
 */
import type { MouseEvent, ReactNode } from 'react';
import { Link } from './router';
import { ThemeSelector } from '../components/ThemeSelector';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useTheme } from '../hooks/useTheme';
import { useI18n } from '../i18n/I18nProvider';

function focusMain(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  const main = document.getElementById('main');
  if (main) {
    main.focus();
    main.scrollIntoView();
  }
}

export function Layout({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { mode, toggleMode, themeName, setThemeName } = useTheme();

  return (
    <div className="flex min-h-full flex-col bg-canvas font-base text-fg">
      <a
        href="#main"
        onClick={focusMain}
        className="sr-only rounded-control bg-accent px-4 py-2 text-accent-fg focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
      >
        {t('a11y.skipToContent')}
      </a>

      <header className="border-b bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-control text-lg font-bold text-fg"
            aria-label={`${t('app.title')} — ${t('nav.home')}`}
          >
            <span aria-hidden="true">🧰</span>
            <span>{t('app.title')}</span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeSelector value={themeName} onChange={setThemeName} />
            <LanguageSwitcher />
            <ThemeToggle theme={mode} onToggle={toggleMode} />
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>

      <footer className="border-t bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-4 text-center text-xs text-fg-muted">
          {t('app.tagline')}
        </div>
      </footer>
    </div>
  );
}
