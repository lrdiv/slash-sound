module.exports = function validate() {
  return function *validate(next) {
    if (this.request.body.token != process.env.SLACK_HOOK_TOKEN) {
      this.throw(401, "Invalid Slack token");
    } else {
      return yield next;
    }
  };
};
