import { MobileRuntime } from "./mobile";
import Prototype, { WebOperationsDashboard } from "./Prototype";

export default function App() {
  const surface = new URLSearchParams(window.location.search).get("surface");

  if (surface === "operations") {
    return <WebOperationsDashboard />;
  }

  return (
    <MobileRuntime>
      <Prototype />
    </MobileRuntime>
  );
}
