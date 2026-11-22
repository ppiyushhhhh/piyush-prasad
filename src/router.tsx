import { QueryClient } from "@tanstack/react-query";
import { createRouter, createBrowserHistory } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { isAdminHost, resolveAdminHostPath } from "./lib/site-hosts";

export const getRouter = () => {
  const queryClient = new QueryClient();

  // On client, if on admin subdomain (admin.piyushprasad.in), configure a custom history
  // that transparently translates between clean browser URLs (/projects) and internal
  // TanStack Router routes (/dashboard/projects) without breaking SSR or route definitions.
  let history = undefined;
  if (typeof window !== "undefined") {
    const isCurrentHostAdmin = isAdminHost(window.location.hostname);
    if (isCurrentHostAdmin) {
      history = createBrowserHistory({
        parseLocation: () => {
          const loc = window.location;
          const { rewrittenPath } = resolveAdminHostPath(loc.pathname);
          const search = loc.search || "";
          const hash = loc.hash || "";
          const href = `${rewrittenPath}${search}${hash}`;
          const state = window.history.state || {};
          return {
            pathname: rewrittenPath,
            search,
            hash,
            href,
            state,
            key: state.__TSR_key || state.key || "default",
          };
        },
        createHref: (path: string) => {
          if (path === "/dashboard" || path === "/dashboard/") return "/";
          if (path.startsWith("/dashboard/")) return path.slice("/dashboard".length);
          return path;
        },
      });
    }
  }

  const router = createRouter({
    routeTree,
    history,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
