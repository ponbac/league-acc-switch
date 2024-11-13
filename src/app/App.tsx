import { useMutation } from "@tanstack/react-query";
import { atomWithStorage } from "jotai/utils";
import { Button } from "@/components/ui/button";
import { Reorder } from "framer-motion";
import { useAtom, useAtomValue } from "jotai/react";
import { Card } from "@/components/ui/card";
import { AddAccountDialog } from "@/components/add-account-dialog";
import { useState } from "react";
import { XOctagon, LogIn } from "lucide-react";
import { ValidExecPath } from "@/components/valid-exec-path";
import { EditAccount } from "@/components/edit-account";
import { commands } from "@/bindings";
import { open } from "@tauri-apps/plugin-shell";

export type LeagueAccount = {
  displayName?: string;
  tag?: string;
  username: string;
  password: string;
};

export const accountsAtom = atomWithStorage<Array<LeagueAccount>>(
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
        <Card>
          <Reorder.Group
            axis="y"
            values={accounts}
            onReorder={setAccounts}
            className="flex flex-col space-y-4 px-4 py-4"
          >
            {accounts.length ?
              accounts.map((account) => (
                <Reorder.Item key={account.username} value={account}>
                  <div
                    key={account.username}
                    className="flex min-w-[18rem] flex-row items-center justify-between gap-8"
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
                        <div className="flex flex-row items-center gap-2">
                          <div className="flex flex-row items-center gap-1">
                            <button
                              onClick={() => {
                                open(
                                  `https://dpm.lol/${account.displayName}${
                                    account.tag ? `-${account.tag}` : "-EUW"
                                  }`,
                                );
                              }}
                              className="flex max-w-[16rem] flex-row items-center gap-1 truncate text-lg font-bold hover:underline"
                            >
                              {account.displayName || account.username}{" "}
                            </button>
                            {account.tag ?
                              <p className="text-sm text-muted-foreground">
                                #{account.tag}
                              </p>
                            : null}
                          </div>
                          <EditAccount account={account} />
                        </div>
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
                      <LogIn />
                    </Button>
                  </div>
                </Reorder.Item>
              ))
            : <div className="flex min-w-[18rem] flex-col items-center justify-center">
                <div className="text-lg font-bold">No Accounts</div>
                <div className="text-sm text-muted-foreground">
                  Add an account to get started
                </div>
              </div>
            }
          </Reorder.Group>
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
