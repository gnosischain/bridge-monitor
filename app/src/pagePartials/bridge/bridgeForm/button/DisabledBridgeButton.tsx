import React from 'react'
import { Button } from './Button'

export const DisabledBridgeButton: React.FC = () => (
  <Button disabled onClick={() => undefined}>
    Bridge
  </Button>
)
