/* eslint-disable */
import * as React from "react";
import { connect } from "react-redux";
import { Store } from "redux";
import * as PropTypes from "prop-types";
import { RootState } from "../store";
import ActionCreator from "../actions";
import { LibraryData, LibrariesData } from "../interfaces";
import Admin from "../models/Admin";
import EditableInput from "./EditableInput";
import { Link } from "react-router";
import { Navbar, Nav, NavItem } from "react-bootstrap";
import { Router } from "@thepalaceproject/web-opds-client/lib/interfaces";
import { Button } from "library-simplified-reusable-components";
import { GenericWedgeIcon } from "@nypl/dgx-svg-icons";
import title from "../utils/title";

const palaceLogoUrl = require("../images/PalaceCollectionManagerLogo.svg")
  .default;

export interface HeaderStateProps {
  isFetchingLibraries?: boolean;
  libraries?: LibraryData[];
}

export interface HeaderDispatchProps {
  fetchLibraries?: () => Promise<LibrariesData>;
}

// Finland
// isEkirjasto boolean (default: true) is for adding/hiding
// some links in menu and its purpose is to ease maintaining
// of both upstream tests and our tests

export interface HeaderOwnProps {
  store?: Store<RootState>;
  isEkirjasto?: boolean; // Finland, default: true
}

export interface HeaderProps
  extends React.Props<Header>,
    HeaderStateProps,
    HeaderDispatchProps,
    HeaderOwnProps {}

export interface HeaderState {
  showAccountDropdown: boolean;
}

export interface HeaderRouter extends Router {
  getCurrentLocation?: Function;
}

export interface HeaderNavItem {
  label: string;
  href: string;
  auth?: boolean;
  hidden?: boolean;
}

/** Header of all admin interface pages, with a dropdown for selecting a library,
    library-specific links for the current library, and site-wide links. */
export class Header extends React.Component<HeaderProps, HeaderState> {
  context: { library: () => string; router: HeaderRouter; admin: Admin };

  static contextTypes = {
    library: PropTypes.func,
    router: PropTypes.object.isRequired,
    admin: PropTypes.object.isRequired,
  };
  private libraryRef = React.createRef<EditableInput>();
  private isEkirjasto: boolean;

  constructor(props) {
    super(props);
    this.state = { showAccountDropdown: false };
    this.isEkirjasto = this.props.isEkirjasto ?? true;
    this.changeLibrary = this.changeLibrary.bind(this);
    this.toggleAccountDropdown = this.toggleAccountDropdown.bind(this);
    this.renderNavItem = this.renderNavItem.bind(this);

    document.body.addEventListener("click", (event: MouseEvent) => {
      if (
        this.state.showAccountDropdown &&
        (event.target as any).className.indexOf("account-dropdown-toggle") ===
          -1
      ) {
        this.toggleAccountDropdown();
      }
    });
  }

  displayPermissions(isSystemAdmin: boolean, isLibraryManager: boolean) {
    let permissions = isSystemAdmin
      ? "a system admin"
      : isLibraryManager
      ? "an administrator"
      : "a user";
    return <li className="permissions">Logged in as {permissions}</li>;
  }

