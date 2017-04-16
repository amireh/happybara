import React from 'react';

const InspectionNotice = React.createClass({
  render() {
    return (
      <div style={{
        position: 'absolute',
        right: 0,
        left: 0,
        top: 0,
        background: 'blue',
        color: 'white',
        fontSize: '0.9rem',
        fontFamily: 'monospace',
        textAlign: 'center',
      }}>
        <p>
          Heads up! It looks like you are in inspection mode. The test runner will
          be waiting for your signal to proceed with the next test.
        </p>

        <p>
          To signal, invoke
          {' '}
          <a onClick={this.stopInspecting}>
            <strong><code>window.stopInspecting()</code></strong>
          </a> from the console.
        </p>
      </div>
    );
  },

  stopInspecting() {
    window.stopInspecting();
  }
});

export default InspectionNotice;
