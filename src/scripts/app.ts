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
	group: THREE.Object3D<THREE.Event> = new THREE.Object3D();
	backgroundColor: string = window.getComputedStyle(document.body, null).getPropertyValue("background-color");
	sizeSquared: number = 35;
	models: any[];
	windowX: number;
	windowY: number;
	scene: any;
	renderer: THREE.WebGLRenderer;
	camera: THREE.PerspectiveCamera;
	controls: OrbitControls;
	backgroundPlane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshPhysicalMaterial>;
	currMouseX: number;
	oldMouseX: number;
	oldMouseY: number;
	lastScale: number;
	

	constructor() {
		this.windowX = window.innerWidth;
		this.windowY = window.innerHeight;
		this.scene = new THREE.Scene();
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
		});
		this.camera = new THREE.PerspectiveCamera(20, this.windowX / this.windowY, 1, 2000);
		this.init();
	}


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

		// Add the renderer to the DOM
		document.body
			.querySelector(".canvas-wrapper")!
			.appendChild(this.renderer.domElement);

		// Exponential fog that increases exponentially as the distance from the camera increases
		// might be a render bottleneck
		this.scene.fog = new THREE.FogExp2("#36454F", 0.01);
	}

	generateCamera() {
		// Perspective camera with a 20 degree field of view, a 1:1 aspect ratio, 
		// and a near and far clipping plane of 1 and 2000 respectively

		this.camera = new THREE.PerspectiveCamera(
			20,
			this.windowX / this.windowY,
			1,
			2000
		);

		// Set the camera position to be 150 units away from the center of the scene
		this.camera.position.set(0, 50, 150);

		// Add the camera to the scene
		this.scene.add(this.camera);
	}

	generateControls() {

		// Orbit controls for the camera to allow for mouse and touch interaction
		this.controls = new OrbitControls(
			this.camera,
			this.renderer.domElement
		);

		// Enable damping so that the camera doesn't move too fast
		this.controls.dampingFactor = 0.03;
		
		// Disable camera controls when the user is scrolling
		this.controls.enabled = false;
	}

	addSpotLight() {

		// Add a spotlight to the scene to illuminate the buildings
		const light = { color: "#05f7ff", x: 641, y: -462, z: 509 };
		const spotLight = new THREE.SpotLight(light.color, 1);

		spotLight.position.set(light.x, light.y, light.z);
		spotLight.castShadow = true;
		
		this.scene.add(spotLight);
	}

	addBackground() {
		const geometry = new THREE.PlaneGeometry(400, 100);
		const material = new THREE.MeshPhysicalMaterial({ color: "#fff" });
		this.backgroundPlane = new THREE.Mesh(geometry, material);

		this.backgroundPlane.position.y = 10;
		this.backgroundPlane.position.z = -150;

		this.scene.add(this.backgroundPlane);

		this.currMouseX = 3;
		this.oldMouseX = 3;
		this.oldMouseY = 65;
		this.lastScale = 155;
		this.tiltFx = {
			body: document.body,
			docEl: document.documentElement,
			getMousePos: (event, scrollFactor: any) => {
				let posx = 0;
				let posy = 0;
				// Generate an event if not already done
				if (!event) {
					event = window.event;
				}
				if (event.pageX || event.pageY) {
					posx = event.pageX;
					posy = event.pageY;
				} else if (event.clientX || event.clientY) {
					posx = event.clientX + scrollFactor.left;
					posy = event.clientY + scrollFactor.top;
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
			this.currMouseX = mp.x - docScrolls.left;
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
		this.oldMouseX = this.tiltFx.lerp(
			this.oldMouseX,
			this.tiltFx.lineEq(6, 0, this.windowX, 0, this.currMouseX),
			0.05
		);
		const newScrollingPos = window.pageYOffset;
		this.oldMouseY = this.tiltFx.lerp(
			this.oldMouseY,
			this.tiltFx.lineEq(0, 65, this.docheight, 0, newScrollingPos),
			0.05
		);
		this.lastScale = this.tiltFx.lerp(
			this.lastScale,
			this.tiltFx.lineEq(0, 158, this.docheight, 0, newScrollingPos),
			0.05
		);
		this.camera.position.set(
			this.oldMouseX,
			this.oldMouseY,
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

	getModel() {
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
			this.deleteLoadingIcon();
			
			this.showBuildings();
		}, 500);

		window.addEventListener("resize", this.onResize.bind(this));
	}

	deleteLoadingIcon() {
		document.querySelector(".loadingIcon").classList.add("loadIconRemove");
	}

	deleteScrollIcon() {
		document.querySelector(".arrows").classList.add("scroll_remove");
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

				const model = this.getModel().clone();

				model.material = temp_material;
				model.scale.y = Math.random() * (max - min + 0.01);
				model.position.x = i * modelSize;
				model.position.z = j * modelSize;

				this.group.add(model);

				this.models.push(model);
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

	onResumeClick() { }

	animate() {
		this.controls.update();

		this.renderer.render(this.scene, this.camera);

		requestAnimationFrame(this.animate.bind(this));
	}
}
