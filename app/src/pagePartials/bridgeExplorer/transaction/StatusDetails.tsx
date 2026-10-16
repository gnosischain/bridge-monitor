import styled from 'styled-components'
import { EyebrowCSS } from '@/src/components/text/Eyebrow'

import { IconStatus, Status } from '@/src/pagePartials/bridgeExplorer/transaction/IconStatus'

const Wrapper = styled.div`
  --icon-size: 28px;

  column-gap: calc(var(--theme-common-space) * 2);
  display: grid;
  grid-template-columns: var(--icon-size) minmax(0, 1fr);
  position: relative;

  &::after {
    background-color: ${({ theme: { colors } }) => colors.line};
    bottom: 4px;
    content: '';
    left: calc(var(--icon-size) / 2 - 1px);
    position: absolute;
    top: calc(var(--icon-size) + 4px);
    width: 2px;
  }

  &:last-child {
    &::after {
      display: none;
    }

    .details {
      padding-bottom: 0;
    }
  }
`

const Icon = styled(IconStatus)`
  height: var(--icon-size);
  width: var(--icon-size);
`

const Head = styled.div`
  align-items: center;
  column-gap: calc(var(--theme-common-space) * 1.5);
  display: flex;
  flex-wrap: wrap;
  min-height: var(--icon-size);
  row-gap: 4px;
`

const TransactionStatus = styled.span`
  ${EyebrowCSS}

  font-size: 1rem;
`

const Details = styled.div`
  min-width: 0;
  padding-bottom: calc(var(--theme-common-space) * 4);
`

Details.defaultProps = {
  className: 'details',
}

const Title = styled.h3`
  color: ${({ theme: { colors } }) => colors.ink};
  font-size: 1.7rem;
  font-weight: 600;
  line-height: 1.3;
  margin: 0;
`

const Description = styled.p`
  color: ${({ theme: { colors } }) => colors.fog};
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1.5;
  margin: 2px 0 calc(var(--theme-common-space) * 2);
  white-space: pre-wrap;
  word-break: break-word;

  &:last-child {
    margin-bottom: 0;
  }
`

interface Props {
  children?: React.ReactNode
  description: string
  title: string
  transactionStatus: string
  statusIcon: Status
}

export const StatusDetails: React.FC<Props> = ({
  children,
  description,
  statusIcon,
  title,
  transactionStatus,
  ...restProps
}) => {
  return (
    <Wrapper {...restProps}>
      <Icon statusIcon={statusIcon} />
      <Details>
        <Head>
          <Title>{title}</Title>
          <TransactionStatus>{transactionStatus}</TransactionStatus>
        </Head>
        <Description>{description}</Description>
        {children}
      </Details>
    </Wrapper>
  )
}
