import styled from 'styled-components'

const NoResults = styled.div`
  background-color: ${({ theme }) => theme.colors.darkestGrey};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  border: 1px solid ${({ theme }) => theme.colors.darkGrey};
  color: ${({ theme }) => theme.colors.cream};
  display: block;
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: ${({ theme: { common } }) => common.space}px;
  margin-top: 0;
  padding: ${({ theme: { common } }) => common.space * 3}px
    ${({ theme: { common } }) => common.space * 4}px;
  text-align: left;
`

const Description = styled.span`
  display: block;
  font-weight: 300;
  font-size: 1.4rem;
  color: ${({ theme }) => theme.colors.darkCream};
  opacity: 0.8;
`

export const NoResultsMessage: React.FC<{ description?: string; text: string }> = ({
  description,
  text,
  ...restProps
}) => {
  return (
    <NoResults {...restProps}>
      {text} {description && <Description>{description}</Description>}
    </NoResults>
  )
}
