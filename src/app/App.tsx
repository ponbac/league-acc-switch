import { useMutation } from "@tanstack/react-query";
import { atomWithStorage } from "jotai/utils";
import * as commands from "../bindings";
import { Button } from "@/components/ui/button";
import { useAtom } from "jotai/react";
import { Card } from "@/components/ui/card";

type LeagueAccount = {
  displayName?: string;
  username: string;
  password: string;
};

const accountsAtom = atomWithStorage<Array<LeagueAccount>>(
  "storedAccounts",
  [],
);

function App() {
  const [accounts, setAccounts] = useAtom(accountsAtom);

  const { mutate: startLeague } = useMutation({
    mutationFn: (options: { username: string; password: string }) =>
      commands.login(options.username, options.password),
  });

  return (
    <div className="flex min-h-screen flex-col p-8">
      <div className="flex flex-1 flex-col items-center justify-center">
        <Card className="flex flex-col space-y-4 px-8 py-4">
          {accounts.map((account) => (
            <div
              key={account.username}
              className="flex flex-row items-center justify-between gap-8"
            >
              <div className="flex flex-col">
                <div className="text-lg font-bold">
                  {account.displayName || account.username}
                </div>
                <div className="text-sm text-muted-foreground">
                  {account.username}
                </div>
              </div>
              <Button
                onClick={() => {
                  startLeague({
                    username: account.username,
                    password: account.password,
                  });
                }}
              >
                Start
              </Button>
            </div>
          ))}
        </Card>
      </div>
      <div className="flex flex-row items-center justify-center">
        <Button
          onClick={() => {
            const displayName = prompt("Display Name");
            const username = prompt("Username");
            const password = prompt("Password");
            if (username && password) {
              setAccounts((prev) => [
                ...prev,
                {
                  displayName: displayName || username,
                  username,
                  password,
                },
              ]);
            }
          }}
        >
          Add Account
        </Button>
      </div>
    </div>
  );
}

export default App;
