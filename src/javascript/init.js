import {registry} from '@jahia/ui-extender';
import register from './RolesUsage/register';
import i18next from 'i18next';

export default function () {
    registry.add('callback', 'support-roles-usage', {
        targets: ['jahiaApp-init:50'],
        callback: async () => {
            await i18next.loadNamespaces('support-roles-usage', () => {
                console.debug('%c support-roles-usage: i18n namespace loaded', 'color: #006633');
            });
            register();
            console.debug('%c support-roles-usage: activation completed', 'color: #006633');
        }
    });
}
