import * as React from "react";
import * as PropTypes from "prop-types";
import Libraries from "./Libraries";
import Collections from "./Collections";
import IndividualAdmins from "./IndividualAdmins";
import PatronAuthServices from "./PatronAuthServices";
import SitewideAnnouncements from "./SitewideAnnouncements";
import SitewideSettings from "./SitewideSettings";
import MetadataServices from "./MetadataServices";
import CatalogServices from "./CatalogServices";
import DiscoveryServices from "./DiscoveryServices";
import {
  TabContainer,
  TabContainerProps,
  TabContainerContext,
} from "./TabContainer";
import Admin from "../models/Admin";

export interface ConfigTabContainerProps extends TabContainerProps {
  editOrCreate?: string;
  identifier?: string;
  class?: string;
}

export interface ConfigTabContainerContext extends TabContainerContext {
  admin: Admin;
}

const COMMON_TABS = { libraries: Libraries };

const LIBRARY_MANAGER_TABS = {
  ...COMMON_TABS,
  individualAdmins: IndividualAdmins,
};

const EKIRJASTO_LIBRARY_MANAGER_TABS = { ...COMMON_TABS };

const SYSTEM_ADMIN_TABS = {
  ...LIBRARY_MANAGER_TABS,
  collections: Collections,
  patronAuth: PatronAuthServices,
  sitewideSettings: SitewideSettings,
  metadata: MetadataServices,
  catalogServices: CatalogServices,
  discovery: DiscoveryServices,
  sitewideAnnouncements: SitewideAnnouncements,
};

const { individualAdmins, ...EKIRJASTO_SYSTEM_ADMIN_TABS } = SYSTEM_ADMIN_TABS;

const DISPLAY_NAMES: Partial<Record<keyof typeof SYSTEM_ADMIN_TABS, string>> = {
  individualAdmins: "Admins",
  patronAuth: "Patron Authentication",
  sitewideAnnouncements: "Sitewide Announcements",
  sitewideSettings: "Sitewide Settings",
  catalogServices: "External Catalogs",
};

/** Body of the system configuration page, with a tab for each type of
    service that can be configured. */
export default class ConfigTabContainer extends TabContainer<
  ConfigTabContainerProps
> {
  context: ConfigTabContainerContext;
  static contextTypes: React.ValidationMap<ConfigTabContainerContext> = {
    router: PropTypes.object.isRequired,
    pathFor: PropTypes.func.isRequired,
    admin: PropTypes.object.isRequired as React.Validator<Admin>,
  };

  tabs() {
    const enabledTabClasses = this.getEnabledTabClasses(this.context.admin);

    const tabComponents = {};
    Object.entries(enabledTabClasses).forEach(([key, ComponentClass]) => {
      tabComponents[key] = (
        <ComponentClass
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          editOrCreate={this.props.editOrCreate}
          identifier={this.props.identifier}
        />
      );
    });
    return tabComponents;
  }

  getEnabledTabClasses(admin: Admin) {
    if (admin.isSystemAdmin()) {
      return admin.isEkirjastoUser()
        ? EKIRJASTO_SYSTEM_ADMIN_TABS
        : SYSTEM_ADMIN_TABS;
    }

    if (admin.isLibraryManagerOfSomeLibrary()) {
      return admin.isEkirjastoUser()
        ? EKIRJASTO_LIBRARY_MANAGER_TABS
        : LIBRARY_MANAGER_TABS;
    }

    return COMMON_TABS;
  }

  handleSelect(event) {
    const tab = event.target.dataset.tabkey;
    if (this.context.router) {
      this.context.router.push("/admin/web/config/" + tab);
    }
  }

  tabDisplayName(name) {
    if (DISPLAY_NAMES[name]) {
      return DISPLAY_NAMES[name];
    } else {
      return super.tabDisplayName(name);
    }
  }

  defaultTab() {
    return "libraries";
  }
}
