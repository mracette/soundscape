export const renderHarmony = (subjects, analyser, extras) => {
  analyser.getFrequencyData();

  for (let i = 0; i < subjects.leaves.length; i++) {
    const fIndex =
      analyser.binMin +
      Math.round(
        (i / subjects.leaves.length) * (analyser.binMax - analyser.binMin)
      );
    subjects.leaves[i].material.emissiveIntensity =
      analyser.fftData[fIndex] / 255;
  }

  for (let i = 0; i < subjects.stickLeaves.length; i++) {
    const fIndex =
      analyser.binMin +
      Math.round(
        (i / subjects.stickLeaves.length) * (analyser.binMax - analyser.binMin)
      );
    subjects.stickLeaves[i].material.emissiveIntensity =
      analyser.fftData[fIndex] / 255;
  }

  for (let i = 0; i < subjects.stickLeavesOne.length; i++) {
    const fIndex =
      analyser.binMin +
      Math.round(
        (i / subjects.stickLeavesOne.length) *
          (analyser.binMax - analyser.binMin)
      );
    subjects.stickLeavesOne[i].material.emissiveIntensity =
      analyser.fftData[fIndex] / 255;
  }
};
