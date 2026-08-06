import * as React from "react";
import { motion } from "framer-motion";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Building2, Loader2, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listDemoUsers } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { DemoUser } from "@/types/api";

export default function LoginPage() {
  const { user, signIn, isAuthenticating } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [demoUsers, setDemoUsers] = React.useState<DemoUser[]>([]);

  React.useEffect(() => {
    listDemoUsers()
      .then(setDemoUsers)
      .catch(() => setDemoUsers([]));
  }, []);

  if (user) {
    const from = (location.state as { from?: Location })?.from?.pathname ?? "/dashboard";
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signIn(username, password);
      navigate("/dashboard");
    } catch {
      setError("Sign-in failed. Check your username and password, or pick a demo persona below.");
    }
  };

  const quickLogin = async (demoUser: DemoUser) => {
    setUsername(demoUser.username);
    setPassword(demoUser.password);
    setError(null);
    try {
      await signIn(demoUser.username, demoUser.password);
      navigate("/dashboard");
    } catch {
      setError("Sign-in failed for the selected demo persona.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/5 px-4">
      <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">EXLSmartAssist</h1>
          <p className="text-sm text-muted-foreground">GenAI-powered Enterprise Operations Copilot</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-primary" />
              Sign in with Microsoft Entra ID
            </CardTitle>
            <CardDescription className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-success" />
              Mock SSO for demo purposes — no real Entra ID tenant required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                placeholder="Username (e.g. agent.priya)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isAuthenticating}>
                {isAuthenticating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
              </Button>
            </form>

            <div className="mt-5">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Or continue as a demo persona:</p>
              <div className="grid gap-2">
                {demoUsers.map((demoUser) => (
                  <button
                    key={demoUser.username}
                    onClick={() => quickLogin(demoUser)}
                    className="flex items-center justify-between rounded-md border border-input px-3 py-2 text-left text-sm transition-colors hover:bg-secondary"
                  >
                    <span className="font-medium">{demoUser.display_name}</span>
                    <span className="text-xs text-muted-foreground">{demoUser.role}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
