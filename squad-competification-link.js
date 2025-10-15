import axios from 'axios';
import BasePlugin from './base-plugin.js';

export default class SquadCompificationLink extends BasePlugin {
  static get description() {
    return (
      'The <code>squadcompificationLink</code> plugin sends player Steam ID and EOS ID squadcompification api ' +
      'when they connect to the server.'
    );
  }

  static get defaultEnabled() {
    return false;
  }

  static get optionsSpecification() {
    return {
      apiEndpoint: {
        required: false,
        description: 'API endpoint URL to send player data to.',
        default: 'https://squad.competification.com/api-squad/eoslink'
      },
      apiToken: {
        required: false,
        description: 'API authentication token.',
        default: ''
      },
      timeout: {
        required: false,
        description: 'API request timeout in milliseconds.',
        default: 5000
      },
      retryOnFailure: {
        required: false,
        description: 'Whether to retry failed API calls.',
        default: false
      },
      logSuccessful: {
        required: false,
        description: 'Log successful API calls (verbose level 2).',
        default: false
      }
    };
  }

  constructor(server, options, connectors) {
    super(server, options, connectors);

    this.onPlayerConnected = this.onPlayerConnected.bind(this);
    this.onPlayerListUpdate = this.onPlayerListUpdate.bind(this);
    this.sendToAPI = this.sendToAPI.bind(this);

    this.processedPlayers = new Set();
  }

  async mount() {
    this.verbose(1, 'APIEOSLink plugin mounting...');
    this.server.on('PLAYER_CONNECTED', this.onPlayerConnected);
    this.server.on('UPDATED_PLAYER_INFORMATION', this.onPlayerListUpdate);
    this.verbose(1, 'APIEOSLink plugin mounted and listening for player events.');
  }

  async unmount() {
    this.server.removeEventListener('PLAYER_CONNECTED', this.onPlayerConnected);
    this.server.removeEventListener('UPDATED_PLAYER_INFORMATION', this.onPlayerListUpdate);
    this.verbose(1, 'APIEOSLink plugin unmounted.');
  }

  async onPlayerListUpdate() {
    try {
      this.verbose(3, `Player list updated - ${this.server.players.length} players online`);

      for (const player of this.server.players) {
        if (!player.steamID || !player.eosID) {
          continue;
        }

        const playerKey = `${player.steamID}_${player.eosID}`;
        

        if (this.processedPlayers.has(playerKey)) {
          continue;
        }

        this.verbose(2, `New player found in list - Name: ${player.name}, SteamID: ${player.steamID}, EOSID: ${player.eosID}`);


        await this.sendToAPI(player.steamID, player.eosID, player.name);


        this.processedPlayers.add(playerKey);
      }

     
      const currentPlayerKeys = new Set(
        this.server.players
          .filter(p => p.steamID && p.eosID)
          .map(p => `${p.steamID}_${p.eosID}`)
      );

      for (const key of this.processedPlayers) {
        if (!currentPlayerKeys.has(key)) {
          this.processedPlayers.delete(key);
          this.verbose(3, `Removed disconnected player from cache`);
        }
      }
    } catch (error) {
      this.verbose(1, `ERROR in onPlayerListUpdate: ${error.message}`);
      this.verbose(2, error.stack);
    }
  }

  async onPlayerConnected(data) {
    try {
      this.verbose(1, '=== PLAYER_CONNECTED event received ===');
      this.verbose(1, `Raw data: ${JSON.stringify(data, null, 2)}`);

      if (!data) {
        this.verbose(1, 'ERROR: No data received in event');
        return;
      }

      this.verbose(2, `Event data keys: ${Object.keys(data).join(', ')}`);

      const { player } = data;

      if (!player) {
        this.verbose(1, 'WARNING: Player object not available in connection event.');
        this.verbose(1, `Available data: ${JSON.stringify(data, null, 2)}`);
        return;
      }

      this.verbose(2, `Player object keys: ${Object.keys(player).join(', ')}`);
      this.verbose(2, `Player name: ${player.name || 'N/A'}`);

      const steamID = player.steamID;
      const eosID = player.eosID;

      this.verbose(1, `Extracted - SteamID: ${steamID || 'MISSING'}, EOSID: ${eosID || 'MISSING'}`);

      if (!steamID || !eosID) {
        this.verbose(
          1,
          `ERROR: Missing IDs for player ${player.name || 'unknown'} - SteamID: ${steamID || 'N/A'}, EOSID: ${eosID || 'N/A'}`
        );
        return;
      }


      const playerKey = `${steamID}_${eosID}`;
      if (this.processedPlayers.has(playerKey)) {
        this.verbose(2, `Player ${player.name} (${steamID}) already processed, skipping API call.`);
        return;
      }

      this.verbose(1, `✓ Player connected - Name: ${player.name}, SteamID: ${steamID}, EOSID: ${eosID}`);

      await this.sendToAPI(steamID, eosID, player.name);

      this.processedPlayers.add(playerKey);
      this.verbose(2, `Added player to processed list (total: ${this.processedPlayers.size})`);

      if (this.processedPlayers.size > 500) {
        const entries = Array.from(this.processedPlayers);
        this.processedPlayers = new Set(entries.slice(-500));
        this.verbose(2, 'Cleaned up processed players cache');
      }
    } catch (error) {
      this.verbose(1, `ERROR in onPlayerConnected: ${error.message}`);
      this.verbose(1, error.stack);
    }
  }

  async sendToAPI(steamID, eosID, playerName = 'Unknown', retryCount = 0) {
    try {
      this.verbose(1, `Sending link to API for ${playerName}: SteamID=${steamID}, EOSID=${eosID}`);

      const response = await axios({
        method: 'PUT',
        url: this.options.apiEndpoint,
        headers: {
          'X-Squad-JS-Token': this.options.apiToken,
          'Content-Type': 'application/json'
        },
        data: {
          steamid: steamID,
          eosid: eosID
        },
        timeout: this.options.timeout
      });

      if (response.data && response.data.success) {
        if (this.options.logSuccessful) {
          this.verbose(
            2,
            `Successfully linked player: ${response.data.message || 'Link saved'}`
          );
          this.verbose(3, `API Response:`, response.data);
        }
      } else {
        this.verbose(1, `API returned unsuccessful response:`, response.data);
      }
    } catch (error) {
      this.verbose(1, `Failed to send link to API: ${error.message}`);

      if (error.response) {
        this.verbose(
          1,
          `API Error - Status: ${error.response.status}, Data:`,
          error.response.data
        );
      } else if (error.request) {
        this.verbose(1, `API Error - No response received from server`);
      }

      if (this.options.retryOnFailure && retryCount < 2) {
        this.verbose(1, `Retrying API call (attempt ${retryCount + 2}/3)...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return this.sendToAPI(steamID, eosID, retryCount + 1);
      }
    }
  }
}

