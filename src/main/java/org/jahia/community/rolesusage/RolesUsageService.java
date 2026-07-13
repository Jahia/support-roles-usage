package org.jahia.community.rolesusage;

import org.jahia.api.Constants;
import org.jahia.community.rolesusage.graphql.GqlAce;
import org.jahia.community.rolesusage.graphql.GqlExternalPermissions;
import org.jahia.community.rolesusage.graphql.GqlRoleUsage;
import org.jahia.community.rolesusage.graphql.GqlWorkspaceUsage;
import org.jahia.services.content.JCRNodeIteratorWrapper;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.JCRSessionWrapper;
import org.jahia.services.content.JCRTemplate;
import org.jahia.services.content.JCRValueWrapper;
import org.jahia.services.usermanager.JahiaGroupManagerService;
import org.jahia.services.usermanager.JahiaUserManagerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.RepositoryException;
import javax.jcr.query.Query;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.function.Consumer;

/**
 * Scans role definitions under /roles and every ACE referencing them, in both the default and
 * live workspaces. Also detects and removes orphaned ACEs (ACEs whose principal no longer exists).
 */
public final class RolesUsageService {

    public static final List<String> WORKSPACES = Collections.unmodifiableList(
            Arrays.asList(Constants.EDIT_WORKSPACE, Constants.LIVE_WORKSPACE));

    private static final Logger LOGGER = LoggerFactory.getLogger(RolesUsageService.class);
    private static final String QUERY_ALL_ACES = "select * from [jnt:ace]";
    private static final String PROP_PRINCIPAL = "j:principal";
    private static final String PROP_ROLES = "j:roles";
    private static final String PROP_ACE_TYPE = "j:aceType";
    private static final String PROP_PERMISSION_NAMES = "j:permissionNames";
    private static final String SITES_PREFIX = "/sites/";
    private static final int SAVE_BATCH_SIZE = 100;

    private RolesUsageService() {
    }

    /**
     * Full report: one entry per role that is either defined under /roles or referenced by at
     * least one ACE, with usage counts per workspace and a status (OK, UNUSED, NOT_DEFINED).
     */
    public static List<GqlRoleUsage> getRolesReport() throws RepositoryException {
        final Map<String, GqlRoleUsage> definitions = loadRoleDefinitions();
        // roleName -> workspace -> [grants, denies, externalAces]
        final Map<String, Map<String, int[]>> counts = new HashMap<>();
        for (String workspace : WORKSPACES) {
            scanAces(workspace, ace -> {
                for (String roleName : ace.getRoles()) {
                    final int[] cell = counts
                            .computeIfAbsent(roleName, k -> new HashMap<>())
                            .computeIfAbsent(workspace, k -> new int[3]);
                    if (ace.isExternal()) {
                        cell[2]++;
                    } else if ("DENY".equalsIgnoreCase(ace.getAceType())) {
                        cell[1]++;
                    } else {
                        cell[0]++;
                    }
                }
            });
        }

        final Set<String> allNames = new TreeSet<>(definitions.keySet());
        allNames.addAll(counts.keySet());
        final List<GqlRoleUsage> report = new ArrayList<>();
        for (String name : allNames) {
            final GqlRoleUsage definition = definitions.get(name);
            final List<GqlWorkspaceUsage> usages = new ArrayList<>();
            for (String workspace : WORKSPACES) {
                final int[] cell = counts.getOrDefault(name, Collections.emptyMap())
                        .getOrDefault(workspace, new int[3]);
                usages.add(new GqlWorkspaceUsage(workspace, cell[0], cell[1], cell[2]));
            }
            final String status = definition == null ? "NOT_DEFINED"
                    : (counts.containsKey(name) ? "OK" : "UNUSED");
            report.add(definition == null
                    ? new GqlRoleUsage(name, null, null, false, Collections.emptyList(),
                            Collections.emptyList(), Collections.emptyList(), usages, status)
                    : definition.withUsages(usages, status));
        }
        return report;
    }

