import { readRequests } from '~/server/utils/requests'

export default defineEventHandler(() => readRequests())
