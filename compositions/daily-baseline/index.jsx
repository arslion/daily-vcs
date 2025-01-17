import * as React from 'react';
import { Box } from '#vcs-react/components';
import {
  useParams,
  useGrid,
  useViewportSize,
  useVideoPlaybackState,
  PlaybackStateType,
} from '#vcs-react/hooks';
import * as layoutFuncs from './layouts.js';

import {
  DEFAULT_FONT,
  DEFAULT_LABEL_FONT_SIZE_PX,
  DEFAULT_TOAST_FONT_SIZE_PX,
  DEFAULT_CORNER_RADIUS_PX,
  PositionEdge,
  PositionCorner,
} from './constants.js';
import { useActiveVideoAndAudio } from './participants.js';

import CustomOverlay from './components/CustomOverlay.js';
import ImageOverlay from './components/ImageOverlay.js';
import Toast from './components/Toast.js';
import TextOverlay from './components/TextOverlay.js';
import VideoDominant from './components/VideoDominant.js';
import VideoGrid from './components/VideoGrid.js';
import VideoPip from './components/VideoPip.js';
import VideoSingle from './components/VideoSingle.js';
import VideoSplit from './components/VideoSplit.js';
import Slate from './components/Slate.js';

// request all standard fonts
const fontFamilies = [
  'Roboto',
  'RobotoCondensed',
  'Anton',
  'Bangers',
  'Bitter',
  'Exo',
  'Magra',
  'PermanentMarker',
  'SuezOne',
  'Teko',
];
// fonts that are legible at a small size (for participant labels)
const fontFamilies_smallSizeFriendly = [
  'Roboto',
  'RobotoCondensed',
  'Bitter',
  'Exo',
  'Magra',
  'SuezOne',
  'Teko',
];
// not all fonts have every weight,
// but we can't currently filter the UI based on the font name
const fontWeights = [
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
];

