import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import "../styles.css";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from "gsap";

import studio from '@theatre/studio';
import { getProject, types } from '@theatre/core';


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
	tiltingEffect!: {
		body: HTMLElement;
		docEl: HTMLElement;
		getMousePos: (event: any, scrollFactor: {left: number, top: number}) => { x: number; y: number; };
		lerp: (a: number, b: number, n: number) => number;
		lineEq: (y2: number, y1: number, x2: number, x1: number, currentVal: number) => number;
	};
	docheight: number;
	requestId: number;
	

	constructor() {

		this.windowX = window.innerWidth;
		this.windowY = window.innerHeight;
		this.scene = new THREE.Scene();
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
			//precision: "lowp",
		});

		this.camera = new THREE.PerspectiveCamera(20, this.windowX / this.windowY, 1, 2000);

		// List of buildings in the scene
		this.models = [];
		
		// Set the orbit controls to the center of the scene
		this.currMouseX = 3;
		this.oldMouseX = 3;
		this.oldMouseY = 65;
		this.lastScale = 155;

		// First we need to set the renderer size and add the renderer to the DOM
		this.generateScene();

		// Orbit controls for the camera to allow for mouse and touch interaction
		this.controls = new OrbitControls(
			this.camera,
			this.renderer.domElement
		);

		// Create an empty plane to be used as the background
		this.backgroundPlane = new THREE.Mesh();

		this.docheight = -1;
		this.requestId = -1;

		
		//this.init();
	}


	init() {

		this.generateScene();
		this.setCamera();
		this.generateControls();
		this.addPlane();
		this.addBackground();
		this.addRemoveScroll();
		this.addSpotLight();
		this.addPointLight();

		// Load models from repository
		this.loadModels(
			"https://raw.githubusercontent.com/ca-john/ca-john.github.io/main/assets/homepage_buildings.obj",
			this.onLoadModelsComplete.bind(this)
		);

		this.animate();

		//this.addAmbientLight();

		//document.addEventListener('scroll', () => { arrows.classList.add("hiddenByScroll")});
		
		this.theatreInit();
		this.theatreStudioInit();
		
		this.buttonGradient();

		//this.createCardGrid();
	}




	theatreInit(){

		
		
	}


	theatreStudioInit(){

		//this.studio = require('@theatre/studio');
		
		if (process.env.NODE_ENV !== 'production') {
			studio.initialize();
		}
	
	}

	generateScene() {
		// Set the renderer size and add the renderer to the DOM
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



	addPointLight(){
		// Add a point light to illuminate the buildings
		const pointLightColor = "#05f7ff";
		const pointLightIntensity = 10;
		const pointLight = new THREE.PointLight(
			pointLightColor,
			pointLightIntensity
		);
		pointLight.position.set(50, 100, -50);
		this.scene.add(pointLight);
	}


	addRemoveScroll(){
		// let limitBottom = document.documentElement.offsetHeight - window.innerHeight; // Get the height of the document which is the height of the viewport minus the height of the document
		window.addEventListener("scroll",function(){ // When the user scrolls
			if(document.documentElement.scrollTop == 0){ // If the user is at the top of the document
				document.querySelector(".arrows")!.classList.remove("scroll_remove"); // Remove the class scroll_remove from the element with the class arrows
			}
			if(document.documentElement.scrollTop != 0){ // If the user is not at the top of the document
				document.querySelector(".arrows")!.classList.add("scroll_remove"); // Add the class scroll_remove to the element with the class arrows
			}
		})
	}



	buttonGradient(){

		// Get the border width and padding from the css variables
		const borderpx: number = Number(getComputedStyle(document.querySelector(".button")!).getPropertyValue('--borderpx').match(/(\d+)/)![0]);
		const paddingx: number = Number(getComputedStyle(document.querySelector(".button")!).getPropertyValue('--paddingx').match(/(\d+)/)![0]);
		const paddingy: number = Number(getComputedStyle(document.querySelector(".button")!).getPropertyValue('--paddingy').match(/(\d+)/)![0]);

		document.querySelectorAll<HTMLElement>(".button").forEach(element => {
			
			// Get the x and y position of the mouse relative to the element
			element.onmousemove = (e) => {
				
				const x = e.pageX - (e.target as HTMLSpanElement).offsetLeft;
				const y = e.pageY - (e.target as HTMLSpanElement).offsetTop;
				// Set the css variables to the x and y position of the mouse
				(e.target as HTMLSpanElement).style.setProperty('--x', `${ x }px`);
				(e.target as HTMLSpanElement).style.setProperty('--y', `${ y }px`);
			
			}

			element.onmouseenter = (e) => {
				// Set the border width and padding to the css variables so that the padding is decreased and the border is increased
				(e.target as HTMLSpanElement).style.setProperty('border', `${ borderpx }px solid transparent`);
				(e.target as HTMLSpanElement).style.setProperty('padding', `${ paddingy - borderpx }px ${ paddingx - borderpx }px`);
			}
			
			element.onmouseleave = (e) => {
				// Set the border width and padding to the css variables so that the border is reset and the padding is increased
				(e.target as HTMLSpanElement).style.setProperty('padding', `${ paddingy }px ${ paddingx }px`);
				(e.target as HTMLSpanElement).style.setProperty('border', `0px solid transparent`);
				
			
			}

		});

		// document.querySelector<HTMLElement>(".button")!.onmousemove = (e) => {

		// 	const x = e.pageX - (e.target as HTMLSpanElement).offsetLeft;
		// 	const y = e.pageY - (e.target as HTMLSpanElement).offsetTop;
		
		// 	(e.target as HTMLSpanElement).style.setProperty('--x', `${ x }px`);
		// 	(e.target as HTMLSpanElement).style.setProperty('--y', `${ y }px`);

			
		// }
	}


	setCamera() {

		// Set the camera position to be 150 units away from the center of the scene
		this.camera.position.set(0, 50, 150);

		// Add the camera to the scene
		this.scene.add(this.camera);
	}

	generateControls() {

		// Enable damping so that the camera doesn't move too fast
		this.controls.dampingFactor = 0.03;
		
		// Disable camera controls when the user is scrolling
		this.controls.enabled = false;
	}

	addSpotLight() {

		// Add a spotlight to the scene to illuminate the buildings
		const light = { color: "#f00", x: 641, y: -462, z: 509 };
		const spotLight = new THREE.SpotLight(light.color, 5);

		spotLight.position.set(light.x, light.y, light.z);
		spotLight.castShadow = true;
		
		this.scene.add(spotLight);
	}

	addBackground() {

		// Create a plane to be used as the background with a geometry and mesh
		const geometry = new THREE.PlaneGeometry(400, 100);
		const material = new THREE.MeshPhysicalMaterial({ color: "#fff" });
		
		this.backgroundPlane.material = material;
		this.backgroundPlane.geometry = geometry;
		this.backgroundPlane.receiveShadow = false;
		
		this.backgroundPlane.position.y = 10;
		this.backgroundPlane.position.z = -150;

		this.scene.add(this.backgroundPlane);

		
		this.tiltingEffect = {
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
			this.tiltingEffect.body.scrollHeight,
			this.tiltingEffect.body.offsetHeight,
			this.tiltingEffect.docEl.clientHeight,
			this.tiltingEffect.docEl.scrollHeight,
			this.tiltingEffect.docEl.offsetHeight
		);

		this.requestId = requestAnimationFrame(() => this.tilt());

		window.addEventListener("mousemove", (ev) => {
			const docScrolls = {
				left:
					this.tiltingEffect.body.scrollLeft + this.tiltingEffect.docEl.scrollLeft,
				top: this.tiltingEffect.body.scrollTop + this.tiltingEffect.docEl.scrollTop,
			};
			const mp = this.tiltingEffect.getMousePos(ev, docScrolls);
			this.currMouseX = mp.x - docScrolls.left;
		});

		window.addEventListener(
			"resize",
			() =>
			(this.docheight = Math.max(
				this.tiltingEffect.body.scrollHeight,
				this.tiltingEffect.body.offsetHeight,
				this.tiltingEffect.docEl.clientHeight,
				this.tiltingEffect.docEl.scrollHeight,
				this.tiltingEffect.docEl.offsetHeight
			))
		);

		window.onbeforeunload = () => {
			window.cancelAnimationFrame(this.requestId);
			window.scrollTo(0, 0);
		};
	}

	tilt() {
		this.oldMouseX = this.tiltingEffect.lerp(
			this.oldMouseX,
			this.tiltingEffect.lineEq(6, 0, this.windowX, 0, this.currMouseX),
			0.05
		);
		const newScrollingPos = window.pageYOffset;
		this.oldMouseY = this.tiltingEffect.lerp(
			this.oldMouseY,
			this.tiltingEffect.lineEq(0, 65, this.docheight, 0, newScrollingPos),
			0.05
		);
		this.lastScale = this.tiltingEffect.lerp(
			this.lastScale,
			this.tiltingEffect.lineEq(0, 158, this.docheight, 0, newScrollingPos),
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

	onLoadModelsComplete(obj: THREE.Object3D) {
		this.models = [...obj.children].map((model) => {
			const scale = 0.01;

			model.scale.set(scale, scale, scale);
			model.position.set(0, -20, 0);
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
		document.querySelector(".loadingIcon")!.classList.add("loadIconRemove");
	}

	deleteScrollIcon() {
		document.querySelector(".arrows")!.classList.add("scroll_remove");
	}

	showBuildings() {
		this.sortBuildingsByDistance();

		this.models.forEach((building, index) => {
			// Apply loading animations to each building model
			gsap.to(building.position, {
				duration: 0.8 + (index / 4000),
				y: 1,
				ease: "Power4.out",
				delay: (index / 4000),
			});

		});
	}

	sortBuildingsByDistance(): void {
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

	loadModels(name: string, callback: (obj: THREE.Group) => void): void {
		const objLoader: OBJLoader = new OBJLoader();
		objLoader.load(name, callback);
	}

	draw(): void {

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

	animate() {
		this.controls.update();

		this.renderer.render(this.scene, this.camera);

		requestAnimationFrame(this.animate.bind(this));
	}



}

// export function getModel(): unknown {
//     throw new Error('Function not implemented.');
// }

