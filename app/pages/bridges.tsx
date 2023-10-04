import type { NextPage } from 'next'
import { Limits } from '@/src/components/limits'
import { MainTitle } from '@/src/components/text/MainTitle'

const Bridges: NextPage = () => {
  return (
    <>
      <MainTitle>Bridges information</MainTitle>
      <Limits />
    </>
  )
}
export default Bridges
