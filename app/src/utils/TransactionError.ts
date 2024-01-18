export class TransactionError extends Error {
  code?: number
  data?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message?: string, code?: number, data?: any) {
    super(message)
    if (code != null) {
      this.name = `Transaction Failed ${code.toString()}`
    } else {
      this.name = `Transaction Failed`
    }
    this.code = code
    this.data = JSON.stringify(data)
  }
}
