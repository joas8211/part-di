import { createPart } from "../functions";
import { Part } from "../types";
import { ProviderPart } from "./Provider";

const find = (definition: Part, parts: Part[]) =>
  parts.find(
    (part) =>
      part.definition === definition ||
      (typeof part.definition !== "string" &&
        find(definition, [part.definition])),
  );

const resolve = <T extends Part>(
  definition: T,
  parts: Part[],
  cache = new Map<Part, any>(),
): ReturnType<T> => {
  const implementation = find(definition, parts) ?? definition;
  if (cache.has(implementation)) return cache.get(implementation);

  const dependencies = implementation.dependencies.map((dependency) =>
    dependency === implementation.definition // Super part as dependency
      ? resolve(
          dependency,
          parts.filter((part) => !find(implementation.definition, [part])),
          cache,
        )
      : resolve(dependency, parts, cache),
  );

  const resolved = implementation(dependencies) as ReturnType<T>;
  cache.set(implementation, resolved);

  return resolved;
};

export const ResolverPart = createPart(
  "PartResolver",
  [ProviderPart],
  ([getParts]) =>
    (definition: Part): ReturnType<Part> => {
      const parts = getParts();
      return resolve(definition, parts);
    },
);
