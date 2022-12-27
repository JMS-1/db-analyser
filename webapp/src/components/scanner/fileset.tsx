import { clsx } from 'clsx'
import * as React from 'react'

import { CsvFile, IBuchung } from './file'
import styles from './fileset.module.scss'

interface IFilesetProps {
    className?: string
    files: CsvFile[]
}

export const Fileset: React.FC<IFilesetProps> = (props) => {
    const { files } = props

    const [changes, setChanges] = React.useState(0)

    const analyseDone = React.useCallback(() => setChanges((c) => c + 1), [])

    React.useEffect(() => files.forEach((f) => f.analyse(analyseDone)), [files, analyseDone])

    const buchungen = React.useMemo(
        () =>
            changes
                ? Object.values(
                      files
                          .flatMap((f) => f.buchungen)
                          .reduce((m: Record<string, IBuchung>, b) => ((m[JSON.stringify(b)] = b), m), {})
                  ).sort(
                      (l, r) =>
                          l.date.localeCompare(r.date) || l.what.localeCompare(r.what) || Math.abs(l.amount - r.amount)
                  )
                : [],
        [files, changes]
    )

    return (
        <div className={clsx(styles.files, props.className)}>
            {buchungen.map((f, i) => (
                <div key={i}>{JSON.stringify(f)}</div>
            ))}
        </div>
    )
}
