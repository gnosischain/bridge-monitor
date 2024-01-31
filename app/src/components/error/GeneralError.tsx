import styled from 'styled-components'

import { FallbackProps } from 'react-error-boundary'

import { Alert } from '@/src/components/assets/Alert'
import { ButtonPrimary } from '@/src/components/buttons/Button'
import { GenericError } from '@/src/components/error/GenericError'

const Button = styled(ButtonPrimary)`
  margin: 0 auto;
  font-size: 1.5rem;
  padding: 0 16px;
  height: 50px;
  width: 100%;
`

const Code = styled.blockquote`
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  color: #fff;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  font-size: 1.6rem;
  font-style: italic;
  line-height: 1.5;
  margin: 0 0 16px;
  padding: 12px 10px;
`

export const GeneralError = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <GenericError
      icon={<Alert />}
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
