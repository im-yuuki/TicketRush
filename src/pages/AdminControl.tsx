import { Button, Card, Input } from "@heroui/react";
import { ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Navigate } from "react-router";
import {
  createOrganization,
  lockAccount,
  unlockAccount,
  verifyOrganization,
} from "../api/admin";
import { getOrganizationInfo, getOrganizationInfoByAlias } from "../api/public";
import { useAuth } from "../contexts/AuthContext";
import type { PublicOrganizationInfo } from "../types/requestDto";

type ActionState = {
  loading: string | null;
  message: string | null;
  error: string | null;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
}

function isNumericId(value: string) {
  return /^\d+$/.test(value.trim());
}

export default function AdminControl() {
  const { account } = useAuth();
  const [lookupValue, setLookupValue] = useState("");
  const [target, setTarget] = useState<PublicOrganizationInfo | null>(null);
  const [lookupState, setLookupState] = useState<ActionState>({
    loading: null,
    message: null,
    error: null,
  });
  const [actionState, setActionState] = useState<ActionState>({
    loading: null,
    message: null,
    error: null,
  });
  const [organizationForm, setOrganizationForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [createState, setCreateState] = useState<ActionState>({
    loading: null,
    message: null,
    error: null,
  });

  if (account?.role !== "ADMINISTRATOR") {
    return <Navigate to="/login" replace />;
  }

  async function handleLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = lookupValue.trim();
    if (!query) {
      setLookupState({ loading: null, message: null, error: "Enter an organization ID or alias." });
      return;
    }

    setTarget(null);
    setActionState({ loading: null, message: null, error: null });
    setLookupState({ loading: "lookup", message: null, error: null });

    try {
      const organization = isNumericId(query)
        ? await getOrganizationInfo(Number(query))
        : await getOrganizationInfoByAlias(query);

      setTarget(organization);
      setLookupState({
        loading: null,
        message: `Resolved ${organization.name} with account ID ${organization.id}.`,
        error: null,
      });
    } catch (error) {
      setLookupState({ loading: null, message: null, error: getErrorMessage(error) });
    }
  }

  async function runAdminAction(action: "lock" | "unlock" | "verify") {
    if (!target) return;

    setActionState({ loading: action, message: null, error: null });

    try {
      if (action === "lock") {
        await lockAccount(target.id);
      } else if (action === "unlock") {
        await unlockAccount(target.id);
      } else {
        await verifyOrganization(target.id);
        setTarget({ ...target, verified: true });
      }

      const actionLabel = action === "lock" ? "locked" : action === "unlock" ? "unlocked" : "verified";
      setActionState({
        loading: null,
        message: `${target.name} was ${actionLabel}.`,
        error: null,
      });
    } catch (error) {
      setActionState({ loading: null, message: null, error: getErrorMessage(error) });
    }
  }

  async function handleCreateOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateState({ loading: "create", message: null, error: null });

    try {
      await createOrganization(organizationForm);
      setCreateState({
        loading: null,
        message: `Created organization account for ${organizationForm.name}.`,
        error: null,
      });
      setOrganizationForm({ name: "", email: "", password: "" });
    } catch (error) {
      setCreateState({ loading: null, message: null, error: getErrorMessage(error) });
    }
  }

  const actionLoading = actionState.loading !== null;

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-6 lg:px-8">
      <section className="rounded-3xl border border-border bg-[radial-gradient(circle_at_top_left,rgba(72,187,120,0.18),transparent_34%),linear-gradient(135deg,var(--surface),rgba(20,20,20,0.96))] p-6 shadow-2xl md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">Admin Control</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
              Resolve first, operate second.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted md:text-base">
              Look up an organization by public ID or alias, then use the resolved unique account ID for admin actions.
            </p>
          </div>
          <div className="flex size-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-lg">
            <ShieldCheck className="size-8" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <Card className="border border-border bg-surface/95">
          <Card.Header className="flex flex-col items-start gap-2 border-b border-border pb-4">
            <h2 className="text-xl font-bold">Find Account</h2>
            <p className="text-sm text-muted">Use a numeric ID or organization alias from the public API.</p>
          </Card.Header>
          <Card.Content className="gap-5 p-5">
            <form onSubmit={handleLookup} className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={lookupValue}
                onInput={(event) => {
                  setLookupValue(event.currentTarget.value);
                  if (lookupState.error || lookupState.message) {
                    setLookupState({ loading: null, message: null, error: null });
                  }
                }}
                placeholder="123 or organization-alias"
                className="min-w-0 flex-1"
              />
              <Button
                type="submit"
                className="bg-accent font-semibold text-accent-foreground hover:bg-accent/90"
                isDisabled={lookupState.loading !== null}
              >
                {lookupState.loading ? "Looking up..." : "Lookup"}
              </Button>
            </form>

            {lookupState.error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{lookupState.error}</p>}
            {lookupState.message && <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{lookupState.message}</p>}

            {target ? (
              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted">Resolved Target</p>
                    <h3 className="mt-1 text-2xl font-black">{target.name}</h3>
                    <p className="mt-1 text-sm text-muted">@{target.aliasName || "no-alias"}</p>
                  </div>
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                      target.verified ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                    }`}
                  >
                    {target.verified ? "Verified" : "Unverified"}
                  </span>
                </div>

                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-xl bg-surface-secondary/60 p-3">
                    <dt className="text-muted">Account ID</dt>
                    <dd className="mt-1 font-bold">{target.id}</dd>
                  </div>
                  <div className="rounded-xl bg-surface-secondary/60 p-3">
                    <dt className="text-muted">Followers</dt>
                    <dd className="mt-1 font-bold">{target.followerCount}</dd>
                  </div>
                  <div className="rounded-xl bg-surface-secondary/60 p-3 sm:col-span-2">
                    <dt className="text-muted">Website</dt>
                    <dd className="mt-1 break-all font-bold">{target.websiteUrl || "Not set"}</dd>
                  </div>
                </dl>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <Button
                    type="button"
                    className="bg-success font-semibold text-success-foreground hover:bg-success/90"
                    isDisabled={actionLoading || target.verified}
                    onClick={() => runAdminAction("verify")}
                  >
                    {actionState.loading === "verify" ? "Verifying..." : "Verify"}
                  </Button>
                  <Button
                    type="button"
                    className="bg-warning font-semibold text-warning-foreground hover:bg-warning/90"
                    isDisabled={actionLoading}
                    onClick={() => runAdminAction("lock")}
                  >
                    {actionState.loading === "lock" ? "Locking..." : "Lock"}
                  </Button>
                  <Button
                    type="button"
                    className="bg-surface-secondary font-semibold text-foreground hover:bg-surface-secondary/80"
                    isDisabled={actionLoading}
                    onClick={() => runAdminAction("unlock")}
                  >
                    {actionState.loading === "unlock" ? "Unlocking..." : "Unlock"}
                  </Button>
                </div>

                {actionState.error && <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{actionState.error}</p>}
                {actionState.message && <p className="mt-4 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{actionState.message}</p>}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-background/40 p-8 text-center text-sm text-muted">
                No account resolved yet. Search by public organization ID or alias to enable operations.
              </div>
            )}
          </Card.Content>
        </Card>

        <Card className="border border-border bg-surface/95">
          <Card.Header className="flex flex-col items-start gap-2 border-b border-border pb-4">
            <h2 className="text-xl font-bold">Create Organization</h2>
            <p className="text-sm text-muted">Create a new organization account with admin privileges.</p>
          </Card.Header>
          <Card.Content className="p-5">
            <form onSubmit={handleCreateOrganization} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold">Organization name</label>
                <Input
                  value={organizationForm.name}
                  onInput={(event) => setOrganizationForm({ ...organizationForm, name: event.currentTarget.value })}
                  placeholder="TicketRush Partner"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold">Email</label>
                <Input
                  type="email"
                  value={organizationForm.email}
                  onInput={(event) => setOrganizationForm({ ...organizationForm, email: event.currentTarget.value })}
                  placeholder="partner@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold">Temporary password</label>
                <Input
                  type="password"
                  value={organizationForm.password}
                  onInput={(event) => setOrganizationForm({ ...organizationForm, password: event.currentTarget.value })}
                  placeholder="Minimum backend requirement"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-accent font-semibold text-accent-foreground hover:bg-accent/90"
                isDisabled={createState.loading !== null}
              >
                {createState.loading ? "Creating..." : "Create organization"}
              </Button>

              {createState.error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{createState.error}</p>}
              {createState.message && <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{createState.message}</p>}
            </form>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
