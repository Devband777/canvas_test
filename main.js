let stage;
let layer;
let groupNode;
let cropImageTransformer;
let stageWidth = 400;
let stageHeight = 400;
let imageNode;
let workWidth = 400 / 4;
let workHeight = 400 / 4;

let fiw;
let fih;
let shape_type;

let widthConstant;
let heigthConstant;
let shapeNode;

const path = "M0.5,25.5h50h50v25v25h-50h-50v-25V25.5z";
const path1 = "M0.5,25.5h50h50v25v25h-50h";
stage = new Konva.Stage({
  container: "container",
  width: stageWidth,
  height: stageHeight,
});

layer = new Konva.Layer();
stage.add(layer);
const commandList = svgPathToCommands(path);
let x = 23;
let y = 25;

group1 = new Konva.Group({
  x,
  y,
  scaleX: 3.5,
  scaleY: 3.5,
  clipFunc: function (ctx) {
    ctx.lineWidth = 1 / 9;
    drawSvgPath(ctx, commandList);
  },
});

let image = new Image();
image.src = "img.png";
image.onload = () => {
  let iw = image.width;
  let ih = image.height;
  fiw = iw;
  fih = ih;

  let stageMax = Math.max(workWidth, workHeight);
  let ratio = 1;
  if (Math.max(iw, ih) > stageMax) {
    if (iw > workWidth) {
      ratio = iw / workWidth;
    }
    if (ih > workHeight) {
      ratio = ih / workHeight;
    }
    fiw = Math.round(iw / ratio);
    fih = Math.round(ih / ratio);
  }

  // y: fih / 2,
  imageNode = new Konva.Image({
    y: fih / 2 > 50 ? fih / 2 : 50,
    x: workWidth / 2,
    image: image,
    width: fiw,
    height: fih,
    scaleX: 1 / 3,
    scaleY: 1 / 3,
    offsetX: fiw / 2,
    offsetY: fih / 2,
    draggable: true,
  });

  group1.add(imageNode);
};

group2 = new Konva.Group({
  opacity: 0.7,
  x,
  y,
  scaleX: 3.5,
  scaleY: 3.5,
  clipFunc: function (ctx) {
    ctx.lineWidth = 1 / 9;
    drawSvgPath(ctx, commandList);
  },
});

const scale = 350 / 100;
shapeNode = new Konva.Shape({
  x: 5,
  y: 5,
  scaleX: 0.9,
  scaleY: 0.9,
  sceneFunc(ctx, shape) {
    ctx.lineWidth = 1 / 4;
    ctx.strokeStyle = "#0098da";
    ctx.setLineDash([4, 4]);
    drawSvgPath(ctx, svgPathToCommands(path));
    ctx.fillStrokeShape(shape);
  },
  listening: false,
});
shapeNode.moveToTop();
group2.add(shapeNode);
group2.add(
  new Konva.Rect({
    width: 105,
    height: 27.9,
    fill: '#F0F0F0',
    strokeDash: [4, 4],
  })
).add(
  new Konva.Rect({
    y:27.86, 
    width: 5.4,
    height: 100,
    fill: '#F0F0F0',
  })
).add(
  new Konva.Rect({
    x: 5.36,
    y: 73,
    width: 105,
    height: 27.8,
    fill: '#F0F0F0',
  })
).add(
  new Konva.Rect({
    x: 95.5,
    y: 27.87,
    width: 5.4,
    height: 45.17,
    fill: '#F0F0F0',
  })
);


function svgPathToCommands(str) {
  const DIGIT_REG_EX = /-?[0-9]*\.?\d+/g;
  const MARKER_REG_EX = /[MmLlSsQqLlHhVvCcSsQqTtAaZz]/g;

  const results = [];
  let match;
  while ((match = MARKER_REG_EX.exec(str)) !== null) {
    results.push(match);
  }

  return results
    .map((match) => {
      return {
        marker: str[match.index],
        index: match.index,
      };
    })
    .reduceRight((all, cur) => {
      const chunk = str.substring(
        cur.index,
        all.length ? all[all.length - 1].index : str.length
      );
      return all.concat([
        {
          marker: cur.marker,
          index: cur.index,
          chunk:
            chunk.length > 0 ? chunk.substr(1, chunk.length - 1) : chunk,
        },
      ]);
    }, [])
    .reverse()
    .map((command) => {
      const values = command.chunk.match(DIGIT_REG_EX);
      return {
        marker: command.marker,
        values: values ? values.map(parseFloat) : [],
      };
    });
}

