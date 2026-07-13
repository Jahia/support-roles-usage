package org.jahia.community.rolesusage.graphql;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;

import java.util.Collections;
import java.util.List;

@GraphQLName("RolesUsageRole")
@GraphQLDescription("A role definition with its usage counts per workspace")
public class GqlRoleUsage {

    private final String name;
    private final String path;
    private final String roleGroup;
    private final boolean hidden;
    private final List<String> nodeTypes;
    private final List<String> permissionNames;
    private final List<GqlExternalPermissions> externalPermissions;
    private final List<GqlWorkspaceUsage> usages;
    private final String status;

    public GqlRoleUsage(String name, String path, String roleGroup, boolean hidden,
            List<String> nodeTypes, List<String> permissionNames,
            List<GqlExternalPermissions> externalPermissions,
            List<GqlWorkspaceUsage> usages, String status) {
        this.name = name;
        this.path = path;
        this.roleGroup = roleGroup;
        this.hidden = hidden;
        this.nodeTypes = Collections.unmodifiableList(nodeTypes);
        this.permissionNames = Collections.unmodifiableList(permissionNames);
        this.externalPermissions = Collections.unmodifiableList(externalPermissions);
        this.usages = Collections.unmodifiableList(usages);
        this.status = status;
    }

    /** Returns a copy of this definition completed with usage counts and status. */
    public GqlRoleUsage withUsages(List<GqlWorkspaceUsage> newUsages, String newStatus) {
        return new GqlRoleUsage(name, path, roleGroup, hidden, nodeTypes, permissionNames,
                externalPermissions, newUsages, newStatus);
    }

    @GraphQLField
    @GraphQLName("name")
    @GraphQLDescription("Role name (unique identifier used in ACEs)")
    public String getName() {
        return name;
    }

    @GraphQLField
    @GraphQLName("path")
    @GraphQLDescription("Path of the role node under /roles (null when the role is not defined)")
    public String getPath() {
        return path;
    }

    @GraphQLField
    @GraphQLName("roleGroup")
    @GraphQLDescription("Role group (edit-role, live-role, server-role, site-role, system-role)")
    public String getRoleGroup() {
        return roleGroup;
    }

    @GraphQLField
    @GraphQLName("hidden")
    @GraphQLDescription("True when the role is hidden in the UI")
    public boolean isHidden() {
        return hidden;
    }

    @GraphQLField
    @GraphQLName("nodeTypes")
    @GraphQLDescription("Node types the role is restricted to")
    public List<String> getNodeTypes() {
        return nodeTypes;
    }

    @GraphQLField
    @GraphQLName("permissionNames")
    @GraphQLDescription("Permission names directly attached to the role")
    public List<String> getPermissionNames() {
        return permissionNames;
    }

    @GraphQLField
    @GraphQLName("externalPermissions")
    @GraphQLDescription("External permissions attached to the role")
    public List<GqlExternalPermissions> getExternalPermissions() {
        return externalPermissions;
    }

    @GraphQLField
    @GraphQLName("usages")
    @GraphQLDescription("ACE counts per workspace")
    public List<GqlWorkspaceUsage> getUsages() {
        return usages;
    }

    @GraphQLField
    @GraphQLName("status")
    @GraphQLDescription("OK (defined and used), UNUSED (defined, never referenced) or NOT_DEFINED (referenced by ACEs but missing under /roles)")
    public String getStatus() {
        return status;
    }
}
