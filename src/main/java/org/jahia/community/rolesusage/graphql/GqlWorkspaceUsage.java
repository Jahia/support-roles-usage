package org.jahia.community.rolesusage.graphql;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;

@GraphQLName("RolesUsageWorkspaceUsage")
@GraphQLDescription("ACE counts for a role in one workspace")
public class GqlWorkspaceUsage {

    private final String workspace;
    private final int grants;
    private final int denies;
    private final int externalAces;

    public GqlWorkspaceUsage(String workspace, int grants, int denies, int externalAces) {
        this.workspace = workspace;
        this.grants = grants;
        this.denies = denies;
        this.externalAces = externalAces;
    }

    @GraphQLField
    @GraphQLName("workspace")
    @GraphQLDescription("Workspace name (default or live)")
    public String getWorkspace() {
        return workspace;
    }

    @GraphQLField
    @GraphQLName("grants")
    @GraphQLDescription("Number of regular GRANT ACEs referencing the role")
    public int getGrants() {
        return grants;
    }

    @GraphQLField
    @GraphQLName("denies")
    @GraphQLDescription("Number of regular DENY ACEs referencing the role")
    public int getDenies() {
        return denies;
    }

    @GraphQLField
    @GraphQLName("externalAces")
    @GraphQLDescription("Number of auto-generated external ACEs referencing the role")
    public int getExternalAces() {
        return externalAces;
    }
}
