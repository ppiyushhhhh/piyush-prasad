import { useState, useMemo } from "react";
import {
  Users,
  UserPlus,
  KeyRound,
  Shield,
  ShieldAlert,
  Ban,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Check,
  Copy,
  UserCheck,
  MoreVertical,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { AdminUserRecord } from "@/lib/database-admin.functions";
import { UserFormDialog } from "./UserFormDialog";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import { ChangeRoleDialog } from "./ChangeRoleDialog";

interface UserManagementProps {
  users: AdminUserRecord[];
  isLoading: boolean;
  serviceRoleConfigured: boolean;
  onRefresh: () => void;
  onCreateUser: (data: { email: string; password: string; role: "admin" | "user" }) => Promise<void>;
  onChangePassword: (targetUserId: string, newPassword: string) => Promise<void>;
  onChangeRole: (targetUserId: string, newRole: "admin" | "user") => Promise<void>;
  onToggleStatus: (targetUserId: string, disable: boolean) => Promise<void>;
  onDeleteUser: (targetUserId: string) => Promise<void>;
}

export function UserManagement({
  users,
  isLoading,
  serviceRoleConfigured,
  onRefresh,
  onCreateUser,
  onChangePassword,
  onChangeRole,
  onToggleStatus,
  onDeleteUser,
}: UserManagementProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<AdminUserRecord | null>(null);
  const [selectedUserForRole, setSelectedUserForRole] = useState<AdminUserRecord | null>(null);
  const [userToToggleStatus, setUserToToggleStatus] = useState<AdminUserRecord | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUserRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        search.trim() === "" ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.id.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  function handleCopy(id: string) {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleConfirmToggleStatus() {
    if (!userToToggleStatus) return;
    try {
      setActionLoading(true);
      const willDisable = userToToggleStatus.status !== "disabled";
      await onToggleStatus(userToToggleStatus.id, willDisable);
      setUserToToggleStatus(null);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleConfirmDelete() {
    if (!userToDelete) return;
    try {
      setActionLoading(true);
      await onDeleteUser(userToDelete.id);
      setUserToDelete(null);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Users className="h-5 w-5 text-cyan-400" />
            Application Users & Access Control
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage application authentication accounts, update passwords, and control role-based privileges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddUserOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-cyan-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      {!serviceRoleConfigured && (
        <div className="rounded-lg border border-amber-900/60 bg-amber-950/20 p-3.5 text-xs text-amber-300 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <span className="font-semibold text-amber-200">Service-Role Key Notice:</span>{" "}
            Add <code className="font-mono bg-slate-900 px-1 py-0.5 rounded text-amber-300">SUPABASE_SERVICE_ROLE_KEY</code> to your server environment (.env) to enable user creation, password updates, and direct account disabling via the Admin Auth API.
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by email or user ID…"
            className="w-full rounded-md border border-slate-800 bg-slate-950 pl-9 pr-3.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-md border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins only</option>
            <option value="user">Users only</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
            <option value="unconfirmed">Unconfirmed</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-[10px] uppercase tracking-[0.14em] text-slate-500 font-semibold">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4">Last Sign-In</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-cyan-400 mb-2" />
                    Loading application users…
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 font-sans">
                    No application users found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isBanned = u.status === "disabled";
                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-sans font-medium text-slate-200">
                          {u.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                          <span title={u.id}>{u.id.slice(0, 18)}…</span>
                          <button
                            onClick={() => handleCopy(u.id)}
                            title="Copy UUID"
                            className="text-slate-500 hover:text-slate-300"
                          >
                            {copiedId === u.id ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {u.role === "admin" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-semibold bg-purple-950/80 border border-purple-800 text-purple-300">
                            <Shield className="h-3 w-3 text-purple-400" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium bg-slate-800 border border-slate-700 text-slate-300">
                            User
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {u.status === "active" ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-sans text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Active
                          </span>
                        ) : u.status === "disabled" ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-sans text-amber-400">
                            <Ban className="h-3 w-3 text-amber-400" />
                            Disabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-sans text-slate-400">
                            Unconfirmed
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {u.lastSignInAt
                          ? new Date(u.lastSignInAt).toLocaleString()
                          : "Never"}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-slate-900 border-slate-800 text-slate-200 text-xs shadow-xl min-w-44"
                          >
                            <DropdownMenuLabel className="text-[10px] text-slate-500 uppercase tracking-wider">
                              User Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-800" />

                            <DropdownMenuItem
                              onClick={() => setSelectedUserForPassword(u)}
                              className="gap-2 cursor-pointer hover:bg-slate-800 text-slate-200"
                            >
                              <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                              Change Password
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => setSelectedUserForRole(u)}
                              className="gap-2 cursor-pointer hover:bg-slate-800 text-slate-200"
                            >
                              <Shield className="h-3.5 w-3.5 text-purple-400" />
                              Change Role
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => setUserToToggleStatus(u)}
                              className="gap-2 cursor-pointer hover:bg-slate-800 text-slate-200"
                            >
                              {isBanned ? (
                                <>
                                  <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                                  Enable Account
                                </>
                              ) : (
                                <>
                                  <Ban className="h-3.5 w-3.5 text-amber-400" />
                                  Disable Account
                                </>
                              )}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-slate-800" />

                            <DropdownMenuItem
                              onClick={() => setUserToDelete(u)}
                              className="gap-2 cursor-pointer hover:bg-rose-950/40 text-rose-400 hover:text-rose-300"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                              Delete Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-800 px-4 py-2.5 text-[11px] text-slate-500 flex items-center justify-between font-mono bg-slate-950/40">
          <span>Showing {filteredUsers.length} of {users.length} users</span>
          <span>Role updates take effect immediately</span>
        </div>
      </div>

      {/* Modals */}
      <UserFormDialog
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onSubmit={onCreateUser}
      />

      <ChangePasswordDialog
        user={selectedUserForPassword}
        isOpen={Boolean(selectedUserForPassword)}
        onClose={() => setSelectedUserForPassword(null)}
        onSubmit={onChangePassword}
      />

      <ChangeRoleDialog
        user={selectedUserForRole}
        isOpen={Boolean(selectedUserForRole)}
        onClose={() => setSelectedUserForRole(null)}
        onSubmit={onChangeRole}
      />

      {/* Disable / Enable Confirmation */}
      <AlertDialog
        open={Boolean(userToToggleStatus)}
        onOpenChange={(open) => !open && !actionLoading && setUserToToggleStatus(null)}
      >
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-100 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold text-slate-100">
              {userToToggleStatus?.status === "disabled"
                ? "Enable User Account?"
                : "Disable User Account?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-400 leading-relaxed">
              {userToToggleStatus?.status === "disabled" ? (
                <>
                  This will restore active login privileges for{" "}
                  <strong className="text-slate-200">{userToToggleStatus?.email}</strong>.
                </>
              ) : (
                <>
                  This will immediately revoke active session access and prevent{" "}
                  <strong className="text-slate-200">{userToToggleStatus?.email}</strong>{" "}
                  from logging in to the application.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel
              disabled={actionLoading}
              className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={actionLoading}
              onClick={handleConfirmToggleStatus}
              className={`text-xs font-semibold ${
                userToToggleStatus?.status === "disabled"
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-amber-600 hover:bg-amber-500 text-white"
              }`}
            >
              {actionLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : userToToggleStatus?.status === "disabled" ? (
                "Enable Account"
              ) : (
                "Disable Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Confirmation */}
      <AlertDialog
        open={Boolean(userToDelete)}
        onOpenChange={(open) => !open && !actionLoading && setUserToDelete(null)}
      >
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-100 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold text-rose-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              Permanently Delete User Account?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-slate-200">{userToDelete?.email}</strong>?
              This action cannot be undone. All assigned roles and user metadata will be deleted from Supabase Auth.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel
              disabled={actionLoading}
              className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={actionLoading}
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
            >
              {actionLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Permanently Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
