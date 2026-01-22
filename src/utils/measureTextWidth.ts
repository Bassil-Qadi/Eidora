export function measureTextWidth(
    text: string,
    fontSize: number,
    fontFamily = "inherit"
  ) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    ctx.font = `${fontSize}px ${fontFamily}`;
    return ctx.measureText(text).width;
  }
  