import { Brick } from 'UI';
import { Mesh } from 'three';
import { Body } from 'cannon-es';
import { CoordinatesDTO } from 'types';

class Jenga {
  meshes: Mesh[] = []
  bodies: Body[] = []

  constructor(brickNumber: number) {
    this.createJenga(brickNumber);
  }

  createJenga(brickNumber: number) {
    const brickSize = { x: 7.2, y: 1.4, z: 2.4 };

    const brickHeight = brickSize.y;
    const brickWidth = brickSize.z;

    let counter = 0;

    do {
      const position: CoordinatesDTO = { x: 0, y: 0, z: 0 };
      let rotated: boolean = false;

      switch (true) {
        case (counter % 3 === 0 || counter === 0): {
          break;
        }
        case (counter % 2 === 0): {
          position.x = 2 * brickWidth;
          break;
        }
        default: {
          position.x = brickWidth;
          break
        }
      }

      let rowNumber = 0;
      if (counter > 0 ) {
        rowNumber = Math.floor(counter / 3);
      }
      position.y = rowNumber * brickHeight

      if (rowNumber % 2 === 0) {
        rotated = true;
        position.x -= brickWidth;
        position.z += brickWidth;
      }

      Object.keys(position).forEach((key) => {
        position[key] = Math.round(position[key] * 10) / 10;
      })

      const currentBrick = new Brick({ position, rotated, size: brickSize });
      if (currentBrick.body && currentBrick.mesh) {
        this.meshes.push(currentBrick.mesh);
        this.bodies.push(currentBrick.body);
      }
      counter += 1;
    } while (counter < brickNumber);
  }
}

export { Jenga };