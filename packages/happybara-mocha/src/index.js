import Session from 'happybara';
import FeatureSuite from './FeatureSuite';
import scenario from './scenario';

const defaultFeatureSuite = FeatureSuite(Session);

export default class HappybaraMochaAdapter {
  constructor(sessionKlass = Session) {
    this.sessionKlass = sessionKlass;
  }

  expose(target = window) {
    const featureSuite = FeatureSuite(this.sessionKlass);

    target.scenario = scenario;
    target.feature = featureSuite;
  }
}

export { defaultFeatureSuite as feature };
export { scenario };
