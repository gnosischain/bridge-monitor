import React from 'react'
import { Button } from './Button'

export const DisabledBridgeButton: React.FC<{ label?: string }> = ({ label = 'Bridge' }) => (
  <Button disabled onClick={() => undefined}>
    {label}
  </Button>
)
