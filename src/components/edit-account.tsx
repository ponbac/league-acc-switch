import { LeagueAccount, accountsAtom } from "@/app/App";
import { AddAccountDialog } from "./add-account-dialog";
import { useState } from "react";
import { useAtom } from "jotai/react";
import { Settings2 } from "lucide-react";

export function EditAccount(props: { account: LeagueAccount }) {
  const [accounts, setAccounts] = useAtom(accountsAtom);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  return (
    <AddAccountDialog
      open={editDialogOpen}
      onOpenChange={setEditDialogOpen}
      onAdd={(updatedAccount) => {
        setAccounts(
          accounts.map((account) =>
            account.username === props.account.username
              ? updatedAccount
              : account,
          ),
        );
        setEditDialogOpen(false);
      }}
      editAccount={props.account}
      customTrigger={
        <button className="transition-colors hover:text-primary">
          <Settings2 size={14} />
        </button>
      }
    />
  );
}
