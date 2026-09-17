import { BookData } from "@natlibfi/ekirjasto-web-opds-client/lib/interfaces";

export type ExtendedBookData = BookData & {
  updated?: string;
  issued?: string;
  targetAgeRange?: string[];
};

export function formatContributor(contributor: {
  name: string;
  role?: string;
}): string {
  const role = contributor.role && mapContributorRole(contributor.role);
  return role ? `${contributor.name} (${role})` : contributor.name;
}

function mapContributorRole(role: string): string {
  const normalizedRole = role.trim().toLowerCase();
  return CONTRIBUTOR_ROLE_NAMES[normalizedRole] || role;
}

const CONTRIBUTOR_ROLE_NAMES: { [role: string]: string } = {
  act: "Actor",
  adp: "Adapter",
  aft: "Afterword Author",
  art: "Artist",
  asn: "Associated Author",
  aut: "Author",
  ctb: "Contributor",
  com: "Compiler",
  cmp: "Composer",
  cph: "Copyright Holder",
  dsr: "Designer",
  drt: "Director",
  edt: "Editor",
  eng: "Engineer",
  pro: "Producer",
  wpr: "Foreword Author",
  ill: "Illustrator",
  win: "Introduction Author",
  lyr: "Lyricist",
  mus: "Musician",
  nrt: "Narrator",
  prf: "Performer",
  pht: "Photographer",
  trc: "Transcriber",
  trl: "Translator",
  clr: "Colorist",
};

export function copiesOwned(book: BookData): number | string | null {
  return book.copies && book.copies.total !== undefined
    ? book.copies.total
    : null;
}

export function copiesAvailable(book: BookData): number | string | null {
  return book.copies && book.copies.available !== undefined
    ? book.copies.available
    : null;
}

export function patronsInQueue(book: BookData): number | string | null {
  return book.holds && book.holds.total !== undefined ? book.holds.total : null;
}

export function selectedByPatrons(book: BookData): number | null {
  const value = rawValue(book, "simplified:selected_by_patrons");
  if (value === null) {
    return null;
  }

  const selected = Number(value);
  return Number.isNaN(selected) ? null : selected;
}

