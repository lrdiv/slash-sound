var fs        = require('fs');
var _         = require('lodash');
var Promise   = require('promise');
var Sound     = require('node-mpg123');
var jsonfile  = require('jsonfile');

var Slack     = require('node-slack');
var slack     = new Slack(process.env.SLACK_HOOK_URL);

var sounds    = jsonfile.readFileSync(__dirname + '/../sounds.json');

module.exports = {

  getPossibleCommands: function() {
    return _.pluck(sounds, 'trigger').join(', ');
  },

  findSoundFile: function(trigger) {
    var sound = {};
    if (trigger == 'random') {
      sound.random = true;
      random = _.sample(sounds);
      sound = _.assign(sound, random);
    } else {
      sound = _.assign(sound, _.first(_.where(sounds, { trigger: trigger })));
    }
    return sound;
  },

  playSound: function(file) {
    return new Promise(function(resolve, reject) {
      var player = new Sound(process.cwd() + "/sounds/" + file);
      player.play();
      
      player.on('complete', function() {
        resolve();
      });
      
      player.on('error', function(err) {
        reject(err);
      });
    });
  },

  sendSlackMessage: function(user, sound) {
    if (user) {
      var slackText = '@' + user + " just triggered the \"" + sound.trigger + "\" sound";
      if (sound.random) {
        slackText += " via \"random\"";
      }
      slack.send({
        text: slackText,
        channel: '#yolo',
        username: 'Soundbot',
        icon_emoji: ':ohgoodforyouuu:'
      });
    }
  }
};
