import { promises as fs } from 'fs'
import { join } from 'path'

const imageTypes: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
}

export default defineEventHandler(async (event) => {
  const body = await readMultipartFormData(event)
  const file = body?.find((part) => part.name === 'file' && part.data)

  if (!file?.data || !file.type || !imageTypes[file.type]) {
    throw createError({ statusCode: 400, statusMessage: 'Choose a JPG, PNG, or WebP image.' })
  }

  if (file.data.length > 5 * 1024 * 1024) {
    throw createError({ statusCode: 400, statusMessage: 'Profile pictures must be smaller than 5 MB.' })
  }

  const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars')
  await fs.mkdir(uploadDir, { recursive: true })
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${imageTypes[file.type]}`
  await fs.writeFile(join(uploadDir, filename), file.data)

  return { url: `/uploads/avatars/${filename}` }
})
