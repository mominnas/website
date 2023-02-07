//import THREE from "./three.r110.js";
//import THREE from "three";
import * as THREE from 'three';
//import OBJLoader from "./three.r110.objloader.js";

//import {OBJLoader} from "./OBJloader.js";
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import "../styles.css";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
//import {OrbitControls} from "./OrbitControls.js";
//import {TweenMax, Quint} from "gsap";
import { gsap, Quint } from "gsap";
//import {TweenMax, Quint} from "./gsap-core.js";


//THREE = window.THREE;
//THREE.OrbitControls = OrbitControls;
//THREE.OBJLoader = OBJLoader;

export default class App {
	group: THREE.Object3D<THREE.Event>;
	backgroundColor: string;
	sizeSquared: number;
	models: any[];
	windowX: number;
	windowY: number;
	scene: any;
	init() {
		this.group = new THREE.Object3D();

		this.backgroundColor = window
			.getComputedStyle(document.body, null)
			.getPropertyValue("background-color");


		this.sizeSquared = 35;

		// List of buildings in the scene
		this.models = [];

		this.windowX = window.innerWidth;
		this.windowY = window.innerHeight;

		this.generateScene();
		this.generateCamera();
		this.generateControls();
		this.addPlane();
		this.addBackground();

		// Load models from repository
		this.loadModels(
			"https://raw.githubusercontent.com/ca-john/ca-john.github.io/main/homepage_buildings.obj",
			this.onLoadModelsComplete.bind(this)
		);

		this.animate();

		// Add a point light to illuminate the buildings
		const pointLightColor = "#05f7ff";
		const pointLightIntensity = 10;
		const pointLight = new THREE.PointLight(
			pointLightColor,
			pointLightIntensity
		);
		pointLight.position.set(50, 180, -50);
		this.scene.add(pointLight);

		//this.addAmbientLight();

		//document.addEventListener('scroll', () => { arrows.classList.add("hiddenByScroll")});
	}

