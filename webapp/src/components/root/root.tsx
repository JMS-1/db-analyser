import * as React from 'react'

import styles from './root.module.scss'

interface IRootProps {
    className?: string
}

export const Root: React.FC<IRootProps> = () => {
    return <div className={styles.root}>HELLO</div>
}
