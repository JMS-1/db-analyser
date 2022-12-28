import { clsx } from 'clsx'
import * as React from 'react'

import { IBuchung } from './file'
import styles from './group.module.scss'

import { strings } from '../../strings'

interface IGroupProps {
    className?: string
    rule: string
    members: IBuchung[]
}

export const Group: React.FC<IGroupProps> = (props) => {
    const { members, rule } = props

    const [expanded, setExpanded] = React.useState(!rule)

    const toggleExpand = React.useCallback(() => setExpanded((e) => !e), [])

    const total = React.useMemo(() => Math.round(100 * members.reduce((s, m) => s + m.amount, 0)) / 100, [members])

    return (
        <div className={clsx(styles.group, props.className)}>
            <div className={styles.header} onClick={toggleExpand}>
                <span>{expanded ? '⊟' : '⊞'}</span>
                <span>
                    {rule || strings.noCategory} {total}€ ({props.members.length})
                </span>
            </div>
            {expanded && (
                <div className={styles.details}>
                    {members.map((m, i) => (
                        <React.Fragment key={i}>
                            <span>{m.date}</span>
                            <span>{(m.amount ?? 0).toFixed(2)}€</span>
                            <span>{m.what}</span>
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    )
}
