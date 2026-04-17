import React from 'react'
import styled from 'styled-components'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { ButtonPlaceholder } from './ButtonPlaceholder'

const BottomInfo = styled.p`
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
  text-align: center;
  color: rgb(221, 113, 67);

  a {
    color: rgb(221, 113, 67);
  }
`

interface ButtonPlaceholderWithWarningProps {
  action: string
}

export const ButtonPlaceholderWithWarning: React.FC<ButtonPlaceholderWithWarningProps> = ({
  action,
}) => {
  const { address, isSCWallet } = useWeb3Connection()
  const myTxsLink = `/bridge-explorer/my-transactions?hash=${address}`

  return (
    <>
      <ButtonPlaceholder />
      {isSCWallet &&
        (action === 'approving' ? (
          <BottomInfo>
            When using a smart contract wallet, if transaction is executed but the approving status
            remains unchanged, just reload the page and insert the same amount for bridge.
          </BottomInfo>
        ) : (
          <BottomInfo>
            When using a smart contract wallet, if the transaction is executed but the {action}{' '}
            status remains unchanged, go to <a href={myTxsLink}>My Transactions</a> page.
          </BottomInfo>
        ))}
    </>
  )
}
