// @ts-check
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";

import { satteri } from "@astrojs/markdown-satteri";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import { mathjaxPlugin } from "./src/markdown/mathjax";

// https://astro.build/config
export default defineConfig({
  site: "https://cateds.github.io",
  integrations: [svelte()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // material-color-utilities' barrel pulls in a module with a broken extensionless
      // import, and its `exports` map blocks deep imports. Alias straight to the files.
      alias: {
        $mcu: fileURLToPath(
          new URL("./node_modules/@material/material-color-utilities", import.meta.url),
        ),
      },
    },
  },
  markdown: {
    processor: satteri({
      features: { math: true },
      hastPlugins: [mathjaxPlugin],
    }),
    syntaxHighlight: "shiki",
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      defaultColor: false,
      transformers: [
        {
          name: "line-numbers",
          pre(node) {
            this.addClassToHast(node, "has-line-numbers");
          },
          line(node, line) {
            this.addClassToHast(node, "code-line");
            node.properties.dataLine = line;
          },
          code(node) {
            node.children = node.children.filter(
              (child) => child.type !== "text" || child.value !== "\n",
            );
          },
        },
      ],
    },
  },
});
