var cube = {
  createVertexData: function() {
    this.vertices = new Float32Array([
      // Front face
      -1.0, -1.0,  1.0,
      1.0, -1.0,  1.0,
      1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,
      // Back face
      -1.0, -1.0, -1.0,
      -1.0,  1.0, -1.0,
      1.0,  1.0, -1.0,
      1.0, -1.0, -1.0,
      // Top face
      -1.0,  1.0, -1.0,
      -1.0,  1.0,  1.0,
      1.0,  1.0,  1.0,
      1.0,  1.0, -1.0,
      // Bottom face
      -1.0, -1.0, -1.0,
      1.0, -1.0, -1.0,
      1.0, -1.0,  1.0,
      -1.0, -1.0,  1.0,
      // Right face
      1.0, -1.0, -1.0,
      1.0,  1.0, -1.0,
      1.0,  1.0,  1.0,
      1.0, -1.0,  1.0,
      // Left face
      -1.0, -1.0, -1.0,
      -1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0,
      -1.0,  1.0, -1.0
    ]);

    this.normals = new Float32Array([
      // Front
      0.0,  0.0,  1.0,
      0.0,  0.0,  1.0,
      0.0,  0.0,  1.0,
      0.0,  0.0,  1.0,
      // Back
      0.0,  0.0, -1.0,
      0.0,  0.0, -1.0,
      0.0,  0.0, -1.0,
      0.0,  0.0, -1.0,
      // Top
      0.0,  1.0,  0.0,
      0.0,  1.0,  0.0,
      0.0,  1.0,  0.0,
      0.0,  1.0,  0.0,
      // Bottom
      0.0, -1.0,  0.0,
      0.0, -1.0,  0.0,
      0.0, -1.0,  0.0,
      0.0, -1.0,  0.0,
      // Right
      1.0,  0.0,  0.0,
      1.0,  1.0,  0.0,
      1.0,  0.0,
      1.0,  0.0,
      1.0,  0.0,
      // Left
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0
    ]);

    this.indicesLines = new Uint16Array([
      0, 1, 1, 2, 2, 3, 3, 0, // front
      4, 5, 5, 6, 6, 7, 7, 4, // back
      8, 9, 9, 10, 10, 11, 11, 8, // top
      12, 13, 13, 14, 14, 15, 15, 12, // bottom
      16, 17, 17, 18, 18, 19, 19, 16, // right
      20, 21, 21, 22, 22, 23, 23, 20 // left
    ]);

    this.indicesTris = new Uint16Array([
      0, 1, 2, 0, 2, 3, // front
      4, 5, 6, 4, 6, 7, // back
      8, 9, 10, 8, 10, 11, // top
      12, 13, 14, 12, 14, 15, // bottom
      16, 17, 18, 16, 18, 19, // right
      20, 21, 22, 20, 22, 23 // left
    ]);
  }
};

var sphere = {
  createVertexData: function() {
    var n = 30;
    var m = 30;

    this.vertices = new Float32Array(3 * (n + 1) * (m + 1));
    this.normals = new Float32Array(3 * (n + 1) * (m + 1));
    this.indicesLines = new Uint16Array(2 * 2 * n * m);
    this.indicesTris = new Uint16Array(3 * 2 * n * m);

    var du = 2 * Math.PI / n;
    var dv = Math.PI / m;
    var r = 1;

    var iLines = 0;
    var iTris = 0;

    for (var i = 0, u = 0; i <= n; i++, u += du) {
      for (var j = 0, v = 0; j <= m; j++, v += dv) {
        var iVertex = i * (m + 1) + j;

        var x = r * Math.sin(v) * Math.cos(u);
        var y = r * Math.sin(v) * Math.sin(u);
        var z = r * Math.cos(v);

        this.vertices[iVertex * 3] = x;
        this.vertices[iVertex * 3 + 1] = y;
        this.vertices[iVertex * 3 + 2] = z;

        this.normals[iVertex * 3] = x;
        this.normals[iVertex * 3 + 1] = y;
        this.normals[iVertex * 3 + 2] = z;

        if (j > 0 && i > 0) {
          this.indicesLines[iLines++] = iVertex - 1;
          this.indicesLines[iLines++] = iVertex;

          this.indicesLines[iLines++] = iVertex - (m + 1);
          this.indicesLines[iLines++] = iVertex;

          this.indicesTris[iTris++] = iVertex;
          this.indicesTris[iTris++] = iVertex - 1;
          this.indicesTris[iTris++] = iVertex - (m + 1);

          this.indicesTris[iTris++] = iVertex - 1;
          this.indicesTris[iTris++] = iVertex - (m + 1) - 1;
          this.indicesTris[iTris++] = iVertex - (m + 1);
        }
      }
    }
  }
};

var cone = {
  createVertexData: function() {
    var n = 30;
    var m = 30;

    this.vertices = new Float32Array(3 * (n + 1) * (m + 1));
    this.normals = new Float32Array(3 * (n + 1) * (m + 1));
    this.indicesLines = new Uint16Array(2 * 2 * n * m);
    this.indicesTris = new Uint16Array(3 * 2 * n * m);

    var du = 2 * Math.PI / n;
    var dv = 1 / m;
    var r = 1;
    var h = 1;

    var iLines = 0;
    var iTris = 0;

    for (var i = 0, u = 0; i <= n; i++, u += du) {
      for (var j = 0, v = 0; j <= m; j++, v += dv) {
        var iVertex = i * (m + 1) + j;

        var x = (1 - v) * r * Math.cos(u);
        var y = (1 - v) * r * Math.sin(u);
        var z = v * h;

        this.vertices[iVertex * 3] = x;
        this.vertices[iVertex * 3 + 1] = y;
        this.vertices[iVertex * 3 + 2] = z;

        this.normals[iVertex * 3] = x;
        this.normals[iVertex * 3 + 1] = y;
        this.normals[iVertex * 3 + 2] = z;

        if (j > 0 && i > 0) {
          this.indicesLines[iLines++] = iVertex - 1;
          this.indicesLines[iLines++] = iVertex;

          this.indicesLines[iLines++] = iVertex - (m + 1);
          this.indicesLines[iLines++] = iVertex;

          this.indicesTris[iTris++] = iVertex;
          this.indicesTris[iTris++] = iVertex - 1;
          this.indicesTris[iTris++] = iVertex - (m + 1);

          this.indicesTris[iTris++] = iVertex - 1;
          this.indicesTris[iTris++] = iVertex - (m + 1) - 1;
          this.indicesTris[iTris++] = iVertex - (m + 1);
        }
      }
    }
  }
};
