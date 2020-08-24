import React, { Component } from "react";
import { Button, View, Text } from "react-native";
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
  mediaDevices,
  registerGlobals,
} from "react-native-webrtc";

import JitsiMeetJS from "../../util/JitsiMeetJS";

let isFront = false;

const jitsiConfig = {
  enableNoAudioDetection: false,
  enableNoisyMicDetection: false,
  testing: {
    p2pTestMode: false,
  },
  useIPv6: false,
  disableAudioLevels: true,
  disableSimulcast: false,
  enableWindowOnErrorHandler: true,
  disableThirdPartyRequests: true,
  enableAnalyticsLogging: false,
  enableRemb: false,
  enableTcc: true,
  resolution: 480,
  openBridgeChannel: true,
  serviceUrl: "https://beta.meet.jit.si/http-bind",
  hosts: {
    domain: "beta.meet.jit.si",
    muc: "conference.beta.meet.jit.si",
  },
  clientNode: "http://jitsi.org/jitsimeet",
  channelLastN: -1,
  useNicks: false,
  startSilent: false,
  applicationName: "Jitsi Meet",
  getWiFiStatsMethod: null,
  enableUserRolesBasedOnToken: false,
  disableSuspendVideo: true,
  preferH264: false,
  useStunTurn: true,
  p2p: {
    enabled: false,
    useStunTurn: true,
    stunServers: [{ urls: "stun:meet-jit-si-turnrelay.jitsi.net:443" }],
  },
  analytics: {},
  deploymentInfo: {},
};

class ClassScreen extends Component {
  state = {
    stream: null,
  };

  pc;
  jitsiConnection;
  jitsiConference;

  componentDidMount() {
    // this.getUserMedia();

    // JitsiMeetJS.createLocalTracks().then((tracks) =>
    //   console.log("🔥🔥🔥 createLocalTracks", { tracks })
    // );

    JitsiMeetJS.init(jitsiConfig);

    JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.INFO);

    this.jitsiConnection = new JitsiMeetJS.JitsiConnection(
      null,
      null,
      jitsiConfig
    );

