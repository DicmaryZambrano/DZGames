import APIServer from "./APIServer.mjs"
import { renderWithTemplate } from "./utils.mjs";

export default class GameDetails {
  constructor(gameID, payload, listElement, gameCardTemplate) {
    this.gameID = pokemonName;
    this.gameData = {};
    this.listElement = listElement;
    this.pokemonCardTemplate = pokemonCardTemplate;
  }

  renderGameDetails() {
    renderWithTemplate(this.gameData, this.listElement, gameCardTemplate);
  }

  async init() {
    let dataSource = new APIServer;
    this.pokemonData = await dataSource.fetchData("/games", payload);
    this.renderPokemon()
  }
}
