export default defineEventHandler(async () => {
  const accounts = await readAccounts()
  return { accounts }
})
