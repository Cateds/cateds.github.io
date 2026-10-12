import MathJax from "mathjax";
import { defineHastPlugin } from "satteri";

const mathjax = MathJax.init({
  loader: { load: ["input/tex", "output/svg"] },
  svg: { fontCache: "local" },
});

export const mathjaxPlugin = defineHastPlugin({
  name: "mathjax",
  element: {
    filter: ["code"],
    async visit(node, ctx) {
      const classNames = Array.isArray(node.properties?.className) ? node.properties.className : [];
      const display = classNames.includes("math-display");

      if (!display && !classNames.includes("math-inline")) return;

      const engine = await mathjax;
      const result = await engine.tex2svgPromise(ctx.textContent(node), {
        display,
      });
      const rendered = {
        type: "raw" as const,
        value: engine.startup.adaptor.outerHTML(result),
      };
      const parent = ctx.parent(node);

      if (display && parent?.type === "element" && parent.tagName === "pre") {
        ctx.replaceNode(parent, rendered);
        return;
      }

      ctx.replaceNode(node, rendered);
    },
  },
});
