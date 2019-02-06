/*
 *
 *  Module for interfacing with database
 *
 */

const MongoClient = require('mongodb')

let db;

// connect to mongodb
function connect() {
  MongoClient.connect(process.env.DB, (err, res) => {
    console.log('connected to ' + res.databaseName)
    db = res
  })
}

// post thread to mongodb
function postThread(board, thread) {
  return db.collection(board).insertOne(thread)
}

// get 10 latest threads from mongodb
function getThreads(board) {
  return (db
    .collection(board)
    .aggregate([
      {
        $addFields: {
          // adds replycount field (since it's used in frontend) 
          // and overwrites replies field with only last three items 
          replycount: { $size: "$replies" },
          replies: { $slice: ["$replies", -3] }
        }
      },
      {
        $project: {
          // ignore reported and password fields on both thread and replies
          reported: 0,
          delete_password: 0,
          "replies.delete_password": 0,
          "replies.reported": 0
        }
      }
    ])
    .sort({ bumped_on: -1 })
    .limit(10)
    .toArray()
  )
}

// find a thread by _id in mongodb
function getThread(board, threadId) {
  return db.collection(board).findOne({ _id: threadId })
}

// delete a thread from mongodb
function deleteThread(board, threadId) {
  return db.collection(board).findOneAndDelete({ _id: threadId })
}

// change threads reported value to true
function reportThread(board, threadId) {
  return db.collection(board).updateOne({ _id: threadId }, { $set: { reported: true }})
}

// add reply to replies array in document
function postReply(board, threadId, reply) {
  return db.collection(board).findOneAndUpdate({ _id: threadId }, { $set: { bumped_on: reply.created_on }, $push: { replies: reply } })
}

// fetch a thread from mongodb
function getReplies(board, threadId) {
  return db.collection(board).findOne({ _id: threadId }, {
      reported: 0,
      delete_password: 0,
      "replies.delete_password": 0,
      "replies.reported": 0
  })
}

// "delete" a reply from a thread by overwriting it's text
function deleteReply(board, threadId, replyId) {
  return db.collection(board).updateOne(
    { _id: threadId, "replies._id": replyId },
    { $set: { "replies.$.text": "[deleted]" } }
  )
}

// change replies reported value to true
 function reportReply(board, threadId, replyId) {
  return db.collection(board).updateOne(
    { _id: threadId, "replies._id": replyId }, 
    { $set: { "replies.$.reported": true }}
  )
}

/*********************additional functions for testing*******************************/

const TEST_BOARD = 'testingx02M438Qs'

function dropCollection(cb) {
  db.collection(TEST_BOARD).drop({}, cb)
}

function addThreads(ids, hashes, now, cb) {
    return db.collection(TEST_BOARD).insertMany([
      { 
        _id: ids.deleteThread,
        text: 'delete this thread',
        created_on: now,
        bumped_on: now,
        reported: false,
        delete_password: hashes[0],
        replies: []
      },
      {
        _id: ids.reportThread,
        text: 'report this thread',
        created_on: now,
        bumped_on: now,
        reported: false,
        delete_password: 'whocares',
        replies: [
          {
            _id: ids.deleteReply,
            text: 'delete this reply',
            created_on: now,
            delete_password: hashes[1],
            reported: false
          },
          {
            _id: ids.reportReply,
            text: 'report this reply',
            created_on: now,
            delete_password: 'somerandompass'
          }
        ]
      }
    ], cb)
}

module.exports = { connect, postThread, getThreads, getThread, deleteThread, reportThread, postReply, getReplies, deleteReply, reportReply, dropCollection, addThreads, TEST_BOARD}