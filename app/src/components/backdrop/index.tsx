import styled, { css } from 'styled-components'

// Painted under the page content (z-index -1), so it shows through the header while that is see-through.
const Wrapper = styled.div`
  background-image: ${({ theme: { backdrop } }) => backdrop.gradient};
  height: 560px;
  left: 0;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
  z-index: -1;
`

// Kept below the header and in the upper part of the wash, so the dots fade out before the
// gradient does.
const DotsArea = styled.div`
  display: none;
  height: 360px;
  left: 0;
  position: absolute;
  right: 0;
  top: 80px;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    display: block;
  }
`

const DotsCSS = css`
  -webkit-mask-image: radial-gradient(closest-side, #000 15%, transparent 100%);
  mask-image: radial-gradient(closest-side, #000 15%, transparent 100%);
  position: absolute;
`

const DotsMain = styled.div`
  ${DotsCSS}
  background-image: radial-gradient(
    ${({ theme: { backdrop } }) => backdrop.dots} 1.25px,
    transparent 1.75px
  );
  background-size: 12px 12px;
  height: 125%;
  opacity: 0.5;
  right: -6%;
  top: -45%;
  width: 55%;
`

const DotsAccent = styled.div`
  ${DotsCSS}
  background-image: radial-gradient(
    ${({ theme: { backdrop } }) => backdrop.dotsAccent} 1.25px,
    transparent 1.75px
  );
  background-size: 10px 10px;
  height: 65%;
  opacity: 0.4;
  right: 14%;
  top: 0;
  width: 25%;
`

export const Backdrop: React.FC = () => (
  <Wrapper aria-hidden="true">
    <DotsArea>
      <DotsMain />
      <DotsAccent />
    </DotsArea>
  </Wrapper>
)
