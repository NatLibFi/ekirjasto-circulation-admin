export const ROOT_TITLE = "E-Kirjasto Admin";

export default (...subtitle: string[]): string => {
  return [ROOT_TITLE, ...subtitle].filter((part) => !!part).join(" - ");
};
