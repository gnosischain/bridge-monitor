import styled from 'styled-components'

import { Cell, Pie, PieChart } from 'recharts'

import { Status } from '@/src/components/assets/Status'
import { Tooltip } from '@/src/components/tooltip/Tooltip'
import { TokenIcon } from '@/src/components/token/TokenIcon'

const LabelWrapper = styled.div`
  column-gap: ${({ theme: { common } }) => common.space}px;
  display: flex;
`

const Badge = styled.div<{ backgroundColor?: string }>`
  --size: 10px;

  background-color: ${({ backgroundColor }) => backgroundColor};
  border-radius: 50%;
  height: var(--size);
  margin-top: 4px;
  width: var(--size);
`

Badge.defaultProps = {
  backgroundColor: '#fff',
}

const LabelContentsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: ${({ theme: { common } }) => common.space}px;
`

const LabelTitleWrapper = styled.div`
  align-items: center;
  column-gap: ${({ theme: { common } }) => common.space / 2}px;
  display: flex;
`

const LabelTitle = styled.span`
  color: ${({ theme: { colors } }) => colors.cream};
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
`

const LabelValue = styled.span`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.cream};
  column-gap: ${({ theme: { common } }) => common.space}px;
  display: flex;
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
`

type satus = {
  title: string
  value: number
  tooltip?: string
}

const Label: React.FC<{ status: satus; tokenSymbol: string; color: string }> = ({
  color,
  status,
  tokenSymbol,
  ...restProps
}) => {
  const { title, tooltip, value } = status

  return (
    <LabelWrapper {...restProps}>
      <Badge backgroundColor={color} />
      <LabelContentsWrapper>
        <LabelTitleWrapper>
          <LabelTitle>{title}</LabelTitle>
          {tooltip && <Tooltip content={tooltip} />}
        </LabelTitleWrapper>
        <LabelValue>
          <TokenIcon symbol={tokenSymbol} /> {value}
        </LabelValue>
      </LabelContentsWrapper>
    </LabelWrapper>
  )
}

const Wrapper = styled.div`
  background: ${({ theme: { colors } }) => colors.darkestGrey};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  padding: ${({ theme: { common } }) => common.space * 2}px;
`

const Head = styled.div`
  align-items: center;
  column-gap: 10px;
  display: flex;
  margin-bottom: 12px;
`

const Title = styled.h2`
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
`

const Contents = styled.div`
  column-gap: ${({ theme: { common } }) => common.space * 2}px;
  row-gap: ${({ theme: { common } }) => common.space * 2}px;
  display: flex;
  flex-direction: column;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    flex-direction: row;
  }
`

const Labels = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: ${({ theme: { common } }) => common.space * 2}px;
`

export const Chart: React.FC<{
  currentEarnedInterest: number
  tokenSymbol: string
  tokensNotBeingInvested: number
  underlyingTokensInvested: number
}> = ({
  currentEarnedInterest,
  tokenSymbol,
  tokensNotBeingInvested,
  underlyingTokensInvested,
  ...restProps
}) => {
  const data: satus[] = [
    { title: 'Tokens not being invested', value: tokensNotBeingInvested },
    {
      title: 'Underlying tokens invested',
      value: underlyingTokensInvested,
    },
    { title: 'Current earned interest', value: currentEarnedInterest },
  ]

  const chartColors = ['#2B9D9D', '#2B5F9D', '#6C44C1']
  const chartSize = 165
  const outerRadius = chartSize / 2
  const innerRadius = outerRadius - 55

  return (
    <Wrapper {...restProps}>
      <Head>
        <Status />
        <Title>Status</Title>
      </Head>
      <Contents>
        <PieChart height={chartSize} width={chartSize}>
          <Pie
            cx="50%"
            cy="50%"
            data={data}
            dataKey="value"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell fill={chartColors[index % chartColors.length]} key={`cell-${index}`} />
            ))}
          </Pie>
        </PieChart>
        <Labels>
          {data.map((item, index) => (
            <Label color={chartColors[index]} key={index} status={item} tokenSymbol={tokenSymbol} />
          ))}
        </Labels>
      </Contents>
    </Wrapper>
  )
}
