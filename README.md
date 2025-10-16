

# Installing the SquadJS Plugins

This guide explains how to install and configure the **DiscordScoreboard** and **SquadCompificationLink** plugins for **SquadJS**.

---

## 1) Prerequisites

* **SquadJS** installed (Node.js 18+ recommended).
* A **Discord bot token** with permission to send messages in your chosen channel.
* For **scoreboard uploads**, a supported **mod** (see section 5).
* For **EOS player linking**, no mod dependencies - it also works on **Vinalia** and other standard Squad servers.

---

## 2) Place the plugin files

1. SSH into your SquadJS server and navigate to your install directory, e.g.:

   ```bash
   cd /opt/squadjs
   ```

2. Copy both plugin files into the `plugins` folder:

   ```
   /opt/squadjs/plugins/DiscordScoreboard.js
   /opt/squadjs/plugins/SquadCompificationLink.js
   ```

> If your setup uses folders per plugin, you can also use:
>
> ```
> /opt/squadjs/plugins/discord-scoreboard/index.js
> /opt/squadjs/plugins/squad-compification-link/index.js
> ```

---

## 3) Configure SquadJS

Open your configuration file — usually located at:

```
/opt/squadjs/config/config.json
```

### 3.1 Add or verify Discord connector

```json
{
  "connectors": {
    "discord": {
      "token": "YOUR_DISCORD_BOT_TOKEN",
      "intents": ["Guilds", "GuildMessages", "MessageContent"]
    }
  }
}
```

### 3.2 Add both plugins to the `plugins` array

Replace placeholders with your actual details:

```json
{
  "plugins": [
    {
      "plugin": "DiscordScoreboard",
      "enabled": true,
      "discordClient": "discord",
      "channelID": "123456789012345678",
      "scoreboardPath": "/home/squad/Scoreboards/",
      "waitTime": 5000
    },
    {
      "plugin": "SquadCompificationLink",
      "enabled": true,
      "apiEndpoint": "https://squad.competification.com/api-squad/eoslink",
      "apiToken": "YOUR_API_TOKEN",
      "timeout": 5000,
      "retryOnFailure": true,
      "logSuccessful": true
    }
  ]
}
```

---

## 4) Obtain Your API Key

To use the **SquadCompificationLink** plugin, you’ll need an API token.

➡️ **Join the official Squad Competification Discord:**
🔗 [https://discord.gg/TTQTnXfRAc](https://discord.gg/TTQTnXfRAc)

Once you’ve joined, **open a ticket or message a developer** to request your **API key** for Squad Competification.

You’ll receive a unique `apiToken` to insert into the plugin configuration.

---

## 5) Known Mods That Generate Scoreboards

> 🟡 **These mods are only required for the *DiscordScoreboard* plugin.**
> The **SquadCompificationLink** plugin (EOS linking) works independently and is **fully supported on vanilla servers like Vinalia** — no mod required.

| Mod Name                                  | Description                                                                                     | Link                                                                                                            |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **New Caster UI / OSI Scoreboard System** | Provides a live scoreboard and saves CSV data at the end of each round.                         | *(Included with most competitive servers)*                                                                      |
| **Competitive Squad Modpack**             | Community-driven modpack for organized competitive play. Includes automatic scoreboard exports. | [Steam Workshop › Competitive Squad Modpack](https://steamcommunity.com/sharedfiles/filedetails/?id=3561863613) |
| **Comp Skirmish (with _caster layers)**   | Training and scrim mod with scoreboard export functionality (layer names include `_caster`).    | [Steam Workshop › Comp Skirmish](https://steamcommunity.com/sharedfiles/filedetails/?id=3294562930)             |

> **Note:** The scoreboard file path may differ depending on your mod or server setup.
> Update the `scoreboardPath` in your plugin config to match where the CSV files are generated.

---

## 6) Restart SquadJS

Depending on your setup:

* **pm2**

  ```bash
  pm2 restart squadjs
  ```
* **systemd**

  ```bash
  sudo systemctl restart squadjs
  ```
* **Manual**

  ```bash
  node index.js
  ```

---

## 7) Verify Operation

### DiscordScoreboard

* When a round ends, the plugin waits the configured `waitTime` (default: 5000 ms) and posts the latest CSV from your scoreboard folder to Discord.
* Check:

    * The CSV path is correct
    * The Discord bot has permission to send messages
    * The SquadJS process can access the scoreboard directory

### SquadCompificationLink

* On round end or player data events, SquadJS sends API requests to your configured endpoint.
* Works on **both modded and vanilla servers** (including **Vinalia**).
* Logs will show success messages if `logSuccessful` is set to `true`.

---

## 8) Common Issues

| Problem            | Cause                                         | Fix                                                                                               |
| ------------------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Bot not posting    | Wrong channel ID or missing permissions       | Double-check Discord channel ID and bot permissions                                               |
| CSV not found      | Incorrect scoreboard path or file permissions | Verify output path and ensure readable by SquadJS                                                 |
| API call failing   | Missing or invalid `apiToken`                 | Join the [Squad Competification Discord](https://discord.gg/TTQTnXfRAc) and request a new API key |
| Plugin not loading | Incorrect plugin folder structure             | Ensure plugin files are in `/opt/squadjs/plugins/` and names match their `plugin` field           |

---

## ✅ Quick Checklist

* [ ] Plugins placed in `/opt/squadjs/plugins/`
* [ ] Discord connector configured
* [ ] Correct `channelID` and `scoreboardPath`
* [ ] Valid `apiToken` obtained from [Squad Competification Discord](https://discord.gg/TTQTnXfRAc)
* [ ] SquadJS restarted without config errors
* [ ] EOS linking verified on vanilla server (e.g. Vinalia)

---