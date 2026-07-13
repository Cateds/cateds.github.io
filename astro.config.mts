// @ts-check
import { defineConfig } from "astro/config";

import { satteri } from "@astrojs/markdown-satteri";
import solid from "@astrojs/solid-js";
import { mathjaxPlugin } from "./src/markdown/mathjax";

// https://astro.build/config
export default defineConfig({
  site: "https://cateds.github.io",
  integrations: [solid()],
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
