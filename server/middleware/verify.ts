import { H3Event } from 'h3'

const protectedPaths = ['/api']

function isProtectedPath(event: H3Event): boolean {
  const path = event.node.req.url
  return protectedPaths.some(prefix => path?.startsWith(prefix))
}

export default defineEventHandler(async (event) => {
  if (!isProtectedPath(event)) {
    return
  }
})

