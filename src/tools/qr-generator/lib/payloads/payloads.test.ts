import { describe, it, expect } from 'vitest';
import { buildText } from './text';
import { buildUrl } from './url';
import { buildWifi, escapeWifi } from './wifi';
import { buildEmail } from './email';
import { buildSms } from './sms';
import { buildTel } from './tel';
import { buildVCard, escapeVCard } from './vcard';
import { buildGeo } from './geo';
import { PAYLOAD_TYPES, getPayloadType, isReady, getErrors } from './index';

describe('buildText', () => {
  it('retourne le texte tel quel', () => {
    expect(buildText('Bonjour')).toBe('Bonjour');
  });
  it('préserve une chaîne vide', () => {
    expect(buildText('')).toBe('');
  });
});

describe('buildUrl', () => {
  it('préfixe https:// quand le schéma est absent', () => {
    expect(buildUrl('exemple.com')).toBe('https://exemple.com');
  });
  it('conserve un schéma http existant', () => {
    expect(buildUrl('http://exemple.com')).toBe('http://exemple.com');
  });
  it('conserve un schéma https existant', () => {
    expect(buildUrl('https://exemple.com')).toBe('https://exemple.com');
  });
  it('conserve un autre schéma (ftp)', () => {
    expect(buildUrl('ftp://files.exemple.com')).toBe('ftp://files.exemple.com');
  });
  it('ignore les espaces autour', () => {
    expect(buildUrl('  exemple.com  ')).toBe('https://exemple.com');
  });
  it('reste vide pour une saisie vide', () => {
    expect(buildUrl('   ')).toBe('');
  });
});

describe('escapeWifi / buildWifi', () => {
  it('échappe les caractères réservés', () => {
    expect(escapeWifi('a;b,c:d"e\\f')).toBe('a\\;b\\,c\\:d\\"e\\\\f');
  });
  it('génère un payload WPA complet', () => {
    expect(
      buildWifi({ ssid: 'MonReseau', password: 'secret', encryption: 'WPA', hidden: false }),
    ).toBe('WIFI:T:WPA;S:MonReseau;P:secret;;');
  });
  it('ajoute H:true pour un réseau masqué', () => {
    expect(buildWifi({ ssid: 'Reseau', password: 'pw', encryption: 'WPA', hidden: true })).toBe(
      'WIFI:T:WPA;S:Reseau;P:pw;H:true;;',
    );
  });
  it('omet le mot de passe pour un réseau ouvert', () => {
    expect(
      buildWifi({ ssid: 'Public', password: 'ignore', encryption: 'nopass', hidden: false }),
    ).toBe('WIFI:T:nopass;S:Public;;');
  });
  it('échappe le SSID et le mot de passe', () => {
    expect(
      buildWifi({ ssid: 'Wifi;Maison', password: 'a,b', encryption: 'WPA', hidden: false }),
    ).toBe('WIFI:T:WPA;S:Wifi\\;Maison;P:a\\,b;;');
  });
});

describe('buildEmail', () => {
  it('génère un mailto simple', () => {
    expect(buildEmail({ to: 'a@b.com', subject: '', body: '' })).toBe('mailto:a@b.com');
  });
  it('ajoute sujet et corps encodés', () => {
    expect(buildEmail({ to: 'a@b.com', subject: 'Coucou ©', body: 'Ligne 1' })).toBe(
      'mailto:a@b.com?subject=Coucou%20%C2%A9&body=Ligne%201',
    );
  });
  it('encode les espaces en %20 (et non +)', () => {
    expect(buildEmail({ to: 'a@b.com', subject: 'deux mots', body: '' })).toBe(
      'mailto:a@b.com?subject=deux%20mots',
    );
  });
});

describe('buildSms', () => {
  it('génère un SMSTO sans message', () => {
    expect(buildSms({ number: '+33612345678', message: '' })).toBe('SMSTO:+33612345678');
  });
  it('ajoute le message', () => {
    expect(buildSms({ number: '0612', message: 'Salut' })).toBe('SMSTO:0612:Salut');
  });
});

describe('buildTel', () => {
  it('génère un tel:', () => {
    expect(buildTel(' +33612345678 ')).toBe('tel:+33612345678');
  });
});

