import type { Meta, StoryObj } from '@storybook/react-vite';
import { QrForm } from './QrForm';
import { PAYLOAD_TYPES_BY_ID } from '../lib/payloads';
import { I18nProvider } from '../../../i18n/I18nProvider';

/**
 * `QrForm` génère dynamiquement ses champs à partir d'un `PayloadType` du registre
 * (aucun type de QR n'est codé en dur). Il consomme l'i18n préfixé (`useQrT`) :
 * on l'enveloppe dans `<I18nProvider>`. Chaque story choisit un type du registre
 * pour illustrer les différentes combinaisons de champs (texte, select, checkbox…).
 */
const meta: Meta<typeof QrForm> = {
  title: 'Tools/QR Generator/QrForm',
  component: QrForm,
  decorators: [
    (Story) => (
      <I18nProvider>
        <Story />
      </I18nProvider>
    ),
  ],
  args: { onChange: () => {} },
};
export default meta;

type Story = StoryObj<typeof QrForm>;

export const Text: Story = {
  args: { type: PAYLOAD_TYPES_BY_ID.text, values: { text: 'Bonjour !' } },
};

export const Wifi: Story = {
  args: {
    type: PAYLOAD_TYPES_BY_ID.wifi,
    values: { ssid: 'Mon réseau', password: 'secret', encryption: 'WPA', hidden: false },
  },
};

export const WithValidationError: Story = {
  args: {
    type: PAYLOAD_TYPES_BY_ID.url,
    values: { url: 'pas une url' },
    errors: { url: 'validation.url' },
  },
};