  render(): JSX.Element {
    const currentPathname =
      (this.context.router &&
        this.context.router.getCurrentLocation() &&
        this.context.router.getCurrentLocation().pathname) ||
      "";
    let currentLibrary = this.context.library && this.context.library();
    let isLibraryManager = this.context.admin.isLibraryManager(currentLibrary);
    let isSystemAdmin = this.context.admin.isSystemAdmin();
    let isEkirjastoUser = this.context.admin.isEkirjastoUser();
    let isSiteWide = !this.context.library || !currentLibrary;
    let isSomeLibraryManager = this.context.admin.isLibraryManagerOfSomeLibrary();

    // Dashboard link that will be rendered in a Link router component.
    const dashboardLinkItem = {
      label: "Dashboard",
      href: "dashboard/",
      hidden: this.isEkirjasto,
    };

    const finlandStatisticsLinkItem = {
      label: "Tilastot",
      href: "statistics/",
      hidden: !this.isEkirjasto || !isSystemAdmin,
    };

    // Links that will be rendered in a NavItem Bootstrap component.
    const libraryNavItems = [
      { label: "Catalog", href: "%2Fgroups?max_cache_age=0" },
      { label: "Hidden Books", href: "%2Fadmin%2Fsuppressed" },
    ];
    // Other links that will be rendered in a Link router component and are library specific.
    const libraryLinkItems = [
      { label: "Lists", href: "lists/" },
      { label: "Lanes", href: "lanes/", auth: isLibraryManager },
      {
        label: "Patrons",
        href: "patrons/",
        auth: isSystemAdmin,
        hidden: this.isEkirjasto,
      },
    ];
    // Links that will be rendered in a Link router component and are sitewide.
    const sitewideLinkItems = [
      {
        label: "Dashboard",
        href: "dashboard/",
        auth:
          // Finland: Palace shows dashboard for all roles
          // For E-kirjasto, limit to system admins only
          (!this.isEkirjasto && isSiteWide) ||
          (this.isEkirjasto && isSiteWide && isSystemAdmin),
      },
      {
        label: "System Configuration",
        href: "config/",
        // Finland: Palace shows system config for all roles.
        // For E-kirjasto limit to system admins only.
        auth: !this.isEkirjasto || isSystemAdmin,
      },
      {
        label: "Troubleshooting",
        href: "troubleshooting/",
        auth: isSystemAdmin,
      },
    ];
    const accountLink = {
      label: "Change password",
      href: "account/",
      hidden: this.context.admin.isEkirjastoUser(),
    };

    return (
      <Navbar fluid={true}>
        <Navbar.Header>
          <img src={palaceLogoUrl} alt={title()} />
          {this.props.libraries && this.props.libraries.length > 0 && (
            <EditableInput
              elementType="select"
              ref={this.libraryRef}
              value={currentLibrary}
              onChange={this.changeLibrary}
              aria-label="Select a library"
            >
              {(!this.context.library || !currentLibrary) && (
                <option aria-selected={false}>Select a library</option>
              )}
              {this.props.libraries.map((library) => (
                <option
                  key={library.short_name}
                  value={library.short_name}
                  aria-selected={currentLibrary === library.short_name}
                >
                  {library.name || library.short_name}
                  {library.is_default && " (default)"}
                </option>
              ))}
            </EditableInput>
          )}
          <Navbar.Toggle />
        </Navbar.Header>

        <Navbar.Collapse className="menu">
          {currentLibrary && (
            <Nav>
              {this.renderLinkItem(
                dashboardLinkItem,
                currentPathname,
                currentLibrary
              )}
              {this.renderLinkItem(
                finlandStatisticsLinkItem,
                currentPathname,
                currentLibrary
              )}
              {libraryNavItems.map((item) =>
                this.renderNavItem(item, currentPathname, currentLibrary)
              )}
              {libraryLinkItems.map((item) =>
                this.renderLinkItem(item, currentPathname, currentLibrary)
              )}
            </Nav>
          )}
          <Nav className="pull-right">
            {sitewideLinkItems.map((item) =>
              this.renderLinkItem(item, currentPathname)
            )}
            {(this.context.admin.email || this.context.admin.givenName) && (
              <li className="dropdown">
                <Button
                  className="account-dropdown-toggle transparent"
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={this.state.showAccountDropdown}
                  callback={this.toggleAccountDropdown}
                  content={
                    <span>
                      {this.context.admin.givenName || this.context.admin.email}{" "}
                      <GenericWedgeIcon />
                    </span>
                  }
                />
                {this.state.showAccountDropdown && (
                  <ul className="dropdown-menu">
                    {this.displayPermissions(isSystemAdmin, isLibraryManager)}
                    {this.renderLinkItem(accountLink, currentPathname)}
                    <li>
                      <a href="/admin/sign_out">Sign out</a>
                    </li>
                  </ul>
                )}
              </li>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }

  UNSAFE_componentWillMount() {
    const { fetchLibraries, isFetchingLibraries } = this.props;

    if (fetchLibraries && !isFetchingLibraries) {
      fetchLibraries();
    }
  }

  changeLibrary() {
    let library = this.libraryRef.current.getValue();
    if (library) {
      this.context.router.push(
        "/admin/web/collection/" + library + "%2Fgroups?max_cache_age=0"
      );
      this.forceUpdate();
    }
  }

  toggleAccountDropdown() {
    let showAccountDropdown = !this.state.showAccountDropdown;
    this.setState({ showAccountDropdown });
  }

  /**
   * renderNavItem
   * Renders a NavItem Bootstrap component and is active based on the page's current path.
   * @param {HeaderNavItem} item Object with the label and href for the navigation item.
   * @param {string} currentPathname Page's current URL.
   * @param {string} currentLibrary Active library.
   */
  renderNavItem(
    item: HeaderNavItem,
    currentPathname: string,
    currentLibrary: string = ""
  ) {
    if (item.hidden) {
      return null;
    }
    const rootCatalogURL = "/admin/web/collection/";
    const { label, href } = item;
    const isActive = currentPathname.indexOf(href) !== -1;

    return (
      <NavItem
        key={href}
        className="header-link"
        href={`${rootCatalogURL}${currentLibrary}${href}`}
        active={isActive}
      >
        {label}
      </NavItem>
    );
  }

  /**
   * renderLinkItem
   * Renders a Link Router component for library and sitewide navigation links
   * and if the current admin has the correct authentication.
   * @param {HeaderNavItem} item Object with the label and href for the navigation item.
   * @param {string} currentPathname Page's current URL.
   * @param {string} currentLibrary Active library.
   */
  renderLinkItem(
    item: HeaderNavItem,
    currentPathname: string,
    currentLibrary: string = ""
  ) {
    if (item.hidden) {
      return null;
    }
    const rootUrl = "/admin/web/";
    const { label, href, auth } = item;
    let isActive = currentPathname.indexOf(href) !== -1;
    if (currentLibrary) {
      isActive = !!(isActive && currentLibrary);
    }
    const liElem = (
      <li className="header-link" key={href}>
        <Link
          to={`${rootUrl}${href}${currentLibrary}`}
          className={isActive ? "active-link" : ""}
        >
          {label}
        </Link>
      </li>
    );

    // Sometimes, some links should only be shown to admins who have
    // specific privileges. If there is no restriction, always render the link.
    if (auth !== undefined) {
      if (auth) {
        return liElem;
      } else {
        return;
      }
    }

    return liElem;
  }
}

function mapStateToProps(state, ownProps) {
  return {
    isFetchingLibraries: state.editor.libraries?.isFetching,
    libraries: state.editor.libraries?.data?.libraries,
  };
}

function mapDispatchToProps(dispatch) {
  let actions = new ActionCreator();
  return {
    fetchLibraries: () => dispatch(actions.fetchLibraries()),
  };
}

const ConnectedHeader = connect<
  HeaderStateProps,
  HeaderDispatchProps,
  HeaderOwnProps
>(
  mapStateToProps,
  mapDispatchToProps
)(Header);

/** HeaderWithStore is a wrapper component to pass the store as a prop to the
    ConnectedHeader, since it's not in the regular place in the context. */
export default class HeaderWithStore extends React.Component<{}, {}> {
  context: { editorStore: Store<RootState> };

  static contextTypes = {
    editorStore: PropTypes.object.isRequired,
  };

  render(): JSX.Element {
    return <ConnectedHeader store={this.context.editorStore} />;
  }
}
