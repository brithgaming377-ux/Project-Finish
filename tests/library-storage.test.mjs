import test from 'node:test'
import assert from 'node:assert/strict'

import { getLibraryStorageKey } from '../utils/library-storage.js'

test('saved books key is unique per account', () => {
  assert.equal(
    getLibraryStorageKey('alice@example.com'),
    'marginalia:library:alice@example.com'
  )
  assert.equal(
    getLibraryStorageKey('bob@example.com'),
    'marginalia:library:bob@example.com'
  )
  assert.notEqual(
    getLibraryStorageKey('alice@example.com'),
    getLibraryStorageKey('bob@example.com')
  )
})

test('guest users do not share stored saved books', () => {
  assert.equal(getLibraryStorageKey(''), 'marginalia:library:guest')
  assert.equal(getLibraryStorageKey(null), 'marginalia:library:guest')
})
