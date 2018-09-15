import {
    WebGLRenderer,
    Scene,
    PerspectiveCamera,
    Vector3,
    Clock,
    GridHelper,
    OrthographicCamera,
    PlaneGeometry,
    ShaderMaterial,
    Mesh,
    FloatType,
    HalfFloatType,
    WebGLRenderTarget,
    ClampToEdgeWrapping,
    RGBAFormat,
    NearestFilter,
    MeshBasicMaterial
} from 'three'

import { Tornado } from './Tornado'

const { innerWidth: width, innerHeight: height } = window
const renderer = new WebGLRenderer()
const scene = new Scene()
const camera = new PerspectiveCamera(45, width / height, 0.1, 1000)
const clock = new Clock()

renderer.setSize(width, height)
renderer.setPixelRatio(window.devicePixelRatio || 1)
renderer.setClearColor(0x000000)
document.body.appendChild(renderer.domElement)

camera.position.set(0, 200, 200)
camera.lookAt(new Vector3(0, 0, 0))

// init

const tornado = new Tornado(200).initialize(scene)

let currentTarget = createRenderTarget(width, height)
let prevTarget = currentTarget.clone()

const blendCamera = new OrthographicCamera(-width / 2, width / 2, -height / 2, height / 2, 0.1, 1000)
blendCamera.position.set(0, 0, -20)
blendCamera.lookAt(new Vector3())
const blendScene = new Scene()
const blendQuad = new PlaneGeometry(width, height, 1, 1)
const blendMaterial = new ShaderMaterial({
    uniforms: {
        texture: { value: currentTarget.texture }
    },
    vertexShader: `
        varying vec2 vUv;

        void main () {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

            vUv = uv;
        }
    `,
    fragmentShader: `
        uniform sampler2D texture;
        varying vec2 vUv;

        void main () {
            // vec2 uv = vUv;
            // uv.y = 1.0 - uv.y;
            vec4 fadeColor = vec4(0.1, 0.1, 0.1, 1.0);

            vec4 textureColor = texture2D(texture, vUv);

            gl_FragColor = mix(textureColor, fadeColor, 0.05);
        }
    `
})
const blendMesh = new Mesh(blendQuad, blendMaterial)
blendScene.add(blendMesh)

const resultCamera = new OrthographicCamera(-width / 2, width / 2, -height / 2, height / 2, 0.1, 1000)
resultCamera.position.set(0, 0, -20)
resultCamera.lookAt(new Vector3())
const resultScene = new Scene()
const resultQuad = new PlaneGeometry(width, height, 1, 1)
const resultMaterial = new MeshBasicMaterial({ map: currentTarget.texture })
const resultMesh = new Mesh(resultQuad, resultMaterial)

// rotate the mesh to fix the y issue i dk why is it like this :(
resultMesh.rotation.z = Math.PI

resultScene.add(resultMesh)

renderFrame()

function renderFrame () {
    window.requestAnimationFrame(renderFrame)
    const dt = clock.getDelta()
    tornado.updateAnimationFrame(dt)

    blendMesh.material.uniforms.texture.value = prevTarget.texture
    renderer.render(blendScene, blendCamera, currentTarget)

    renderer.autoClearColor = false

    renderer.render(scene, camera, currentTarget)
    
    resultMesh.material.map = currentTarget.texture

    renderer.autoClearColor = true

    renderer.render(resultScene, resultCamera)

    swapBuffers()

}

function swapBuffers () {
  let temp = prevTarget
  prevTarget = currentTarget
  currentTarget = temp
}

function createRenderTarget (w, h) {
  let type = FloatType
  if( renderer.extensions.get( 'OES_texture_float_linear' ) === null ) type = HalfFloatType

  let renderTarget = new WebGLRenderTarget( 1, 1, {
    type,
    wrapS: ClampToEdgeWrapping,
    wrapT: ClampToEdgeWrapping,
    format: RGBAFormat,
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    stencilBuffer: false,
    depthBuffer: true
  })
  
  const dpr = window.devicePixelRatio || 1
  renderTarget.texture.generateMipmaps = false
  renderTarget.setSize(w * dpr, h * dpr)

  return renderTarget
}
