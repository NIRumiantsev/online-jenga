import {
  BoxGeometry,
  Mesh,
  TextureLoader,
  MeshStandardMaterial,
} from 'three';
import {
  Body,
  Box,
  Vec3,
  Material
} from 'cannon-es';
import {
  CoordinatesDTO,
} from 'types';

type BrickProps = {
  size: CoordinatesDTO,
  position: CoordinatesDTO,
  rotated: boolean,
};

const woodColors = ['lite', 'dark', 'gray'];

class Brick {
  mesh?: Mesh
  body?: Body

  constructor(props: BrickProps) {
    const {
      size,
      position,
      rotated,
    } = props;
    this.updateBody(size, position, rotated);
    this.updateMesh(size);
  }

  updateBody(size: CoordinatesDTO, brickPosition: CoordinatesDTO, rotated: boolean) {
    const { x, y, z } = brickPosition;
    const mass = 0.05;
    const material = new Material({ restitution: 0.1, friction: 0.5});
    const shape = new Box(new Vec3(size.x / 2, size.y / 2, size.z / 2));
    const position = new Vec3(z, y, x);
    const brickBody = new Body({ mass, shape, material, position });
    console.log(position)
    if (rotated) {
      brickBody.position.set(x, y, z)
      brickBody.quaternion.setFromAxisAngle(new Vec3(0, 1, 0), Math.PI / 2);
    }
    this.body = brickBody;
  }

  updateMesh(size: CoordinatesDTO) {
    const geometry = new BoxGeometry(size.x, size.y, size.z);
    const textureLoader = new TextureLoader();
    const currentBrickColor = woodColors[Math.floor(Math.random() * woodColors.length)];
    const textureBrick = textureLoader.load(require(`./textures/${currentBrickColor}.jpg`));
    const material = new MeshStandardMaterial( { map: textureBrick } );
    const brickMesh = new Mesh(geometry, material);
    brickMesh.castShadow = true;
    brickMesh.receiveShadow = true;
    if (this.body) {
      //@ts-ignore
      // brickMesh.position.copy(this.body.position);
    }
    this.mesh = brickMesh;
  }
}

export { Brick };
