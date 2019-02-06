/*
 * manipulates test data before saving
 */

const { ObjectID } = require('mongodb')
const bcrypt = require('bcrypt')
const { dropCollection, addThreads } = require('./db.js')

function dropBoard(cb) {
  dropCollection(cb)
}

function addTestThreads(ids, passwords, cb) {
  const now = new Date()
  const objectIds = {}
  for (let id in ids) {
    if (ids.hasOwnProperty(id)) {
      const objectId = new ObjectID(ids[id])
      objectIds[id] = objectId
    }
  }
  Promise.all([bcrypt.hash(passwords.thread, 10), bcrypt.hash(passwords.reply, 10)])
  .then(hashes => addThreads(objectIds, hashes, now, cb))
}

module.exports = { dropBoard, addTestThreads }