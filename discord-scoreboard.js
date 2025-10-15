import fs from 'fs';
import path from 'path';
import { AttachmentBuilder } from 'discord.js';
import Client from 'ssh2-sftp-client';

import DiscordBasePlugin from './discord-base-plugin.js';

export default class DiscordScoreboard extends DiscordBasePlugin {
  static get description() {
    return (
      'The <code>DiscordScoreboard</code> plugin will post match scoreboard CSV files to a Discord ' +
      'channel when a round ends.'
    );
  }

  static get defaultEnabled() {
    return false;
  }

  static get optionsSpecification() {
    return {
      ...DiscordBasePlugin.optionsSpecification,
      channelID: {
        required: true,
        description: 'The ID of the channel to post scoreboards to.',
        default: '',
        example: ''
      },
      scoreboardPath: {
        required: false,
        description: 'Path to the OSI_Scoreboards directory on the server.',
        default: '/SquadGame/Saved/OSI_Scoreboards/'
      },
      waitTime: {
        required: false,
        description: 'Time to wait (in milliseconds) after round ends before looking for CSV file.',
        default: 5000
      }
    };
  }

  constructor(server, options, connectors) {
    super(server, options, connectors);

    this.onRoundEnded = this.onRoundEnded.bind(this);
  }

  async mount() {
    this.server.on('ROUND_ENDED', this.onRoundEnded);
    this.verbose(1, 'DiscordScoreboard plugin mounted.');
  }

  async unmount() {
    this.server.removeEventListener('ROUND_ENDED', this.onRoundEnded);
    this.verbose(1, 'DiscordScoreboard plugin unmounted.');
  }

  async onRoundEnded(info) {
    this.verbose(1, 'Round ended, looking for scoreboard CSV...');

    try {
      await new Promise((resolve) => setTimeout(resolve, this.options.waitTime));


      const csvFile = await this.findLatestScoreboardFile();

      if (!csvFile) {
        this.verbose(1, 'No scoreboard CSV file found.');
        return;
      }

      this.verbose(1, `Found scoreboard file: ${csvFile}`);


      await this.sendScoreboardToDiscord(csvFile, info);

      this.verbose(1, 'Scoreboard posted to Discord successfully.');
    } catch (error) {
      this.verbose(1, `Error posting scoreboard: ${error.message}`);
      this.verbose(2, error.stack);
    }
  }

  async findLatestScoreboardFile() {
    try {
      const scoreboardDir = this.options.scoreboardPath;


      if (this.server.options.logReaderMode === 'sftp') {
        return await this.findLatestScoreboardFileSFTP(scoreboardDir);
      } else {
        return await this.findLatestScoreboardFileLocal(scoreboardDir);
      }
    } catch (error) {
      this.verbose(1, `Error finding latest scoreboard file: ${error.message}`);
      return null;
    }
  }

  async findLatestScoreboardFileLocal(scoreboardDir) {
    if (!fs.existsSync(scoreboardDir)) {
      this.verbose(1, `Scoreboard directory does not exist: ${scoreboardDir}`);
      return null;
    }


    const files = await fs.promises.readdir(scoreboardDir);


    const csvFiles = files.filter((file) => file.endsWith('.csv'));

    if (csvFiles.length === 0) {
      this.verbose(1, 'No CSV files found in scoreboard directory.');
      return null;
    }


    let latestFile = null;
    let latestTime = 0;

    for (const file of csvFiles) {
      const filePath = path.join(scoreboardDir, file);
      const stats = await fs.promises.stat(filePath);

      if (stats.mtimeMs > latestTime) {
        latestTime = stats.mtimeMs;
        latestFile = filePath;
      }
    }

    return latestFile;
  }

  async findLatestScoreboardFileSFTP(scoreboardDir) {
    const sftp = new Client();

    try {

      await sftp.connect(this.server.options.sftp);

      this.verbose(1, `Connected to SFTP server, checking directory: ${scoreboardDir}`);


      const dirExists = await sftp.exists(scoreboardDir);
      if (!dirExists) {
        this.verbose(1, `Scoreboard directory does not exist: ${scoreboardDir}`);
        await sftp.end();
        return null;
      }


      const files = await sftp.list(scoreboardDir);


      const csvFiles = files
        .filter((file) => file.name.endsWith('.csv') && file.type === '-')
        .sort((a, b) => b.modifyTime - a.modifyTime);

      if (csvFiles.length === 0) {
        this.verbose(1, 'No CSV files found in scoreboard directory.');
        await sftp.end();
        return null;
      }


      const latestFile = csvFiles[0];
      const latestFilePath = path.join(scoreboardDir, latestFile.name);

      this.verbose(1, `Found latest scoreboard file: ${latestFile.name}`);


      const tempDir = '/tmp/squadjs-scoreboards';
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const localFilePath = path.join(tempDir, latestFile.name);
      await sftp.get(latestFilePath, localFilePath);

      this.verbose(1, `Downloaded scoreboard file to: ${localFilePath}`);

      await sftp.end();

      return localFilePath;
    } catch (error) {
      this.verbose(1, `Error accessing SFTP: ${error.message}`);
      try {
        await sftp.end();
      } catch (e) {

      }
      return null;
    }
  }

  async sendScoreboardToDiscord(csvFilePath, roundInfo) {
    try {

      const layerName = this.server.currentLayer?.name || 'Unknown Map';
      const winner = roundInfo.winner || 'Unknown';
      const fileName = path.basename(csvFilePath);


      const attachment = new AttachmentBuilder(csvFilePath, { name: fileName });

      await this.channel.send({
        content: `**Match Scoreboard**\nWinner: **${winner}**\n Map: **${layerName}**`,
        files: [attachment]
      });
    } catch (error) {
      this.verbose(1, `Error sending scoreboard to Discord: ${error.message}`);
      this.verbose(2, error.stack);
      throw error;
    }
  }
}

