import './index.scss'

import * as React from 'react'
import { createRoot } from 'react-dom/client'

import { Root } from './components/root/root'

document.body.classList.add('semantic-loaded')

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.querySelector('body > client-root')!).render(<Root />)

document.onkeyup = (ev): void => {
    if (!ev.ctrlKey) {
        return
    }

    const delta = ev.key === '+' ? +1 : ev.key === '-' ? -1 : 0

    if (!delta) {
        return
    }

    const html = document.documentElement
    const old = html.style.fontSize || '14px'
    const size = Math.max(14, parseInt(old) + delta)

    html.style.fontSize = `${size}px`
}
