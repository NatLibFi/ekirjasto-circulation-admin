import * as React from "react";
import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import { LibraryData, LibrariesData } from "../interfaces";
import Admin from "../models/Admin";

export interface ContentManagementProps {
  data?: LibrariesData;
}

/** Entry point for editorial content from the system configuration panel. */
export class ContentManagement extends React.Component<ContentManagementProps> {
  context: { admin: Admin };

  static contextTypes = {
    admin: PropTypes.object.isRequired,
  };

  accessibleLibraries(): LibraryData[] {
    return (
      (this.props.data && this.props.data.libraries) ||
      []
    ).filter((library) =>
      this.context.admin.isContentWriter(library.short_name)
    );
  }

  render() {
    const libraries = this.accessibleLibraries();
    return (
      <section className="content-management">
        <h2>Content management</h2>
        <p>
          Create and manage news, FAQs, and rich sitewide disruption
          announcements for a library.
        </p>
        <ul>
          {libraries.map((library) => (
            <li key={library.short_name}>
              <a href={`/admin/web/content/${library.short_name}`}>
                {library.name || library.short_name}
              </a>
            </li>
          ))}
        </ul>
      </section>
    );
  }
}

function mapStateToProps(state) {
  return {
    data: state.editor.libraries && state.editor.libraries.data,
  };
}

export default connect(mapStateToProps)(ContentManagement);
