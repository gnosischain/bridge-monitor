import styled from 'styled-components'

import { IconStatus, Status } from './IconStatus'

const Wrapper = styled.div`
  --line-gap: 24px;
  --status-height: 64px;
  --wrapper-width: 155px;

  display: grid;
  align-items: center;
  grid-template-columns: 1fr;
  position: relative;
  row-gap: calc(var(--theme-common-space) * 2);
  text-align: right;

  &:last-child {
    .details {
      padding-bottom: 0;
    }
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    column-gap: 50px;
    grid-template-columns: minmax(0, 950px) var(--wrapper-width);
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    &::after {
      background-color: ${({ theme: { colors } }) => colors.creamDarker};
      border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
      content: '';
      height: calc(100% - var(--line-gap) - var(--status-height));
      right: calc(var(--wrapper-width) / 2);
      position: absolute;
      top: calc(var(--status-height) + 2 * var(--line-gap));
      width: 8px;
    }

    &:last-child::after {
      display: none;
    }
  }
`

const StatusWrapper = styled.div`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.creamDarker};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  column-gap: var(--theme-common-space);
  display: flex;
  height: var(--status-height);
  padding: 0 var(--theme-common-space);
  order: 0;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    margin-top: 33px;
    margin-bottom: 33px;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    order: 1;
  }
`

const Icon = styled(IconStatus)`
  --size: 28px;

  background-color: ${({ theme: { colors } }) => colors.cream};
  height: var(--size);
  width: var(--size);
`

const TransactionStatus = styled.h2`
  color: ${({ theme: { colors } }) => colors.primary};
  font-size: 1.6rem;
  font-weight: 500;
  line-height: 1.2;
  margin: 0;
  text-transform: uppercase;
`

const Details = styled.div`
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  order: 1;
  display: flex;
  flex-direction: column;
  gap: var(--theme-common-space);
  align-items: center;
  justify-content: center;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    order: 0;
    align-items: end;
  }
`

Details.defaultProps = {
  className: 'details',
}

const Title = styled.h3`
  color: ${({ theme: { colors } }) => colors.primary};
  font-size: 1.8rem;
  font-weight: 500;
  line-height: 1.2;
  margin: 0;
  text-align: center;
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    align-items: end;
    text-align: right;
  }
`

const Description = styled.p`
  color: ${({ theme: { colors } }) => colors.error};
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 1.5;
  margin: 0 0 calc(var(--theme-common-space) * 3);
  white-space: pre-wrap;
  word-break: break-word;
  text-align: center;

  &:last-child {
    margin-bottom: 0;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    align-items: end;
    text-align: right;
  }
`

interface Props {
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
      <Details>
        <Title>{title}</Title>
        <Description>{description}</Description>
        {children}
      </Details>
      <StatusWrapper>
        <Icon statusIcon={statusIcon} />
        <TransactionStatus>{transactionStatus}</TransactionStatus>
      </StatusWrapper>
    </Wrapper>
  )
}
