import APIServer from "./APIServer.mjs"
import { renderWithTemplate, getGameCategory } from "./utils.mjs";

export default class GameList {
  constructor(endpoint, payload, listElement, gameCardTemplate) {
    this.endpoint = endpoint;
    this.payload = payload;
    this.listElement = listElement;
    this.gameCardTemplate = gameCardTemplate;
    this.gameList= [];
  }

  renderGame() {
    renderWithTemplate(this.gameList,this.listElement,this.gameCardTemplate)
  }

  async init() {
        let dataSource = new APIServer;
        let data = await dataSource.fetchData(this.endpoint, this.payload);

        for (const game of data) {
            game.cover.url = `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.webp`;
            game.category = getGameCategory(game.category)
            this.gameList.push(game)
        }
        this.renderGame();
    }   
}