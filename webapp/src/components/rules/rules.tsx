import { clsx } from 'clsx'
import * as React from 'react'

import styles from './rules.module.scss'

import { strings } from '../../strings'
import { SettingsContext } from '../settings/settings'

interface IRulesProps {
    className?: string
    onAnalyse(): void
}

export const Rules: React.FC<IRulesProps> = (props) => {
    const { onAnalyse } = props

    const { load, save, categories, update } = React.useContext(SettingsContext)

    const uploader = React.useRef<HTMLInputElement>(null)

    const [edit, setEdit] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [name, setName] = React.useState('')
    const [open, setOpen] = React.useState(false)
    const [rules, setRules] = React.useState('')
    const [selected, setSelected] = React.useState('')

    function reset(selected: string, categories: Record<string, string[]>): void {
        const current = Object.entries(categories).find((e) => e[0] === selected)?.[1]

        setName(selected)
        setRules(current?.join('\n') || '')
    }

    const onOpen = React.useCallback(() => setOpen((o) => !o), [])

    const onCancel = React.useCallback(() => {
        if (edit) {
            setEdit(false)

            reset(selected, categories)
        } else {
            setSelected('')

            setOpen(false)
        }
    }, [edit, selected, categories])

    const doExport = React.useCallback(() => save(), [save])

    const doImport = React.useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            const files = ev.target.files || []
            const file = files.length === 1 && files[0]

            if (!file) {
                return
            }

            setLoading(true)

            load(file).then(() => {
                setLoading(false)
                setSelected('')

                onAnalyse()
            })
        },
        [load, onAnalyse]
    )

    const startUpload = React.useCallback(() => uploader.current?.click(), [])

    const onSelect = React.useCallback((ev: React.ChangeEvent<HTMLSelectElement>) => setSelected(ev.target.value), [])

    const onSetName = React.useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
        setName(ev.target.value)
        setEdit(true)
    }, [])

    const onSetRules = React.useCallback((ev: React.ChangeEvent<HTMLTextAreaElement>) => {
        setRules(ev.target.value)
        setEdit(true)
    }, [])

    React.useEffect(() => reset(selected, categories), [selected, categories])

    const canSave = React.useMemo(() => {
        if (!name || !edit) {
            return false
        }

        const allowed = new Set(Object.keys(categories))

        if (selected) {
            allowed.delete(selected)
        }

        if (allowed.has(name)) {
            return false
        }

        for (const rule of rules.split('\n')) {
            try {
                new RegExp(rule)
            } catch (error) {
                return false
            }
        }

        return true
    }, [name, edit, categories, selected, rules])

    const onUpdate = React.useCallback(() => {
        const newCategories = { ...categories }

        if (selected) {
            delete newCategories[selected]
        }

        newCategories[name] = rules.split('\n').filter((r) => r)

        update('categories', newCategories)

        setEdit(false)
        setSelected(name)

        onAnalyse()
    }, [categories, name, onAnalyse, rules, selected, update])

    const onDelete = React.useCallback(() => {
        if (!selected) {
            return
        }

        const newCategories = { ...categories }

        delete newCategories[selected]

        update('categories', newCategories)

        setEdit(false)
        setSelected('')

        onAnalyse()
    }, [categories, onAnalyse, selected, update])

    return (
        <>
            <button className={clsx(styles.rules, props.className)} onClick={onOpen}>
                {strings.rules}
            </button>
            {open && (
                <div className={clsx(styles.dialog, loading && styles.loading)}>
                    <div>
                        <div className={styles.title}>{strings.rules}</div>
                        <div className={styles.form}>
                            <select disabled={edit} value={selected} onChange={onSelect}>
                                <option value=''>{strings.newRule}</option>
                                {Object.keys(categories)
                                    .sort((l, r) => l.localeCompare(r))
                                    .map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                            </select>
                            <input type='text' value={name} onChange={onSetName} />
                            <textarea value={rules} onChange={onSetRules} />
                        </div>
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
                                <button disabled={edit} onClick={startUpload}>
                                    {strings.loadFrom}
                                </button>
                            </label>
                            <button disabled={!canSave} onClick={canSave ? onUpdate : undefined}>
                                {strings.save}
                            </button>
                            <button disabled={!selected} onClick={selected ? onDelete : undefined}>
                                {strings.remove}
                            </button>
                            <button onClick={onCancel}>{edit ? strings.cancel : strings.close}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
