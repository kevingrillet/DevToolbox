/**
 * Composant racine de DevTools Hub.
 *
 * `App` fournit le contexte i18n (`I18nProvider`), puis la coquille `Layout`
 * (en-tête + contrôles thème/langue + pied de page) encadre la sortie du routeur
 * (`RouterOutlet`), qui résout le chemin courant (`#/...`) vers la page d'accueil,
 * un outil chargé en `lazy()`, ou la page 404.
 */
import { I18nProvider } from './i18n/I18nProvider';
import { Layout } from './app/Layout';
import { RouterOutlet } from './app/routes';

export default function App() {
  return (
    <I18nProvider>
      <Layout>
        <RouterOutlet />
      </Layout>
    </I18nProvider>
  );
}
