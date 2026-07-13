import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useMutation} from '@apollo/client';
import {useTranslation} from 'react-i18next';
import {Button} from '@jahia/moonstone';
import styles from './RolesUsage.scss';
import {REMOVE_ORPHANED_ACES} from './RolesUsage.gql';

export const OrphanedAces = ({orphans, onCleanupDone}) => {
    const {t} = useTranslation('support-roles-usage');
    const [showConfirm, setShowConfirm] = useState(false);
    const [actionStatus, setActionStatus] = useState(null);
    const [removedCount, setRemovedCount] = useState(0);

    const [removeOrphanedAces, {loading: removing}] = useMutation(REMOVE_ORPHANED_ACES);

    const handleRemove = async () => {
        setShowConfirm(false);
        setActionStatus(null);
        try {
            const result = await removeOrphanedAces({variables: {skipPrincipals: []}});
            const removed = result.data?.supportRolesUsage?.removeOrphanedAces ?? [];
            setRemovedCount(removed.length);
            setActionStatus('removeSuccess');
            onCleanupDone();
        } catch (err) {
            console.error('Failed to remove orphaned ACEs:', err);
            setActionStatus('removeError');
        }
    };

    return (
        <div>
            <p className={styles.ru_hint}>{t('label.orphansDescription')}</p>

            {actionStatus === 'removeSuccess' && (
                <div className={`${styles.ru_alert} ${styles['ru_alert--success']}`} role="status">
                    {t('label.removeSuccess', {count: removedCount})}
                </div>
            )}
            {actionStatus === 'removeError' && (
                <div className={`${styles.ru_alert} ${styles['ru_alert--error']}`} role="alert">
                    {t('label.removeError')}
                </div>
            )}

            {orphans.length === 0 ? (
                <p className={styles.ru_emptyMsg}>{t('label.orphansEmpty')}</p>
            ) : (
                <>
                    <table className={styles.ru_table}>
                        <thead>
                            <tr>
                                <th scope="col">{t('label.colWorkspace')}</th>
                                <th scope="col">{t('label.colAceType')}</th>
                                <th scope="col">{t('label.colPrincipal')}</th>
                                <th scope="col">{t('label.colPath')}</th>
                                <th scope="col">{t('label.colRoles')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orphans.map(ace => (
                                <tr key={`${ace.workspace}-${ace.path}-${ace.principal}-${ace.external}`}>
                                    <td>{ace.workspace}</td>
                                    <td>{ace.aceType}</td>
                                    <td>{ace.principal}</td>
                                    <td className={styles.ru_pathCell}>{ace.path}</td>
                                    <td>{ace.roles.join(', ')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className={styles.ru_actions}>
                        <Button
                            id="ru-remove-orphans"
                            type="button"
                            label={t('label.removeAll')}
                            variant="destructive"
                            isDisabled={removing}
                            onClick={() => setShowConfirm(true)}
                        />
                    </div>
                </>
            )}

            {showConfirm && (
                <div className={styles.ru_dialogOverlay}>
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="ru-confirm-title"
                        aria-describedby="ru-confirm-desc"
                        className={styles.ru_dialog}
                    >
                        <h3 id="ru-confirm-title" className={styles.ru_dialogTitle}>{t('label.confirmTitle')}</h3>
                        <p id="ru-confirm-desc" className={styles.ru_dialogDesc}>
                            {t('label.confirmMessage', {count: orphans.length})}
                        </p>
                        <p className={styles.ru_dialogWarning}>{t('label.confirmLdapWarning')}</p>
                        <div className={styles.ru_dialogActions}>
                            <button
                                id="ru-confirm-remove"
                                type="button"
                                className={styles.ru_dialogConfirmBtn}
                                onClick={handleRemove}
                            >
                                {t('label.confirmRemove')}
                            </button>
                            <button
                                id="ru-cancel-remove"
                                type="button"
                                className={styles.ru_dialogCancelBtn}
                                onClick={() => setShowConfirm(false)}
                            >
                                {t('label.cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

OrphanedAces.propTypes = {
    orphans: PropTypes.array.isRequired,
    onCleanupDone: PropTypes.func.isRequired
};
