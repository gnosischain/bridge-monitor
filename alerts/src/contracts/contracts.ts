import { Contract, ContractInterface } from "@ethersproject/contracts"
import { RPCProvider } from "../providers"

const call = async <
  MyContract extends Contract,
  Method extends keyof MyContract & string,
  Params extends Parameters<MyContract[Method]>,
  Return extends ReturnType<MyContract[Method]> | null,
>(
  provider: RPCProvider,
  address: string,
  abi: ContractInterface,
  method: Method,
  params: Params | null
): Promise<Return> => {
  try {
    const contract = new Contract(address, abi, provider)
    const deployedContract = await contract.deployed()
    const contractMethod = deployedContract[method]
    const result = Array.isArray(params) ? await contractMethod(...params) : await contractMethod()
    return result
  } catch (e) {
    console.log({ e })
    return null
  }
}

export { call }
