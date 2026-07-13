import {registry} from '@jahia/ui-extender';
import {RolesUsageAdmin} from './RolesUsage';
import React from 'react';

export default () => {
    registry.add('adminRoute', 'supportRolesUsage', {
        targets: ['administration-server-usersAndRoles:20'],
        requiredPermission: 'rolesUsageAdmin',
        label: 'support-roles-usage:label.menu_entry',
        isSelectable: true,
        render: () => React.createElement(RolesUsageAdmin)
    });
};
