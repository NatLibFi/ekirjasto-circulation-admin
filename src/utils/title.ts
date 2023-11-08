export const ROOT_TITLE = "E-kirjasto";

export default (...subtitle: string[]): string => {
  return [ROOT_TITLE, ...subtitle].filter((part) => !!part).join(" - ");
};
