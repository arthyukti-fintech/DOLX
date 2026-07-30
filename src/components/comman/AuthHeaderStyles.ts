import { Dimensions, StyleSheet } from "react-native";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const IMG_GAP = 12;
const MOSAIC_ROTATION = "14deg";
const MOSAIC_H = SCREEN_H * 0.58;
const GRID_W = SCREEN_W * 1.42;
const GRID_OFFSET_LEFT = -(GRID_W - SCREEN_W) / 2;
const GRID_OFFSET_TOP = -SCREEN_H * 0.07;
const COL_W = (GRID_W - IMG_GAP * 2) / 3;
const CARD_BORDER_R = 28;

const styles = StyleSheet.create({
  mosaicContainer: {
    width: SCREEN_W,
    height: MOSAIC_H,
    overflow: "hidden",
  },

  mosaicRotated: {
    flexDirection: "row",
    width: GRID_W,
    gap: IMG_GAP,
    position: "absolute",
    top: GRID_OFFSET_TOP,
    left: GRID_OFFSET_LEFT,
    transform: [{ rotate: MOSAIC_ROTATION }],
  },

  mosaicColumn: {
    width: COL_W,
    gap: IMG_GAP,
  },

  mosaicColumnLeft: {},

  mosaicColumnCenter: {
    marginTop: 56,
  },

  mosaicColumnRight: {
    marginTop: -22,
  },

  mosaicImgTall: {
    width: COL_W,
    height: COL_W * 1.3,
    borderRadius: 24,
  },

  mosaicImgSquare: {
    width: COL_W,
    height: COL_W * 0.95,
    borderRadius: 24,
  },

  mosaicImgWide: {
    width: COL_W,
    height: COL_W * 0.8,
    borderRadius: 24,
  },

  mosaicOverlay: {
    backgroundColor: "rgba(15, 15, 26, 0.45)",
    borderBottomLeftRadius: CARD_BORDER_R,
    borderBottomRightRadius: CARD_BORDER_R,
    flex: 1,
  },
});

export default styles;