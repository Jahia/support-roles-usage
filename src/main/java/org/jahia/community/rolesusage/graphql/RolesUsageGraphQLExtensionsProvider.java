package org.jahia.community.rolesusage.graphql;

import org.jahia.modules.graphql.provider.dxm.DXGraphQLExtensionsProvider;
import org.osgi.service.component.annotations.Component;

/**
 * Marker component: its presence triggers the discovery of the @GraphQLTypeExtension classes
 * of this bundle by the graphql-dxm-provider.
 */
@Component(service = DXGraphQLExtensionsProvider.class, immediate = true)
public class RolesUsageGraphQLExtensionsProvider implements DXGraphQLExtensionsProvider {
}
