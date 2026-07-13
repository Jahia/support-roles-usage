package org.jahia.community.rolesusage.graphql;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import org.jahia.community.rolesusage.RolesUsageService;
import org.jahia.modules.graphql.provider.dxm.DataFetchingException;
import org.jahia.modules.graphql.provider.dxm.security.GraphQLRequiresPermission;

import javax.jcr.RepositoryException;
import java.util.List;

@GraphQLName("SupportRolesUsageMutation")
@GraphQLDescription("Roles usage mutations")
public class RolesUsageMutation {

    @GraphQLField
    @GraphQLName("removeOrphanedAces")
    @GraphQLDescription("Removes every ACE whose principal no longer exists. "
            + "WARNING: make sure all external user/group providers (LDAP, SSO...) are connected "
            + "before running, otherwise their principals look missing and their ACEs would be removed. "
            + "Use the orphanedAces query first to review what will be removed.")
    @GraphQLRequiresPermission("rolesUsageAdmin")
    public List<GqlAce> removeOrphanedAces(
            @GraphQLName("skipPrincipals")
            @GraphQLDescription("Principals to never remove, in ACE format (u:name or g:name)") List<String> skipPrincipals) {
        try {
            return RolesUsageService.removeOrphanedAces(skipPrincipals);
        } catch (RepositoryException e) {
            throw new DataFetchingException(e);
        }
    }
}
