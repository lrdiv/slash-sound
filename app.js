require('dotenv').load();

var app = module.exports = require('koa')();
var router = require('koa-router')();
var koabody = require('koa-body')();
var validate = require('./lib/validate');

var _ = require('lodash');
var soundmachine = require('./lib/soundmachine');

router.post('/play', koabody, function *(next) {
  var params = this.request.body,
      trigger = params.text,
      user = params.user_name;

  if (!params.text || params.text.length < 2) {
    var commands = soundmachine.getPossibleCommands();
    this.response.body = { text: commands };
    return yield next;
  }

  var sound = soundmachine.findSoundFile(trigger);

  if (_.isEmpty(sound)) {
    this.response.body = { text: "No sound matching that trigger!" };
    return yield next;
  } else {
    this.response.status = 200;
    yield next;
    soundmachine.playSound(sound.filename).then(
      soundmachine.sendSlackMessage(user, sound), function(err) {
        console.error(err);
      }
    );
  }
});

app.use(router.routes());
app.use(validate());

app.listen(3000);
