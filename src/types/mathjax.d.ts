declare module "mathjax" {
  // MathJax ships no type declarations; only `init` is used at build time.
  const MathJax: { init(config: unknown): Promise<any> };
  export default MathJax;
}
