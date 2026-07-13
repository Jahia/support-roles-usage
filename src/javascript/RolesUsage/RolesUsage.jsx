import React, {useEffect} from 'react';
import {useQuery} from '@apollo/client';
import {useTranslation} from 'react-i18next';
import {Loader, Typography} from '@jahia/moonstone';
import styles from './RolesUsage.scss';
import {GET_ORPHANED_ACES, GET_ROLES} from './RolesUsage.gql';
import {RolesTable} from './RolesTable';
import {OrphanedAces} from './OrphanedAces';

export const RolesUsageAdmin = () => {
    const {t} = useTranslation('support-roles-usage');

    const {loading: rolesLoading, error: rolesError, data: rolesData, refetch: refetchRoles} =
        useQuery(GET_ROLES, {fetchPolicy: 'network-only'});
    const {loading: orphansLoading, error: orphansError, data: orphansData, refetch: refetchOrphans} =
        useQuery(GET_ORPHANED_ACES, {fetchPolicy: 'network-only'});

    useEffect(() => {
        const prev = document.title;
        document.title = `${t('label.title')} — Jahia Administration`;
        return () => {
            document.title = prev;
        };
    }, [t]);

    const roles = rolesData?.supportRolesUsage?.roles;
    const orphans = orphansData?.supportRolesUsage?.orphanedAces;

    const handleCleanupDone = () => {
        refetchOrphans();
        refetchRoles();
    };

    return (
        <div className={styles.ru_container}>
            <div className={styles.ru_content}>
            <div className={styles.ru_pageHeader}>
                <h2>{t('label.title')}</h2>
                <Typography className={styles.ru_description}>{t('label.description')}</Typography>
            </div>

            <div className={styles.ru_panel}>
                <div className={styles.ru_panelHeading}>
                    <h3>{t('label.rolesSection')}</h3>
                </div>
                <div className={styles.ru_panelBody}>
                    {rolesLoading && <div className={styles.ru_loading} role="status"><Loader size="small"/></div>}
                    {rolesError && (
                        <div className={`${styles.ru_alert} ${styles['ru_alert--error']}`} role="alert">
                            {t('label.loadError')}
                        </div>
                    )}
                    {roles && <RolesTable roles={roles}/>}
                </div>
            </div>

            <div className={styles.ru_panel}>
                <div className={styles.ru_panelHeading}>
                    <h3>{t('label.orphansSection')}</h3>
                </div>
                <div className={styles.ru_panelBody}>
                    {orphansLoading && <div className={styles.ru_loading} role="status"><Loader size="small"/></div>}
                    {orphansError && (
                        <div className={`${styles.ru_alert} ${styles['ru_alert--error']}`} role="alert">
                            {t('label.loadError')}
                        </div>
                    )}
                    {orphans && <OrphanedAces orphans={orphans} onCleanupDone={handleCleanupDone}/>}
                </div>
            </div>
            </div>
        </div>
    );
};

export default RolesUsageAdmin;
