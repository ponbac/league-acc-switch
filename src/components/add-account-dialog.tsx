import { LeagueAccount } from "@/app/App";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function AddAccountDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (account: LeagueAccount) => void;
  editAccount?: LeagueAccount;
  customTrigger?: React.ReactNode;
}) {
  const mode = props.editAccount ? "Edit" : "Add";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const clearFields = () => {
    setUsername("");
    setPassword("");
    setDisplayName("");
  };

  // submit on enter (todo: should use proper form)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && username && password) {
        props.onAdd({ username, password, displayName });
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [username, password, displayName, props]);

  useEffect(() => {
    if (props.editAccount && props.open) {
      setUsername(props.editAccount.username);
      setPassword(props.editAccount.password);
      setDisplayName(props.editAccount.displayName || "");
    }
  }, [props.editAccount, props.open]);

  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => {
        props.onOpenChange(open);
        if (!open) {
          clearFields();
        }
      }}
    >
      <DialogTrigger asChild>
        {props.customTrigger ? (
          props.customTrigger
        ) : (
          <Button>Add account</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[85%] rounded-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "Add" ? "Add League account" : "Edit account"}
          </DialogTitle>
          <DialogDescription>
            These credentials will be stored locally on your computer.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            placeholder="Display name (optional)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            disabled={!username || !password}
            onClick={() => props.onAdd({ username, password, displayName })}
          >
            {mode === "Add" ? "Add" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