function drawSvgPath(ctx, commandList) {
  // ctx.save();
  ctx.beginPath();
  let lastPos = [0, 0];
  let pointOne, pointTwo;
  commandList.forEach((command) => {
    switch (command.marker) {
      case "z":
      case "Z": {
        lastPos = [0, 0];
        ctx.closePath();
        break;
      }
      case "m": {
        lastPos = [
          lastPos[0] + command.values[0],
          lastPos[1] + command.values[1],
        ];
        ctx.moveTo(lastPos[0], lastPos[1]);
        break;
      }
      case "l": {
        lastPos = [
          lastPos[0] + command.values[0],
          lastPos[1] + command.values[1],
        ];
        ctx.lineTo(lastPos[0], lastPos[1]);
        break;
      }
      case "h": {
        lastPos = [lastPos[0] + command.values[0], lastPos[1]];
        ctx.lineTo(lastPos[0], lastPos[1]);
        break;
      }
      case "v": {
        lastPos = [lastPos[0], lastPos[1] + command.values[0]];
        ctx.lineTo(lastPos[0], lastPos[1]);
        break;
      }
      case "c": {
        pointOne = [
          lastPos[0] + command.values[0],
          lastPos[1] + command.values[1],
        ];
        pointTwo = [
          lastPos[0] + command.values[2],
          lastPos[1] + command.values[3],
        ];
        lastPos = [
          lastPos[0] + command.values[4],
          lastPos[1] + command.values[5],
        ];
        ctx.bezierCurveTo(
          pointOne[0],
          pointOne[1],
          pointTwo[0],
          pointTwo[1],
          lastPos[0],
          lastPos[1]
        );
        break;
      }
      case "s": {
        pointOne = [
          lastPos[0] - pointTwo[0] + lastPos[0],
          lastPos[1] - pointTwo[1] + lastPos[1],
        ];
        pointTwo = [
          lastPos[0] + command.values[0],
          lastPos[1] + command.values[1],
        ];
        lastPos = [
          lastPos[0] + command.values[2],
          lastPos[1] + command.values[3],
        ];
        ctx.bezierCurveTo(
          pointOne[0],
          pointOne[1],
          pointTwo[0],
          pointTwo[1],
          lastPos[0],
          lastPos[1]
        );
        break;
      }
      case "M": {
        lastPos = [command.values[0], command.values[1]];
        ctx.moveTo(lastPos[0], lastPos[1]);
        break;
      }
      case "L": {
        lastPos = [command.values[0], command.values[1]];
        ctx.lineTo(lastPos[0], lastPos[1]);
        break;
      }
      case "H": {
        lastPos = [command.values[0], lastPos[1]];
        ctx.lineTo(lastPos[0], lastPos[1]);
        break;
      }
      case "V": {
        lastPos = [lastPos[0], command.values[0]];
        ctx.lineTo(lastPos[0], lastPos[1]);
        break;
      }
      case "C": {
        pointOne = [command.values[0], command.values[1]];
        pointTwo = [command.values[2], command.values[3]];
        lastPos = [command.values[4], command.values[5]];
        ctx.bezierCurveTo(
          pointOne[0],
          pointOne[1],
          pointTwo[0],
          pointTwo[1],
          lastPos[0],
          lastPos[1]
        );
        break;
      }
      case "S": {
        pointOne = [
          lastPos[0] - pointTwo[0] + lastPos[0],
          lastPos[1] - pointTwo[1] + lastPos[1],
        ];
        pointTwo = [command.values[0], command.values[1]];
        lastPos = [command.values[2], command.values[3]];
        ctx.bezierCurveTo(
          pointOne[0],
          pointOne[1],
          pointTwo[0],
          pointTwo[1],
          lastPos[0],
          lastPos[1]
        );
        break;
      }
      default:
        "";
    }
  });

  ctx.stroke();
  // ctx.restore();
}

layer.add(group1);
layer.add(group2);