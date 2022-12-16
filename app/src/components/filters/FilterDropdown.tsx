import { useState } from 'react'

import { ButtonDropdown } from '@/src/components/buttons/Button'
import { Dropdown, DropdownItem } from '@/src/components/common/Dropdown'

const BridgeDropdown: React.FC<{ onChange?: (bridge: string) => void; options: string[] }> = ({
  onChange,
  options,
  ...restProps
}) => {
  const [bridge, setBridge] = useState<string>()

  const onSelectOption = (bridgeFilter: string) => {
    setBridge(bridgeFilter)
    if (typeof onChange !== 'undefined') {
      onChange(bridgeFilter)
    }
  }
  return (
    <Dropdown
      dropdownButton={<ButtonDropdown>{bridge ? bridge : options[0]}</ButtonDropdown>}
      items={options.map((el, index) => (
        <DropdownItem
          key={index}
          onClick={() => {
            onSelectOption(el)
          }}
        >
          {el}
        </DropdownItem>
      ))}
      {...restProps}
    />
  )
}

export default BridgeDropdown
