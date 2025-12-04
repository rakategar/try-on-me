import { PoseLandmark } from "@/types/pose";

export class BodyCalibration {
  private baseShoulderWidth: number = 0;
  private baseHeight: number = 0;
  private isCalibrated: boolean = false;

  calibrate(landmarks: PoseLandmark[]) {
    if (landmarks.length < 33) return;

    // Calculate shoulder width
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    this.baseShoulderWidth = Math.sqrt(
      Math.pow(rightShoulder.x - leftShoulder.x, 2) +
        Math.pow(rightShoulder.y - leftShoulder.y, 2)
    );

    // Calculate body height (shoulder to hip)
    const leftHip = landmarks[23];
    this.baseHeight = Math.abs(leftShoulder.y - leftHip.y);

    this.isCalibrated = true;
  }

  getScale(currentLandmarks: PoseLandmark[]): number {
    if (!this.isCalibrated || currentLandmarks.length < 33) return 1;

    const leftShoulder = currentLandmarks[11];
    const rightShoulder = currentLandmarks[12];
    const currentShoulderWidth = Math.sqrt(
      Math.pow(rightShoulder.x - leftShoulder.x, 2) +
        Math.pow(rightShoulder.y - leftShoulder.y, 2)
    );

    return currentShoulderWidth / this.baseShoulderWidth;
  }

  reset() {
    this.isCalibrated = false;
    this.baseShoulderWidth = 0;
    this.baseHeight = 0;
  }
}

export default new BodyCalibration();
