/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
const { TEST_BOARD } = require('../utils/db.js')
const { dropBoard, addTestThreads } = require('../utils/test-helpers.js')

// IDs and passwords for delete and report tests
const ids = {
  deleteThread: '5c59d6e6c0e9f749af655ff8',
  reportThread: '5c59d6e6c0e9f749af655ff9',
  deleteReply: '5c59d6e6c0e9f749af655ffa',
  reportReply: '5c59d6e6c0e9f749af655ffb'
}
const passwords = {
  thread: 'password123',
  reply: 'thisisatest'
}

chai.use(chaiHttp);


  
suite('Functional Tests', function() {

  before(function(done) {addTestThreads(ids, passwords, done)}) 
  
  suite('API ROUTING FOR /api/threads/:board', function() {
    const threadsRoute = '/api/threads/' + TEST_BOARD
    
    suite('POST', function() {
      test('All fields', function(done) {
        chai
        .request(server)
        .post(threadsRoute)
        .send({
          text: 'All fields test',
          delete_password: 'testpass'
        })
        .end(function(err, res) {
          assert.isNull(err)
          assert.equal(res.status, 200)
          done()
        }) 
      })
    });

    suite('GET', function() {
      test('Get all threads', function(done) {
        chai
        .request(server)
        .get(threadsRoute)
        .end(function(err, res) {
          assert.isNull(err)
          assert.equal(res.status, 200)
          assert.isArray(res.body)
          done()
        })
      })
    });

    suite('DELETE', function() {
      test('Delete a thread', function(done) {
        chai
        .request(server)
        .delete(threadsRoute)
        .send({
          thread_id: ids.deleteThread, 
          delete_password: passwords.thread
        })
        .end(function(err, res) {
          assert.isNull(err)
          assert.equal(res.text, 'success')
          done()
        })
      })
      test('Wrong password', function(done) {
        chai
        .request(server)
        .delete(threadsRoute)
        .send({
          thread_id: ids.reportThread, 
          delete_password: passwords.thread
        })
        .end(function(err, res) {
          assert.equal(err.message, 'Unauthorized')
          assert.equal(res.status, 401)
          assert.equal(res.text, 'incorrect password')
          done()
        })
      })
    });

    suite('PUT', function() {
       test('Report a thread', function(done) {
         chai
         .request(server)
         .put(threadsRoute)
         .send({
           thread_id: ids.reportThread
         })
         .end(function(err, res) {
           assert.isNull(err)
           assert.equal(res.text, 'success')
           done()
         })
       })
    });


  });

  suite('API ROUTING FOR /api/replies/:board', function() {
    const repliesRoute = '/api/replies/' + TEST_BOARD
    
    suite('POST', function() {
      test('All fields entered', function(done) {
        chai
        .request(server)
        .post(repliesRoute)
        .send({
          thread_id: ids.reportThread,
          text: 'All fields entered',
          delete_password: 'testpass'
        })
        .end(function(err, res) {
          assert.isNull(err)
          assert.equal(res.status, 200)
          done()
        })
      })
    });

    suite('GET', function() {
      test('Get all replies', function(done) {
        chai
        .request(server)
        .get(repliesRoute)
        .query({thread_id: ids.reportThread})
        .end(function(err, res) {
          assert.isNull(err)
          assert.isObject(res.body)
          assert.isArray(res.body.replies)
          assert.equal(res.body._id, ids.reportThread)
          done()
        })
      })
    });

    suite('PUT', function() {
      test('Report a reply', function(done) {
        chai
        .request(server)
        .put(repliesRoute)
        .send({
          thread_id: ids.reportThread,
          reply_id: ids.reportReply
        })
        .end(function(err, res) {
          assert.isNull(err)
          assert.equal(res.text, 'success')
          done()
        })
      })
    });

    suite('DELETE', function() {
      test('Delete a reply', function(done) {
        chai
        .request(server)
        .delete(repliesRoute)
        .send({
          thread_id: ids.reportThread,
          reply_id: ids.deleteReply,
          delete_password: passwords.reply
        })
        .end(function(err, res) {
          assert.isNull(err)
          assert.equal(res.text, 'success')
          done()
        })
      })
      test('Wrong password', function(done) {
        chai
        .request(server)
        .delete(repliesRoute)
        .send({
          thread_id: ids.reportThread,
          reply_id: ids.reportReply,
          delete_password: passwords.thread
        })
        .end(function(err, res) {
          assert.equal(err.message, 'Unauthorized')
          assert.equal(res.status, 401)
          assert.equal(res.text, 'incorrect password')
          done()
        })
      })
    });
  });
  
  after(function(done) {dropBoard(done)})
});

