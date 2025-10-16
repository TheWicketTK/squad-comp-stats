# 🧩 Installing SquadJS Plugins

### *DiscordScoreboard* & *SquadCompificationLink*

This guide explains how to install, configure, and use the **DiscordScoreboard** and **SquadCompificationLink** plugins with **SquadJS**.

---

## ⚙️ Prerequisites

Before you begin, make sure you have:

* ✅ A working [**SquadJS**](https://github.com/Team-Silver-Sphere/SquadJS) installation connected to your game server.
* 🤖 A **Discord bot token** with permission to send messages in your desired channel.
* 📁 For scoreboard uploads — a **supported mod** (see [Supported Mods](#supported-mods)).
* 🔑 For EOS player linking — an **API key** from [Squad Competification](https://discord.gg/TTQTnXfRAc).

---

## 📥 Installation

1. **Copy the plugin files** into your SquadJS plugins folder:

   ```
   /squad-server/plugins/discord-scoreboard.js
   /squad-server/plugins/squad-competification-link.js
   ```



2. Open you `config.json` **Add both plugins** to the `plugins` array and fill in your details:

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
> 💡 **Tip:** The scoreboard path may vary depending on your mod or server setup.
> Update the `"scoreboardPath"` in your config to match where your server saves the CSV files.   

3. **Restart SquadJS** to apply the changes.



---

## 🔑 Getting Your API Key

The **SquadCompificationLink** plugin requires an API key to communicate with the **Squad Competification** platform.

1. Join the **official Squad Competification Discord**:
   🔗 [https://discord.gg/TTQTnXfRAc](https://discord.gg/TTQTnXfRAc)

2. Once you’ve joined, **open a support ticket or message a developer** to request your **API key**.

3. You’ll receive a unique `apiToken` copy it into your plugin configuration under `"apiToken"`.

---

## 🧾 Supported Mods for Scoreboard Exports

> ⚠️ These mods are **only required** for the **DiscordScoreboard** plugin.
> The **SquadCompificationLink** plugin (EOS linking) works **independently** and is fully supported on **vanilla layers**.

| Mod Name                                  | Description                                                                         | Link                                                                                                            |
| ----------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **New Caster UI / OSI Scoreboard System** | Provides a live scoreboard and saves CSV data at the end of each round.             | *(Bundled with most competitive servers)*                                                                       |
| **Competitive Squad Modpack**             | Community-driven modpack for organized play. Includes automatic scoreboard exports. | [Steam Workshop › Competitive Squad Modpack](https://steamcommunity.com/sharedfiles/filedetails/?id=3561863613) |
| **Comp Skirmish (with `_caster` layers)** | Training/scrim mod that supports scoreboard export (layers ending with `_caster`).  | [Steam Workshop › Comp Skirmish](https://steamcommunity.com/sharedfiles/filedetails/?id=3294562930)             |

