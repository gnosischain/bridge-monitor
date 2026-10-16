import styled from 'styled-components'
import { EyebrowCSS } from '@/src/components/text/Eyebrow'

import { IconStatus, Status } from './IconStatus'

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

const Details = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding-bottom: calc(var(--theme-common-space) * 3.5);
  row-gap: 4px;
`

Details.defaultProps = {
  className: 'details',
}

const TransactionStatus = styled.span`
  ${EyebrowCSS}

  font-size: 1rem;
  line-height: 16px;
  margin-top: calc((var(--icon-size) - 16px) / 2);
`

const Title = styled.h3`
  color: ${({ theme: { colors } }) => colors.ink};
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.6rem;
  font-weight: 600;
  line-height: 1.35;
  margin: 0;
`

const Description = styled.p`
  color: ${({ theme: { colors } }) => colors.violet};
  font-size: 1.4rem;
  font-weight: 500;
  line-height: 1.5;
  margin: 0 0 calc(var(--theme-common-space) / 2);
  white-space: pre-wrap;
  word-break: break-word;
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
        <TransactionStatus>{transactionStatus}</TransactionStatus>
        <Title>{title}</Title>
        {description && <Description>{description}</Description>}
        {children}
      </Details>
    </Wrapper>
  )
}
