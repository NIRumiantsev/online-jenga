import { useEffect, useRef } from 'react';
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  AmbientLight,
  Color,
  SpotLight,
  PCFSoftShadowMap,
  Fog,
  Raycaster,
  Vector2,
  Object3D,
} from 'three';
import {
  World,
  Plane,
  Body,
  Vec3,
  GSSolver,
} from 'cannon-es';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import CannonDebugger from 'cannon-es-debugger';
import { Table, Jenga } from 'UI';

const MainScene = () => {
  const root: any = useRef(null);

  useEffect(() => {
    createScene()
  });

  const createScene = () => {
    //Common values
    let druggedBrickIndex: null | number = null;
    let highlightedBrickIndex: null | number = null;
    let keyControllerActive = false;
    let currentKey: string | null = null;

    //Scene
    const scene = new Scene();
    scene.background = new Color(0x222222);
    scene.fog = new Fog(0x222222, 100, 200);

    //Camera
    const camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.z = 5;

    //Raycaster
    const raycaster = new Raycaster();
    const mouse = new Vector2();

    //Renderer
    const renderer = new WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    root.current?.appendChild( renderer.domElement );

    renderer.setClearColor(0x222222, 1)
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;

    // Lights
    const ambientLight = new AmbientLight(0xffffff, 0.5);
    ambientLight.castShadow = true;
    scene.add(ambientLight)

    const spotLight = new SpotLight(0xffffff, 0.5, 0, Math.PI / 8, 1)
    spotLight.position.set(0, 200, 0)
    spotLight.target.position.set(0, 0, 0)
    spotLight.castShadow = true
    spotLight.shadow.camera.near = 10
    spotLight.shadow.camera.far = 1000
    spotLight.shadow.camera.fov = 30
    spotLight.shadow.mapSize.width = 1000
    spotLight.shadow.mapSize.height = 1000
    scene.add(spotLight)

    //Geometry
    const jengaBricks = new Jenga(54); //todo Add different number of bricks

    jengaBricks.meshes.forEach((brick, index) => {
      brick.userData = { index };
      scene.add(brick);
    });

    scene.add(new Table());

    //Controls
    const orbitControls = new OrbitControls( camera, renderer.domElement );
    orbitControls.update();

    document.addEventListener('keydown', (event: any) => {
      currentKey = event.code;
    });

    document.addEventListener('keyup', () => {
      currentKey = null;
    });

    document.addEventListener(
      "click",
      (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children);
        if (intersects[0].object.userData.index) {
          addController(intersects[0].object);
        }
      },
      false
    );

    document.addEventListener(
      "mousemove",
      (event) => {
        if (highlightedBrickIndex !== null && highlightedBrickIndex !== druggedBrickIndex) {
          highlightBrick(highlightedBrickIndex, 0x000000)
        }
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children);
        const currentIndex: number | undefined = intersects[0].object.userData.index;
        if (typeof(currentIndex) === 'number') {
          highlightedBrickIndex = currentIndex;
          highlightBrick(currentIndex, 0xaaaaaa);
        }
      }
    )

    const addController = (brick: Object3D) => {
      if (druggedBrickIndex !== null) {
        highlightBrick(druggedBrickIndex, 0x000000 );
      }
      druggedBrickIndex = brick.userData.index;
      if (druggedBrickIndex !== null) {
        highlightBrick(druggedBrickIndex, 0xaaaaaa );
      }
      //@ts-ignore
      keyControllerActive = true;
    }

    const removeController = () => {
      //@ts-ignore
      highlightBrick(druggedBrickIndex, 0x000000)
      druggedBrickIndex = null;
      keyControllerActive = false;
      currentKey = null;
    };

    const highlightBrick = (index: number, emissiveColor: number) => {
      //@ts-ignore
      jengaBricks.meshes[index]?.material?.emissive.set( emissiveColor );
    }

    //Physics
    const world = new World();
    const solver = new GSSolver();
    solver.iterations = 50;
    solver.tolerance = 0;
    world.solver = solver;
    world.gravity.set(0, -10, 0);

    // @ts-ignore
    // const cannonDebugRenderer = new CannonDebugger(scene, world, {});

    const groundShape = new Plane();
    const groundBody = new Body({ mass: 0, shape: groundShape });
    groundBody.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);
    groundBody.position.set(0, -0.7, 0);

    world.addBody(groundBody);

    jengaBricks.bodies.forEach((brick) => {
      world.addBody(brick);
    });

    const moveBrick = () => {
      if (druggedBrickIndex !== null) {
        const currentBrick = jengaBricks.meshes[druggedBrickIndex];
        switch ( currentKey ) {
          case 'ArrowUp':
          case 'KeyW':
            currentBrick.position.z += 0.1;
            break;
          case 'ArrowLeft':
          case 'KeyA':
            currentBrick.position.x -= 0.1;
            break;
          case 'ArrowDown':
          case 'KeyS':
            currentBrick.position.z -= 0.1;
            break;
          case 'ArrowRight':
          case 'KeyD':
            currentBrick.position.x += 0.1;
            break;
          case 'KeyE':
            currentBrick.rotateY(0.01);
            break;
          case 'KeyQ':
            currentBrick.rotateY(-0.01);
            break;
          case 'Space':
            currentBrick.position.y += 0.1;
            break;
          case 'ControlLeft':
            currentBrick.position.y -= 0.1;
            break;
          case 'Enter':
            removeController();
            break;
        }
      }
    };


    const animate = () => {
      orbitControls.update();
      requestAnimationFrame( animate );
      world.step(1/60);

      // cannonDebugRenderer.update();
      renderer.render( scene, camera );

      if (keyControllerActive) {
        moveBrick()
      }

      jengaBricks.bodies.forEach((brick, index) => {
        if (index === druggedBrickIndex) {
          // @ts-ignore
          brick.position.copy(jengaBricks.meshes[index].position);
          // @ts-ignore
          brick.quaternion.copy(jengaBricks.meshes[index].quaternion);
          brick.velocity.set(0, 0, 0);
          brick.angularVelocity.set(0, 0, 0);
        } else {
          // @ts-ignore
          jengaBricks.meshes[index].position.copy(brick.position);
          // @ts-ignore
          jengaBricks.meshes[index].quaternion.copy(brick.quaternion);
        }
      });
    }
    animate()
  }

  return (
    <div ref={root}/>
  )
};

export { MainScene };