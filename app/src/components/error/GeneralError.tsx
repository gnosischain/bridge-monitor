import styled from 'styled-components'

import { FallbackProps } from 'react-error-boundary'

import { ButtonPrimary } from '@/src/components/buttons/Button'
import { GenericError } from '@/src/components/error/GenericError'

const Button = styled(ButtonPrimary)`
  display: inline-flex;
  font-size: 1.5rem;
  height: 44px;
  padding: 0 calc(var(--theme-common-space) * 3);
`

const Code = styled.blockquote`
  background-color: ${({ theme: { colors } }) => colors.page};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  color: ${({ theme: { colors } }) => colors.ink};
  font-family: ${({ theme: { fonts } }) => fonts.familyCode};
  font-size: 1.3rem;
  line-height: 1.5;
  margin: 0 0 calc(var(--theme-common-space) * 2);
  padding: calc(var(--theme-common-space) * 1.5) calc(var(--theme-common-space) * 2);
  text-align: left;
  width: 100%;
`

export const GeneralError = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <GenericError
      text={
        <>
          <Code>
            <b>Error:</b> {error.message}
          </Code>
          <Button onClick={resetErrorBoundary}>Try again</Button>
        </>
      }
      title="Something went wrong"
    />
  )
}
