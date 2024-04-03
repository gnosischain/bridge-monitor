import { Toast, Toaster, toast } from 'react-hot-toast'

import { Failed as FailedIcon } from '@/src/components/assets/Failed'
import { Success as SuccessIcon } from '@/src/components/assets/Success'
import { Spinner } from '@/src/components/loading/Spinner'
import { ToastComponent } from '@/src/components/toast/ToastComponent'
import { ToastStates } from '@/src/constants/types'

type ToastComponentProps = {
  explorerUrl?: string
  message?: string
  t: Toast
  title?: string
}

type ToastTypes = {
  [ToastStates.waiting]: ({ explorerUrl, message, t }: ToastComponentProps) => JSX.Element
  [ToastStates.failed]: ({ explorerUrl, message, t }: ToastComponentProps) => JSX.Element
  [ToastStates.success]: ({ explorerUrl, message, t }: ToastComponentProps) => JSX.Element
}

const ToastTypes: ToastTypes = {
  [ToastStates.waiting]: ({ explorerUrl, message, t, title }: ToastComponentProps) => (
    <ToastComponent
      icon={<Spinner dimensions="25px" />}
      link={explorerUrl ? { url: explorerUrl, text: 'Click to verify on explorer' } : undefined}
      message={message ? message : undefined}
      t={t}
      title={title ? title : 'Transaction Sent'}
      type={ToastStates.waiting}
    />
  ),
  [ToastStates.failed]: ({ explorerUrl, message, t, title }: ToastComponentProps) => (
    <ToastComponent
      icon={<FailedIcon />}
      link={explorerUrl ? { url: explorerUrl, text: 'Click to see on explorer' } : undefined}
      message={message ? message : undefined}
      t={t}
      title={title ? title : 'Transaction Failed'}
      type={ToastStates.failed}
    />
  ),
  [ToastStates.success]: ({ explorerUrl, message, t, title }: ToastComponentProps) => (
    <ToastComponent
      icon={<SuccessIcon />}
      link={explorerUrl ? { url: explorerUrl, text: 'Click to verify on explorer' } : undefined}
      message={message ? message : undefined}
      t={t}
      title={title ? title : 'Transaction confirmed'}
      type={ToastStates.success}
    />
  ),
}

const notify = ({
  explorerUrl,
  id,
  message,
  title,
  type,
}: {
  explorerUrl?: string
  id?: string | undefined
  message?: string
  title?: string
  type: ToastStates
}) => {
  toast.custom((t: Toast) => ToastTypes[type]({ title, t, explorerUrl, message }), { id })
}

const Toast = () => (
  <Toaster
    position="bottom-right"
    toastOptions={{
      duration: 10000,
    }}
  />
)

export default Toast
export { notify }
