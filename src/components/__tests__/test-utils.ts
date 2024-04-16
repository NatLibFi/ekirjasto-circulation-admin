import {
  ReactWrapper,
  mount as enzymeMount,
  shallow as enzymeShallow,
} from "enzyme";

import React = require("react");

import i18n from "../../i18n/config";

/**
 * Adds i18next props for mounted element
 */
export function mount(node: React.ReactElement, options?: object) {
  return enzymeMount(React.cloneElement(node, { t: i18n.t }), options);
}

/**
 * Adds i18next props for shallow rendered element
 */
export function shallow(node: React.ReactElement, options?: object) {
  return enzymeShallow(React.cloneElement(node, { t: i18n.t }), options);
}