    /**
     * ACE details for one role (or all roles when roleName is null), in one workspace
     * (or all workspaces when workspace is null).
     */
    public static List<GqlAce> getAces(String roleName, String workspace) throws RepositoryException {
        final List<GqlAce> result = new ArrayList<>();
        for (String ws : workspaces(workspace)) {
            scanAces(ws, ace -> {
                if (roleName == null || ace.getRoles().contains(roleName)) {
                    result.add(ace);
                }
            });
        }
        return result;
    }

    /** All ACEs (regular and external) whose principal no longer exists, in both workspaces. */
    public static List<GqlAce> getOrphanedAces() throws RepositoryException {
        final List<GqlAce> result = new ArrayList<>();
        for (String workspace : WORKSPACES) {
            scanAces(workspace, ace -> {
                if (!ace.isPrincipalExists()) {
                    result.add(ace);
                }
            });
        }
        return result;
    }

    /**
     * Removes every ACE whose principal no longer exists, except principals listed in
     * skipPrincipals. Regular ACEs are removed first (Jahia's AclListener then cascades to the
     * external ACEs derived from them on save), then a second pass sweeps external leftovers.
     *
     * @return the ACEs that were actually removed
     */
    public static List<GqlAce> removeOrphanedAces(Collection<String> skipPrincipals) throws RepositoryException {
        final Set<String> skip = skipPrincipals == null
                ? Collections.emptySet() : new TreeSet<>(skipPrincipals);
        final List<GqlAce> removed = new ArrayList<>();
        for (String workspace : WORKSPACES) {
            // Pass 1: regular ACEs. Pass 2 (fresh session): external ACEs still left over.
            for (boolean externalPass : new boolean[]{false, true}) {
                removed.addAll(removeOrphanedAcesPass(workspace, externalPass, skip));
            }
        }
        LOGGER.info("Orphaned ACEs cleanup removed {} ACEs", removed.size());
        return removed;
    }

    private static List<GqlAce> removeOrphanedAcesPass(String workspace, boolean externalPass,
            Set<String> skipPrincipals) throws RepositoryException {
        return JCRTemplate.getInstance().doExecuteWithSystemSession(null, workspace, session -> {
            final List<GqlAce> removed = new ArrayList<>();
            int pending = 0;
            final JCRNodeIteratorWrapper iterator = queryAces(session);
            while (iterator.hasNext()) {
                final JCRNodeWrapper node = (JCRNodeWrapper) iterator.next();
                if (node.isNodeType("jnt:externalAce") != externalPass) {
                    continue;
                }
                final GqlAce ace = toGqlAce(node, workspace);
                if (ace.isPrincipalExists() || skipPrincipals.contains(ace.getPrincipal())) {
                    continue;
                }
                LOGGER.info("Removing orphaned ACE {} ({} {} on {})",
                        ace.getAcePath(), ace.getAceType(), ace.getPrincipal(), ace.getPath());
                node.remove();
                removed.add(ace);
                pending++;
                if (pending >= SAVE_BATCH_SIZE) {
                    session.save();
                    pending = 0;
                }
            }
            if (pending > 0) {
                session.save();
            }
            return removed;
        });
    }