// -- the control interface exposed by this composition --
export const compositionInterface = {
  displayMeta: {
    name: 'Daily Baseline',
    description: "Composition with Daily's baseline features",
  },
  fontFamilies,
  imagePreloads: ['user_white_64.png', 'overlay.png', 'party-popper_1f389.png'],
  params: [
    // -- composition's video layout mode --
    {
      id: 'mode',
      type: 'enum',
      defaultValue: 'grid',
      values: ['single', 'split', 'grid', 'dominant', 'pip'],
    },
    {
      id: 'showTextOverlay',
      type: 'boolean',
      defaultValue: false,
    },
    {
      id: 'showImageOverlay',
      type: 'boolean',
      defaultValue: false,
    },
    {
      id: 'showTitleSlate',
      type: 'boolean',
      defaultValue: false,
    },
    {
      id: 'enableAutoOpeningSlate',
      type: 'boolean',
      defaultValue: false,
      shortHelpText:
        'Shown immediately when stream starts. Goes away automatically.\nTo preview this slate, click Stop, then Restart.',
    },
    // -- video layout params --
    {
      id: 'videoSettings.preferScreenshare',
      type: 'boolean',
      defaultValue: false,
    },
    {
      id: 'videoSettings.omitPaused',
      type: 'boolean',
      defaultValue: false,
    },
    {
      id: 'videoSettings.showParticipantLabels',
      type: 'boolean',
      defaultValue: false,
    },
    {
      id: 'videoSettings.roundedCorners',
      type: 'boolean',
      defaultValue: false,
    },
    {
      id: 'videoSettings.scaleMode',
      type: 'enum',
      defaultValue: 'fill',
      values: ['fill', 'fit'],
    },
    {
      id: 'videoSettings.placeholder.bgColor',
      type: 'text',
      defaultValue: 'rgb(0, 50, 80)',
    },
    {
      id: 'videoSettings.grid.useDominantForSharing',
      type: 'boolean',
      defaultValue: false,
    },
    {
      id: 'videoSettings.dominant.position',
      type: 'enum',
      defaultValue: PositionEdge.LEFT,
      values: Object.values(PositionEdge),
    },
    {
      id: 'videoSettings.dominant.splitPos',
      type: 'number',
      defaultValue: 0.8,
      step: 0.1,
    },
    {
      id: 'videoSettings.dominant.numChiclets',
      type: 'number',
      defaultValue: 5,
    },
    {
      id: 'videoSettings.dominant.followDomFlag',
      type: 'boolean',
      defaultValue: true,
    },
    {
      id: 'videoSettings.dominant.itemInterval_gu',
      type: 'number',
      defaultValue: 0.7,
      step: 0.1,
    },
    {
      id: 'videoSettings.dominant.outerPadding_gu',
      type: 'number',
      defaultValue: 0.5,
      step: 0.1,
    },
    {
      id: 'videoSettings.pip.position',
      type: 'enum',
      defaultValue: PositionCorner.TOP_RIGHT,
      values: Object.values(PositionCorner),
    },
    {
      id: 'videoSettings.pip.aspectRatio',
      type: 'number',
      defaultValue: 1,
      step: 0.1,
    },
    {
      id: 'videoSettings.pip.height_gu',
      type: 'number',
      defaultValue: 12,
      step: 1,
    },
    {
      id: 'videoSettings.pip.margin_gu',
      type: 'number',
      defaultValue: 1.5,
      step: 0.1,
    },
    {
      id: 'videoSettings.pip.followDomFlag',
      type: 'boolean',
      defaultValue: false,
    },
    {
      id: 'videoSettings.labels.fontFamily',
      type: 'enum',
      defaultValue: fontFamilies_smallSizeFriendly[0],
      values: fontFamilies_smallSizeFriendly,
    },
    {
      id: 'videoSettings.labels.fontWeight',
      type: 'enum',
      defaultValue: '600',
      values: fontWeights,
    },
    {
      id: 'videoSettings.labels.fontSize_pct',
      type: 'number',
      defaultValue: 100,
    },
    {
      id: 'videoSettings.labels.offset_x_gu',
      type: 'number',
      defaultValue: 0,
      step: 0.1,
    },
    {
      id: 'videoSettings.labels.offset_y_gu',
      type: 'number',
      defaultValue: 0,
      step: 0.1,
    },
    {
      id: 'videoSettings.labels.color',
      type: 'text',
      defaultValue: 'white',
    },
    {
      id: 'videoSettings.labels.strokeColor',
      type: 'text',
      defaultValue: 'rgba(0, 0, 0, 0.9)',
    },
    {
      id: 'videoSettings.margin.left_gu',
      type: 'number',
      defaultValue: 0,
      step: 1,
    },
    {
      id: 'videoSettings.margin.right_gu',
      type: 'number',
      defaultValue: 0,
      step: 1,
    },
    {
      id: 'videoSettings.margin.top_gu',
      type: 'number',
      defaultValue: 0,
      step: 1,
    },
    {
      id: 'videoSettings.margin.bottom_gu',
      type: 'number',
      defaultValue: 0,
      step: 1,
    },

    // -- text overlay params --
    {
      id: 'text.content',
      type: 'text',
      defaultValue: 'An example text overlay',
      //'An example text overlay\nwith line breaks\nThis third line is very long dolor sit amet lorem ipsum, and the line ends here.',
    },
    {
      id: 'text.align_horizontal',
      type: 'enum',
      defaultValue: 'center',
      values: ['left', 'right', 'center'],
    },
    {
      id: 'text.align_vertical',
      type: 'enum',
      defaultValue: 'center',
      values: ['top', 'bottom', 'center'],
    },
    {
      id: 'text.offset_x_gu',
      type: 'number',
      defaultValue: 0,
      step: 0.1,
    },
    {
      id: 'text.offset_y_gu',
      type: 'number',
      defaultValue: 0,
      step: 0.1,
    },
    {
      id: 'text.rotation_deg',
      type: 'number',
      defaultValue: 0,
    },
    {
      id: 'text.fontFamily',
      type: 'enum',
      defaultValue: fontFamilies[0],
      values: fontFamilies,
    },
    {
      id: 'text.fontWeight',
      type: 'enum',
      defaultValue: '400',
      values: fontWeights,
    },
    {
      id: 'text.fontStyle',
      type: 'enum',
      defaultValue: '',
      values: ['normal', 'italic'],
    },
    {
      id: 'text.fontSize_gu',
      type: 'number',
      defaultValue: 2.5,
      step: 0.1,
    },
    {
      id: 'text.color',
      type: 'text',
      defaultValue: 'rgba(255, 250, 200, 0.95)',
    },
    {
      id: 'text.strokeColor',
      type: 'text',
      defaultValue: 'rgba(0, 0, 0, 0.8)',
    },

    // -- image overlay params --
    {
      id: 'image.assetName',
      type: 'text',
      defaultValue: 'overlay.png',
    },
    {
      id: 'image.position',
      type: 'enum',
      defaultValue: PositionCorner.TOP_RIGHT,
      values: Object.values(PositionCorner),
    },
    {
      id: 'image.fullScreen',
      type: 'boolean',
      defaultValue: false,
    },
    {
      id: 'image.aspectRatio',
      type: 'number',
      defaultValue: 1.778,
      step: 0.1,
    },
    {
      id: 'image.height_gu',
      type: 'number',
      defaultValue: 12,
      step: 1,
    },
    {
      id: 'image.margin_gu',
      type: 'number',
      defaultValue: 1.5,
      step: 0.1,
    },
    {
      id: 'image.opacity',
      type: 'number',
      defaultValue: 1,
      step: 0.1,
    },
    {
      id: 'image.enableFade',
      type: 'boolean',
      defaultValue: true,
    },

    // -- toast params --
    {
      id: 'toast.key',
      type: 'number',
      defaultValue: 0,
      shortHelpText: "To send a toast, increment the value of 'key'",
    },
    {
      id: 'toast.text',
      type: 'text',
      defaultValue: 'Hello world',
    },
    {
      id: 'toast.duration_secs',
      type: 'number',
      defaultValue: 4,
    },
    {
      id: 'toast.numTextLines',
      type: 'number',
      defaultValue: 2,
    },
    {
      id: 'toast.showIcon',
      type: 'boolean',
      defaultValue: true,
    },
    {
      id: 'toast.icon.assetName',
      type: 'text',
      defaultValue: '',
    },
    {
      id: 'toast.color',
      type: 'text',
      defaultValue: 'rgba(15, 50, 110, 0.6)',
    },
    {
      id: 'toast.strokeColor',
      type: 'text',
      defaultValue: 'rgba(0, 0, 30, 0.44)',
    },
    {
      id: 'toast.text.color',
      type: 'text',
      defaultValue: 'white',
    },
    {
      id: 'toast.text.fontFamily',
      type: 'enum',
      defaultValue: fontFamilies_smallSizeFriendly[0],
      values: fontFamilies_smallSizeFriendly,
    },
    {
      id: 'toast.text.fontWeight',
      type: 'enum',
      defaultValue: '500',
      values: fontWeights,
    },
    {
      id: 'toast.text.fontSize_pct',
      type: 'number',
      defaultValue: 100,
    },

    // -- opening slate (a.k.a. start titles) params --
    {
      id: 'openingSlate.duration_secs',
      type: 'number',
      defaultValue: 4,
      shortHelpText:
        'The slate is shown for this amount of time when the stream starts.',
    },
    {
      id: 'openingSlate.title',
      type: 'text',
      defaultValue: 'Welcome',
    },
    {
      id: 'openingSlate.subtitle',
      type: 'text',
      defaultValue: '',
    },
    {
      id: 'openingSlate.bgImageAssetName',
      type: 'text',
      defaultValue: '',
    },
    {
      id: 'openingSlate.bgColor',
      type: 'text',
      defaultValue: 'rgba(0, 0, 0, 1)',
    },
    {
      id: 'openingSlate.textColor',
      type: 'text',
      defaultValue: 'rgba(255, 255, 255, 1)',
    },
    {
      id: 'openingSlate.fontFamily',
      type: 'enum',
      defaultValue: 'Bitter',
      values: fontFamilies,
    },
    {
      id: 'openingSlate.fontWeight',
      type: 'enum',
      defaultValue: '500',
      values: fontWeights,
    },
    {
      id: 'openingSlate.fontStyle',
      type: 'enum',
      defaultValue: '',
      values: ['normal', 'italic'],
    },
    {
      id: 'openingSlate.fontSize_gu',
      type: 'number',
      defaultValue: 2.5,
      step: 0.1,
    },
    {
      id: 'openingSlate.subtitle.fontSize_pct',
      type: 'number',
      defaultValue: 75,
      step: 1,
    },
    {
      id: 'openingSlate.subtitle.fontWeight',
      type: 'enum',
      defaultValue: '400',
      values: fontWeights,
    },

    // -- title slate params --
    {
      id: 'titleSlate.title',
      type: 'text',
      defaultValue: 'Title slate',
    },
    {
      id: 'titleSlate.subtitle',
      type: 'text',
      defaultValue: 'Subtitle',
    },
    {
      id: 'titleSlate.bgImageAssetName',
      type: 'text',
      defaultValue: '',
    },
    {
      id: 'titleSlate.bgColor',
      type: 'text',
      defaultValue: 'rgba(0, 0, 0, 1)',
    },
    {
      id: 'titleSlate.textColor',
      type: 'text',
      defaultValue: 'rgba(255, 255, 255, 1)',
    },
    {
      id: 'titleSlate.fontFamily',
      type: 'enum',
      defaultValue: 'Bitter',
      values: fontFamilies,
    },
    {
      id: 'titleSlate.fontWeight',
      type: 'enum',
      defaultValue: '500',
      values: fontWeights,
    },
    {
      id: 'titleSlate.fontStyle',
      type: 'enum',
      defaultValue: '',
      values: ['normal', 'italic'],
    },
    {
      id: 'titleSlate.fontSize_gu',
      type: 'number',
      defaultValue: 2.5,
      step: 0.1,
    },
    {
      id: 'titleSlate.subtitle.fontSize_pct',
      type: 'number',
      defaultValue: 75,
      step: 1,
    },
    {
      id: 'titleSlate.subtitle.fontWeight',
      type: 'enum',
      defaultValue: '400',
      values: fontWeights,
    },
  ],
};

