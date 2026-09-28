/* Eleven Estilistes — ondas de agua WebGL sobre la foto y ritual de 11 pasos */
gsap.registerPlugin(ScrollTrigger);
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ---------- agua ---------- */
(function water() {
  const cv = $('#water'), img = $('.hero__fallback');
  const gl = cv.getContext('webgl');
  if (!gl) return;
  const N = 12;
  const vs = `attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;uv.y=1.-uv.y;gl_Position=vec4(p,0.,1.);}`;
  const fs = `precision mediump float;uniform sampler2D t;uniform vec2 res,img;uniform float time;uniform vec3 drops[${N}];varying vec2 uv;
  vec2 cover(vec2 q){float r=res.x/res.y,ir=img.x/img.y;vec2 sc=r>ir?vec2(1.,ir/r):vec2(r/ir,1.);return (q-.5)*sc+.5;}
  void main(){vec2 asp=vec2(res.x/res.y,1.);vec2 off=vec2(0.);float light=0.;
    for(int i=0;i<${N};i++){vec3 d=drops[i];float age=time-d.z;if(age<0.||age>5.)continue;
      vec2 dv=(uv-d.xy)*asp;float dist=length(dv);float r=age*.22;float a=exp(-age*.9)*.018;
      float w=sin((dist-r)*70.)*exp(-abs(dist-r)*14.)*a;off+=normalize(dv+1e-5)*w;light+=w*18.;}
    vec3 c=texture2D(t,cover(uv+off)).rgb;c+=vec3(.55,.8,.85)*max(light,0.)*.9;
    gl_FragColor=vec4(c,1.);}`;
  const sh = (ty, s) => { const x = gl.createShader(ty); gl.shaderSource(x, s); gl.compileShader(x); return x; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(pr, n);
  const drops = new Float32Array(N * 3).fill(-10); let di = 0;
  const t0 = performance.now(); const now = () => (performance.now() - t0) / 1000;
  const drop = (x, y) => { drops[di * 3] = x; drops[di * 3 + 1] = y; drops[di * 3 + 2] = now(); di = (di + 1) % N; };
  function start() {
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.uniform2f(U('img'), img.naturalWidth, img.naturalHeight);
    $('.hero').classList.add('has-gl');
    size(); drop(.5, .45);
    gsap.ticker.add(draw);
  }
  function size() { const d = Math.min(2, devicePixelRatio || 1); cv.width = cv.clientWidth * d; cv.height = cv.clientHeight * d; gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U('res'), cv.width, cv.height); }
  addEventListener('resize', size);
  let last = 0;
  const hero = $('.hero');
  hero.addEventListener('pointermove', e => { const t = now(); if (t - last < .12) return; last = t; const r = cv.getBoundingClientRect(); drop((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height); });
  hero.addEventListener('pointerdown', e => { const r = cv.getBoundingClientRect(); drop((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height); });
  setInterval(() => drop(.2 + Math.random() * .6, .2 + Math.random() * .6), 2200);
  let vis = true; new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(cv);
  function draw() { if (!vis) return; gl.uniform1f(U('time'), now()); gl.uniform3fv(U('drops'), drops); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
  if (img.complete && img.naturalWidth) start(); else img.addEventListener('load', start);
})();

/* ---------- entrada ---------- */
gsap.from('.hero__txt > *', { y: 40, opacity: 0, duration: 1.3, ease: 'expo.out', stagger: .1, delay: .4 });

/* ---------- pasos: el número se llena de color al pasar ---------- */
$$('.step').forEach(s => {
  ScrollTrigger.create({ trigger: s, start: 'top 65%', end: 'bottom 35%', toggleClass: 'is-on' });
  gsap.from(s.children, { y: 40, opacity: 0, duration: 1, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: s, start: 'top 88%' } });
});
$$('.head, .color figure, .big, .reviews__row blockquote, .visit > *').forEach(n => gsap.from(n, { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: n, start: 'top 90%' } }));
