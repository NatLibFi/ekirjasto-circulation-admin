export interface Navigate {
  (collectionUrl: string, bookUrl: string, tab?: string): void;
}

export interface LinkData {
  href: string;
  rel: string;
}

export interface CategoryData {
  label: string;
}

export interface BookData {
  title: string;
  subtitle?: string;
  fiction?: boolean;
  audience?: string;
  targetAgeRange?: string[];
  summary?: string;
  hideLink?: LinkData;
  restoreLink?: LinkData;
  refreshLink?: LinkData;
  editLink?: LinkData;
  issuesLink?: LinkData;
  categories?: string[];
  series?: string;
  seriesPosition?: string;
}

export interface BookLink {
  text: string;
  url: (book: BookData) => string;
}

export interface ComplaintsData {
  book: {
    id: string;
  };
  complaints: { [key: string]: number };
}

export interface PostComplaint {
  (url: string, data: { type: string }): Promise<any>;
}

export type Audience = "Children" | "Young Adult" | "Adult" | "Adults Only";

export type Fiction = "Fiction" | "Nonfiction";

export interface GenreTree {
  Fiction: {
    [index: string]: GenreData;
  };
  Nonfiction: {
    [index: string]: GenreData;
  };
}

export interface GenreData {
  name: string;
  parents: string[];
  subgenres: string[];
}

export interface ClassificationData {
  type: string;
  name: string;
  source: string;
  weight: number;
}

export interface CirculationEventData {
  id: number;
  type: string;
  patron_id: string;
  time: string;
  book: {
    title: string;
    url: string;
  };
}

export interface StatsData {
  patrons: {
    total: number;
    with_active_loans: number;
    with_active_loans_or_holds: number;
    loans: number;
    holds: number;
  };
  inventory: {
    titles: number;
    licenses: number;
    available_licenses: number;
  };
  vendors: {
    overdrive?: number;
    bibliotheca?: number;
    axis360?: number;
    open_access?: number;
  };
}

export interface LibraryData {
  uuid?: string;
  name?: string;
  short_name?: string;
  library_registry_short_name?: string;
  library_registry_shared_secret?: string;
  settings?: {
    [key: string]: string;
  };
}

export interface LibrarySettingField {
  key: string;
  label: string;
}

export interface LibrariesData {
  libraries: LibraryData[];
  settings?: LibrarySettingField[];
}

export interface CollectionData {
  name: string;
  protocol: string;
  libraries: string[];
  [key: string]: string | string[];
}

export interface ProtocolField {
  key: string;
  label: string;
  optional?: boolean;
  type?: string;
  options?: ProtocolField[];
}

export interface ProtocolData {
  name: string;
  label?: string;
  description?: string;
  fields: ProtocolField[];
  library_fields?: ProtocolField[];
}

export interface CollectionsData {
  collections: CollectionData[];
  protocols: ProtocolData[];
  allLibraries?: LibraryData[];
}

export interface PathFor {
  (collectionUrl: string, bookUrl: string, tab?: string): string;
}

export interface AdminAuthServiceData {
  provider: string;
  url?: string;
  username?: string;
  password?: string;
  domains?: string[];
}

export interface AdminAuthServicesData {
  admin_auth_services: AdminAuthServiceData[];
  providers: string[];
}

export interface IndividualAdminData {
  email: string;
  password?: string;
}

export interface IndividualAdminsData {
  individualAdmins?: IndividualAdminData[];
}

export interface PatronAuthServiceLibrary {
  short_name: string;
  [key: string]: string;
}

export interface PatronAuthServiceData {
  id: string | number;
  protocol: string;
  settings?: {
    [key: string]: string;
  };
  libraries?: PatronAuthServiceLibrary[];
}

export interface PatronAuthServicesData {
  patron_auth_services: PatronAuthServiceData[];
  protocols: ProtocolData[];
  allLibraries?: LibraryData[];
}