package org.jahia.community.rolesusage.graphql;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import graphql.annotations.annotationTypes.GraphQLTypeExtension;
import org.jahia.modules.graphql.provider.dxm.DXGraphQLProvider;

@GraphQLTypeExtension(DXGraphQLProvider.Query.class)
@GraphQLDescription("Roles usage queries")
public final class RolesUsageQueryExtension {

    private RolesUsageQueryExtension() {
    }

    @GraphQLField
    @GraphQLName("supportRolesUsage")
    @GraphQLDescription("Roles usage query namespace")
    public static RolesUsageQuery supportRolesUsage() {
        return new RolesUsageQuery();
    }
}
