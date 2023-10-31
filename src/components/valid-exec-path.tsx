import * as commands from "@/bindings";
import { isClientPathValidAtom, riotClientExecPathAtom } from "@/app/App";
import { useAtom, useSetAtom } from "jotai/react";
import { BadgeCheck, XOctagon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";

export function ValidExecPath(props: { className?: string }) {
  const [clientExecPath, setClientExecPath] = useAtom(riotClientExecPathAtom);
  const setClientPathValid = useSetAtom(isClientPathValidAtom);

  const { data: isClientPathValid } = useQuery({
    queryKey: ["isClientPathValid", clientExecPath],
    queryFn: () => commands.checkExec(clientExecPath),
  });

  useEffect(() => {
    if (isClientPathValid) {
      setClientPathValid(true);
    } else {
      setClientPathValid(false);
    }
  }, [isClientPathValid, setClientPathValid]);

  return (
    <Card className={cn("px-4 py-2", props.className)}>
      <div className="flex flex-row items-center justify-between gap-8">
        <div className="flex flex-row items-center justify-center gap-2">
          {isClientPathValid ? (
            <BadgeCheck className="text-green-600" />
          ) : (
            <XOctagon className="text-red-500" />
          )}
          <div className="flex flex-col">
            <div className="text-sm font-medium">Riot Client Services</div>
            <div className="text-xs text-muted-foreground">
              {clientExecPath || "Not set"}
            </div>
          </div>
        </div>
      </div>
      {!isClientPathValid ? (
        <div className="text-sm text-red-500">
          Invalid League of Legends Client Path
        </div>
      ) : null}
    </Card>
  );
}
