/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect
const MongoClient = require('mongodb')
const { ObjectID } = require('mongodb')
const bcrypt = require('bcrypt')
const db = require('../utils/db.js')

// Connect to MongoDB on server start
db.connect()

module.exports = function (app) {
  
  app.route('/api/threads/:board')
  // post new thread
  .post((req, res, next) => {
    // get values for thread document
    const board = getBoard(req)
    const {text} = req.body
    const now = new Date()
    //hash password and save thread
    bcrypt.hash(req.body.delete_password, 10)
    .then(hash => {
      const thread = {
        text,
        created_on: now,
        bumped_on: now,
        delete_password: hash,
        reported: false,
        replies: []
      }
      return db.postThread(board, thread)})
    .then(doc => {
      res.redirect('/b/' + board)
    })
    .catch(err => next(err))
  })
  // get 10 most recent threads
  .get((req, res, next) => {
    const board = getBoard(req)
    db.getThreads(board)
    .then(threads => res.send(threads))
    .catch(err => next(err))
  })
  // delete thread if allowed
  .delete((req, res, next) => {
    const board = getBoard(req)
    const threadId = getThreadId(req)
    // get hashed password for comparison
    db.getThread(board, threadId)
    // compare passwords and reject if not matching
    .then(({ delete_password: hash }) => bcrypt.compare(req.body.delete_password, hash))
    .then(isValid => {
      if (!isValid) {
        throw new Error('badpass')
      }
      // delete thread if password matches
      return db.deleteThread(board, threadId)
    })
    .then(result => res.send('success'))
    .catch(err => {
      if (err.message === 'badpass') {
        return res.status(401).send('incorrect password')
      } else {
        return next(err)
      }
    }
    )
  })
  // report a thread
  .put((req, res, next) => {
    const board = getBoard(req)
    const threadId = getThreadId(req)
    db.reportThread(board, threadId)
    .then(result => res.send('success'))
    .catch(err => next(err))
  })
  app.route('/api/replies/:board')
  // post a reply to a thread
  .post((req, res, next) => {
    const board = getBoard(req)
    const { text }  = req.body
    const threadId = getThreadId(req)
    const now = new Date()
    bcrypt.hash(req.body.delete_password, 10)
    .then(hash => {
      const reply = {
        text,
        created_on: now,
        delete_password: hash,
        reported: false,
        _id: new ObjectID()
      }
      return db.postReply(board, threadId, reply)
    })
    .then(doc => {
      res.redirect(`/b/${board}/${threadId}`)
    })
    .catch(err => next(err))
  })
  // get all of a threads replies
  .get((req, res, next) => {
    const board = getBoard(req)
    const threadId = new ObjectID(req.query.thread_id)
    db.getReplies(board, threadId)
    .then(thread => {
      res.send(thread)})
    .catch(err => next(err))
  })
  // 'delete' a reply
  .delete((req, res, next) => {
    const board = getBoard(req)
    const threadId = getThreadId(req)
    const replyId = new ObjectID(req.body.reply_id)
    // get a list of thread's replies

    db.getThread(board, threadId)
    .then(({ replies }) => {
      const replyIndex = replies.findIndex(reply => (
        replyId.equals(reply._id)
      ))
      return bcrypt.compare(req.body.delete_password, replies[replyIndex].delete_password)
    })
    .then(isValid => {
      if (!isValid) {
        throw new Error('badpass')
      }
      db.deleteReply(board, threadId, replyId)
    })
    .then(result => res.send('success'))
    .catch(err => {
      if (err.message === 'badpass') {
        return res.status(401).send('incorrect password')
      }
      return next(err)
    })
  })
  // report a reply
  .put((req, res, next) => {
    const board = getBoard(req)
    const threadId = getThreadId(req)
    const replyId = new ObjectID(req.body.reply_id)
    db.reportReply(board, threadId, replyId)
    .then(result => res.send('success'))
    .catch(err => next(err))
  })
};

// Other helper functions
function getBoard(req) {
  return req.params.board
}
function getThreadId(req) {
  return new ObjectID(req.body.thread_id)
}
