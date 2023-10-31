import { useMutation } from "@tanstack/react-query";
import { atomWithStorage } from "jotai/utils";
import * as commands from "../bindings";
import { Button } from "@/components/ui/button";
import { useAtom, useAtomValue } from "jotai/react";
import { Card } from "@/components/ui/card";
import { AddAccountDialog } from "@/components/add-account-dialog";
import { useState } from "react";
import { XOctagon } from "lucide-react";
import { ValidExecPath } from "@/components/valid-exec-path";

export type LeagueAccount = {
  displayName?: string;
  username: string;
  password: string;
};

const accountsAtom = atomWithStorage<Array<LeagueAccount>>(
  "storedAccounts",
  [],
);

export const riotClientExecPathAtom = atomWithStorage<string>(
  "riotClientExecPath",
  "C:\\Riot Games\\Riot Client\\RiotClientServices.exe",
);

export const isClientPathValidAtom = atomWithStorage<boolean>(
  "isClientPathValid",
  true,
);

function App() {
  const clientExecPath = useAtomValue(riotClientExecPathAtom);
  const isClientPathValid = useAtomValue(isClientPathValidAtom);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [accounts, setAccounts] = useAtom(accountsAtom);

  const { mutate: startLeague } = useMutation({
    mutationFn: (options: { username: string; password: string }) =>
      commands.login(options.username, options.password, clientExecPath),
    onError: (error) => {
      console.error(error);
    },
  });

  return (
    <div className="flex min-h-screen flex-col p-8">
      <ValidExecPath className="self-center" />
      <div className="flex flex-1 flex-col items-center justify-center">
        <Card className="flex flex-col space-y-4 px-4 py-4">
          {accounts.length ? (
            accounts.map((account) => (
              <div
                key={account.username}
                className="flex flex-row items-center justify-between gap-8"
              >
                <div className="flex flex-row justify-center gap-4">
                  <button
                    className="group"
                    onClick={() => {
                      setAccounts((prev) =>
                        prev.filter((a) => a.username !== account.username),
                      );
                    }}
                  >
                    <XOctagon
                      size={24}
                      className="text-muted-foreground transition-colors duration-150 group-hover:text-red-500"
                    />
                  </button>
                  <div className="flex flex-col">
                    <h1 className="max-w-[16rem] truncate text-lg font-bold">
                      {account.displayName || account.username}
                    </h1>
                    <h2 className="text-sm text-muted-foreground">
                      {account.username}
                    </h2>
                  </div>
                </div>
                <Button
                  disabled={!isClientPathValid}
                  onClick={() => {
                    startLeague({
                      username: account.username,
                      password: account.password,
                    });
                  }}
                >
                  Login
                </Button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="text-lg font-bold">No Accounts</div>
              <div className="text-sm text-muted-foreground">
                Add an account to get started
              </div>
            </div>
          )}
        </Card>
      </div>
      <div className="flex flex-row items-center justify-center">
        <AddAccountDialog
          key={accounts.length}
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onAdd={(account) => {
            setAccounts((prev) => [...prev, account]);
            setAddDialogOpen(false);
          }}
        />
      </div>
    </div>
  );
}

export default App;