    this.jitsiConnection.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
      this.jitsiConnectionEstablished
    );

    this.jitsiConnection.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_FAILED,
      this.jitsiConnectionFailed
    );

    this.jitsiConnection.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
      this.jitsiConnectionDisconnected
    );

    JitsiMeetJS.mediaDevices.addEventListener(
      JitsiMeetJS.events.mediaDevices.DEVICE_LIST_CHANGED,
      (devices) => {}
    );

    this.jitsiConnection.connect();
  }

  componentWillUnmount() {
    if (this.jitsiConference) {
      this.jitsiConference.leave();
    }

    if (this.jitsiConnection) {
      this.jitsiConnection.disconnect();
    }
  }

  swithCamera = () => {
    this.state.stream.getVideoTracks().forEach((track) => {
      track._switchCamera();
    });
  };

  // getUserMedia = () => {
  //   mediaDevices.enumerateDevices().then((sourceInfos) => {
  //     let videoSourceId;
  //     for (let i = 0; i < sourceInfos.length; i++) {
  //       const sourceInfo = sourceInfos[i];
  //       if (
  //         sourceInfo.kind == "videoinput" &&
  //         sourceInfo.facing == (isFront ? "front" : "environment")
  //       ) {
  //         videoSourceId = sourceInfo.deviceId;
  //       }
  //     }
  //     mediaDevices
  //       .getUserMedia({
  //         audio: true,
  //         video: {
  //           mandatory: {
  //             minWidth: 500, // Provide your own width, height and frame rate here
  //             minHeight: 300,
  //             minFrameRate: 30,
  //           },
  //           facingMode: isFront ? "user" : "environment",
  //           optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
  //         },
  //       })
  //       .then((stream) => {
  //         this.setState({ stream });
  //       })
  //       .catch((error) => {
  //         console.log("stream error", error);
  //         // Log error
  //       });
  //   });
  // };

  getJitsiUserMedia = () => {
    // adding tracks to conference
    if (!this.jitsiConference) {
      return;
    }

    JitsiMeetJS.mediaDevices.enumerateDevices((mediaDevices) => {
      let cameraDeviceId, micDeviceId;
      mediaDevices.forEach((d) => {
        if (d.kind === "videoinput") {
          cameraDeviceId = d.deviceId;
        } else {
          micDeviceId = d.deviceId;
        }
      });

      console.log({ cameraDeviceId, micDeviceId });

      JitsiMeetJS.createLocalTracks({
        devices: ["video", "audio"],
        cameraDeviceId,
        micDeviceId,
      }).then((tracks) => {
        // this.jitsiConference.addTrack(tracks[0]).catch((e) => console.log(e));

        tracks.forEach((t) => {
          // console.log("created track", t);
          t.addEventListener(JitsiMeetJS.events.track.TRACK_MUTE_CHANGED, () =>
            console.log("local track muted")
          );
          t.addEventListener(JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED, () =>
            console.log("local track stoped")
          );
          this.jitsiConference
            .addTrack(t)
            .catch((e) => console.log("track add error", e));
        });
      });
    });
  };

  jitsiConnectionEstablished = () => {
    if (!this.jitsiConnection) {
      return;
    }
    console.log("🔥----------------connection established----------------🔥");
    this.jitsiConferenceInit();
  };

  jitsiConnectionFailed = () => {
    console.log("🔥----------------connection failed----------------🔥");
  };

  jitsiConnectionDisconnected = () => {
    console.log("🔥----------------connection disconnected----------------🔥");
  };

  jitsiConferenceInit = () => {
    this.jitsiConference = this.jitsiConnection.initJitsiConference(
      "test1",
      jitsiConfig
    );

    this.jitsiConference.on(
      JitsiMeetJS.events.conference.TRACK_ADDED,
      this.onTrackAdded
    );
    this.jitsiConference.on(
      JitsiMeetJS.events.conference.TRACK_REMOVED,
      () => {}
    );

    this.jitsiConference.on(
      JitsiMeetJS.events.conference.CONFERENCE_JOINED,
      this.onConferenceJoined
    );

    this.jitsiConference.on(
      JitsiMeetJS.events.conference.CONFERENCE_LEFT,
      () => {}
    );

    this.jitsiConference.on(
      JitsiMeetJS.events.conference.USER_JOINED,
      this.onUserJoined
    );

    this.jitsiConference.on(
      JitsiMeetJS.events.conference.USER_LEFT,
      this.onUserLeft
    );

    this.jitsiConference.on(
      JitsiMeetJS.events.conference.JINGLE_FATAL_ERROR,
      this.onJingleFatalError
    );

    this.jitsiConference.on(
      JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED,
      (track) => {
        console.log(`${track.getType()} - ${track.isMuted()}`);
      }
    );
    this.jitsiConference.on(
      JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED,
      (userID, displayName) => console.log(`${userID} - ${displayName}`)
    );
    this.jitsiConference.on(
      JitsiMeetJS.events.conference.TRACK_AUDIO_LEVEL_CHANGED,
      (userID, audioLevel) => console.log(`${userID} - ${audioLevel}`)
    );
    this.jitsiConference.on(
      JitsiMeetJS.events.conference.PHONE_NUMBER_CHANGED,
      () =>
        console.log(
          `${this.jitsiConference.getPhoneNumber()} - ${this.jitsiConference.getPhonePin()}`
        )
    );
    this.jitsiConference.on(
      JitsiMeetJS.events.conference.USER_STATUS_CHANGED,
      () => console.log("🔥 ----------user status changed")
    );

    this.jitsiConference.on(
      JitsiMeetJS.events.conference.MESSAGE_RECEIVED,
      () => console.log("🔥 ----------message received")
    );

    this.getJitsiUserMedia();

    this.jitsiConference.join();
    // this.getJitsiUserMedia();
  };

  onTrackAdded = (track) => {
    console.log("🔥---------------track added", {
      // track,
      isLocal: track.isLocal(),
      type: track.getType(),
      // trackParticipants: track.conference.participants,
      // trackRoom: track.conference.room,
      // trackDeviceId: track.deviceId,
    });

    if (track.getType() === "video") {
      this.setState({ stream: track.getOriginalStream() });
    }
  };

  onConferenceJoined = () => {
    console.log("🔥----------------conference joined");
    // this.getJitsiUserMedia();
    const participants = this.jitsiConference.getParticipants();
    // console.log(
    //   "🔥getParticipants",
    //   `numParticipants: ${participants.length}`,
    //   participants
    // );
  };

  onUserJoined = (id, user) => {
    console.log("🔥----------------user joined", {
      id,
      // user,
    });
    const localTracks = this.jitsiConference.getLocalTracks();
    // console.log(
    //   "🔥 getlocaltracks",
    //   `numLocalTracks: ${localTracks.length}`,
    //   localTracks
    // );
    localTracks.forEach((t) => {
      this.jitsiConference
        .addTrack(t)
        .catch((e) => console.log("track add error", e));
    });
  };

  onUserLeft = (user) => {
    console.log("🔥----------------user left", { user });
  };

  onJingleFatalError = (error) => {
    console.log("🔥----------------jingle fatal error", error);
  };

  render() {
    const { stream } = this.state;

    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text>Class Screen</Text>
        <Button
          onPress={() => this.props.navigation.goBack()}
          title="Go to First Screen"
        />
        {stream && (
          <>
            <Button onPress={this.swithCamera} title="Switch Camera" />
            <RTCView
              streamURL={stream.toURL()}
              style={{ width: 300, height: 300 }}
            />
          </>
        )}
      </View>
    );
  }
}

export default ClassScreen;
