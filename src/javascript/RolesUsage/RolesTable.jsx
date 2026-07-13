import React, {useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import styles from './RolesUsage.scss';
import {RoleAcesDetails} from './RoleAcesDetails';

const STATUS_STYLE = {
    OK: 'ru_badge--ok',
    UNUSED: 'ru_badge--warn',
    NOT_DEFINED: 'ru_badge--error'
};

// Value extractors used for sorting each sortable column.
const SORT_VALUES = {
    name: role => role.name.toLowerCase(),
    roleGroup: role => (role.roleGroup || '').toLowerCase(),
    hidden: role => (role.hidden ? 1 : 0),
    permissions: role => role.permissionNames.length,
    status: role => role.status
};

const EMPTY_FILTERS = {name: '', roleGroup: '', hidden: '', permissions: '', status: ''};

const usageCell = (role, workspace) => {
    const usage = role.usages.find(u => u.workspace === workspace);
    return usage ? `${usage.grants} / ${usage.denies} / ${usage.externalAces}` : '-';
};

const matchesFilters = (role, filters) => {
    const nameFilter = filters.name.trim().toLowerCase();
    if (nameFilter && !role.name.toLowerCase().includes(nameFilter)) {
        return false;
    }

    if (filters.roleGroup && (role.roleGroup || '') !== filters.roleGroup) {
        return false;
    }

    if (filters.hidden && String(role.hidden) !== filters.hidden) {
        return false;
    }

    if (filters.status && role.status !== filters.status) {
        return false;
    }

    if (filters.permissions === 'with' && role.permissionNames.length === 0) {
        return false;
    }

    if (filters.permissions === 'without' && role.permissionNames.length > 0) {
        return false;
    }

    return true;
};

export const RolesTable = ({roles}) => {
    const {t} = useTranslation('support-roles-usage');
    const [expandedRole, setExpandedRole] = useState(null);
    const [sort, setSort] = useState({column: null, direction: 'asc'});
    const [filters, setFilters] = useState(EMPTY_FILTERS);

    const toggle = name => setExpandedRole(prev => (prev === name ? null : name));

    // Click cycles: unsorted -> ascending -> descending -> unsorted.
    const handleSort = column => setSort(prev => {
        if (prev.column !== column) {
            return {column, direction: 'asc'};
        }

        if (prev.direction === 'asc') {
            return {column, direction: 'desc'};
        }

        return {column: null, direction: 'asc'};
    });

    const setFilter = (key, value) => setFilters(prev => ({...prev, [key]: value}));

    const groupOptions = useMemo(
        () => [...new Set(roles.map(r => r.roleGroup).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
        [roles]
    );

    const visibleRoles = useMemo(() => {
        const filtered = roles.filter(role => matchesFilters(role, filters));

        if (!sort.column) {
            return filtered;
        }

        const extract = SORT_VALUES[sort.column];
        const factor = sort.direction === 'asc' ? 1 : -1;
        // Copy before sorting so the roles prop is never mutated.
        return [...filtered].sort((a, b) => {
            const va = extract(a);
            const vb = extract(b);
            if (va < vb) {
                return -factor;
            }

            if (va > vb) {
                return factor;
            }

            return a.name.localeCompare(b.name);
        });
    }, [roles, filters, sort]);

    const hasActiveFilters = Object.values(filters).some(Boolean);

    const ariaSort = column => {
        if (sort.column !== column) {
            return 'none';
        }

        return sort.direction === 'asc' ? 'ascending' : 'descending';
    };

    const sortIndicator = column => {
        if (sort.column !== column) {
            return '';
        }

        return sort.direction === 'asc' ? ' ▲' : ' ▼';
    };

    const sortableHeader = (column, labelKey) => (
        <th scope="col" aria-sort={ariaSort(column)}>
            <button type="button" className={styles.ru_sortBtn} onClick={() => handleSort(column)}>
                {t(`label.${labelKey}`)}
                <span aria-hidden="true" className={styles.ru_sortIndicator}>{sortIndicator(column)}</span>
            </button>
        </th>
    );

    return (
        <>
            <p className={styles.ru_hint}>{t('label.usageLegend')}</p>
            <table className={styles.ru_table}>
                <thead>
                    <tr>
                        {sortableHeader('name', 'colRole')}
                        {sortableHeader('roleGroup', 'colGroup')}
                        {sortableHeader('hidden', 'colHidden')}
                        {sortableHeader('permissions', 'colPermissions')}
                        <th scope="col">{t('label.colDefault')}</th>
                        <th scope="col">{t('label.colLive')}</th>
                        {sortableHeader('status', 'colStatus')}
                        <th scope="col">
                            <span className={styles.ru_sr_only}>{t('label.colDetails')}</span>
                        </th>
                    </tr>
                    <tr className={styles.ru_filterRow}>
                        <td>
                            <input
                                type="text"
                                className={styles.ru_filterInput}
                                value={filters.name}
                                placeholder={t('label.filterByRole')}
                                aria-label={t('label.filterByRole')}
                                onChange={e => setFilter('name', e.target.value)}
                            />
                        </td>
                        <td>
                            <select
                                className={styles.ru_filterSelect}
                                value={filters.roleGroup}
                                aria-label={t('label.filterByGroup')}
                                onChange={e => setFilter('roleGroup', e.target.value)}
                            >
                                <option value="">{t('label.filterAll')}</option>
                                {groupOptions.map(group => <option key={group} value={group}>{group}</option>)}
                            </select>
                        </td>
                        <td>
                            <select
                                className={styles.ru_filterSelect}
                                value={filters.hidden}
                                aria-label={t('label.filterByHidden')}
                                onChange={e => setFilter('hidden', e.target.value)}
                            >
                                <option value="">{t('label.filterAll')}</option>
                                <option value="true">{t('label.yes')}</option>
                                <option value="false">{t('label.no')}</option>
                            </select>
                        </td>
                        <td>
                            <select
                                className={styles.ru_filterSelect}
                                value={filters.permissions}
                                aria-label={t('label.filterByPermissions')}
                                onChange={e => setFilter('permissions', e.target.value)}
                            >
                                <option value="">{t('label.filterAll')}</option>
                                <option value="with">{t('label.permWith')}</option>
                                <option value="without">{t('label.permWithout')}</option>
                            </select>
                        </td>
                        <td/>
                        <td/>
                        <td>
                            <select
                                className={styles.ru_filterSelect}
                                value={filters.status}
                                aria-label={t('label.filterByStatus')}
                                onChange={e => setFilter('status', e.target.value)}
                            >
                                <option value="">{t('label.filterAll')}</option>
                                <option value="OK">{t('label.status.OK')}</option>
                                <option value="UNUSED">{t('label.status.UNUSED')}</option>
                                <option value="NOT_DEFINED">{t('label.status.NOT_DEFINED')}</option>
                            </select>
                        </td>
                        <td>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    className={styles.ru_linkBtn}
                                    onClick={() => setFilters(EMPTY_FILTERS)}
                                >
                                    {t('label.clearFilters')}
                                </button>
                            )}
                        </td>
                    </tr>
                </thead>
                <tbody>
                    {visibleRoles.length === 0 ? (
                        <tr>
                            <td colSpan={8} className={styles.ru_emptyMsg}>{t('label.noResults')}</td>
                        </tr>
                    ) : visibleRoles.map(role => (
                        <React.Fragment key={role.name}>
                            <tr>
                                <td className={styles.ru_roleName}>{role.name}</td>
                                <td>{role.roleGroup || '-'}</td>
                                <td>{role.hidden ? t('label.yes') : t('label.no')}</td>
                                <td>{role.permissionNames.length}</td>
                                <td>{usageCell(role, 'default')}</td>
                                <td>{usageCell(role, 'live')}</td>
                                <td>
                                    <span className={`${styles.ru_badge} ${styles[STATUS_STYLE[role.status]] || ''}`}>
                                        {t(`label.status.${role.status}`)}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        className={styles.ru_linkBtn}
                                        aria-expanded={expandedRole === role.name}
                                        onClick={() => toggle(role.name)}
                                    >
                                        {expandedRole === role.name ? t('label.hideDetails') : t('label.showDetails')}
                                    </button>
                                </td>
                            </tr>
                            {expandedRole === role.name && (
                                <tr>
                                    <td colSpan={8} className={styles.ru_detailsCell}>
                                        <RoleAcesDetails role={role}/>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </>
    );
};

RolesTable.propTypes = {
    roles: PropTypes.array.isRequired
};
