import {gql} from '@apollo/client';

export const GET_ROLES = gql`
    query RolesUsageReport {
        supportRolesUsage {
            roles {
                name
                path
                roleGroup
                hidden
                nodeTypes
                permissionNames
                externalPermissions {
                    name
                    targetPath
                    permissionNames
                }
                usages {
                    workspace
                    grants
                    denies
                    externalAces
                }
                status
            }
        }
    }
`;

export const GET_ROLE_ACES = gql`
    query RolesUsageAces($roleName: String) {
        supportRolesUsage {
            aces(roleName: $roleName) {
                workspace
                path
                principal
                aceType
                external
                principalExists
                roles
            }
        }
    }
`;

export const GET_ORPHANED_ACES = gql`
    query RolesUsageOrphanedAces {
        supportRolesUsage {
            orphanedAces {
                workspace
                path
                principal
                aceType
                external
                roles
            }
        }
    }
`;

export const REMOVE_ORPHANED_ACES = gql`
    mutation RolesUsageRemoveOrphanedAces($skipPrincipals: [String]) {
        supportRolesUsage {
            removeOrphanedAces(skipPrincipals: $skipPrincipals) {
                workspace
                path
                principal
                aceType
                external
            }
        }
    }
`;
