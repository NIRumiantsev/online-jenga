import {
  PlaneGeometry,
  Mesh,
  TextureLoader,
  MathUtils,
  RepeatWrapping,
  MeshStandardMaterial,
} from 'three';

class Table extends Mesh {
  constructor() {
    super();
    const geometry = new PlaneGeometry(1000, 1000);
    geometry.rotateX(MathUtils.degToRad(-90));
    geometry.translate(0, -0.7, 0);

    const texture = new TextureLoader().load(require('./textures/white-wood.jpg'));
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(100, 100);

    const material = new MeshStandardMaterial({ map: texture });

    this.geometry = geometry;
    this.material = material
    this.receiveShadow = true;
    this.castShadow = false;
  }
}

export { Table };
