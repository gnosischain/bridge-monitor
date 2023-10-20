import { Tooltip } from 'react-tooltip'

const TooltipConfig: React.FC = ({ ...restProps }) => {
  return (
    <Tooltip
      className="customTooltip"
      clickable
      delayHide={250}
      delayShow={50}
      id="mainTooltip"
      {...restProps}
    />
  )
}

export default TooltipConfig
