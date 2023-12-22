import { NotImplementedError } from "./errors";
import { ProviderPart, ResolverPart } from "./parts/index";
import { Part } from "./types";

export const createPart = <Type, Dependencies extends Part[] = []>(
  definition: Part<Type> | string,
  dependencies: [...Dependencies] = [] as Dependencies,
  implementation: (dependencies: {
    [Key in keyof Dependencies]: ReturnType<Dependencies[Key]>;
  }) => Type = () => {
    throw new NotImplementedError(definition);
  },
): Part<Type, Dependencies> =>
  Object.assign(implementation, { definition, dependencies });

export const resolvePart = <Type>(
  definition: Part<Type>,
  parts: Part[],
): ReturnType<typeof definition> => {
  const provider = createPart(ProviderPart, [], () => () => parts);
  const resolve = ResolverPart([() => [...parts, provider]])(ResolverPart);
  return resolve(definition);
};

export const getName = (part: Part | string): string => {
  if (typeof part === "string") {
    return part;
  }
  return getName(part.definition);
};
