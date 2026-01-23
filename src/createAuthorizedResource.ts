import { createResource } from "solid-js";
import { useAuth } from "./Auth0";

function createAuthorizedResource<S = true, T = unknown>(
  source?: any,
  fetcher?: any,
  options: Record<string, any> = {},
) {
  if (arguments.length === 2) {
    if (typeof fetcher === "object") {
      options = fetcher;
      fetcher = source;
      source = true;
    }
  } else if (arguments.length === 1) {
    fetcher = source;
    source = true;
  }
  const [{ accessToken }] = useAuth();
  const tokenizedSource = () => ({
    accessToken: accessToken(),
    source: source === true ? source : source(),
  });
  return createResource(
    tokenizedSource,
    ({ accessToken, source }: { accessToken: string; source: any }) => {
      return fetcher(accessToken, source);
    },
    options,
  );
}

export default createAuthorizedResource;
