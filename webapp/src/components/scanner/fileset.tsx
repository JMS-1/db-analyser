import { clsx } from 'clsx'
import * as React from 'react'

import { CsvFile, IBuchung } from './file'
import styles from './fileset.module.scss'
import { Group } from './group'

import { SettingsContext } from '../settings/settings'

interface IFilesetProps {
    className?: string
    files: CsvFile[]
    onGroups(groups: [string, IBuchung[]][]): void
}

export const Fileset: React.FC<IFilesetProps> = (props) => {
    const { files, onGroups } = props

    const { categories } = React.useContext(SettingsContext)

    console.log(JSON.stringify(categories))

    const [changes, setChanges] = React.useState(1)

    const analyseDone = React.useCallback(() => setChanges((c) => c + 1), [])

    React.useEffect(() => files.forEach((f) => f.analyse(analyseDone)), [files, categories, analyseDone])

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

    const rules = React.useMemo(
        () =>
            Object.entries(categories).map(([name, rules]) => ({
                name,
                rules: rules.map((r) => {
                    try {
                        return new RegExp(r)
                    } catch (error) {
                        return null
                    }
                }),
            })),
        [categories]
    )

    const categorized = React.useMemo(
        () =>
            buchungen.map((b) => ({
                ...b,
                rules: rules
                    .filter((r) => r.rules.some((r) => r?.test(b.what)))
                    .map((r) => r.name)
                    .join(', '),
            })),
        [buchungen, rules]
    )

    const grouped = React.useMemo(
        () =>
            Object.entries(
                categorized.reduce((m: Record<string, IBuchung[]>, c) => {
                    const list = m[c.rules]

                    if (list) {
                        list.push(c)
                    } else {
                        m[c.rules] = [c]
                    }

                    return m
                }, {})
            ).sort((l, r) => (!l[0] === !r[0] ? l[0].localeCompare(r[0]) : l[0] ? -1 : +1)),
        [categorized]
    )

    React.useEffect(() => onGroups(grouped), [grouped, onGroups])

    return (
        <div className={clsx(styles.files, props.className)}>
            <div>
                {grouped.map((g) => (
                    <Group key={g[0]} members={g[1]} rule={g[0]} />
                ))}
            </div>
        </div>
    )
}
