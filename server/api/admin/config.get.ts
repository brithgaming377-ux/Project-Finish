export default defineEventHandler(async (event) => {
  const config = await readConfig()
  return config
})
