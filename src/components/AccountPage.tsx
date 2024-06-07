import * as React from "react";
import { Store } from "redux";
import * as PropTypes from "prop-types";
import ChangePasswordForm from "./ChangePasswordForm";
import { RootState } from "../store";
import Header from "./Header";
import Footer from "./Footer";
import title from "../utils/title";
import { WithTranslation, withTranslation } from "react-i18next";

export interface AccountPageContext {
  editorStore: Store<RootState>;
  csrfToken: string;
}

/** Page for configuring account settings. */
export class AccountPage extends React.Component<
  object & Partial<WithTranslation>,
  object
> {
  context: AccountPageContext;

  static contextTypes: React.ValidationMap<AccountPageContext> = {
    editorStore: PropTypes.object.isRequired as React.Validator<Store>,
    csrfToken: PropTypes.string.isRequired,
  };

  render(): JSX.Element {
    return (
      <div className="account">
        <Header />
        <ChangePasswordForm
          store={this.context.editorStore}
          csrfToken={this.context.csrfToken}
        />
        <Footer />
      </div>
    );
  }

  UNSAFE_componentWillMount() {
    document.title = title(this.props.t("accountPage.documentTitle"));
  }
}

export default withTranslation()(AccountPage);