describe('escapeVCard / buildVCard', () => {
  it('échappe les caractères réservés', () => {
    expect(escapeVCard('a,b;c\\d')).toBe('a\\,b\\;c\\\\d');
  });
  it('génère une vCard minimale', () => {
    const vcard = buildVCard({
      firstName: 'Jean',
      lastName: 'Dupont',
      organization: '',
      title: '',
      phone: '',
      email: '',
      url: '',
    });
    expect(vcard).toBe(
      ['BEGIN:VCARD', 'VERSION:3.0', 'N:Dupont;Jean;;;', 'FN:Jean Dupont', 'END:VCARD'].join(
        '\r\n',
      ),
    );
  });
  it('inclut les champs optionnels renseignés', () => {
    const vcard = buildVCard({
      firstName: 'Marie',
      lastName: 'Martin',
      organization: 'ACME',
      title: 'CTO',
      phone: '0612',
      email: 'm@acme.fr',
      url: 'https://acme.fr',
    });
    expect(vcard).toContain('ORG:ACME');
    expect(vcard).toContain('TITLE:CTO');
    expect(vcard).toContain('TEL;TYPE=CELL:0612');
    expect(vcard).toContain('EMAIL:m@acme.fr');
    expect(vcard).toContain('URL:https://acme.fr');
  });
});

describe('buildGeo', () => {
  it('génère un geo:', () => {
    expect(buildGeo({ latitude: '48.8584', longitude: '2.2945' })).toBe('geo:48.8584,2.2945');
  });
});

describe('registre', () => {
  it('expose tous les types attendus', () => {
    const ids = PAYLOAD_TYPES.map((t) => t.id);
    expect(ids).toEqual(['text', 'url', 'wifi', 'email', 'sms', 'tel', 'vcard', 'geo']);
  });

  it('lève une erreur pour un type inconnu', () => {
    expect(() => getPayloadType('inconnu')).toThrowError(/inconnu/);
  });

  it('chaque type a au moins un champ requis et construit depuis ses valeurs par défaut', () => {
    for (const type of PAYLOAD_TYPES) {
      expect(type.fields.some((f) => f.required)).toBe(true);
      // build() ne doit jamais lever, même avec les valeurs par défaut (vides).
      expect(() => type.build(type.defaults)).not.toThrow();
    }
  });

  describe('isReady', () => {
    it('est faux quand un champ requis est vide', () => {
      const url = getPayloadType('url');
      expect(isReady(url, { url: '' })).toBe(false);
      expect(isReady(url, { url: '   ' })).toBe(false);
    });
    it('est vrai quand tous les champs requis sont renseignés', () => {
      const wifi = getPayloadType('wifi');
      expect(isReady(wifi, { ...wifi.defaults, ssid: 'X' })).toBe(true);
    });
  });

  describe('getErrors', () => {
    it('ne renvoie aucune erreur pour un champ vide (rôle de isReady)', () => {
      expect(getErrors(getPayloadType('url'), { url: '' })).toEqual({});
      expect(getErrors(getPayloadType('email'), { to: '' })).toEqual({});
      expect(getErrors(getPayloadType('geo'), { latitude: '', longitude: '' })).toEqual({});
    });

    it('ne renvoie aucune erreur pour les types sans validation', () => {
      expect(getErrors(getPayloadType('text'), { text: 'coucou' })).toEqual({});
    });

    describe('url', () => {
      const url = getPayloadType('url');
      it('accepte une adresse sans schéma', () => {
        expect(getErrors(url, { url: 'exemple.com' })).toEqual({});
      });
      it('rejette une saisie qui n’est pas une URL', () => {
        expect(getErrors(url, { url: 'pas une url' })).toEqual({ url: 'validation.url' });
      });
    });

    describe('email', () => {
      const email = getPayloadType('email');
      it('accepte une adresse valide', () => {
        expect(getErrors(email, { to: 'a@b.com' })).toEqual({});
      });
      it('rejette une adresse sans domaine', () => {
        expect(getErrors(email, { to: 'a@b' })).toEqual({ to: 'validation.email' });
      });
    });

    describe('geo', () => {
      const geo = getPayloadType('geo');
      it('accepte des coordonnées dans les bornes', () => {
        expect(getErrors(geo, { latitude: '48.85', longitude: '2.29' })).toEqual({});
      });
      it('rejette une latitude hors limites', () => {
        expect(getErrors(geo, { latitude: '120', longitude: '2.29' })).toEqual({
          latitude: 'validation.latitude',
        });
      });
      it('rejette une longitude non numérique', () => {
        expect(getErrors(geo, { latitude: '48.85', longitude: 'abc' })).toEqual({
          longitude: 'validation.longitude',
        });
      });
    });
  });
});
