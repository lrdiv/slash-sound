# /sound

## Slack Incoming WebHook Configuration
1. Go to `https://SLACKDOMAIN.slack.com/services`
2. Find **Incoming WebHooks** and click it
3. Click the green "Add" button
4. Choose the channel you want to announce to when someone plays a sound, then click **Add Incoming WebHooks Integration**
5. Copy the **Webhook URL** down somewhere, you'll need it later.

## Slack Slash Command Configuration
1. Go back to "All Integrations" page
2. Find **Slash Commands** and click it
3. Click the green "Add" button (it's at the bottom this time)
4. From the "Outgoing Data" section, copy the value of the `token`

## Running on a Raspberry Pi
1. Clone the repo on your Pi
2. Create a `.env` file in the project root
3. Add the following environment variables
  - `SLACK_HOOK_URL` - the webhook URL
  - `SLACK_HOOK_TOKEN` - the slash command token
4. `npm install`
5. `sudo apt-get install mpg123`
6. `forever start bin/www`

## Accessing the Raspberry Pi
I recommend using a service like [ngrok](https://ngrok.io) on the Raspberry Pi to get a dedicated subdomain for the application. Once you have this set up, you can finish configuring your slash command with the URL where the app is accessible. **Note that the endpoint will be `/play`**

## Adding New Sounds
1. Put the mp3 file in the sounds directory
2. Open `lib/sounds.js` in your editor
3. Add a new object to the array of sounds, the `trigger` is the text passed after your slash command and the `filename` is the name of the mp3 file (relative to the sounds directory).
