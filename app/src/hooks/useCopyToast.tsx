import { Toast, toast } from 'react-hot-toast'
import { ToastComponent } from '@/src/components/toast/ToastComponent'

export const useCopyToast = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const copy = (e: any, message: string) => {
    e.stopPropagation()
    e.preventDefault()

    const timeDelay = 2500

    navigator.clipboard.writeText(message)
    toast.custom(
      (t: Toast) => {
        return <ToastComponent autoWidth message={'Copied to the clipboard'} t={t} />
      },
      {
        duration: timeDelay,
        position: 'top-center',
        id: 'copy-to-clipboard',
      },
    )
  }

  return { copy }
}
