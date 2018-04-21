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
        expect(res.body).to.have.lengthOf(10);
      });
  });

  it('should return an array of objects with id, title, and content', function() {
    return chai.request(app)
      .get('/api/notes')
      .then( function(res) {
        res.body.forEach( function(item) {
          expect(item).to.have.all.keys('id', 'title', 'content');
        });
      });
  });

  it('should return correct search results for a valid query', function() {
    return chai.request(app)
      .get('/api/notes/?searchTerm=cats')
      .then( function(res) {
        expect(res).to.have.status(200);
      });
  });

  it('should return an empty array for an incorrect query', function() {
    return chai.request(app)
      .get('/api/notes/?searchTerm=12345DoesNoteExistBruh')
      .then( function(res) {
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.lengthOf(0);
      });
  });

});

describe('GET /api/notes/:id', function() {

  it('should return correct note object with id, title and content for a given id', function() {
    return chai.request(app)
      .get('/api/notes/1001')
      .then( function(res) {
        expect(res.body).to.have.all.keys('id', 'title', 'content');
        expect(res.body.id).to.equal(1001);
        expect(res).status(200);
      });
  });

  it('should respond with a 404 for an invalid id', function() {
    return chai.request(app)
      .get('/api/notes/DOESNOTEXIST')
      .then( function(res) {
        expect(res).status(404);
      });
  });

});