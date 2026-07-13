package org.jahia.community.rolesusage.graphql;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;

import java.util.Collections;
import java.util.List;

@GraphQLName("RolesUsageAce")
@GraphQLDescription("An access control entry referencing one or more roles")
public class GqlAce {

    private final String workspace;
    private final String path;
    private final String acePath;
    private final String principal;
    private final String aceType;
    private final boolean external;
    private final boolean principalExists;
    private final List<String> roles;

    public GqlAce(String workspace, String path, String acePath, String principal, String aceType,
            boolean external, boolean principalExists, List<String> roles) {
        this.workspace = workspace;
        this.path = path;
        this.acePath = acePath;
        this.principal = principal;
        this.aceType = aceType;
        this.external = external;
        this.principalExists = principalExists;
        this.roles = Collections.unmodifiableList(roles);
    }

    @GraphQLField
    @GraphQLName("workspace")
    @GraphQLDescription("Workspace the ACE lives in (default or live)")
    public String getWorkspace() {
        return workspace;
    }

    @GraphQLField
    @GraphQLName("path")
    @GraphQLDescription("Path of the secured node the ACE applies to")
    public String getPath() {
        return path;
    }

    @GraphQLField
    @GraphQLName("acePath")
    @GraphQLDescription("Path of the ACE node itself")
    public String getAcePath() {
        return acePath;
    }

    @GraphQLField
    @GraphQLName("principal")
    @GraphQLDescription("Principal in ACE format, e.g. u:john or g:site-administrators")
    public String getPrincipal() {
        return principal;
    }

    @GraphQLField
    @GraphQLName("aceType")
    @GraphQLDescription("GRANT or DENY")
    public String getAceType() {
        return aceType;
    }

    @GraphQLField
    @GraphQLName("external")
    @GraphQLDescription("True for auto-generated external ACEs (jnt:externalAce)")
    public boolean isExternal() {
        return external;
    }

    @GraphQLField
    @GraphQLName("principalExists")
    @GraphQLDescription("False when the principal (user or group) no longer exists")
    public boolean isPrincipalExists() {
        return principalExists;
    }

    @GraphQLField
    @GraphQLName("roles")
    @GraphQLDescription("Role names referenced by this ACE")
    public List<String> getRoles() {
        return roles;
    }
}
