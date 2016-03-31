interface LinkData {
  href: string;
  rel: string;
}

interface BookData {
  title: string;
  hideLink?: LinkData;
  restoreLink?: LinkData;
  refreshLink?: LinkData;
  editLink?: LinkData;
}

interface BookLink {
  text: string;
  url: (book: BookData) => string;
}

interface RootProps extends __React.Props<any> {
  csrfToken: string;
  collection: string;
  book: string;
  tab: string;
  isTopLevel: boolean;
  navigate: (collection: string, book: string, isTopLevel: boolean, tab?: string) => void;
  bookLinks?: BookLink[];
}

interface ErrorData {
  status: number;
  url: string;
  response: string;
}

interface EditorProps extends __React.Props<any> {
  book: string;
  bookUrl?: string;
  bookData?: BookData;
  fetchError?: ErrorData;
  editError?: ErrorData;
  csrfToken: string;
  store?: Redux.Store;
  fetchBook?: (url: string) => void;
  refreshBook?: () => void;
  dispatchEdit?: () => void;
  dispatchEditFailure?: (error) => void;
  isFetching?: boolean;
}

interface ButtonFormProps {
  link: string;
  label: string;
  csrfToken: string;
  disabled: boolean;
  refresh: () => any;
  dispatchEdit: () => void;
  dispatchEditFailure?: (error) => void;
}

interface EditableInputProps extends __React.Props<any> {
  label: string;
  value: string;
  name: string;
  disabled: boolean;
}

interface EditFormProps extends BookData {
  csrfToken: string;
  disabled: boolean;
  refresh: () => any;
  dispatchEdit: () => void;
  dispatchEditFailure?: (error) => void;
}

interface ErrorMessageProps {
  error: ErrorData;
  tryAgain?: () => any;
}

interface BookDetailsContainerProps extends __React.Props<any> {
  book: {
    url: string;
  };
  collection: string;
}

interface BookDetailsContainerConfig {
  editorStore: Redux.Store;
  csrfToken: string;
  navigate?: (collectionUrl: string, bookUrl: string, tab: string, isTopLevel?: boolean) => void;
  tab?: string;
  refreshBook?: () => Promise<any>;
}

interface TabContainerProps extends __React.Props<any> {
  book: string;
  collection: string;
  store: Redux.Store;
  csrfToken: string;
  tab: string;
  navigate: (collectionUrl: string, bookUrl: string, isToplevel: boolean, tab?: string) => void;
  refreshBook: () => void;
  complaintsCount?: number;
}

interface ComplaintsData {
  book: {
    id: string;
  };
  complaints: { [key: string]: number };
}

interface ComplaintsProps extends __React.Props<any> {
  book: string;
  bookData?: BookData;
  complaints?: any;
  fetchError?: ErrorData;
  store?: Redux.Store;
  fetchComplaints?: (url: string) => Promise<any>;
  isFetching?: boolean;
}

interface EditorContext {
  csrfToken?: string;
  navigate?: (collection: string, book: string, isTopLevel: boolean, tab?: string) => void;
  tab?: string;
  refreshBook?: () => void;
  editorStore?: Redux.Store;
}