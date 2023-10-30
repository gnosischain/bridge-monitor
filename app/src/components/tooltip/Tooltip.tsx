import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

import { renderToStaticMarkup } from 'react-dom/server'
import { Tooltip as TooltipIcon } from '@/src/components/assets/Tooltip'

const Wrapper = styled.span`
  cursor: pointer;
  display: inline-flex;
  max-width: fit-content;
`

interface Props extends HTMLAttributes<HTMLSpanElement> {
  content: React.ReactElement | string
}

export const Tooltip = ({ children, content, ...restProps }: Props) => {
  const tooltipContent = typeof content === 'string' ? content : renderToStaticMarkup(content)

  return (
    <Wrapper data-tooltip-html={tooltipContent} data-tooltip-id="mainTooltip" {...restProps}>
      {children ? children : <TooltipIcon />}
    </Wrapper>
  )
}
