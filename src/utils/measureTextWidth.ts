export function measureTextWidth(
    text: string,
    fontSize: number,
    fontFamily = "inherit",
    canvasWidth: number = 360 // Default to desktop canvas width
  ) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    ctx.font = `${fontSize}px ${fontFamily}`;
    const measuredWidth = ctx.measureText(text).width;
    
    // Scale based on actual canvas width (for responsive canvas)
    // Canvas sizes: mobile 280px, sm 320px, md+ 360px
    const scaleFactor = canvasWidth / 360;
    return measuredWidth * scaleFactor;
  }
  