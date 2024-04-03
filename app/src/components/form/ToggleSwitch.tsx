import styled, { css } from 'styled-components'

const Wrapper = styled.label<{ disabled?: boolean }>`
  height: 40px;
  position: relative;
  transition: opacity 0.15s linear;
  width: 72px;
  ${({ disabled }) =>
    disabled &&
    css`
      cursor: not-allowed;
      opacity: 0.5;
      pointer-events: none;
    `}
`
const Switch = styled.span`
  background-color: ${({ theme: { colors } }) => colors.cream};
  border-radius: 60px;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 0;

  &::after {
    --gap: 4px;
    --size: 32px;

    background-color: ${({ theme: { colors } }) => colors.white};
    background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEzLjAzMDYgMTEuOTY5NUMxMy4xNzE1IDEyLjExMDQgMTMuMjUwNiAxMi4zMDE1IDEzLjI1MDYgMTIuNTAwN0MxMy4yNTA2IDEyLjcgMTMuMTcxNSAxMi44OTExIDEzLjAzMDYgMTMuMDMyQzEyLjg4OTcgMTMuMTcyOSAxMi42OTg2IDEzLjI1MiAxMi40OTkzIDEzLjI1MkMxMi4zMDAxIDEzLjI1MiAxMi4xMDkgMTMuMTcyOSAxMS45NjgxIDEzLjAzMkw3Ljk5OTk3IDkuMDYyNjFMNC4wMzA2IDEzLjAzMDdDMy44ODk3IDEzLjE3MTYgMy42OTg2MSAxMy4yNTA4IDMuNDk5MzUgMTMuMjUwOEMzLjMwMDA5IDEzLjI1MDggMy4xMDg5OSAxMy4xNzE2IDIuOTY4MSAxMy4wMzA3QzIuODI3MiAxMi44ODk4IDIuNzQ4MDUgMTIuNjk4NyAyLjc0ODA1IDEyLjQ5OTVDMi43NDgwNSAxMi4zMDAyIDIuODI3MiAxMi4xMDkxIDIuOTY4MSAxMS45NjgyTDYuOTM3NDcgOC4wMDAxMUwyLjk2OTM1IDQuMDMwNzNDMi44Mjg0NSAzLjg4OTg0IDIuNzQ5MyAzLjY5ODc0IDIuNzQ5MyAzLjQ5OTQ4QzIuNzQ5MyAzLjMwMDIzIDIuODI4NDUgMy4xMDkxMyAyLjk2OTM1IDIuOTY4MjNDMy4xMTAyNCAyLjgyNzM0IDMuMzAxMzQgMi43NDgxOCAzLjUwMDYgMi43NDgxOEMzLjY5OTg2IDIuNzQ4MTggMy44OTA5NSAyLjgyNzM0IDQuMDMxODUgMi45NjgyM0w3Ljk5OTk3IDYuOTM3NjFMMTEuOTY5MyAyLjk2NzYxQzEyLjExMDIgMi44MjY3MSAxMi4zMDEzIDIuNzQ3NTYgMTIuNTAwNiAyLjc0NzU2QzEyLjY5OTkgMi43NDc1NiAxMi44OTEgMi44MjY3MSAxMy4wMzE4IDIuOTY3NjFDMTMuMTcyNyAzLjEwODUxIDEzLjI1MTkgMy4yOTk2IDEzLjI1MTkgMy40OTg4NkMxMy4yNTE5IDMuNjk4MTIgMTMuMTcyNyAzLjg4OTIxIDEzLjAzMTggNC4wMzAxMUw5LjA2MjQ3IDguMDAwMTFMMTMuMDMwNiAxMS45Njk1WiIgZmlsbD0iIzNFNjk1NyIvPgo8L3N2Zz4K');
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 50%;
    content: '';
    display: block;
    height: var(--size);
    left: var(--gap);
    position: absolute;
    top: var(--gap);
    transition: all 0.15s linear;
    width: var(--size);
  }
`
const CheckBox = styled.input`
  cursor: pointer;
  display: block;
  height: 100%;
  opacity: 0;
  position: relative;
  width: 100%;
  z-index: 5;

  &:checked + ${Switch} {
    &::after {
      background-color: ${({ theme: { colors } }) => colors.white};
      background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE0LjUzMDYgNS4wMzA1N0w2LjUzMDYgMTMuMDMwNkM2LjQ2MDkyIDEzLjEwMDUgNi4zNzgxMyAxMy4xNTYgNi4yODY5NiAxMy4xOTM4QzYuMTk1OCAxMy4yMzE3IDYuMDk4MDYgMTMuMjUxMiA1Ljk5OTM1IDEzLjI1MTJDNS45MDA2NCAxMy4yNTEyIDUuODAyOSAxMy4yMzE3IDUuNzExNzMgMTMuMTkzOEM1LjYyMDU3IDEzLjE1NiA1LjUzNzc4IDEzLjEwMDUgNS40NjgxIDEzLjAzMDZMMS45NjgxIDkuNTMwNTdDMS44OTgzMyA5LjQ2MDggMS44NDI5OSA5LjM3Nzk4IDEuODA1MjQgOS4yODY4M0MxLjc2NzQ4IDkuMTk1NjggMS43NDgwNSA5LjA5Nzk4IDEuNzQ4MDUgOC45OTkzMkMxLjc0ODA1IDguOTAwNjYgMS43Njc0OCA4LjgwMjk2IDEuODA1MjQgOC43MTE4MUMxLjg0Mjk5IDguNjIwNjYgMS44OTgzMyA4LjUzNzgzIDEuOTY4MSA4LjQ2ODA3QzIuMDM3ODYgOC4zOTgzIDIuMTIwNjkgOC4zNDI5NiAyLjIxMTg0IDguMzA1MjFDMi4zMDI5OSA4LjI2NzQ1IDIuNDAwNjkgOC4yNDgwMiAyLjQ5OTM1IDguMjQ4MDJDMi41OTgwMSA4LjI0ODAyIDIuNjk1NzEgOC4yNjc0NSAyLjc4Njg2IDguMzA1MjFDMi44NzgwMSA4LjM0Mjk2IDIuOTYwODMgOC4zOTgzIDMuMDMwNiA4LjQ2ODA3TDUuOTk5OTcgMTEuNDM3NEwxMy40NjkzIDMuOTY5MzJDMTMuNjEwMiAzLjgyODQyIDEzLjgwMTMgMy43NDkyNyAxNC4wMDA2IDMuNzQ5MjdDMTQuMTk5OSAzLjc0OTI3IDE0LjM5MSAzLjgyODQyIDE0LjUzMTggMy45NjkzMkMxNC42NzI3IDQuMTEwMjEgMTQuNzUxOSA0LjMwMTMxIDE0Ljc1MTkgNC41MDA1N0MxNC43NTE5IDQuNjk5ODMgMTQuNjcyNyA0Ljg5MDkyIDE0LjUzMTggNS4wMzE4MkwxNC41MzA2IDUuMDMwNTdaIiBmaWxsPSIjM0U2OTU3Ii8+Cjwvc3ZnPgo=');
      right: var(--gap);
      left: auto;
    }
  }

  &:disabled {
    cursor: not-allowed;
  }
`

CheckBox.defaultProps = {
  type: 'checkbox',
}

type Props = React.InputHTMLAttributes<HTMLInputElement>

export const ToggleSwitch = ({ checked, disabled, onChange, ...restProps }: Props) => {
  return (
    <Wrapper disabled={disabled}>
      <CheckBox checked={checked} disabled={disabled} onChange={onChange} {...restProps} />
      <Switch />
    </Wrapper>
  )
}
