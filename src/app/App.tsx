import { useQuery } from "@tanstack/react-query";
import * as commands from "../bindings";

function getGreeting(name: string) {
  return commands.hello(name);
}

function App() {
  const { data: greeting } = useQuery({
    queryKey: ["greeting"],
    queryFn: () => getGreeting("Pontus"),
  });

  return (
    <div className="flex min-h-screen flex-col">
      <h1>Tauri + React + Vite + shadcn/ui template!</h1>
      <p>{greeting}</p>
    </div>
  );
}

export default App;