// -- the root component of this composition --
export default function DailyBaselineVCS() {
  const params = useParams();
  const viewportSize = useViewportSize();
  const pxPerGu = useGrid().pixelsPerGridUnit;
  const guPerVh = viewportSize.h / pxPerGu;
  const guPerVw = viewportSize.w / pxPerGu;

  // style applied to video elements.
  // placeholder is used if no video is available.
  const videoStyle = {
    cornerRadius_px: params['videoSettings.roundedCorners']
      ? DEFAULT_CORNER_RADIUS_PX
      : 0,
  };
  const placeholderStyle = {
    fillColor: params['videoSettings.placeholder.bgColor'] || '#008',
    cornerRadius_px: videoStyle.cornerRadius_px,
  };
  const videoLabelStyle = {
    textColor: params['videoSettings.labels.color'] || 'white',
    fontFamily: params['videoSettings.labels.fontFamily'] || DEFAULT_FONT,
    fontWeight: params['videoSettings.labels.fontWeight'] || '600',
    fontSize_px: params['videoSettings.labels.fontSize_pct']
      ? (params['videoSettings.labels.fontSize_pct'] / 100) *
        DEFAULT_LABEL_FONT_SIZE_PX
      : DEFAULT_LABEL_FONT_SIZE_PX,
    strokeColor:
      params['videoSettings.labels.strokeColor'] || 'rgba(0, 0, 0, 0.9)',
    strokeWidth_px: 4,
  };

  // props passed to the video layout component
  const { participantDescs, dominantVideoId, hasScreenShare } =
    useActiveVideoAndAudio({
      preferScreenshare: params['videoSettings.preferScreenshare'],
      omitPaused: params['videoSettings.omitPaused'],
    });

  const videoProps = {
    videoStyle,
    placeholderStyle,
    videoLabelStyle,
    participantDescs,
    dominantVideoId,
    preferScreenshare: params['videoSettings.preferScreenshare'],
    omitPaused: params['videoSettings.omitPaused'],
    showLabels: params['videoSettings.showParticipantLabels'],
    scaleMode: params['videoSettings.scaleMode'],
    labelsOffset_px: {
      x: params['videoSettings.labels.offset_x_gu']
        ? parseFloat(params['videoSettings.labels.offset_x_gu']) * pxPerGu
        : 0,
      y: params['videoSettings.labels.offset_y_gu']
        ? parseFloat(params['videoSettings.labels.offset_y_gu']) * pxPerGu
        : 0,
    },
  };
  // bw compatibility - check for deprecated param names using absolute px units instead of gu
  if (isFinite(params['videoSettings.labels.offset_x'])) {
    videoProps.labelsOffset_px.x = parseInt(
      params['videoSettings.labels.offset_x'],
      10
    );
  }
  if (isFinite(params['videoSettings.labels.offset_y'])) {
    videoProps.labelsOffset_px.y = parseInt(
      params['videoSettings.labels.offset_y'],
      10
    );
  }

  let mode = params.mode;
  if (
    mode === 'grid' &&
    params['videoSettings.grid.useDominantForSharing'] &&
    hasScreenShare
  ) {
    mode = 'dominant';
  }

  let video;
  switch (mode) {
    default:
    case 'single':
      video = <VideoSingle {...videoProps} />;
      break;
    case 'grid':
      video = <VideoGrid {...videoProps} />;
      break;
    case 'split':
      video = <VideoSplit {...videoProps} />;
      break;
    case 'pip': {
      let h_gu;
      let margin_gu;
      // bw compatibility - deprecated params that used viewport height instead of gu
      if (isFinite(params['videoSettings.pip.height_vh'])) {
        h_gu = params['videoSettings.pip.height_vh'] * guPerVh;
      } else {
        h_gu = params['videoSettings.pip.height_gu'];
      }
      if (isFinite(params['videoSettings.pip.margin_vh'])) {
        margin_gu = params['videoSettings.pip.margin_vh'] * guPerVh;
      } else {
        margin_gu = params['videoSettings.pip.margin_gu'];
      }

      video = (
        <VideoPip
          {...videoProps}
          positionCorner={params['videoSettings.pip.position']}
          aspectRatio={params['videoSettings.pip.aspectRatio']}
          height_gu={h_gu}
          margin_gu={margin_gu}
          followDominantFlag={params['videoSettings.pip.followDomFlag']}
        />
      );
      break;
    }
    case 'dominant':
      video = (
        <VideoDominant
          {...videoProps}
          positionEdge={params['videoSettings.dominant.position']}
          splitPos={params['videoSettings.dominant.splitPos']}
          maxItems={params['videoSettings.dominant.numChiclets']}
          followDominantFlag={params['videoSettings.dominant.followDomFlag']}
          itemInterval_gu={params['videoSettings.dominant.itemInterval_gu']}
          outerPadding_gu={params['videoSettings.dominant.outerPadding_gu']}
        />
      );
      break;
  }

  let graphics = [];
  let gi = 0;
  if (params.showTextOverlay) {
    // copy params to props and ensure types are what the component expects
    let overlayProps = params.text ? { ...params.text } : {};

    // bw compatibility: deprecated params that used absolute coords rather than gu
    if (isFinite(overlayProps.offset_x)) {
      overlayProps.offset_x_gu = parseInt(overlayProps.offset_x, 10) / pxPerGu;
    } else {
      overlayProps.offset_x_gu = parseFloat(overlayProps.offset_x_gu);
    }
    if (isFinite(overlayProps.offset_y)) {
      overlayProps.offset_y_gu = parseInt(overlayProps.offset_y, 10) / pxPerGu;
    } else {
      overlayProps.offset_y_gu = parseFloat(overlayProps.offset_y_gu);
    }

    // bw compatibility: renamed param
    if (isFinite(overlayProps.rotationInDegrees)) {
      overlayProps.rotation_deg = parseFloat(overlayProps.rotationInDegrees);
    } else {
      overlayProps.rotation_deg = parseFloat(overlayProps.rotation_deg);
    }

    // bw compatibility: deprecated param that used view height rather than gu
    if (isFinite(overlayProps.fontSize_percentageOfViewH)) {
      overlayProps.fontSize_gu =
        (parseFloat(overlayProps.fontSize_percentageOfViewH) / 100) * guPerVh;
    } else {
      overlayProps.fontSize_gu = parseFloat(overlayProps.fontSize_gu);
    }

    overlayProps.color = overlayProps.color ? overlayProps.color.trim() : null;

    overlayProps.strokeColor = overlayProps.strokeColor
      ? overlayProps.strokeColor.trim()
      : null;
    overlayProps.useStroke =
      overlayProps.strokeColor && overlayProps.strokeColor.length > 0;

    graphics.push(<TextOverlay key={gi} {...overlayProps} />);
  }
  gi++;

  {
    // image overlay
    let h_gu;
    let margin_gu;
    // bw compatibility - deprecated params that used viewport height instead of gu
    if (isFinite(params['image.height_vh'])) {
      h_gu = params['image.height_vh'] * guPerVh;
    } else {
      h_gu = params['image.height_gu'];
    }
    if (isFinite(params['image.margin_vh'])) {
      margin_gu = params['image.margin_vh'] * guPerVh;
    } else {
      margin_gu = params['image.margin_gu'];
    }

    graphics.push(
      <ImageOverlay
        key={gi}
        src={params['image.assetName']}
        positionCorner={params['image.position']}
        fullScreen={params['image.fullScreen']}
        aspectRatio={params['image.aspectRatio']}
        height_gu={h_gu}
        margin_gu={margin_gu}
        opacity={params['image.opacity']}
        enableFade={params['image.enableFade']}
        show={params.showImageOverlay}
      />
    );
    gi++;
  }

  graphics.push(
    <Toast
      key={gi++}
      numberOfLines={
        params['toast.numTextLines']
          ? parseInt(params['toast.numTextLines'], 10)
          : 2
      }
      currentItem={{
        key: params['toast.key'] ? parseInt(params['toast.key'], 10) : 0,
        text: params['toast.text'],
        showIcon: !!params['toast.showIcon'],
        iconOverrideAssetName: params['toast.icon.assetName'],
        durationInSeconds: params['toast.duration_secs']
          ? parseFloat(params['toast.duration_secs'])
          : 4,
      }}
      style={{
        fillColor: params['toast.color'],
        textColor: params['toast.text.color'] || 'white',
        fontFamily: params['toast.text.fontFamily'] || DEFAULT_FONT,
        fontWeight: params['toast.text.fontWeight'] || '500',
        fontSize_px: params['toast.text.fontSize_pct']
          ? (params['toast.text.fontSize_pct'] / 100) *
            DEFAULT_TOAST_FONT_SIZE_PX
          : DEFAULT_TOAST_FONT_SIZE_PX,
        strokeColor: params['toast.strokeColor'],
      }}
    />
  );

  // custom overlay is the topmost of non-fullscreen graphics.
  // it's empty by default (meant to be overridden in session assets).
  graphics.push(<CustomOverlay key={gi++} />);

  {
    // title slate (a fullscreen graphic)
    const titleStyle = {
      textColor: params['titleSlate.textColor'] || 'white',
      fontFamily: params['titleSlate.fontFamily'] || DEFAULT_FONT,
      fontWeight: params['titleSlate.fontWeight'] || '500',
      fontSize_gu: params['titleSlate.fontSize_gu'] || 2.5,
    };
    const subtitleStyle = {
      ...titleStyle,
      fontWeight: params['titleSlate.subtitle.fontWeight'] || '400',
    };
    if (isFinite(params['titleSlate.subtitle.fontSize_pct'])) {
      subtitleStyle.fontSize_gu *=
        params['titleSlate.subtitle.fontSize_pct'] / 100;
    }

    graphics.push(
      <Slate
        key={'titleslate_' + gi++}
        id="titleSlate"
        show={params['showTitleSlate']}
        src={params['titleSlate.bgImageAssetName']}
        bgColor={params['titleSlate.bgColor']}
        title={params['titleSlate.title']}
        subtitle={params['titleSlate.subtitle']}
        titleStyle={titleStyle}
        subtitleStyle={subtitleStyle}
      />
    );
  }

  // automatic opening slate, will be displayed at start of stream.
  const enableOpeningSlate = params['enableAutoOpeningSlate'];
  if (enableOpeningSlate) {
    const titleStyle = {
      textColor: params['openingSlate.textColor'] || 'white',
      fontFamily: params['openingSlate.fontFamily'] || DEFAULT_FONT,
      fontWeight: params['openingSlate.fontWeight'] || '500',
      fontSize_gu: params['openingSlate.fontSize_gu'] || 2.5,
    };
    const subtitleStyle = {
      ...titleStyle,
      fontWeight: params['openingSlate.subtitle.fontWeight'] || '400',
    };
    if (isFinite(params['openingSlate.subtitle.fontSize_pct'])) {
      subtitleStyle.fontSize_gu *=
        params['openingSlate.subtitle.fontSize_pct'] / 100;
    }

    graphics.push(
      <Slate
        key={'openingslate_' + gi++}
        id="openingSlate"
        show={true}
        isOpeningSlate={true}
        openingWaitTime={params['openingSlate.duration_secs']}
        src={params['openingSlate.bgImageAssetName']}
        bgColor={params['openingSlate.bgColor']}
        title={params['openingSlate.title']}
        subtitle={params['openingSlate.subtitle']}
        titleStyle={titleStyle}
        subtitleStyle={subtitleStyle}
      />
    );
  }

  // automatic closing slate based on stream playback slate.
  // currently this one isn't configurable because the server doesn't
  // send the postroll transition event.
  const inPostRoll = useVideoPlaybackState() === PlaybackStateType.POSTROLL;
  graphics.push(
    <Slate key={'closingslate_' + gi++} id="closingSlate" show={inPostRoll} />
  );

  // apply a layout function to the video container if non-zero margins specified
  let videoBoxLayout;
  const videoMargins_gu = {
    l: parseFloat(params['videoSettings.margin.left_gu']),
    r: parseFloat(params['videoSettings.margin.right_gu']),
    t: parseFloat(params['videoSettings.margin.top_gu']),
    b: parseFloat(params['videoSettings.margin.bottom_gu']),
  };
  // bw compatibility - deprecated params that use viewport dimensions instead of gu
  if (isFinite(params['videoSettings.margin.left_vw'])) {
    videoMargins_gu.l =
      parseFloat(params['videoSettings.margin.left_vw']) * guPerVw;
  }
  if (isFinite(params['videoSettings.margin.right_vw'])) {
    videoMargins_gu.r =
      parseFloat(params['videoSettings.margin.right_vw']) * guPerVw;
  }
  if (isFinite(params['videoSettings.margin.top_vh'])) {
    videoMargins_gu.t =
      parseFloat(params['videoSettings.margin.top_vh']) * guPerVh;
  }
  if (isFinite(params['videoSettings.margin.bottom_vh'])) {
    videoMargins_gu.b =
      parseFloat(params['videoSettings.margin.bottom_vh']) * guPerVh;
  }
  if (
    (isFinite(videoMargins_gu.l) && videoMargins_gu.l !== 0) ||
    (isFinite(videoMargins_gu.r) && videoMargins_gu.r !== 0) ||
    (isFinite(videoMargins_gu.t) && videoMargins_gu.t !== 0) ||
    (isFinite(videoMargins_gu.b) && videoMargins_gu.b !== 0)
  ) {
    videoBoxLayout = [layoutFuncs.pad, { pad_gu: videoMargins_gu }];
  }

  return (
    <Box id="main">
      <Box id="videoBox" layout={videoBoxLayout}>
        {video}
      </Box>
      <Box id="graphicsBox">{graphics}</Box>
    </Box>
  );
}
