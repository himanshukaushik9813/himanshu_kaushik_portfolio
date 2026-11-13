import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Check, Copy, X } from 'lucide-react'
import { Arrow } from '@/components/ui/Arrow'
import { lockScroll } from '@/motion/lenis'
import './email-dialog.css'

export interface EmailDialogHandle { open(): void }

const gmailUrl = (to: string) => `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}`

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Older / insecure contexts: a temporary selection + execCommand fallback.
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      return ok
    } catch {
      return false
    }
  }
}

/**
 * Email dialog (REFERENCE_ANALYSIS §6.11 / §8): opened by the Email contact row.
 * "Copy email" (clipboard, result announced through an aria-live status) and "Open Gmail" (compose window).
 * Native <dialog> with showModal(): focus is trapped and restored, Esc and the backdrop close it,
 * page scroll is locked while open. CSS keyframes `email-dialog-in`, as in the reference.
 */
export const EmailDialog = forwardRef<EmailDialogHandle, { email: string }>(function EmailDialog({ email }, ref) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const resetTimer = useRef(0)

  const close = useCallback(() => dialogRef.current?.close(), [])
  useImperativeHandle(ref, () => ({
    open() {
      const d = dialogRef.current
      if (!d || d.open) return
      setStatus('idle')
      d.showModal()
      d.querySelector<HTMLElement>('[data-email-copy]')?.focus()
      lockScroll(true)
    },
  }), [])

  useEffect(() => {
    const d = dialogRef.current
    if (!d) return
    const onClose = () => { lockScroll(false); window.clearTimeout(resetTimer.current) }
    const onClick = (e: MouseEvent) => { if (e.target === d) d.close() } // backdrop
    // Keep Tab inside the dialog (a modal <dialog> alone lets focus escape to the browser chrome).
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const items = Array.from(d.querySelectorAll<HTMLElement>('button, a[href]'))
      if (!items.length) return
      const first = items[0]!
      const last = items[items.length - 1]!
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    d.addEventListener('keydown', onKey)
    d.addEventListener('close', onClose)
    d.addEventListener('click', onClick)
    return () => {
      d.removeEventListener('close', onClose)
      d.removeEventListener('click', onClick)
      d.removeEventListener('keydown', onKey)
      if (d.open) { d.close(); lockScroll(false) }
    }
  }, [])

  const onCopy = async () => {
    const ok = await copyText(email)
    setStatus(ok ? 'copied' : 'failed')
    window.clearTimeout(resetTimer.current)
    resetTimer.current = window.setTimeout(() => setStatus('idle'), 2600)
  }

  return (
    <dialog ref={dialogRef} className="email-dialog" aria-labelledby="email-dialog-title" aria-describedby="email-dialog-address" aria-modal="true">
      <div className="email-dialog__panel">
        <div className="email-dialog__head">
          <span id="email-dialog-title" className="meta">Email</span>
          <button type="button" className="email-dialog__close" onClick={close} aria-label="Close">
            <X size={18} strokeWidth={1.6} />
          </button>
        </div>
        <p id="email-dialog-address" className="email-dialog__address">
          {email.split('@')[0]}@<wbr />{email.split('@')[1]}
        </p>
        <div className="email-dialog__actions">
          <button type="button" className="email-dialog__btn email-dialog__btn--primary" onClick={onCopy} data-email-copy>
            {status === 'copied' ? <Check size={16} strokeWidth={2} /> : <Copy size={16} strokeWidth={1.8} />}
            <span>{status === 'copied' ? 'Copied' : 'Copy email'}</span>
          </button>
          <a className="email-dialog__btn" href={gmailUrl(email)} target="_blank" rel="noreferrer" data-email-gmail onClick={() => close()}>
            <span>Open Gmail</span>
            <Arrow size={12} stroke={1.8} />
          </a>
        </div>
        <p className="email-dialog__status" role="status" aria-live="polite">
          {status === 'copied' ? 'Email address copied to clipboard.' : status === 'failed' ? 'Couldn’t copy automatically. Select the address above to copy it.' : ''}
        </p>
      </div>
    </dialog>
  )
})
