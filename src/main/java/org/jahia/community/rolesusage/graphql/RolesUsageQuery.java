package org.jahia.community.rolesusage.graphql;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import org.jahia.community.rolesusage.RolesUsageService;
import org.jahia.modules.graphql.provider.dxm.DataFetchingException;
import org.jahia.modules.graphql.provider.dxm.security.GraphQLRequiresPermission;

import javax.jcr.RepositoryException;
import java.util.List;

@GraphQLName("SupportRolesUsageQuery")
@GraphQLDescription("Roles usage queries")
public class RolesUsageQuery {

    @GraphQLField
    @GraphQLName("roles")
    @GraphQLDescription("All roles defined under /roles or referenced by ACEs, with usage counts per workspace")
    @GraphQLRequiresPermission("rolesUsageAdmin")
    public List<GqlRoleUsage> roles() {
        try {
            return RolesUsageService.getRolesReport();
        } catch (RepositoryException e) {
            throw new DataFetchingException(e);
        }
    }

    @GraphQLField
    @GraphQLName("aces")
    @GraphQLDescription("ACE details for a role (all roles when roleName is omitted)")
    @GraphQLRequiresPermission("rolesUsageAdmin")
    public List<GqlAce> aces(
            @GraphQLName("roleName") @GraphQLDescription("Role name to filter on") String roleName,
            @GraphQLName("workspace") @GraphQLDescription("Workspace (default or live); both when omitted") String workspace) {
        try {
            return RolesUsageService.getAces(roleName, workspace);
        } catch (RepositoryException e) {
            throw new DataFetchingException(e);
        }
    }

    @GraphQLField
    @GraphQLName("orphanedAces")
    @GraphQLDescription("ACEs whose principal (user or group) no longer exists, in both workspaces")
    @GraphQLRequiresPermission("rolesUsageAdmin")
    public List<GqlAce> orphanedAces() {
        try {
            return RolesUsageService.getOrphanedAces();
        } catch (RepositoryException e) {
            throw new DataFetchingException(e);
        }
    }
}