    private static Map<String, GqlRoleUsage> loadRoleDefinitions() throws RepositoryException {
        return JCRTemplate.getInstance().doExecuteWithSystemSession(null, Constants.EDIT_WORKSPACE, session -> {
            final Map<String, GqlRoleUsage> definitions = new TreeMap<>();
            final JCRNodeIteratorWrapper iterator = (JCRNodeIteratorWrapper) session.getWorkspace()
                    .getQueryManager()
                    .createQuery("select * from [jnt:role] as r where isdescendantnode(r, '/roles')", Query.JCR_SQL2)
                    .execute().getNodes();
            while (iterator.hasNext()) {
                final JCRNodeWrapper role = (JCRNodeWrapper) iterator.next();
                final List<GqlExternalPermissions> externalPermissions = new ArrayList<>();
                for (JCRNodeWrapper child : role.getNodes()) {
                    if (child.isNodeType("jnt:externalPermissions")) {
                        externalPermissions.add(new GqlExternalPermissions(child.getName(),
                                child.getPropertyAsString("j:path"),
                                multiValued(child, PROP_PERMISSION_NAMES)));
                    }
                }
                definitions.put(role.getName(), new GqlRoleUsage(
                        role.getName(),
                        role.getPath(),
                        role.getPropertyAsString("j:roleGroup"),
                        role.hasProperty("j:hidden") && role.getProperty("j:hidden").getBoolean(),
                        multiValued(role, "j:nodeTypes"),
                        multiValued(role, PROP_PERMISSION_NAMES),
                        externalPermissions,
                        Collections.emptyList(),
                        null));
            }
            return definitions;
        });
    }

    private static void scanAces(String workspace, Consumer<GqlAce> consumer) throws RepositoryException {
        JCRTemplate.getInstance().doExecuteWithSystemSession(null, workspace, session -> {
            final JCRNodeIteratorWrapper iterator = queryAces(session);
            while (iterator.hasNext()) {
                consumer.accept(toGqlAce((JCRNodeWrapper) iterator.next(), workspace));
            }
            return null;
        });
    }

    private static JCRNodeIteratorWrapper queryAces(JCRSessionWrapper session) throws RepositoryException {
        return (JCRNodeIteratorWrapper) session.getWorkspace().getQueryManager()
                .createQuery(QUERY_ALL_ACES, Query.JCR_SQL2).execute().getNodes();
    }

    private static GqlAce toGqlAce(JCRNodeWrapper ace, String workspace) throws RepositoryException {
        String securedPath;
        try {
            securedPath = ace.getParent().getParent().getPath(); // ace -> j:acl -> secured node
        } catch (RepositoryException e) {
            securedPath = ace.getPath();
        }
        final String principal = ace.getPropertyAsString(PROP_PRINCIPAL);
        return new GqlAce(workspace, securedPath, ace.getPath(), principal,
                ace.getPropertyAsString(PROP_ACE_TYPE),
                ace.isNodeType("jnt:externalAce"),
                principalExists(principal, siteKeyOf(securedPath)),
                multiValued(ace, PROP_ROLES));
    }

    private static List<String> multiValued(JCRNodeWrapper node, String propertyName) throws RepositoryException {
        if (!node.hasProperty(propertyName)) {
            return Collections.emptyList();
        }
        final List<String> values = new ArrayList<>();
        for (JCRValueWrapper value : node.getProperty(propertyName).getValues()) {
            values.add(value.getString());
        }
        return values;
    }

    private static String siteKeyOf(String path) {
        if (path == null || !path.startsWith(SITES_PREFIX)) {
            return null;
        }
        final String rest = path.substring(SITES_PREFIX.length());
        final int slash = rest.indexOf('/');
        return slash == -1 ? rest : rest.substring(0, slash);
    }

    /**
     * Returns true when the ACE principal (u:name or g:name) still exists.
     * Unknown principal formats return true so they are never flagged or removed.
     */
    private static boolean principalExists(String principal, String siteKey) {
        if (principal == null || principal.length() < 3) {
            return false;
        }
        final String name = principal.substring(2);
        if (principal.startsWith("u:")) {
            return JahiaUserManagerService.getInstance().lookupUser(name) != null;
        }
        if (principal.startsWith("g:")) {
            final JahiaGroupManagerService groupService = JahiaGroupManagerService.getInstance();
            return groupService.lookupGroup(siteKey, name) != null
                    || groupService.lookupGroup(null, name) != null;
        }
        return true;
    }

    private static List<String> workspaces(String workspace) {
        if (workspace == null) {
            return WORKSPACES;
        }
        if (!WORKSPACES.contains(workspace)) {
            throw new IllegalArgumentException("Unknown workspace: " + workspace);
        }
        return Collections.singletonList(workspace);
    }
}
