const chaiHttp = require('chai-http');
const chai     = require('chai');
const assert   = chai.assert;
const server   = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let testIssueId1;   // for updates/deletes
  let testIssueId2;

  // 1) Create issue with every field
  test('1) Create an issue with every field: POST /api/issues/{project}', function(done) {
    chai.request(server)
      .post('/api/issues/test-project')
      .send({
        issue_title: 'Title 1',
        issue_text: 'Text 1',
        created_by: 'Functional Test',
        assigned_to: 'Chai and Mocha',
        status_text: 'In QA'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        assert.equal(res.body.issue_title, 'Title 1');
        assert.equal(res.body.assigned_to, 'Chai and Mocha');
        testIssueId1 = res.body._id;
        done();
      });
  });

  // 2) Create issue with only required fields
  test('2) Create an issue with only required fields: POST /api/issues/{project}', function(done) {
    chai.request(server)
      .post('/api/issues/test-project')
      .send({
        issue_title: 'Title 2',
        issue_text: 'Text 2',
        created_by: 'Functional Test'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        assert.equal(res.body.assigned_to, '');
        testIssueId2 = res.body._id;
        done();
      });
  });

  // 3) Create issue with missing required fields
  test('3) Create an issue with missing required fields: POST /api/issues/{project}', function(done) {
    chai.request(server)
      .post('/api/issues/test-project')
      .send({ issue_title: 'Oops' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'required field(s) missing' });
        done();
      });
  });

  // 4) View issues on a project
  test('4) View issues on a project: GET /api/issues/{project}', function(done) {
    chai.request(server)
      .get('/api/issues/test-project')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.property(res.body[0], 'issue_title');
        done();
      });
  });

  // 5) View issues with one filter
  test('5) View issues on a project with one filter: GET /api/issues/{project}?open=true', function(done) {
    chai.request(server)
      .get('/api/issues/test-project')
      .query({ open: true })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(issue => assert.isTrue(issue.open));
        done();
      });
  });

  // 6) View issues with multiple filters
  test('6) View issues on a project with multiple filters: GET /api/issues/{project}?open=true&created_by=Functional Test', function(done) {
    chai.request(server)
      .get('/api/issues/test-project')
      .query({ open: true, created_by: 'Functional Test' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(issue => {
          assert.isTrue(issue.open);
          assert.equal(issue.created_by, 'Functional Test');
        });
        done();
      });
  });

  // 7) Update one field on an issue
  test('7) Update one field on an issue: PUT /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/test-project')
      .send({ _id: testIssueId1, issue_text: 'Updated text' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          result: 'successfully updated',
          _id: testIssueId1
        });
        done();
      });
  });

  // 8) Update multiple fields on an issue
  test('8) Update multiple fields on an issue: PUT /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/test-project')
      .send({
        _id: testIssueId2,
        issue_title: 'New Title',
        assigned_to: 'Someone else'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          result: 'successfully updated',
          _id: testIssueId2
        });
        done();
      });
  });

  // 9) Update an issue with missing _id
  test('9) Update an issue with missing _id: PUT /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/test-project')
      .send({ issue_text: 'No ID' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'missing _id' });
        done();
      });
  });

  // 10) Update an issue with no fields to update
  test('10) Update an issue with no fields to update: PUT /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/test-project')
      .send({ _id: testIssueId1 })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          error: 'no update field(s) sent',
          _id: testIssueId1
        });
        done();
      });
  });

  // 11) Update an issue with an invalid _id
  test('11) Update an issue with an invalid _id: PUT /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/test-project')
      .send({ _id: '123456789012', issue_text: 'Invalid ID' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          error: 'could not update',
          _id: '123456789012'
        });
        done();
      });
  });

  // 12) Delete an issue
  test('12) Delete an issue: DELETE /api/issues/{project}', function(done) {
    chai.request(server)
      .delete('/api/issues/test-project')
      .send({ _id: testIssueId1 })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          result: 'successfully deleted',
          _id: testIssueId1
        });
        done();
      });
  });

  // 13) Delete an issue with invalid _id
  test('13) Delete an issue with an invalid _id: DELETE /api/issues/{project}', function(done) {
    chai.request(server)
      .delete('/api/issues/test-project')
      .send({ _id: 'abcdef123456' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          error: 'could not delete',
          _id: 'abcdef123456'
        });
        done();
      });
  });

  // 14) Delete an issue with missing _id
  test('14) Delete an issue with missing _id: DELETE /api/issues/{project}', function(done) {
    chai.request(server)
      .delete('/api/issues/test-project')
      .send({})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'missing _id' });
        done();
      });
  });

});
