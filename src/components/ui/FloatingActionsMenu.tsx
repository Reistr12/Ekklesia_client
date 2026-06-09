import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type FloatingActionsMenuProps = {
  isOpen: boolean
  top: number
  left: number
  onClose: () => void
  children: ReactNode
  widthClassName?: string
}

export function FloatingActionsMenu({
  isOpen,
  top,
  left,
  onClose,
  children,
  widthClassName = 'w-36',
}: FloatingActionsMenuProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) {
        return
      }

      const target = event.target as Node
      if (containerRef.current.contains(target)) {
        return
      }

      onClose()
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    window.addEventListener('scroll', onClose, true)
    window.addEventListener('resize', onClose)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      window.removeEventListener('scroll', onClose, true)
      window.removeEventListener('resize', onClose)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return createPortal(
    <div
      ref={containerRef}
      className={`fixed z-[70] ${widthClassName} rounded-xl border border-slate-200 bg-white p-1 shadow-soft`}
      style={{ top, left }}
      data-floating-actions-menu
    >
      {children}
    </div>,
    document.body,
  )
}
