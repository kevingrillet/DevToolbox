/**
 * Affichage structuré d'un JWT décodé : badge d'expiration, en-tête et payload
 * en JSON indenté, claims temporels (`iat`/`exp`/`nbf`) traduits en dates lisibles
 * selon la langue, et signature brute (rappelée comme non vérifiée).
 *
 * Composant de présentation pur : toute la logique de décodage vit dans `lib/jwt`.
 */
import { Fragment } from 'react';
import { useI18n } from '../../../i18n/I18nProvider';
import { Badge } from '../../../components/ui/Badge';
import { Callout } from '../../../components/ui/Callout';
import { Panel } from '../../../components/ui/Panel';
import { JWT_TIME_CLAIMS, type JwtResult } from '../lib/jwt';

export function JwtView({ result }: { result: JwtResult }) {
  const { t, lang } = useI18n();

  if (!result.ok) {
    return (
      <Callout tone="danger" block>
        {t(`tools.encoder.jwt.errors.${result.errorCode}`)}
      </Callout>
    );
  }

  const { decoded, expired } = result;

  const expiryBadge =
    expired === null ? (
      <Badge variant="neutral">{t('tools.encoder.jwt.noExpiry')}</Badge>
    ) : expired ? (
      <Badge variant="danger">{t('tools.encoder.jwt.expired')}</Badge>
    ) : (
      <Badge variant="success">{t('tools.encoder.jwt.valid')}</Badge>
    );

  const timeRows = JWT_TIME_CLAIMS.filter(
    (claim) => typeof decoded.payload[claim] === 'number',
  ).map((claim) => ({
    claim,
    date: new Date((decoded.payload[claim] as number) * 1000).toLocaleString(lang),
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {expiryBadge}
        <span className="text-xs text-fg-muted">{t('tools.encoder.jwt.decodeOnly')}</span>
      </div>

      <Panel title={t('tools.encoder.jwt.header')} titleLevel={3}>
        <pre className="overflow-x-auto text-xs">{JSON.stringify(decoded.header, null, 2)}</pre>
      </Panel>

      <Panel title={t('tools.encoder.jwt.payload')} titleLevel={3}>
        <pre className="overflow-x-auto text-xs">{JSON.stringify(decoded.payload, null, 2)}</pre>
      </Panel>

      {timeRows.length > 0 && (
        <Panel title={t('tools.encoder.jwt.claims')} titleLevel={3}>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            {timeRows.map(({ claim, date }) => (
              <Fragment key={claim}>
                <dt className="text-fg-muted">{t(`tools.encoder.jwt.timeClaims.${claim}`)}</dt>
                <dd className="font-mono">{date}</dd>
              </Fragment>
            ))}
          </dl>
        </Panel>
      )}

      <Panel
        title={t('tools.encoder.jwt.signature')}
        titleLevel={3}
        description={t('tools.encoder.jwt.signatureNote')}
      >
        <code className="block break-all text-xs text-fg-muted">{decoded.signature || '—'}</code>
      </Panel>
    </div>
  );
}
