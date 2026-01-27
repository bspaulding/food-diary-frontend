import type { ResourceOptions, ResourceReturn, ResourceSource } from "solid-js";
import { createResource } from "solid-js";
import { useAuth } from "./Auth0";

/**
 * Type for the fetcher function used in createAuthorizedResource.
 * The fetcher receives an access token and the source value, and returns the resource data.
 */
export type AuthorizedResourceFetcher<S, T> = (
  accessToken: string,
  source: S,
) => T | Promise<T>;

/**
 * Creates a resource with automatic authentication token injection.
 * Similar to SolidJS's createResource, but automatically passes the access token as the first parameter to the fetcher.
 *
 * Usage patterns:
 * - Single parameter: createAuthorizedResource(fetcher)
 * - Two parameters with fetcher and options: createAuthorizedResource(fetcher, options)
 * - Two parameters with source and fetcher: createAuthorizedResource(source, fetcher)
 * - Three parameters: createAuthorizedResource(source, fetcher, options)
 */
function createAuthorizedResource<T, R = unknown>(
  fetcher: AuthorizedResourceFetcher<true, T>,
  options?: ResourceOptions<T, true>,
): ResourceReturn<T, R>;
function createAuthorizedResource<T, S, R = unknown>(
  source: ResourceSource<S>,
  fetcher: AuthorizedResourceFetcher<S, T>,
  options?: ResourceOptions<T, S>,
): ResourceReturn<T, R>;
function createAuthorizedResource<S = true, T = unknown, R = unknown>(
  source?: any,
  fetcher?: any,
  options: Record<string, any> = {},
): ResourceReturn<T, R> {
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
    options as any,
  ) as ResourceReturn<T, R>;
}

export default createAuthorizedResource;
