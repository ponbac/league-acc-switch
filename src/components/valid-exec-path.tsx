import * as commands from "@/bindings";
import { open } from "@tauri-apps/api/dialog";
import { isClientPathValidAtom, riotClientExecPathAtom } from "@/app/App";
import { useAtom, useSetAtom } from "jotai/react";
import { BadgeCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";
import React from "react";

export function ValidExecPath(props: { className?: string }) {
  const [clientExecPath, setClientExecPath] = useAtom(riotClientExecPathAtom);
  const setClientPathValid = useSetAtom(isClientPathValidAtom);

  const { data: isClientPathValid } = useQuery({
    queryKey: ["isClientPathValid", clientExecPath],
    queryFn: () => commands.checkExec(clientExecPath),
  });

  const onPathSelected = React.useCallback(
    async (path: string) => {
      setClientExecPath(path);
    },
    [setClientExecPath],
  );

  useEffect(() => {
    if (isClientPathValid) {
      setClientPathValid(true);
    } else {
      setClientPathValid(false);
    }
  }, [isClientPathValid, setClientPathValid]);

  return (
    <Card className={cn("px-4 py-2", props.className)}>
      <div className="flex flex-row items-center justify-center gap-2">
        {isClientPathValid ? (
          <>
            <BadgeCheck className="text-green-600" />
            <div className="flex flex-col">
              <div className="text-sm font-medium">Riot Client Services</div>
              <button
                className="text-xs text-muted-foreground hover:underline"
                onClick={async () => {
                  const selectedPath = await open({
                    multiple: false,
                    directory: false,
                  });

                  if (selectedPath && !Array.isArray(selectedPath)) {
                    onPathSelected(selectedPath);
                  }
                }}
              >
                {clientExecPath || "Not set"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-sm text-red-500">
              <button
                className="hover:underline"
                onClick={async () => {
                  const selectedPath = await open({
                    multiple: false,
                    directory: false,
                  });

                  if (selectedPath && !Array.isArray(selectedPath)) {
                    onPathSelected(selectedPath);
                  }
                }}
              >
                Riot Client not found, click here to set path to{" "}
                <span className="font-mono">RiotClientServices.exe</span>
              </button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
