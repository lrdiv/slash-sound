var _             = require('lodash');
var fs            = require('fs');
var chai          = require('chai');
var app           = require('../app.js');
var validate      = require('../lib/validate');
var soundmachine  = require('../lib/soundmachine');
var request       = require('supertest').agent(app.listen());
var slack_token   = "TEST_SLACK_TOKEN";

describe('validate middleware', function() {
  beforeEach(function(done) {
    process.env.SLACK_HOOK_TOKEN = slack_token;
    done();
  });

  it('should return a 401 if the slack token is invalid', function(done) {
    request
      .post('/play')
      .send({
        "user_name": "lrdiv",
        "text": "chewy",
        "token": "INVALID_SLACK_TOKEN"
      })
      .expect(401)
      .end(done);
  });

  it('should return a 200 if the slack token is valid', function(done) {
    request
      .post('/play')
      .send({
        "user_name": "lrdiv",
        "text": "chewy",
        "token": slack_token
      })
      .expect(200)
      .end(done);
  });
});

describe('POST /play', function() {
  beforeEach(function(done) {
    process.env.SLACK_HOOK_TOKEN = slack_token;
    done();
  });

  it('should return a "No sound..." message when trigger doesn\'t exist', function(done) {
    request
      .post('/play')
      .send({
        "user_name": "lrdiv",
        "text": "thiswillneverexist",
        "token": slack_token
      })
      .end(function(err, res) {
        var text = JSON.parse(res.text).text;
        chai.expect(text).to.equal("No sound matching that trigger!");
        done();
      });
  });

  it('should return a list of sounds if no text is passed', function(done) {
    request
      .post('/play')
      .send({
        "user_name": "lrdiv",
        "text": " ",
        "token": slack_token
      })
      .end(function(err, res) {
        var text = JSON.parse(res.text).text;
        chai.expect(text).to.equal(soundmachine.getPossibleCommands());
        done();
      });
  });
});
