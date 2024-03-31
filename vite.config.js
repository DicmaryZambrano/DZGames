import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/",
  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        game: resolve(__dirname, "src/game_details/index.html"),
        explore: resolve(__dirname, "src/explore/index.html"),
        wishlist: resolve(__dirname, "src/wishlist/index.html")
      },
    },
  },
});
