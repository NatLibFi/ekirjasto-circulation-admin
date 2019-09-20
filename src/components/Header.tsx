import * as React from "react";
import { connect } from "react-redux";
import { Store } from "redux";
import * as PropTypes from "prop-types";
import { State } from "../reducers/index";
import ActionCreator from "../actions";
import { LibraryData, LibrariesData } from "../interfaces";
import Admin from "../models/Admin";
import EditableInput from "./EditableInput";
import { Link } from "react-router";
import { Navbar, Nav, NavItem } from "react-bootstrap";
import { Router } from "opds-web-client/lib/interfaces";
import { Button } from "library-simplified-reusable-components";
import { GenericWedgeIcon } from "@nypl/dgx-svg-icons";

export interface HeaderStateProps {
  libraries?: LibraryData[];
}

export interface HeaderDispatchProps {
  fetchLibraries?: () => Promise<LibrariesData>;
}

export interface HeaderOwnProps {
  store?: Store<State>;
}

export interface HeaderProps extends React.Props<Header>, HeaderStateProps, HeaderDispatchProps, HeaderOwnProps {}

export interface HeaderState {
  showAccountDropdown: boolean;
}

export interface HeaderRouter extends Router {
  getCurrentLocation?: Function;
}

export interface HeaderNavItem {
  label: string;
  href: string;
  catalog?: boolean;
  auth?: boolean;
}

/** Header of all admin interface pages, with a dropdown for selecting a library,
    library-specific links for the current library, and site-wide links. */
export class Header extends React.Component<HeaderProps, HeaderState> {
  context: { library: () => string, router: HeaderRouter, admin: Admin };

  static contextTypes = {
    library: PropTypes.func,
    router: PropTypes.object.isRequired,
    admin: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { showAccountDropdown: false };
    this.changeLibrary = this.changeLibrary.bind(this);
    this.toggleAccountDropdown = this.toggleAccountDropdown.bind(this);
    this.renderNavItem = this.renderNavItem.bind(this);

    document.body.addEventListener("click", (event: MouseEvent) => {
      if (this.state.showAccountDropdown &&
        ((event.target as any).className).indexOf("account-dropdown-toggle") === -1) {
        this.toggleAccountDropdown();
      }
    });
  }

