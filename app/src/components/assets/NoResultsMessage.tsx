import React from 'react'
import styled from 'styled-components'

const NoResults = styled.strong`
  display: block;
  background-color: ${({ theme }) => theme.colors.darkestGrey};
  border: 1px solid ${({ theme }) => theme.colors.darkGrey};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  color: ${({ theme }) => theme.colors.cream};
  font-size: 1.6rem;
  font-weight: 600;
  padding: ${({ theme: { common } }) => common.space * 3}px
    ${({ theme: { common } }) => common.space * 4}px;
  margin-top: 0;
  margin-bottom: ${({ theme: { common } }) => common.space}px;
  text-align: left;
  span {
    display: block;
    font-weight: 300;
    font-size: 1.4rem;
    color: ${({ theme }) => theme.colors.darkCream};
    opacity: 0.8;
  }
`

export const NoResultsMessage: React.FC<{ description?: string; text: string }> = ({
  description,
  text,
}) => {
  return (
    <NoResults>
      {text} {description && <span>{description}</span>}
    </NoResults>
  )
}
