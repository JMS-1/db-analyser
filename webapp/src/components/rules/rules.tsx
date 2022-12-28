import { clsx } from 'clsx'
import * as React from 'react'

import styles from './rules.module.scss'

import { strings } from '../../strings'

interface IRulesProps {
    className?: string
}

export const Rules: React.FC<IRulesProps> = (props) => {
    const [open, setOpen] = React.useState(false)

    const toggle = React.useCallback(() => setOpen((o) => !o), [])

    const close = React.useCallback((ev: React.MouseEvent<HTMLDivElement>) => {
        if (ev.target === ev.currentTarget) {
            setOpen(false)
        }
    }, [])

    return (
        <>
            <button className={clsx(styles.rules, props.className)} onClick={toggle}>
                {strings.rules}
            </button>
            {open && (
                <div className={styles.dialog} onClick={close}>
                    <div>[HI]</div>
                </div>
            )}
        </>
    )
}