  render(): JSX.Element {
    const currentPathname = (this.context.router &&
      this.context.router.getCurrentLocation() &&
      this.context.router.getCurrentLocation().pathname) || "";
    let currentLibrary = this.context.library && this.context.library();
    let isLibraryManager = this.context.admin.isLibraryManager(currentLibrary);
    let isSystemAdmin = this.context.admin.isSystemAdmin();
    const libraryNavItems = [
      { label: "Catalog", href: "%2Fgroups" },
      { label: "Complaints", href: "%2Fadmin%2Fcomplaints" },
      { label: "Hidden Books", href: "%2Fadmin%2Fsuppressed" },
    ];
    const libraryLinkItems = [
      { label: "Lists", href: "/admin/web/lists/" },
      { label: "Lanes", href: "/admin/web/lanes/", auth: isLibraryManager },
      { label: "Dashboard", href: "/admin/web/dashboard/"  },
      { label: "Patrons", href: "/admin/web/patrons/", auth: isLibraryManager },
    ];
    const sitewideLinkItems = [
      { label: "Dashboard", href: "/admin/web/dashboard/",
        auth: (!this.context.library || !currentLibrary) },
      { label: "System Configuration", href: "/admin/web/config/",
        auth: this.context.admin.isLibraryManagerOfSomeLibrary() },
      { label: "Troubleshooting", href: "/admin/web/troubleshooting/",
        auth: isSystemAdmin },
    ];
    const accountLink = { label: "Change password", href: "/admin/web/account/" };

    return (
      <Navbar fluid={true}>
        <Navbar.Header>
          <Navbar.Brand>
            Admin
          </Navbar.Brand>
          { this.props.libraries && this.props.libraries.length > 0 &&
            <EditableInput
              elementType="select"
              ref="library"
              value={currentLibrary}
              onChange={this.changeLibrary}
              >
              { (!this.context.library || !currentLibrary) &&
                <option aria-selected={false}>Select a library</option>
              }
              { this.props.libraries.map(library =>
                  <option
                    key={library.short_name}
                    value={library.short_name}
                    aria-selected={currentLibrary === library.short_name}
                  >
                    {library.name || library.short_name}
                  </option>
                )
              }
            </EditableInput>
          }
          <Navbar.Toggle />
        </Navbar.Header>

        <Navbar.Collapse className="menu">
          { currentLibrary &&
            <Nav>
              { libraryNavItems.map(item =>
                  this.renderNavItem(item, currentPathname, currentLibrary))
              }
              { libraryLinkItems.map(item =>
                  this.renderLinkItem(item, currentPathname, currentLibrary))
              }
            </Nav>
          }
          <Nav className="pull-right">
            { sitewideLinkItems.map(item =>
                this.renderLinkItem(item, currentPathname))
            }
            { this.context.admin.email &&
              <li className="dropdown">
                <Button
                  className="account-dropdown-toggle transparent"
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={this.state.showAccountDropdown}
                  callback={this.toggleAccountDropdown}
                  content={<span>{this.context.admin.email} <GenericWedgeIcon /></span>}
                />
                { this.state.showAccountDropdown &&
                  <ul className="dropdown-menu">
                    {this.renderLinkItem(accountLink, currentPathname)}
                    <li><a href="/admin/sign_out">Sign out</a></li>
                  </ul>
                }
              </li>
            }
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }

  componentWillMount() {
    if (this.props.fetchLibraries) {
      this.props.fetchLibraries();
    }
  }

  changeLibrary() {
    let library = (this.refs["library"] as any).getValue();
    if (library) {
      this.context.router.push("/admin/web/collection/" + library + "%2Fgroups");
      this.forceUpdate();
    }
  }

  toggleAccountDropdown() {
    let showAccountDropdown = !this.state.showAccountDropdown;
    this.setState({ showAccountDropdown });
  }

  renderNavItem(item: HeaderNavItem, currentPathname: string, currentLibrary: string) {
    const rootCatalogURL = "/admin/web/collection/";
    const href = item.href;
    const isActive = currentPathname.indexOf(href) !== -1;

    return (
      <NavItem
        key={href}
        className="header-link"
        href={`${rootCatalogURL}${currentLibrary}${href}`}
        active={isActive}
      >
        {item.label}
      </NavItem>
    );
  }

  renderLinkItem(item: HeaderNavItem, currentPathname: string, currentLibrary: string = "") {
    const href = item.href;
    let isActive = currentPathname.indexOf(href) !== -1;
    if (currentLibrary) {
      isActive = !!(isActive && currentLibrary);
    }
    const liElem = (
      <li className="header-link" key={href}>
        <Link
          to={`${href}${currentLibrary}`}
          className={isActive ? "active-link" : ""}
        >
          {item.label}
        </Link>
      </li>
    );

    if (item.auth !== undefined) {
      if (item.auth) {
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
    libraries: state.editor.libraries && state.editor.libraries.data && state.editor.libraries.data.libraries
  };
}

function mapDispatchToProps(dispatch) {
  let actions = new ActionCreator();
  return {
    fetchLibraries: () => dispatch(actions.fetchLibraries())
  };
}

const ConnectedHeader = connect<HeaderStateProps, HeaderDispatchProps, HeaderOwnProps>(
  mapStateToProps,
  mapDispatchToProps,
)(Header);

/** HeaderWithStore is a wrapper component to pass the store as a prop to the
    ConnectedHeader, since it's not in the regular place in the context. */
export default class HeaderWithStore extends React.Component<{}, {}> {
  context: { editorStore: Store<State> };

  static contextTypes = {
    editorStore: PropTypes.object.isRequired
  };

  render(): JSX.Element {
    return (
      <ConnectedHeader
        store={this.context.editorStore}
        />
    );
  }
}
