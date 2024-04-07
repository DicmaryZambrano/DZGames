import APIServer from "./APIServer.mjs"
import { renderWithTemplate, getCategory } from "./utils.mjs";

export default class GameDetails {
  constructor(endpoint, payload, parentElement, gameCardTemplate) {
    this.endpoint = endpoint;
    this.payload = payload;
    this.game = {};
    this.parentElement = parentElement;
    this.gameCardTemplate = gameCardTemplate;
  }

  renderGame() {
    renderWithTemplate(this.game, this.parentElement, this.gameCardTemplate);
  }

  async init() {
    let dataSource = new APIServer;
    let game = await dataSource.fetchData(this.endpoint, this.payload);

    this.game.id = game.id;
    this.game.name = game.name;
    this.game.category = getCategory(game.category);

    if (game.cover) {
        let cover = await dataSource.fetchData("/covers", `
            fields image_id;
            where id = (${game.cover});
        `);
        this.game.cover = `https://images.igdb.com/igdb/image/upload/t_cover_big/${cover[0].image_id}.jpg`;
    } else {
        this.game.cover = null;
    }

    if (game.game_modes) {
        let gameModes = await dataSource.fetchData("/game_modes", `
            fields name;
            where id = (${game.game_modes.join(",")});
        `);
        this.game.game_modes = gameModes;
    } else {
        this.game.game_modes = null;
    }

    if (game.genres) {
        let genres = await dataSource.fetchData("/genres", `
            fields name;
            where id = (${game.genres.join(",")});
        `);
        this.game.genres = genres;
    } else {
        this.game.genres = null;
    }

    if (game.platforms) {
        let platforms = await dataSource.fetchData("/platforms", `
            fields name;
            where id = (${game.platforms.join(",")});
        `);
        this.game.platforms = platforms;
    } else {
        this.game.platforms = null;
    }

    if (game.summary) {
      this.game.summary = game.summary;
    } else {
        this.game.summary = null;
    }

    this.renderGame();
}
}