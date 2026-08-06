import { LogOut } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuth } from "@/lib/auth";

export function Topbar({ title }: { title: string }) {
  const { user, signOut } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card/60 px-6 backdrop-blur">
      <h1 className="text-lg font-semibold">{title}</h1>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        {user && (
          <>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight">{user.display_name}</p>
              <Badge variant="secondary" className="mt-0.5">
                {user.role}
              </Badge>
            </div>
            <Avatar>
              <AvatarFallback>{user.avatar_initials}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
