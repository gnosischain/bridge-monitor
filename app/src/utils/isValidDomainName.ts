export const isValidDomainName = (name: string): boolean => {
  const pattern = /^[a-zA-Z0-9-]+\.gno$/
  return pattern.test(name)
}
