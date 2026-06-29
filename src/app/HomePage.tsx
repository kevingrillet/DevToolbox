/**
 * Page d'accueil — générée depuis le registre d'outils (`TOOLS`).
 *
 * Les outils sont triés alphabétiquement par **titre localisé** (le tri se refait
 * au changement de langue) et filtrables via une recherche (titre, description ou
 * tags). Chaque outil devient une carte cliquable ; ajouter une entrée au registre
 * suffit à la faire apparaître.
 */
import { useMemo, useState } from 'react';
import { Link } from './router';
import { TOOLS } from '../registry';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useI18n } from '../i18n/I18nProvider';

export function HomePage() {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState('');

  const sorted = useMemo(
    () => [...TOOLS].sort((a, b) => t(a.titleKey).localeCompare(t(b.titleKey), lang)),
    [t, lang],
  );

  const needle = query.trim().toLowerCase();
  const filtered =
    needle === ''
      ? sorted
      : sorted.filter(
          (tool) =>
            t(tool.titleKey).toLowerCase().includes(needle) ||
            t(tool.descriptionKey).toLowerCase().includes(needle) ||
            tool.tags.some((tag) => tag.includes(needle)),
        );

  return (
    <section aria-labelledby="home-title">
      <h1 id="home-title" className="text-2xl font-bold">
        {t('home.title')}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-fg-muted">{t('home.intro')}</p>

      <div className="mt-6 max-w-md">
        <Input
          type="search"
          label={t('home.search')}
          placeholder={t('home.searchPlaceholder')}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 rounded-card border border-dashed bg-surface p-8 text-center text-fg-muted">
          {TOOLS.length === 0 ? t('home.empty') : t('home.noResults')}
        </p>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tool) => (
            <li key={tool.id}>
              <Link
                to={tool.path}
                className="flex h-full flex-col gap-2 rounded-card border bg-surface p-5 shadow-card transition hover:bg-subtle"
              >
                <span aria-hidden="true" className="text-3xl">
                  {tool.icon}
                </span>
                <span className="font-semibold text-fg">{t(tool.titleKey)}</span>
                <span className="text-sm text-fg-muted">{t(tool.descriptionKey)}</span>
                <span className="mt-1 flex flex-wrap gap-1">
                  {tool.tags.slice(0, 4).map((tag) => (
                    <Badge key={tag} variant="neutral">
                      {tag}
                    </Badge>
                  ))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
