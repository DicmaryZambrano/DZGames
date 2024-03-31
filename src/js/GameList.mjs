import APIServer from "./APIServer.mjs"
import { renderWithTemplate, getCategory } from "./utils.mjs";

export default class GameList {
  constructor(endpoint, payload, listElement, gameCardTemplate) {
    this.endpoint = endpoint;
    this.payload = payload;
    this.gameList = [];
    this.listElement = listElement;
    this.gameCardTemplate = gameCardTemplate;
  }

  renderGameList() {
    renderWithTemplate(this.gameList, this.listElement, this.gameCardTemplate);
  }

  async init() {
    let dataSource = new APIServer;
    let data = await dataSource.fetchData(this.endpoint, this.payload);

    for (const game of data) {
        const json = {};
        json.id = game.id;
        json.name = game.name;
        json.category = getCategory(game.category);

        if (game.cover) {
            let cover = await dataSource.fetchData("/covers", `
                fields image_id;
                where id = (${game.cover});
            `);
            json.cover = `https://images.igdb.com/igdb/image/upload/t_cover_big/${cover[0].image_id}.jpg`;
        } else {
            json.cover = null;
        }

        if (game.game_modes) {
            let gameModes = await dataSource.fetchData("/game_modes", `
                fields name;
                where id = (${game.game_modes.join(",")});
            `);
            json.game_modes = gameModes;
        } else {
            json.game_modes = null;
        }

        if (game.genres) {
            let genres = await dataSource.fetchData("/genres", `
                fields name;
                where id = (${game.genres.join(",")});
            `);
            json.genres = genres;
        } else {
            json.genres = null;
        }

        if (game.platforms) {
            let platforms = await dataSource.fetchData("/platforms", `
                fields name;
                where id = (${game.platforms.join(",")});
            `);
            json.platforms = platforms;
        } else {
            json.platforms = null;
        }

        if (game.summary) {
          json.summary = game.summary;
        } else {
            json.summary = null;
        }

        this.gameList.push(json);
    }

    this.renderGameList();
}
}