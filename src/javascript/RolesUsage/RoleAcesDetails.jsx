import React from 'react';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/client';
import {useTranslation} from 'react-i18next';
import {Loader} from '@jahia/moonstone';
import styles from './RolesUsage.scss';
import {GET_ROLE_ACES} from './RolesUsage.gql';

export const RoleAcesDetails = ({role}) => {
    const {t} = useTranslation('support-roles-usage');
    const {loading, error, data} = useQuery(GET_ROLE_ACES, {
        variables: {roleName: role.name},
        fetchPolicy: 'network-only'
    });

    if (loading) {
        return <div className={styles.ru_loading} role="status"><Loader size="small"/></div>;
    }

    if (error) {
        return <div className={`${styles.ru_alert} ${styles['ru_alert--error']}`} role="alert">{t('label.loadError')}</div>;
    }

    const aces = data?.supportRolesUsage?.aces ?? [];

    return (
        <div className={styles.ru_details}>
            {role.permissionNames.length > 0 && (
                <p className={styles.ru_permissions}>
                    <strong>{t('label.permissions')}:</strong> {role.permissionNames.join(', ')}
                </p>
            )}
            {role.externalPermissions.map(ext => (
                <p key={ext.name} className={styles.ru_permissions}>
                    <strong>{t('label.externalPermissions')} “{ext.name}” → {ext.targetPath}:</strong>{' '}
                    {ext.permissionNames.join(', ')}
                </p>
            ))}
            {aces.length === 0 ? (
                <p className={styles.ru_emptyMsg}>{t('label.noAces')}</p>
            ) : (
                <table className={styles.ru_table}>
                    <thead>
                        <tr>
                            <th scope="col">{t('label.colWorkspace')}</th>
                            <th scope="col">{t('label.colAceType')}</th>
                            <th scope="col">{t('label.colPrincipal')}</th>
                            <th scope="col">{t('label.colPath')}</th>
                            <th scope="col">{t('label.colFlags')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {aces.map(ace => (
                            <tr key={`${ace.workspace}-${ace.path}-${ace.principal}-${ace.external}`}>
                                <td>{ace.workspace}</td>
                                <td>{ace.aceType}</td>
                                <td>{ace.principal}</td>
                                <td className={styles.ru_pathCell}>{ace.path}</td>
                                <td>
                                    {ace.external && (
                                        <span className={`${styles.ru_badge} ${styles['ru_badge--neutral']}`}>
                                            {t('label.externalFlag')}
                                        </span>
                                    )}
                                    {!ace.principalExists && (
                                        <span className={`${styles.ru_badge} ${styles['ru_badge--error']}`}>
                                            {t('label.missingPrincipalFlag')}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

RoleAcesDetails.propTypes = {
    role: PropTypes.object.isRequired
};
