'use client'

import { useEffect, useState } from 'react'
import { Modal } from '@/src/components/modal'
import { SelectWallet } from '@/src/components/wallet/SelectWallet'
import { useConnection } from 'wagmi'

export const ModalConnectWallet: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const connection = useConnection()

  useEffect(() => {
    const handleOpenModal = () => {
      setIsOpen(true)
    }

    window.addEventListener('openConnectModal', handleOpenModal)
    return () => {
      window.removeEventListener('openConnectModal', handleOpenModal)
    }
  }, [])

  useEffect(() => {
    if (connection.isConnected && isOpen) {
      setIsOpen(false)
    }
  }, [connection.isConnected, isOpen])

  if (!isOpen) return null

  return (
    <Modal onClose={() => setIsOpen(false)} size="lg">
      <SelectWallet />
    </Modal>
  )
}
