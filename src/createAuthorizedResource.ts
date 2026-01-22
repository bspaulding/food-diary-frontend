import type { ResourceFetcher, ResourceSource } from "solid-js";
import { createResource } from "solid-js";
import { useAuth } from "./Auth0";

function createAuthorizedResource<S = true, T = unknown>(
  source?: ResourceSource<S> | ResourceFetcher<string, T, unknown>,
  fetcher?: ResourceFetcher<S, T, unknown> | Record<string, any>,
  options: Record<string, any> = {}
) {
  if (arguments.length === 2) {
    if (typeof fetcher === "object") {
      options = fetcher;
      fetcher = source as any;
      source = true as any;
    }
  } else if (arguments.length === 1) {
    fetcher = source as any;
    source = true as any;
  }
  const [{ accessToken }] = useAuth();
  const tokenizedSource = () => ({
    accessToken: accessToken(),
    source: source === true ? source : (source as any)(),
  });
  return createResource(
    tokenizedSource,
    ({ accessToken, source }: { accessToken: string; source: any }) => {
      return (fetcher as any)(accessToken, source);
    },
    options
  );
}

export default createAuthorizedResource;
