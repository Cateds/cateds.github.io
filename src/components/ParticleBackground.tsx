import { Match, Switch, createSignal, onMount } from "solid-js";
import ParticleBackgroundCanvas from "./ParticleBackgroundCanvas";
import ParticleBackgroundWebGPU from "./ParticleBackgroundWebGPU";
import type { ParticleBackgroundProps } from "./particleBackgroundShared";

type RendererMode = "checking" | "canvas" | "webgpu";

export default function ParticleBackground(props: ParticleBackgroundProps) {
  const [renderer, setRenderer] = createSignal<RendererMode>("checking");

  onMount(() => {
    const gpuNavigator = navigator as Navigator & {
      gpu?: { requestAdapter: () => Promise<unknown> };
    };

    if (!gpuNavigator.gpu) {
      setRenderer("canvas");
      return;
    }

    void gpuNavigator.gpu
      .requestAdapter()
      .then((adapter) => {
        setRenderer(adapter ? "webgpu" : "canvas");
      })
      .catch(() => {
        setRenderer("canvas");
      });
  });

  return (
    <Switch>
      <Match when={renderer() === "webgpu"}>
        <ParticleBackgroundWebGPU {...props} onFallback={() => setRenderer("canvas")} />
      </Match>
      <Match when={renderer() === "canvas"}>
        <ParticleBackgroundCanvas {...props} />
      </Match>
    </Switch>
  );
}