	generateScene() {
		this.scene = new THREE.Scene();
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
		});
		this.renderer.setSize(this.windowX, this.windowY);

		this.renderer.shadowMap.enabled = true;
		// Variance Shadow Map for the building models, *might impact performance*
		this.renderer.shadowMap.type = THREE.VSMShadowMap;

		document.body
			.querySelector(".canvas-wrapper")
			.appendChild(this.renderer.domElement);

		//this.scene.fog = new THREE.Fog(this.fogConfig.color, this.fogConfig.near, this.fogConfig.far);
		// Exponential fog that increases exponentially as the distance from the camera increases
		// might be a render bottleneck
		this.scene.fog = new THREE.FogExp2("#36454F", 0.01);
	}

	generateCamera() {
		this.camera = new THREE.PerspectiveCamera(
			20,
			this.windowX / this.windowY,
			1,
			1000
		);
		this.camera.position.set(3, 50, 155);

		this.scene.add(this.camera);
	}

	generateControls() {
		this.controls = new OrbitControls(
			this.camera,
			this.renderer.domElement
		);

		this.controls.enabled = false;
	}

	addSpotLight() {
		const light = { color: "#05f7ff", x: 641, y: -462, z: 509 };
		const spotLight = new THREE.SpotLight(light.color, 1);

		spotLight.position.set(light.x, light.y, light.z);
		spotLight.castShadow = true;

		this.scene.add(spotLight);
	}

	addBackground() {
		const planeGeometry = new THREE.PlaneGeometry(400, 100);
		const planeMaterial = new THREE.MeshPhysicalMaterial({ color: "#fff" });
		this.backgroundShape = new THREE.Mesh(planeGeometry, planeMaterial);

		this.backgroundShape.position.y = 10;
		this.backgroundShape.position.z = -150;

		this.scene.add(this.backgroundShape);

		this.mouseX = 3;
		this.lastMouseX = 3;
		this.lastMouseY = 65;
		this.lastScale = 155;
		this.tiltFx = {
			body: document.body,
			docEl: document.documentElement,
			getMousePos: (e, docScrolls) => {
				let posx = 0;
				let posy = 0;
				// Generate an event if not already done
                if (!e) {
					e = window.event;
				}
				if (e.pageX || e.pageY) {
					posx = e.pageX;
					posy = e.pageY;
				} else if (e.clientX || e.clientY) {
					posx = e.clientX + docScrolls.left;
					posy = e.clientY + docScrolls.top;
				}
				return { x: posx, y: posy };
			},
			lerp: (a, b, n) => (1 - n) * a + n * b,
			lineEq: (y2, y1, x2, x1, currentVal) => {
				let m = (y2 - y1) / (x2 - x1);
				let b = y1 - m * x1;
				return m * currentVal + b;
			},
		};

		this.docheight = Math.max(
			this.tiltFx.body.scrollHeight,
			this.tiltFx.body.offsetHeight,
			this.tiltFx.docEl.clientHeight,
			this.tiltFx.docEl.scrollHeight,
			this.tiltFx.docEl.offsetHeight
		);

		this.requestId = requestAnimationFrame(() => this.tilt());

		window.addEventListener("mousemove", (ev) => {
			const docScrolls = {
				left:
					this.tiltFx.body.scrollLeft + this.tiltFx.docEl.scrollLeft,
				top: this.tiltFx.body.scrollTop + this.tiltFx.docEl.scrollTop,
			};
			const mp = this.tiltFx.getMousePos(ev, docScrolls);
			this.mouseX = mp.x - docScrolls.left;
		});

		window.addEventListener(
			"resize",
			() =>
				(this.docheight = Math.max(
					this.tiltFx.body.scrollHeight,
					this.tiltFx.body.offsetHeight,
					this.tiltFx.docEl.clientHeight,
					this.tiltFx.docEl.scrollHeight,
					this.tiltFx.docEl.offsetHeight
				))
		);

		window.onbeforeunload = () => {
			window.cancelAnimationFrame(this.requestId);
			window.scrollTo(0, 0);
		};
	}

	tilt() {
		this.lastMouseX = this.tiltFx.lerp(
			this.lastMouseX,
			this.tiltFx.lineEq(6, 0, this.windowX, 0, this.mouseX),
			0.05
		);
		const newScrollingPos = window.pageYOffset;
		this.lastMouseY = this.tiltFx.lerp(
			this.lastMouseY,
			this.tiltFx.lineEq(0, 65, this.docheight, 0, newScrollingPos),
			0.05
		);
		this.lastScale = this.tiltFx.lerp(
			this.lastScale,
			this.tiltFx.lineEq(0, 158, this.docheight, 0, newScrollingPos),
			0.05
		);
		this.camera.position.set(
			this.lastMouseX,
			this.lastMouseY,
			this.lastScale
		);
		this.requestId = requestAnimationFrame(() => this.tilt());
	}

	addPlane() {
		const floor = { color: "#000000" };
		const planeGeometry = new THREE.PlaneGeometry(200, 200);
		const planeMaterial = new THREE.MeshStandardMaterial({
			color: floor.color,
			metalness: 0,
			emissive: "#000000",
			roughness: 0,
		});

		const plane = new THREE.Mesh(planeGeometry, planeMaterial);

		planeGeometry.rotateX(-Math.PI / 2);
		plane.position.y = 0;

		this.scene.add(plane);
	}

	getRandomBuiding() {
		return this.models[
			Math.floor(Math.random() * Math.floor(this.models.length))
		];
	}

	onLoadModelsComplete(obj) {
		this.models = [...obj.children].map((model) => {
			const scale = 0.01;

			model.scale.set(scale, scale, scale);
			model.position.set(0, -14, 0);
			model.receiveShadow = true;
			model.castShadow = true;

			return model;
		});

		this.draw();

		setTimeout(() => {
			this.removeLoader();
			this.showBuildings();
		}, 500);

		window.addEventListener("resize", this.onResize.bind(this));
	}

	removeLoader() {
		document.querySelector(".loader").classList.add("loader--done");
	}

	showBuildings() {
		this.sortBuildingsByDistance();

		this.models.forEach((building, index) => {
			gsap.to(building.position, {
				duration: 0.6 + index / 4000,
				y: 1,
				ease: Quint.easeOut,
				delay: index / 4000,
			});
			// TweenMax.to(building.position, 0.6 + index / 4000, {
			// 	y: 1,
			// 	ease: Quint.easeOut,
			// 	delay: index / 4000,
			// });
		});
	}

	sortBuildingsByDistance() {
		this.models
			.sort((a, b) => {
				if (a.position.z > b.position.z) {
					return 1;
				}
				if (a.position.z < b.position.z) {
					return -1;
				}
				return 0;
			})
			.reverse();
	}

	loadModels(name, callback) {
		const objLoader = new OBJLoader();

		objLoader.load(name, callback);
	}

	draw() {
		// Size of the box of each building
		//const modelSize = 3;
		const modelSize = 3;

		const meshParams = {
			color: "#000",
			metalness: 0,
			emissive: "#000",
			//emissiveIntensity: 0.01,
			roughness: 0.8,
			//clearcoat: 1,
			//clearcoatRoughness: 0.1,
		};

		const max = 0.009;
		const min = 0.001;

		const temp_material = new THREE.MeshPhysicalMaterial(meshParams);

		for (let i = 0; i < this.sizeSquared; i++) {
			for (let j = 0; j < this.sizeSquared; j++) {
				const building = this.getRandomBuiding().clone();

				building.material = temp_material;
				building.scale.y = Math.random() * (max - min + 0.01);
				building.position.x = i * modelSize;
				building.position.z = j * modelSize;

				this.group.add(building);

				this.models.push(building);
			}
		}

		this.scene.add(this.group);
		this.group.position.set(-this.sizeSquared - 10, 1, -this.sizeSquared - 10);
	}

	onResize() {
		this.windowX = window.innerWidth;
		this.windowY = window.innerHeight;

		this.camera.aspect = this.windowX / this.windowY;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(this.windowX, this.windowY);
	}

	onResumeClick() {}

	animate() {
		this.controls.update();

		this.renderer.render(this.scene, this.camera);

		requestAnimationFrame(this.animate.bind(this));
	}
}
