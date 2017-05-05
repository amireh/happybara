import React from 'react';
import ReactDOM from 'react-dom';
import InspectionNotice from './InspectionNotice';
import { assert } from 'chai';

const { confirm } = window;

export default class HappybaraReactCapability {
  constructor({ inspect, stubRenderFn, restoreRenderFn }) {
    this.options = { inspect };
    this.stubRenderFn = stubRenderFn;
    this.restoreRenderFn = restoreRenderFn;
    this.state = {
      component: null,
      container: null,
      inspectionNoticeContainer: null,
      confirmations: [],
      confirmationPromptCount: 0,
    };
  }

  isMounted() {
    return !!this.state.component;
  }

  getRootComponent() {
    return this.state.component;
  }

  acceptUpcomingConfirmation() {
    this.state.confirmations.push({ result: true });
  }

  getPendingConfirmationCount() {
    return this.state.confirmations.length;
  }

  getConfirmationCount() {
    return this.state.confirmationPromptCount;
  }

  rejectUpcomingConfirmation() {
    this.state.confirmations.push({ result: false });
  }

  setupContainer() {
    this.stubRenderFn((_component/*, container*/) => {
      this.state.component = ReactDOM.render(_component, this.state.container);
    });

    this.state.container = document.body.appendChild( document.createElement('div') );

    if (this.options.inspect) {
      this.state.inspectionNoticeContainer = document.body.appendChild(
        document.createElement('div')
      );

      ReactDOM.render(<InspectionNotice />, this.state.inspectionNoticeContainer);
    }

    window.confirm = () => {
      const confirmation = this.state.confirmations.pop();

      assert(!!confirmation,
        "An unexpected confirmation prompt was presented. Did you forget to call " +
        "acceptUpcomingConfirmation() or rejectUpcomingConfirmation()?"
      );

      this.state.confirmationPromptCount += 1;

      return confirmation.result;
    };
  }

  removeContainer() {
    window.confirm = confirm;

    this.state.confirmations.splice(0);
    this.state.confirmationPromptCount = 0;

    this.restoreRenderFn();
    this.state.component = null;

    if (this.state.container) {
      ReactDOM.unmountComponentAtNode(this.state.container);

      removeNode(this.state.container);
      this.state.container = null;
    }

    if (this.state.inspectionNoticeContainer) {
      ReactDOM.unmountComponentAtNode(this.state.inspectionNoticeContainer);

      removeNode(this.state.inspectionNoticeContainer);
      this.state.inspectionNoticeContainer = null;
    }
  }
}

function removeNode(node) {
  if (typeof node.remove === 'function') {
    node.remove();
  }
  else {
    node.parentNode.removeChild(node);
  }
}