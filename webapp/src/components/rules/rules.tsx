import { clsx } from 'clsx'
import * as React from 'react'

import styles from './rules.module.scss'

import { strings } from '../../strings'
import { useSettings } from '../settings/settings'

interface IRulesProps {
    className?: string
    onAnalyse(): void
}

export const Rules: React.FC<IRulesProps> = (props) => {
    const { onAnalyse } = props

    const settings = useSettings()

    const uploader = React.useRef<HTMLInputElement>(null)

    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)

    const toggle = React.useCallback(() => setOpen((o) => !o), [])

    const close = React.useCallback((ev: React.MouseEvent<HTMLDivElement>) => {
        if (ev.target === ev.currentTarget) {
            setOpen(false)
        }
    }, [])

    const doExport = React.useCallback(() => settings.save(), [settings])

    const doImport = React.useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            const files = ev.target.files || []
            const file = files.length === 1 && files[0]

            if (!file) {
                return
            }

            setLoading(true)

            settings.load(file).then(() => {
                setLoading(false)

                onAnalyse()
            })
        },
        [settings, onAnalyse]
    )

    const startUpload = React.useCallback(() => uploader.current?.click(), [])

    return (
        <>
            <button className={clsx(styles.rules, props.className)} onClick={toggle}>
                {strings.rules}
            </button>
            {open && (
                <div className={clsx(styles.dialog, loading && styles.loading)} onClick={close}>
                    <div>
                        <div className={styles.title}>[TITLE]</div>
                        <div>[CONTENT]</div>
                        <div className={styles.actions}>
                            <button onClick={doExport}>{strings.saveAs}</button>
                            <label>
                                <input
                                    ref={uploader}
                                    accept='application/json'
                                    type='file'
                                    value=''
                                    onChange={doImport}
                                />
                                <button onClick={startUpload}>{strings.loadFrom}</button>
                            </label>
                            <button>{strings.cancel}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
