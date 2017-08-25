// @flow

const Buffer = require('../data/buffer');
const VertexArrayObject = require('./vertex_array_object');
const PosArray = require('../data/pos_array');

import type Painter from './painter';

class RenderTexture {
    gl: WebGLRenderingContext;
    texture: WebGLTexture;
    fbo: WebGLFramebuffer;
    buffer: Buffer;
    vao: VertexArrayObject;

    constructor(painter: Painter) {
        const gl = this.gl = painter.gl;

        const texture = this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, painter.width, painter.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        gl.bindTexture(gl.TEXTURE_2D, null);

        const fbo = this.fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        const array = new PosArray();
        array.emplaceBack(0, 0);
        array.emplaceBack(1, 0);
        array.emplaceBack(0, 1);
        array.emplaceBack(1, 1);
        this.buffer = Buffer.fromStructArray(array, Buffer.BufferType.VERTEX);
        this.vao = new VertexArrayObject();
    }

    attachRenderbuffer(depthRbo: WebGLRenderbuffer) {
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRbo);
    }

    detachRenderbuffer() {
        const gl = this.gl;
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
}

module.exports = RenderTexture;
