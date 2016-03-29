import * as React from "react";
import * as ReactDOM from "react-dom";
import Root from "./components/Root";
const OPDSBrowser = require("opds-browser");
import Editor from "./components/Editor";
import * as qs from "qs";

require("bootstrap/dist/css/bootstrap.css");
require("font-awesome/css/font-awesome.min.css");

class CirculationWeb {

  constructor(config) {
    let web;
    let div = document.createElement("div");
    div.id = "opds-browser";
    document.getElementsByTagName("body")[0].appendChild(div);

    function getParam(name) {
      let match = RegExp("[?&]" + name + "=([^&]*)").exec(window.location.search);
      return match && decodeURIComponent(match[1].replace(/\+/g, " "));
    };

    function serializeParams(params) {
      if (Object.keys(params).length === 0) {
        return "";
      }

      return "?" + qs.stringify(params, { skipNulls: true });
    };

    function historyArgs(collectionUrl: string, bookUrl: string, tab: string) {
      let params = {
        collection: collectionUrl,
        book: bookUrl,
        tab: tab
      };

      return [params, "", serializeParams(params)];
    }

    window.onpopstate = (event) => {
      let collection = null,
          book = null,
          tab = null;

      if (event.state) {
        collection = event.state.collection;
        book = event.state.book;
        tab = event.state.tab || "details";
      }

      render(collection, book, tab, false);
    };

    function pushHistory(collectionUrl: string, bookUrl: string, tab: string) {
      window.history.pushState.apply(window.history, historyArgs(collectionUrl, bookUrl, tab));
    };

    function onNavigate(collectionUrl: string, bookUrl: string, tab: string, isTopLevel: boolean) {
      pushHistory(collectionUrl, bookUrl, tab);
      render(collectionUrl, bookUrl, tab, isTopLevel);
    }

    function render(collectionUrl: string, bookUrl: string, tab: string, isTopLevel: boolean) {
      ReactDOM.render(
        <Root
          ref={c => web = c}
          csrfToken={config.csrfToken}
          collection={collectionUrl}
          book={bookUrl}
          tab={tab}
          isTopLevel={isTopLevel}
          onNavigate={onNavigate}/>,
        document.getElementById("opds-browser")
      );
    }

    let startCollection = getParam("collection") || config.homeUrl;
    let startBook = getParam("book");
    let startTab = getParam("tab");

    render(startCollection, startBook, startTab, false);

    if (startCollection || startBook || startTab) {
      window.history.replaceState.apply(window.history, historyArgs(startCollection, startBook, startTab));
    }
  }
}

export = CirculationWeb;