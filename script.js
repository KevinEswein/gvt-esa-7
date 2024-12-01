const app = (function () {
  let gl;
  let prog;
  const models = [];
  let interactiveModel;
  const camera = {
    eye: [0, 1, 4],
    center: [0, 0, 0],
    up: [0, 1, 0],
    fovy: 60.0 * Math.PI / 180,
    lrtb: 2.0,
    vMatrix: mat4.create(),
    pMatrix: mat4.create(),
    projectionType: "perspective",
    zAngle: 0,
    distance: 4,
  };

  function start() {
    init();
    render();
  }

  function init() {
    initWebGL();
    initShaderProgram();
    initUniforms();
    initModels();
    initEventHandler();
    initPipline();
  }

  function initWebGL() {
    let canvas = document.getElementById('canvas');
    gl = canvas.getContext('experimental-webgl');
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  }

  function initPipline() {
    gl.clearColor(.95, .95, .95, 1);
    gl.frontFace(gl.CCW);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(0.5, 0);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    camera.aspect = gl.viewportWidth / gl.viewportHeight;
  }

  function initShaderProgram() {
    const vs = initShader(gl.VERTEX_SHADER, "vertexshader");
    const fs = initShader(gl.FRAGMENT_SHADER, "fragmentshader");
    prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, 0, "aPosition");
    gl.linkProgram(prog);
    gl.useProgram(prog);
  }

  function initShader(shaderType, SourceTagId) {
    const shader = gl.createShader(shaderType);
    const shaderSource = document.getElementById(SourceTagId).text;
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log(SourceTagId + ": " + gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  }

  function initUniforms() {
    prog.pMatrixUniform = gl.getUniformLocation(prog, "uPMatrix");
    prog.mvMatrixUniform = gl.getUniformLocation(prog, "uMVMatrix");
    prog.nMatrixUniform = gl.getUniformLocation(prog, "uNMatrix");
    prog.colorUniform = gl.getUniformLocation(prog, "uColor");
  }

  function initModels() {
    const fs = "fillwireframe";
    createModel("cube", fs, [1, 0, 0, 1], [-1.2, 0.1, 0.4], [0, 0, 0], [0.8, 0.5, 0.5]);
    createModel("cube", fs, [0, 1, 0, 1], [0, 0, -0.2], [0, 0, 0], [0.5, 0.35, 0.8]);
    createModel("cube", fs, [0, 0, 1, 1], [0.5, 0, -1.2], [0, 0, 0], [0.5, 0.8, 0.5]);
    interactiveModel = models[0];
  }

  function createModel(geometryname, fillstyle, color, translate, rotate, scale) {
    const model = {};
    model.fillstyle = fillstyle;
    model.color = color;
    initDataAndBuffers(model, geometryname);
    initTransformations(model, translate, rotate, scale);
    models.push(model);
  }

  function initTransformations(model, translate, rotate, scale) {
    model.translate = translate;
    model.rotate = rotate;
    model.scale = scale;
    model.mMatrix = mat4.create();
    model.mvMatrix = mat4.create();
    model.nMatrix = mat3.create();
  }

  function initDataAndBuffers(model, geometryname) {
    this[geometryname]['createVertexData'].apply(model);
    model.vboPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vboPos);
    gl.bufferData(gl.ARRAY_BUFFER, model.vertices, gl.STATIC_DRAW);
    prog.positionAttrib = gl.getAttribLocation(prog, 'aPosition');
    gl.enableVertexAttribArray(prog.positionAttrib);

    model.vboNormal = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vboNormal);
    gl.bufferData(gl.ARRAY_BUFFER, model.normals, gl.STATIC_DRAW);
    prog.normalAttrib = gl.getAttribLocation(prog, 'aNormal');
    gl.enableVertexAttribArray(prog.normalAttrib);

    model.iboLines = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboLines);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesLines, gl.STATIC_DRAW);
    model.iboLines.numberOfElements = model.indicesLines.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    model.iboTris = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboTris);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesTris, gl.STATIC_DRAW);
    model.iboTris.numberOfElements = model.indicesTris.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }

  function initEventHandler() {
    const deltaRotate = Math.PI / 36;
    const deltaTranslate = 0.05;

    window.onkeydown = function (evt) {
      const key = evt.which ? evt.which : evt.keyCode;
      const c = String.fromCharCode(key);
      const sign = evt.shiftKey ? -1 : 1;

      switch (c) {
        // WASD: Bewegung der Kamera in der XY-Ebene
        case 'W':
          camera.eye[1] += deltaTranslate; // Kamera nach oben bewegen
          break;
        case 'S':
          camera.eye[1] -= deltaTranslate; // Kamera nach unten bewegen
          break;
        case 'A':
          camera.eye[0] -= deltaTranslate; // Kamera nach links bewegen
          break;
        case 'D':
          camera.eye[0] += deltaTranslate; // Kamera nach rechts bewegen
          break;

        case 'C':
          camera.zAngle += sign * deltaRotate;
          break;
        case 'H':
          camera.eye[1] += sign * deltaTranslate;
          break;
        case 'E':
          camera.distance += sign * deltaTranslate;
          break;
        case 'V':
          camera.fovy += sign * 5 * Math.PI / 180;
          break;
      }

      // Pfeiltasten: Drehung der Szene
      switch (key) {
        case 37: // Left arrow
          camera.zAngle -= deltaRotate;
          break;
        case 38: // Up arrow
          camera.eye[1] += deltaTranslate;
          break;
        case 39: // Right arrow
          camera.zAngle += deltaRotate;
          break;
        case 40: // Down arrow
          camera.eye[1] -= deltaTranslate;
          break;
      }

      render();
    };
  }

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    setProjection();
    calculateCameraOrbit();
    mat4.lookAt(camera.vMatrix, camera.eye, camera.center, camera.up);

    for (let i = 0; i < models.length; i++) {
      updateTransformations(models[i]);
      gl.uniform4fv(prog.colorUniform, models[i].color);
      gl.uniformMatrix4fv(prog.mvMatrixUniform, false, models[i].mvMatrix);
      gl.uniformMatrix3fv(prog.nMatrixUniform, false, models[i].nMatrix);
      draw(models[i]);
    }
  }

  function calculateCameraOrbit() {
    const x = 0, z = 2;
    camera.eye[x] = camera.center[x];
    camera.eye[z] = camera.center[z];
    camera.eye[x] += camera.distance * Math.sin(camera.zAngle);
    camera.eye[z] += camera.distance * Math.cos(camera.zAngle);
  }

  function setProjection() {
    let v;
    switch (camera.projectionType) {
      case "ortho":
        v = camera.lrtb;
        mat4.ortho(camera.pMatrix, -v, v, -v, v, -10, 10);
        break;
      case "frustum":
        v = camera.lrtb;
        mat4.frustum(camera.pMatrix, -v / 2, v / 2, -v / 2, v / 2, 1, 10);
        break;
      case "perspective":
        mat4.perspective(camera.pMatrix, camera.fovy, camera.aspect, 1, 10);
        break;
    }
    gl.uniformMatrix4fv(prog.pMatrixUniform, false, camera.pMatrix);
  }

  function updateTransformations(model) {
    const mMatrix = model.mMatrix;
    const mvMatrix = model.mvMatrix;

    mat4.identity(mMatrix);
    mat4.identity(mvMatrix);

    mat4.translate(mMatrix, mMatrix, model.translate);
    mat4.rotateX(mMatrix, mMatrix, model.rotate[0]);
    mat4.rotateY(mMatrix, mMatrix, model.rotate[1]);
    mat4.rotateZ(mMatrix, mMatrix, model.rotate[2]);
    mat4.scale(mMatrix, mMatrix, model.scale);

    mat4.multiply(mvMatrix, camera.vMatrix, mMatrix);
    mat3.normalFromMat4(model.nMatrix, mvMatrix);
  }

  function draw(model) {
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vboPos);
    gl.vertexAttribPointer(prog.positionAttrib, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.vboNormal);
    gl.vertexAttribPointer(prog.normalAttrib, 3, gl.FLOAT, false, 0, 0);

    const fill = (model.fillstyle.search(/fill/) !== -1);
    if (fill) {
      gl.enableVertexAttribArray(prog.normalAttrib);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboTris);
      gl.drawElements(gl.TRIANGLES, model.iboTris.numberOfElements, gl.UNSIGNED_SHORT, 0);
    }

    const wireframe = (model.fillstyle.search(/wireframe/) !== -1);
    if (wireframe) {
      gl.uniform4fv(prog.colorUniform, [0., 0., 0., 1.]);
      gl.disableVertexAttribArray(prog.normalAttrib);
      gl.vertexAttrib3f(prog.normalAttrib, 0, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboLines);
      gl.drawElements(gl.LINES, model.iboLines.numberOfElements, gl.UNSIGNED_SHORT, 0);
    }
  }

  return {
    start: start
  };
}());
