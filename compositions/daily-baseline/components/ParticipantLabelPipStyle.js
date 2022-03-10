import * as React from 'react';
import { Box, Label } from '#vcs-react/components';
import * as layoutFuncs from '../layouts';

export function ParticipantLabelPipStyle({
  label: labelStr,
  labelStyle,
  layout: outerLayout,
  labelsOffset_px,
}) {
  if (
    !labelsOffset_px ||
    !Number.isFinite(labelsOffset_px.x) ||
    !Number.isFinite(labelsOffset_px.y)
  ) {
    labelsOffset_px = { x: 0, y: 0 };
  }
  // this is the default offset for PiP mode
  labelsOffset_px.x += 10;
  labelsOffset_px.y += 10;

  const label = (
    <Label style={labelStyle} layout={[layoutFuncs.offset, labelsOffset_px]}>
      {labelStr || ''}
    </Label>
  );

  if (outerLayout) {
    // wrap in a box
    return (
      <Box layout={outerLayout} clip>
        {label}
      </Box>
    );
  }
  return label;
}
