import styled from 'styled-components/macro'

export const StyledCanvas = styled.canvas`
  position: absolute;
  bottom: 0;
  left: 0;
  // opacity: 0.5;
  opacity: 1;
`

export const CanvasContainer = styled.div`
  height: 100%;
  width: 100%;
  img {
    position: absolute;
    bottom: 5%;
    z-index: 0;
    opacity: 0.5;
  }
`
