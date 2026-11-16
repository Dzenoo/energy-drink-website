// The model's faces are not all wound the same way: whichever way a face is
// wound, its normal faces the camera, so no face is lit from behind.
if (dot(normal, vViewPosition) < 0.0) normal = -normal;