export function circulationUrl(
  book: BookData,
  library?: string,
  bookUrl?: string
): string | null {
  const rawLinkValues = book.raw
    ? Object.keys(book.raw)
        .filter((key) => key === "link" || key.endsWith(":link"))
        .map((key) => book.raw[key])
    : [];
  const rawLinks = rawLinkValues.reduce(
    (links: any[], value: any) =>
      links.concat(Array.isArray(value) ? value : value ? [value] : []),
    []
  );
  const circulationLink = rawLinks.find(
    (link: any) =>
      link &&
      link["$"] &&
      link["$"].rel &&
      rawAttributeValue(link["$"].rel) ===
        "http://librarysimplified.org/terms/rel/circulation-details"
  );

  const rawUrl =
    circulationLink && circulationLink["$"] && circulationLink["$"].href
      ? rawAttributeValue(circulationLink["$"].href)
      : null;
  if (rawUrl) {
    return rawUrl;
  }

  if (!library || !bookUrl) {
    return null;
  }

  const librarySlug = library.split(/[/?#]/)[0];
  const worksMarker = "/works/";
  const worksIndex = bookUrl.indexOf(worksMarker);
  if (!librarySlug || worksIndex === -1) {
    return null;
  }

  const identifierPath = bookUrl
    .substring(worksIndex + worksMarker.length)
    .split(/[?#]/)[0];
  const parts = identifierPath.split("/");
  if (parts.length < 2 || !parts[0] || !parts.slice(1).join("/")) {
    return null;
  }

  return `/${librarySlug}/admin/works/${parts[0]}/${parts
    .slice(1)
    .join("/")}/circulation`;
}

function rawAttributeValue(attribute: any): string | null {
  return attribute && typeof attribute === "object"
    ? attribute.value || attribute._ || null
    : attribute || null;
}

export function updated(book: ExtendedBookData): string | null {
  const value = book.updated || rawUpdatedValue(book);
  return value ? formatDate(value) : null;
}

function rawUpdatedValue(book: BookData): string | null {
  return rawValue(book, "updated") || rawValue(book, "atom:updated");
}

export function issued(book: ExtendedBookData): string | null {
  return (
    book.issued || rawValue(book, "issued") || rawValue(book, "atom:issued")
  );
}

export function targetAge(book: ExtendedBookData): string | string[] | null {
  return (
    book.targetAgeRange ||
    categoryLabel(book, "http://schema.org/typicalAgeRange")
  );
}

function rawValue(book: BookData, key: string): string | null {
  const value = book.raw && book.raw[key];
  const firstValue = Array.isArray(value) ? value[0] : value;
  if (firstValue === null || firstValue === undefined) {
    return null;
  }

  if (typeof firstValue === "object") {
    const textValue = firstValue._ ?? firstValue.value;
    return textValue === null || textValue === undefined
      ? null
      : String(textValue);
  }

  return String(firstValue);
}

function categoryLabel(book: BookData, scheme: string): string | null {
  const category = rawCategories(book).find(
    (candidate) =>
      candidate["$"] &&
      candidate["$"]["scheme"] &&
      normalizeCategoryScheme(candidate["$"]["scheme"].value) ===
        normalizeCategoryScheme(scheme)
  );
  return label(category);
}

export function audience(book: BookData): string | null {
  const audienceCategory = rawCategories(book).find(
    (category) =>
      category["$"] &&
      category["$"]["scheme"] &&
      category["$"]["scheme"].value === "http://schema.org/audience"
  );
  return label(audienceCategory);
}

export function fictionType(book: BookData): string | null {
  const category = rawCategories(book).find((candidate) => {
    const scheme = candidate["$"] && candidate["$"]["scheme"];
    return (
      scheme &&
      normalizeCategoryScheme(scheme.value) ===
        "http://librarysimplified.org/terms/fiction"
    );
  });

  return categoryValue(category, "label");
}

function normalizeCategoryScheme(scheme: string): string {
  return scheme.replace(/\/$/, "");
}

export function genres(book: BookData): string[] | null {
  const excluded = [
    "http://schema.org/audience",
    "http://schema.org/typicalAgeRange",
  ];
  const fictionScheme = "http://librarysimplified.org/terms/fiction/";
  const raw = rawCategories(book);
  let values = raw
    .filter(
      (category) =>
        label(category) &&
        category["$"] &&
        category["$"]["scheme"] &&
        excluded
          .concat([fictionScheme])
          .indexOf(category["$"]["scheme"].value) === -1
    )
    .map(label)
    .filter(Boolean);

  if (!values.length) {
    values = raw
      .filter(
        (category) =>
          category["$"] &&
          category["$"]["scheme"] &&
          category["$"]["scheme"].value === fictionScheme
      )
      .map(label)
      .filter(Boolean);
  }

  return values.length ? values : null;
}

export function distributor(book: BookData): string | null {
  const distributions = book.raw && book.raw["bibframe:distribution"];
  const provider =
    distributions &&
    distributions[0] &&
    distributions[0]["$"] &&
    distributions[0]["$"]["bibframe:ProviderName"];
  return provider ? provider.value : null;
}

export function isbn(book: BookData): string | null {
  const prefix = "urn:isbn:";
  return book.id && book.id.indexOf(prefix) === 0
    ? book.id.substring(prefix.length)
    : null;
}

export function medium(book: BookData): string | null {
  const value =
    book.raw && book.raw["$"] && book.raw["$"]["schema:additionalType"];
  if (!value || !value.value) {
    return null;
  }
  if (value.value === "http://bib.schema.org/Audiobook") {
    return "Audio";
  }
  if (
    value.value === "http://schema.org/EBook" ||
    value.value === "http://schema.org/Book"
  ) {
    return "eBook";
  }
  return null;
}

// The deepest indirect-acquisition type is the actual deliverable format.
export function formats(book: BookData): string[] | null {
  const acquisitionTypes = rawAcquisitionTypes(book);
  if (acquisitionTypes.formats.length) {
    return acquisitionTypes.formats;
  }

  const links = ([] as Array<{
    type: string;
    indirectType?: string;
  }>).concat(
    book.openAccessLinks || [],
    book.allBorrowLinks || [],
    book.fulfillmentLinks || []
  );
  const values = links
    .filter((link) => !link.indirectType)
    .map((link) => link.type)
    .filter(Boolean)
    .filter((format, index, all) => all.indexOf(format) === index);

  return values.length ? values : null;
}

// Indirect-acquisition types before the deepest type describe DRM layers.
export function drm(book: BookData): string[] | null {
  const acquisitionTypes = rawAcquisitionTypes(book);
  if (acquisitionTypes.drm.length) {
    return acquisitionTypes.drm;
  }

  const links = ([] as Array<{ indirectType?: string }>).concat(
    book.allBorrowLinks || [],
    book.fulfillmentLinks || []
  );
  const values = links
    .map((link) => link.indirectType)
    .filter(Boolean)
    .filter((format, index, all) => all.indexOf(format) === index);

  return values.length ? values : null;
}

function rawAcquisitionTypes(book: BookData): {
  drm: string[];
  formats: string[];
} {
  const links = (book.raw && book.raw.link) || [];
  const types = links.reduce(
    (types: { drm: string[]; formats: string[] }, link: any) => {
      const rel = link && link["$"] && link["$"].rel;
      if (!rel || !rel.value || rel.value.indexOf("/acquisition/") === -1) {
        return types;
      }

      const indirectAcquisitions = Object.keys(link)
        .filter(
          (key) =>
            key === "opds:indirectAcquisition" ||
            key === "indirectAcquisition"
        )
        .reduce(
          (acquisitions: any[], key) => acquisitions.concat(link[key]),
          []
        );
      if (!indirectAcquisitions.length) {
        const type = link["$"]["type"] && link["$"]["type"].value;
        if (type) {
          types.formats.push(type);
        }
        return types;
      }

      indirectAcquisitions.forEach((acquisition) => {
        const chain = indirectAcquisitionTypeChain(acquisition);
        if (chain.length > 1) {
          types.drm.push(...chain.slice(0, -1));
        }
        const format = chain[chain.length - 1];
        if (format) {
          types.formats.push(format);
        }
      });

      return types;
    },
    { drm: [], formats: [] }
  );
  return {
    drm: uniqueValues(types.drm),
    formats: uniqueValues(types.formats),
  };
}

function uniqueValues(values: string[]): string[] {
  return values.filter((value, index) => values.indexOf(value) === index);
}

function indirectAcquisitionTypeChain(acquisition: any): string[] {
  const type =
    acquisition && acquisition["$"] && acquisition["$"]["type"]
      ? acquisition["$"]["type"].value
      : acquisition && acquisition.type;
  const nested = Object.keys(acquisition || {})
    .filter(
      (key) =>
        key === "opds:indirectAcquisition" || key === "indirectAcquisition"
    )
    .reduce((acquisitions: any[], key) => acquisitions.concat(acquisition[key]), []);
  const nestedChain = nested.length
    ? indirectAcquisitionTypeChain(nested[nested.length - 1])
    : [];
  return (type ? [type] : []).concat(nestedChain);
}

function rawCategories(book: BookData): any[] {
  return (book.raw && book.raw.category) || [];
}

function label(category: any): string | null {
  return categoryValue(category, "label");
}

function categoryValue(category: any, attribute: string): string | null {
  const value = category && category["$"] && category["$"][attribute];
  return value && value.value ? value.value : null;
}

function formatDate(value: string, includeTime = false): string {
  const date = new Date(value);
  return isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        ...(includeTime && {
          hour: "numeric",
          minute: "2-digit",
        }),
        timeZone: "UTC",
      });
}
