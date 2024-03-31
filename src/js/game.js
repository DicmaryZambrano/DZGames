import gameDetails from "./GameList.mjs";
import { getParam } from "./utils.mjs";

const pokeDetailsCardFunc = function (game) {
  return ` 
  <div class="game-card">
    <img
      src=${game.sprites.front_default}
      alt=${game.name}
    />
    <img
    src=${game.sprites.back_default}
    alt=${game.name}
    />
    <h3 class="game-card__name">${game.name}</h3>
    <h4 class="game-card__type">${game.types[0].type.name}</h4>
    <p>
      <span class="game-card__weight">weight= ${game.weight}</span>
      <span class="game-card__moves">moves= ${game.moves[0].move.name},${game.moves[1].move.name},${game.moves[2].move.name}</span>
    </p>
  </div>
  `;
};


const gameName = getParam("game");

const gameDetails = new gameDetails(
  gameName,
  "#game",
  pokeDetailsCardFunc,
);
gameDetails.init();