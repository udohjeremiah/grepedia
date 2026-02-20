type CountryOption = {
  label: string;
  value: string;
};

const regionDisplayNames = new Intl.DisplayNames(["en"], { type: "region" });
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const regionCodes = (() => {
  const codes = new Set<string>();

  for (const firstLetter of alphabet) {
    for (const secondLetter of alphabet) {
      const code = `${firstLetter}${secondLetter}`;
      const label = regionDisplayNames.of(code);

      if (label && label !== code) {
        codes.add(code);
      }
    }
  }

  return [...codes];
})();

export const countryOptions: CountryOption[] = regionCodes
  .map((code) => ({
    label: regionDisplayNames.of(code) ?? code,
    value: code,
  }))
  // eslint-disable-next-line unicorn/no-array-sort
  .sort((a, b) => a.label.localeCompare(b.label));
