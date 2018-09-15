import {
    BufferAttribute,
    BufferGeometry,
    ShaderMaterial,
    Points
} from 'three'

import { vertexShader } from './vertex-shader'
import { fragmentShader } from './fragment-shader'

export class Tornado {
    constructor (particleCount = 1000) {
        this._particleCount = particleCount

        this._mesh = null
    }

    initialize (parent) {
        const geometry = new BufferGeometry()

        const vertices = new Float32Array(this._particleCount * 3)
        const timeOffsets = new Float32Array(this._particleCount)

        for (let i = 0; i < this._particleCount; i += 1) {

            const randY = i * 0.2
            const randX = Math.sin(i) * (Math.random() * randY)
            const randZ = Math.cos(i) * (Math.random() * randY)

            vertices[i * 3 + 0] = randX
            vertices[i * 3 + 1] = randY
            vertices[i * 3 + 2] = randZ

            timeOffsets[i] = Math.random() * 10 + 5
        }

        geometry.addAttribute('position', new BufferAttribute(vertices, 3))
        geometry.addAttribute('offsetTime', new BufferAttribute(timeOffsets, 1))

        const material = new ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader,
            fragmentShader
        })
        this._mesh = new Points(geometry, material)
        parent.add(this._mesh)
        return this
    }

    updateAnimationFrame (dt) {
        this._mesh.material.uniforms.time.value += dt
    }

}