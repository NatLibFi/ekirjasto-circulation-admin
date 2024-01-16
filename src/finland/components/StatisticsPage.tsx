import * as React from "react";
import { Store } from "redux";
import { RootState } from "../../store";
import * as PropTypes from "prop-types";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import title from "../../utils/title";
import { FinlandStats } from "./FinlandStats";

export interface StatisticsPageProps {
  params: {
    library: string;
  };
}

export interface StatisticsPageContext {
  editorStore: Store<RootState>;
}

/** Page that shows more detailed statistics about circulation events
 * (Modified from DashboardPage)
 */
export default class StatisticsPage extends React.Component<
  StatisticsPageProps
> {
  context: StatisticsPageContext;

  static contextTypes: React.ValidationMap<StatisticsPageContext> = {
    editorStore: PropTypes.object.isRequired as React.Validator<Store>,
  };

  static childContextTypes: React.ValidationMap<object> = {
    library: PropTypes.func,
  };

  getChildContext() {
    return {
      library: () => this.props.params.library,
    };
  }

  render(): JSX.Element {
    const { library } = this.props.params;
    return (
      <div className="dashboard">
        <Header />
        <main className="body">
          <FinlandStats library={library} />
        </main>
        <Footer />
      </div>
    );
  }

  UNSAFE_componentWillMount() {
    document.title = title("Tilastot");
  }
}
