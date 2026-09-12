import { promises as fs } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const body = await readMultipartFormData(event)
  if (!body || body.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No files uploaded' })
  }

  const uploadDir = join(process.cwd(), 'public', 'uploads')
  await fs.mkdir(uploadDir, { recursive: true })
  const uploadedFiles: { field: string; filename: string; url: string }[] = []

  for (const part of body) {
    if (!part.data || part.name !== 'file') continue

    const originalName = part.filename || 'document'
    const extension = originalName.toLowerCase().endsWith('.pdf') ? '.pdf' : ''
    if (!extension) {
      throw createError({ statusCode: 400, statusMessage: 'Only PDF files are supported.' })
    }

    const timestamp = Date.now()
    const random = Math.random().toString(36).slice(2, 8)
    const filename = `${timestamp}-${random}${extension}`
    const filepath = join(uploadDir, filename)
    const publicUrl = `/uploads/${filename}`

    await fs.writeFile(filepath, part.data)
    uploadedFiles.push({ field: part.name, filename, url: publicUrl })
  }

  return { files: uploadedFiles }
})
