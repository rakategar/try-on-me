import { PoseResults, PoseLandmarkIndex } from "@/types/pose";

export class PoseDetectionService {
  private static instance: PoseDetectionService;

  private constructor() {}

  static getInstance(): PoseDetectionService {
    if (!PoseDetectionService.instance) {
      PoseDetectionService.instance = new PoseDetectionService();
    }
    return PoseDetectionService.instance;
  }

  processResults(results: PoseResults) {
    if (!results.poseLandmarks) return null;

    const landmarks = results.poseLandmarks;

    // Get shoulder landmarks
    const leftShoulder = landmarks[PoseLandmarkIndex.LEFT_SHOULDER];
    const rightShoulder = landmarks[PoseLandmarkIndex.RIGHT_SHOULDER];

    // Calculate shoulder width
    const shoulderWidth = Math.sqrt(
      Math.pow(rightShoulder.x - leftShoulder.x, 2) +
        Math.pow(rightShoulder.y - leftShoulder.y, 2)
    );

    // Calculate center position
    const centerX = (leftShoulder.x + rightShoulder.x) / 2;
    const centerY = (leftShoulder.y + rightShoulder.y) / 2;

    return {
      shoulderWidth,
      centerX,
      centerY,
      landmarks,
    };
  }
}

export default PoseDetectionService.getInstance();
