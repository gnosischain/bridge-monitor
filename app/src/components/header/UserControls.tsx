import { ButtonConnect } from '@/src/components/buttons/ButtonConnect'
import { UserDropdown } from '@/src/components/header/UserDropdown'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

export const UserControls: React.FC = () => {
  const { connectWallet, isWalletConnected } = useWeb3Connection()

  return isWalletConnected ? (
    <UserDropdown />
  ) : (
    <ButtonConnect onClick={connectWallet}>Connect Wallet</ButtonConnect>
  )
}
