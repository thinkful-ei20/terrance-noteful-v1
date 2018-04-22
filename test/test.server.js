'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Reality check', function() {

  it('true should be true', function() {
    expect(true).to.be.true;
  });

  it('2 + 2 should equal 4', function() {
    expect(2 + 2).to.equal(4);
  });

});

describe('Express static', function() {

  it('GET request "/" should return the index page', function() {
    return chai.request(app)
      .get('/')
      .then(function (res) {
        expect(res).to.exist;
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      }); 
  });

});

describe('404 handler', function() {

  it('should respond with 404 when given a bad path', function() {
    return chai.request(app)
      .get('/DOES/NOT/EXIST')
      .then( function(res) {
        expect(res).to.have.status(404);
      });
  });

});

describe('GET /api/notes', function() {
  
  it('should return the default of 10 notes as an array', function() {
    return chai.request(app)
      .get('/api/notes')
      .then( function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.length(10);
      });
  });

  it('should return an array of objects with id, title, and content', function() {
    return chai.request(app)
      .get('/api/notes')
      .then( function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.length(10);
        res.body.forEach( function(item) {
          expect(item).to.be.an('object');
          expect(item).to.have.all.keys('id', 'title', 'content');
        });
      });
  });

  it('should return correct search results for a valid query', function() {
    return chai.request(app)
      .get('/api/notes/?searchTerm=government')
      .then( function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.length(1);
        expect(res.body[0]).to.be.an('object');
      });
  });

  it('should return an empty array for an incorrect query', function() {
    return chai.request(app)
      .get('/api/notes/?searchTerm=12345DoesNoteExistBruh')
      .then( function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(0);
      });
  });

});

describe('GET /api/notes/:id', function() {

  it('should return correct note object with id, title and content for a given id', function() {
    return chai.request(app)
      .get('/api/notes/1000')
      .then( function(res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.include.keys('id', 'title', 'content');
        expect(res.body.id).to.equal(1000);
        expect(res.body.title).to.equal('5 life lessons learned from cats');
      });
  });

  it('should respond with a 404 for an invalid id', function() {
    return chai.request(app)
      .get('/api/notes/DOESNOTEXIST')
      .catch( function(err) { 
        return err.response;
      })
      .then( function(res) {
        expect(res).to.have.status(404);
      });
  });

});

describe('POST /api/notes', function() {

  it('should create and return a new item with location header when provided valid data', function() {
    const newItem = {
      'title': 'This is a test title',
      'content': 'This is testing content'
    };

    return chai.request(app)
      .post('/api/notes')
      .send(newItem)
      .then( function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.include.keys('id', 'title', 'content');
        
        expect(res.body.id).to.equal(1010);
        expect(res.body.title).to.equal(newItem.title);
        expect(res.body.content).to.equal(newItem.content);
        expect(res).to.have.header('location');
      });
  });

  it('should return an obj with a message prop "Missing title in request body" when missing "title" field', function() {

    const badItem = {'title': ''};

    return chai.request(app)
    .post('/api/notes')
    .send(badItem)
    .catch( function(err) {
      return err.response;
    })
    .then( function(res) {
      expect(res).to.have.status(400);
      expect(res).to.be.json;
      expect(res.body).to.be.an('object');
      expect(res.body.message).to.equal('Missing `title` in request body');
    });

  });

});

describe('PUT /api/notes/:id', function() {

  it('should update and return a note object when given valid data', function() {
    const updateItem = {
      'title': 'This be da new title bruh',
      'content': 'Here be sum fresh content'
    };

    return chai.request(app)
      .put('/api/notes/1005')
      .send(updateItem)
      .then( function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.include.keys('id', 'title', 'content');

        expect(res.body.id).to.equal(1005);
        expect(res.body.title).to.equal(updateItem.title);
        expect(res.body.content).to.equal(updateItem.content);
      });
  });

  it('should respond with a 404 for an invalid id (/api/notes/DOESNOTEXIST)', function() {
    const updateItem = {
      'title': 'This title should not update',
      'content': 'This content should not update'
    };

    return chai.request(app)
      .put('/api/notes/DOESNOTEXIST')
      .send(updateItem)
      .catch( function(err) {
        return err.response;
      })
      .then( function(res) {
        expect(res).to.have.status(404);
      });
  });

  it('should return an object with a message prop "Missing title in request body" when missing "title" field', function() {
    const updateItem = {
      'foo': 'bar'
    };

    return chai.request(app)
      .put('/api/notes/1005')
      .send(updateItem)
      .catch( function(err) {
        return err.response;
      })
      .then( function(res) {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body.message).to.equal('Missing `title` in request body');
      });
  });

});

describe('DELETE /api/notes/:id', function() {

  it('should delete an item by id', function() {
    return chai.request(app)
      .delete('/api/notes/1005')
      .then( function(res) {
        expect(res).to.have.status(204);
      });
  });

});