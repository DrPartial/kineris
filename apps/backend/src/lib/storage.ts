import { randomUUID } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import type { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { put } from '@vercel/blob'

const LOCAL_UPLOAD_DIR = path.resolve(import.meta.dirname, '../../uploads/coa')

/** True when CoA files go to Vercel Blob (BLOB_READ_WRITE_TOKEN is set), false for local disk. */
export const usesBlobStorage = Boolean(process.env.BLOB_READ_WRITE_TOKEN)

/**
 * Saves an uploaded Certificate of Analysis PDF and returns the URL it is served from.
 *
 * Hosted (Vercel): a public Blob URL, absolute, so the storefront can link straight to it. A
 * serverless function's disk is read-only and discarded between requests, so files cannot live there.
 * Local dev: the uploads folder, served back by server.ts at /uploads/coa/<file> (a relative URL).
 */
export async function saveCoaFile(file: Readable): Promise<string> {
  const filename = `${randomUUID()}.pdf`
  if (usesBlobStorage) {
    const blob = await put(`coa/${filename}`, file, {
      access: 'public',
      contentType: 'application/pdf',
      addRandomSuffix: false,
    })
    return blob.url
  }
  await mkdir(LOCAL_UPLOAD_DIR, { recursive: true })
  await pipeline(file, createWriteStream(path.join(LOCAL_UPLOAD_DIR, filename)))
  return `/uploads/coa/${filename}`
}
