import styled from 'styled-components'

export const MainTabsWrapper = styled.div`
  --mains-tab-wrapper-border-radius: 8px;

  background-color: ${({ theme: { colors } }) => colors.cream};
  border-radius: var(--mains-tab-wrapper-border-radius);
  border: 2px solid ${({ theme: { colors } }) => colors.cream};
`

export const Tabs = styled.nav`
  background-color: ${({ theme }) => theme.colors.creamLight};
  border-bottom: 1px solid ${({ theme }) => theme.colors.cream};
  border-top-left-radius: var(--mains-tab-wrapper-border-radius);
  border-top-right-radius: var(--mains-tab-wrapper-border-radius);
  display: flex;
`

export const TabContentInner = styled.div`
  display: flex;
  flex-direction: column;
  padding: calc(var(--theme-common-space) * 3) calc(var(--theme-common-space) * 2);
  row-gap: calc(var(--theme-common-space) * 3);
`
