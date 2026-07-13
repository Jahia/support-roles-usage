package org.jahia.community.rolesusage.graphql;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import graphql.annotations.annotationTypes.GraphQLTypeExtension;
import org.jahia.modules.graphql.provider.dxm.DXGraphQLProvider;

@GraphQLTypeExtension(DXGraphQLProvider.Mutation.class)
@GraphQLDescription("Roles usage mutations")
public final class RolesUsageMutationExtension {

    private RolesUsageMutationExtension() {
    }

    @GraphQLField
    @GraphQLName("supportRolesUsage")
    @GraphQLDescription("Roles usage mutation namespace")
    public static RolesUsageMutation supportRolesUsage() {
        return new RolesUsageMutation();
    }
}
