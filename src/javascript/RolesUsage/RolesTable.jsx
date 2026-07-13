import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import styles from './RolesUsage.scss';
import {RoleAcesDetails} from './RoleAcesDetails';

const STATUS_STYLE = {
    OK: 'ru_badge--ok',
    UNUSED: 'ru_badge--warn',
    NOT_DEFINED: 'ru_badge--error'
};

const usageCell = (role, workspace) => {
    const usage = role.usages.find(u => u.workspace === workspace);
    return usage ? `${usage.grants} / ${usage.denies} / ${usage.externalAces}` : '-';
};

export const RolesTable = ({roles}) => {
    const {t} = useTranslation('support-roles-usage');
    const [expandedRole, setExpandedRole] = useState(null);

    const toggle = name => setExpandedRole(prev => (prev === name ? null : name));

    return (
        <>
            <p className={styles.ru_hint}>{t('label.usageLegend')}</p>
            <table className={styles.ru_table}>
                <thead>
                    <tr>
                        <th scope="col">{t('label.colRole')}</th>
                        <th scope="col">{t('label.colGroup')}</th>
                        <th scope="col">{t('label.colHidden')}</th>
                        <th scope="col">{t('label.colPermissions')}</th>
                        <th scope="col">{t('label.colDefault')}</th>
                        <th scope="col">{t('label.colLive')}</th>
                        <th scope="col">{t('label.colStatus')}</th>
                        <th scope="col">
                            <span className={styles.ru_sr_only}>{t('label.colDetails')}</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {roles.map(role => (
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
