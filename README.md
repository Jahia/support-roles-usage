# Support Roles Usage

Jahia module providing a complete report of **roles usage** (definitions, ACE
references, unused / undefined roles) and **cleanup of orphaned ACEs** (ACEs whose
principal no longer exists), through an administration UI and a GraphQL API.

- **Group / Artifact:** `org.jahia.community:support-roles-usage`
- **Version:** `1.0.0-SNAPSHOT`
- **Module type:** `system`
- **Jahia required version:** `8.2.2.1`
- **Depends on:** `default`, `graphql-dxm-provider`

## What it does

- Scans every role defined under `/roles` and every `jnt:ace` / `jnt:externalAce`
  referencing a role, in both the `default` (edit) and `live` workspaces.
- Produces a per-role report with GRANT / DENY / external ACE counts per workspace
  and a status: `OK`, `UNUSED` (defined but never referenced) or `NOT_DEFINED`
  (referenced by ACEs but missing under `/roles`).
- Detects **orphaned ACEs** whose principal (`u:user` / `g:group`) no longer
  resolves, and lets an administrator remove them in bulk.
- Exposes the whole feature behind the `rolesUsageAdmin` permission and a dedicated
  `support-roles-usage-administrator` server role.

## Architecture

### Backend (Java / OSGi)

| Package | Responsibility |
|---------|----------------|
| `org.jahia.community.rolesusage.RolesUsageService` | JCR scanning logic: role definitions, ACE counting, orphan detection and batched removal (system sessions). |
| `org.jahia.community.rolesusage.graphql` | GraphQL type model (`Gql*`) and the `Query` / `Mutation` namespace extensions. |

The GraphQL API follows the Jahia convention of a **single hierarchical namespace**
rather than flat root fields:

```graphql
query {
  supportRolesUsage {
    roles { name status usages { workspace grants denies externalAces } }
    aces(roleName: "editor") { workspace principal aceType roles }
    orphanedAces { workspace path principal roles }
  }
}

mutation {
  supportRolesUsage {
    removeOrphanedAces(skipPrincipals: []) { workspace path principal }
  }
}
```

`RolesUsageQueryExtension` / `RolesUsageMutationExtension` add the single
`supportRolesUsage` field to the root `Query` / `Mutation` types (via
`@GraphQLTypeExtension`); `RolesUsageGraphQLExtensionsProvider` is the marker
component that triggers bundle discovery by `graphql-dxm-provider`.

All operations require the `rolesUsageAdmin` permission
(`@GraphQLRequiresPermission`).

### Frontend (React / Module Federation)

A JavaScript admin route registered under
`administration-server-usersAndRoles` via `@jahia/ui-extender`:

- `src/javascript/index.js` — app-shell bootstrap entry.
- `src/javascript/init.js` — exposed federated module (`./init`); loads the i18n
  namespace and registers the route.
- `src/javascript/RolesUsage/` — the React UI (`RolesUsageAdmin`, `RolesTable`,
  `RoleAcesDetails`, `OrphanedAces`), the Apollo GraphQL documents
  (`RolesUsage.gql.js`) and styles (`RolesUsage.scss`).

### Initial JCR content

`src/main/import/` is packaged into `import.zip` and imported once per module version:

- `permissions.xml` — declares the `rolesUsageAdmin` permission under `/permissions/admin`.
- `roles.xml` — declares the `support-roles-usage-administrator` server role granting
  `administrationAccess` + `rolesUsageAdmin`.

> Bump the module version whenever this content changes — Jahia only imports it once
> per version.

## Build

Java + JS are built together by Maven (the `frontend-maven-plugin` installs Node/Yarn
locally and runs the webpack production build during `generate-resources`):

```bash
mvn clean install
```

The produced OSGi bundle is `target/support-roles-usage-1.0.0-SNAPSHOT.jar`.

### Frontend only

```bash
yarn install
yarn build            # development build
yarn build:production # production build (what Maven runs)
yarn watch            # rebuild on change
yarn lint             # eslint
```

Webpack outputs the federated bundle into
`src/main/resources/javascript/apps/` (`remoteEntry.js`,
`support-roles-usage.bundle.js` and lazy chunks), which the bundle plugin then
ships as static resources.

## Repository provenance

This repository was reconstructed from the compiled artifacts
(`support-roles-usage-1.0.0-SNAPSHOT.jar` and its `-sources.jar`):

- **Java sources, resource bundle, GraphQL SCR descriptor, `pom.xml`,
  `package.json`, `en.json` and the `import.zip` content** were recovered
  verbatim from the JARs.
- **The React/JSX/SCSS sources** were recovered from the webpack `sourcesContent`
  embedded in the shipped `*.js.map` source maps (lossless).
- **`webpack.config.js`, `.eslintrc.json`, `.gitignore` and this README** were
  regenerated to reproduce the observed build outputs; they are not present in the
  artifacts and may differ slightly from the originals.
