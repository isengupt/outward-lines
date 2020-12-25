import React, { Component } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { fragment } from "./shaders/fragment";
import { vertex } from "./shaders/vertex";
class Scene extends Component {
  constructor(props) {
    super(props);

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.animate = this.animate.bind(this);
  }
  componentDidMount() {
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true,
      alpha: true,
    });
    this.renderer.autoClear = false;
    this.renderer.setClearColor("#fff");
    this.renderer.setSize(this.width, this.height);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container = document.getElementById("scene");
    this.width = this.mount.clientWidth;
    this.height = this.mount.clientHeight;
    this.mount.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      75,
      this.width / this.height,
      0.001,
      1000
    );

    this.camera.position.set(0, 0, 2);
    

    this.raycaster = new THREE.Raycaster();

    this.mouse = new THREE.Vector2();

    this.time = 0;
    this.setupResize();
    this.addObjects();
    this.animate();
    this.resize();
    this.mouseEvents();
  }

  mouseEvents() {
    let that = this;
    function onMouseMove(event) {
     
     

      that.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      that.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    that.raycaster.setFromCamera(that.mouse, that.camera);


      let intersects = that.raycaster.intersectObjects([that.clearPlane]);
      if(intersects[0]) {
          let p = intersects[0].point;
          
          that.material.uniforms.uMouse.value = new THREE.Vector2(p.x,p.y)
      }


      
    }

    window.addEventListener("mousemove", onMouseMove, false);
  }

  addObjects() {
    let that = this;
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        uMouse: { type: "v2", value: new THREE.Vector2(0, 0) },
        resolution: { type: "v4", value: new THREE.Vector4()  },
        uvRate1: {
          value: new THREE.Vector2(1, 1),
        },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    this.geometry = new THREE.BufferGeometry();
    let num = 2000;
    let positions = new Float32Array(num * 3);
    let angle = new Float32Array(num * 3);
    let offset = new Float32Array(num * 3);
    let life = new Float32Array(num * 3);
    for (let i = 0; i < num; i++) {
      positions.set(
        [Math.random() * 0.3, Math.random() * 0.3, Math.random() * 0.3],
        3 * i
      );

      angle.set([Math.random() * Math.PI * 2], i);

      life.set([4 + Math.random() * 10], i);

      offset.set([1000 * Math.random()], i);
    }

    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    this.geometry.setAttribute("angle", new THREE.BufferAttribute(angle, 1));

    this.geometry.setAttribute("life", new THREE.BufferAttribute(life, 1));

    this.geometry.setAttribute("offset", new THREE.BufferAttribute(offset, 1));
    this.dots = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.dots);

    this.clearPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 7),
      new THREE.MeshBasicMaterial({
        transparent: true,
        color: 0x0000ff,
        opacity: 0.01,
      })
    );
    this.scene.add(this.clearPlane);
  }

  setupResize = () => {
    window.addEventListener("resize", this.resize);
  };

  resize = () => {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    console.log("resize");

    this.imageAspect = 853 / 1280;
    /* 
    let a1;
    let a2;

    if (this.height / this.width > this.imageAspect) {
      a1 = (this.width / this.height) * this.imageAspect;
      a2 = 1;
    } else {
      a1 = 1;
      a2 = this.height / this.width / this.imageAspect;
    }

    this.material.uniforms.resolution.value.x = this.width;
    this.material.uniforms.resolution.value.y = this.height;
    this.material.uniforms.resolution.value.z = a1;
    this.material.uniforms.resolution.value.w = a2;

    const dist = this.camera.position.z;
    const height = 1;
    this.camera.fov = 2* (180/Math.PI) * Math.atan(height/(2*dist));

    if (this.width / this.height > 1) {
      this.plane.scale.x = this.camera.aspect;
    } else {
      this.plane.scale.y = 1 / this.camera.aspect;
    }  */

    this.camera.updateProjectionMatrix();
    console.log(this.camera);
  };

  componentWillUnmount() {
    this.stop();
    this.mount.removeChild(this.renderer.domElement);
  }

  start() {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);
    }
  }

  stop() {
    cancelAnimationFrame(this.frameId);
  }

  animate() {
    this.time += 0.05;
    this.material.uniforms.time.value = this.time;

    this.frameId = requestAnimationFrame(this.animate);

    this.renderScene();
  }

  renderScene() {
    this.renderer.render(this.scene, this.camera);
  }

  render() {
    return (
      <div
        id="scene"
        ref={(mount) => {
          this.mount = mount;
        }}
      />
    );
  }
}

export default Scene;
