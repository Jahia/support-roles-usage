package org.jahia.community.rolesusage.graphql;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;

import java.util.Collections;
import java.util.List;

@GraphQLName("RolesUsageExternalPermissions")
@GraphQLDescription("External permissions attached to a role (permissions granted on another path)")
public class GqlExternalPermissions {

    private final String name;
    private final String targetPath;
    private final List<String> permissionNames;

    public GqlExternalPermissions(String name, String targetPath, List<String> permissionNames) {
        this.name = name;
        this.targetPath = targetPath;
        this.permissionNames = Collections.unmodifiableList(permissionNames);
    }

    @GraphQLField
    @GraphQLName("name")
    @GraphQLDescription("Name of the external permissions definition")
    public String getName() {
        return name;
    }

    @GraphQLField
    @GraphQLName("targetPath")
    @GraphQLDescription("Path the permissions are granted on (may be 'currentSite')")
    public String getTargetPath() {
        return targetPath;
    }

    @GraphQLField
    @GraphQLName("permissionNames")
    @GraphQLDescription("Permission names granted on the target path")
    public List<String> getPermissionNames() {
        return permissionNames;
    }
}
