
## DiscordScoreboard

Posts match scoreboard CSV files ( When having the OSI mod install on your Squad server ) to a Discord channel when a round ends.

### Configuration parameters

```json
{
  "plugin": "DiscordScoreboard",
  "enabled": true,
  "discordClient": "discord",
  "channelID": "",
  "scoreboardPath": "/PATH/TO/OSI_Scoreboards/",
  "waitTime": 1000
}
```

### Params

- `plugin`: Must be `"DiscordScoreboard"`
- `enabled`: Set to `true` to activate the plugin
- `discordClient`: Discord connector name from config (usually `"discord"`)
- `channelID`: The Discord channel ID where scoreboards will be posted
- `scoreboardPath`: Path to the OSI_Scoreboards directory on your server
- `waitTime`: Time in milliseconds to wait after round ends before looking for CSV file (default: 5000)

---

## Link plugin - For Squad Compification

### Params

```json
{
  "plugin": "SquadCompificationLink",
  "enabled": true,
  "apiEndpoint": "https://squad.competification.com/api-squad/eoslink",
  "apiToken": "",
  "timeout": 1000,
  "retryOnFailure": true,
  "logSuccessful": true
}
```

### Details

- `plugin`: Must be `"SquadCompificationLink"`
- `enabled`: Set to `true` to activate the plugin
- `apiEndpoint`: API endpoint URL to send player data to
- `apiToken`: Your API authentication token
- `timeout`: API request timeout in milliseconds (default: 5000)
- `retryOnFailure`: Whether to retry failed API calls (default: false)
- `logSuccessful`: Log successful API calls at verbose level 2 (default: false)

---

