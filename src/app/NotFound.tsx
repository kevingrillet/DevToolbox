/**
 * Page 404 — affichée pour tout chemin qui ne correspond ni à l'accueil ni à un
 * outil du registre. Propose un retour vers l'accueil.
 */
import { Link } from './router';
import { useI18n } from '../i18n/I18nProvider';

export function NotFound() {
  const { t } = useI18n();
  return (
    <section aria-labelledby="notfound-title" className="py-12 text-center">
      <p className="text-5xl font-bold text-fg-muted" aria-hidden="true">
        404
      </p>
      <h1 id="notfound-title" className="mt-4 text-2xl font-bold">
        {t('notFound.title')}
      </h1>
      <p className="mt-2 text-fg-muted">{t('notFound.body')}</p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center rounded-control bg-accent px-4 py-2 font-medium text-accent-fg shadow-btn transition hover:bg-accent-hover"
      >
        {t('nav.backToHome')}
      </Link>
    </section>
  );
}
