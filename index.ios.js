'use strict';

var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  DeviceEventEmitter,
} = React;

var INTERVAL = 0.02;

var {
  Accelerometer,
} = require('NativeModules');


// velocity[i] = (acceleration[i] + acceleration[i-1])/2 * interval + velocity[i-1]
var calculateVelocity = (acceleration, prevAcceleration, prevVelocity) => {
  return ((acceleration + prevAcceleration) /2) * INTERVAL + prevVelocity;
};


// distance[i] = (velocity[i] + velocity[i-1])/2 * interval + distance[i-1]
var calculateDistance = (velocity, prevVelocity, prevDistance) => {
  return ((velocity + prevVelocity) / 2) * INTERVAL + prevDistance;
};

var emptyState = () => {
  return {acceleration: [0, 0], velocity: 0, distanceUp: 0, distanceDown: 0};
}

var SendMeToHeaven = React.createClass({
  getInitialState() {
    return emptyState();
  },

  componentDidMount() {
    Accelerometer.setAccelerometerUpdateInterval(INTERVAL);
  },

  startRecording() {
    Accelerometer.startAccelerometerUpdates();
    this.setState({recording: true});

    DeviceEventEmitter.addListener('AccelerationData', (data) => {
      var acceleration = [];
      acceleration[0] = data.acceleration.y;
      acceleration[1] = this.state.acceleration[0];

      var velocity = calculateVelocity(acceleration[0], acceleration[1], this.state.velocity);
      var distanceUp, distanceDown;


      if (acceleration[0] > 0) {
        distanceUp = calculateDistance(velocity, this.state.velocity, this.state.distanceUp);
        distanceDown = this.state.distanceDown;
      } else {
        distanceUp = this.state.distanceUp;
        distanceDown = calculateDistance(velocity, this.state.velocity, this.state.distanceDown);
      }

      this.setState({acceleration: acceleration, velocity: velocity, distanceUp: distanceUp, distanceDown: distanceDown});
    });
  },

  stopRecording() {
    Accelerometer.stopAccelerometerUpdates();
    this.setState({recording: false});
  },

  renderRecordingButton() {
    if (this.state.recording) {
       return (
         <TouchableOpacity onPress={this.stopRecording}>
          <View style={{padding: 20, marginTop: 20, backgroundColor: 'rgba(0,0,0,0.9)'}}>
            <Text style={{color: '#ffffff'}}>
              Stop Recording
            </Text>
          </View>
        </TouchableOpacity>
       )
    } else {
      return (
       <TouchableOpacity onPress={this.startRecording}>
        <View style={{padding: 20, marginTop: 20, backgroundColor: '#eeeeee'}}>
          <Text>
            Start Recording
          </Text>
        </View>
      </TouchableOpacity>
      )
    }
  },

  reset() {
    this.setState(emptyState());
  },

  render() {
    return (
      <View style={styles.container}>
        <View>
          <Text style={styles.instructions}>
            y: {this.state.acceleration[0]}
          </Text>
          <Text style={styles.instructions}>
            y-1: {this.state.acceleration[1]}
          </Text>
        </View>

        <View>
          <Text style={styles.instructions}>
            velocity: {this.state.velocity}
          </Text>
        </View>

        <View>
          <Text style={styles.instructions}>
            distance up: {Math.abs(this.state.distanceUp)}
          </Text>
        </View>

        <View>
          <Text style={styles.instructions}>
            distance down: {Math.abs(this.state.distanceDown)}
          </Text>
        </View>

        {this.renderRecordingButton()}

        <TouchableOpacity onPress={this.reset}>
         <View style={{padding: 20, marginTop: 20, backgroundColor: '#eeeeee'}}>
           <Text>
             Reset
           </Text>
         </View>
       </TouchableOpacity>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('SendMeToHeaven', () => SendMeToHeaven);
